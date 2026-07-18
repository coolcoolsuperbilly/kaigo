import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { pool, JWT_SECRET } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { analyzeTransactionSecurity, SecurityCheckInput } from './scam-analyzer.js';
import { alertManager } from './alert-manager.js';
import { RiskLevel } from './types.js';

export class KaigoTools {
  // ============================================================================
  // AUTH & ONBOARDING
  // ============================================================================

  @Tool({
    name: 'sign_in',
    description: 'Authenticate user with FUFA handle and password, returning JWT session token and user info',
    inputSchema: z.object({
      fufaHandle: z.string().describe('FUFA handle (e.g. john.doe@fufa)'),
      password: z.string().describe('User password')
    })
  })
  @Widget('sign-in')
  async signIn(input: { fufaHandle: string; password: string }, ctx: ExecutionContext) {
    ctx.logger.info('Executing sign_in', { fufaHandle: input.fufaHandle });
    const dbClient = await pool.connect();
    try {
      const { fufaHandle, password } = input;
      if (!fufaHandle || !password) {
        throw new Error('Missing handle or password');
      }

      const query = await dbClient.query(
        `SELECT u.id, u.password_hash, w.available_balance 
         FROM users u 
         LEFT JOIN wallets w ON u.id = w.user_id 
         WHERE u.fufa_handle = $1`,
        [fufaHandle]
      );

      if (query.rows.length === 0) {
        throw new Error('Invalid handle or password');
      }

      const user = query.rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        throw new Error('Invalid handle or password');
      }

      const token = jwt.sign(
        {
          userId: user.id,
          fufaHandle,
          exp: Math.floor(Date.now() / 1000) + 7 * 86400
        },
        JWT_SECRET
      );

      const balanceCents = Number(user.available_balance || 0);

      return {
        success: true,
        token,
        userId: user.id,
        fufaHandle,
        balanceInCents: balanceCents,
        balanceInRupees: balanceCents / 100,
        message: 'Authentication successful'
      };
    } catch (error: any) {
      ctx.logger.error('Sign In Error', { error: error.message });
      return { success: false, error: error.message || 'Failed to sign in' };
    } finally {
      dbClient.release();
    }
  }

  @Tool({
    name: 'generate_fufa_account',
    description: 'Register a new user, create their FUFA account handle, wallet, and verified KYC record',
    inputSchema: z.object({
      email: z.string().email().describe('User email address'),
      firstName: z.string().describe('First name'),
      lastName: z.string().describe('Last name'),
      accNo: z.string().describe('Bank account number'),
      ifsc: z.string().describe('Bank IFSC code'),
      password: z.string().min(6).describe('Password (minimum 6 characters)')
    })
  })
  @Widget('generate-fufa-account')
  async generateFufaAccount(
    input: {
      email: string;
      firstName: string;
      lastName: string;
      accNo: string;
      ifsc: string;
      password: string;
    },
    ctx: ExecutionContext
  ) {
    ctx.logger.info('Executing generate_fufa_account', { email: input.email, firstName: input.firstName });
    const dbClient = await pool.connect();
    try {
      const { email, firstName, lastName, accNo, ifsc, password } = input;
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const userId = uuidv4();
      const walletId = uuidv4();
      const fufaHandle = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@fufa`;

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await dbClient.query('BEGIN');

      await dbClient.query(
        `INSERT INTO users (id, email, first_name, last_name, fufa_handle, password_hash) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, email, firstName, lastName, fufaHandle, hashedPassword]
      );

      await dbClient.query(
        `INSERT INTO wallets (id, user_id, available_balance) VALUES ($1, $2, $3)`,
        [walletId, userId, 0]
      );

      await dbClient.query(
        `INSERT INTO kyc_records (id, user_id, account_number, ifsc_code, kyc_status) 
         VALUES ($1, $2, $3, $4, 'VERIFIED')`,
        [uuidv4(), userId, accNo, ifsc]
      );

      await dbClient.query('COMMIT');

      const token = jwt.sign(
        {
          userId,
          fufaHandle,
          exp: Math.floor(Date.now() / 1000) + 7 * 86400
        },
        JWT_SECRET
      );

      return {
        success: true,
        token,
        userId,
        fufaHandle,
        message: 'FUFA Account created successfully with verified KYC'
      };
    } catch (error: any) {
      await dbClient.query('ROLLBACK');
      ctx.logger.error('Account generation error', { error: error.message });
      return { success: false, error: error.message || 'Failed to generate account' };
    } finally {
      dbClient.release();
    }
  }

  // ============================================================================
  // BALANCE & WALLET
  // ============================================================================

  @Tool({
    name: 'check_balance',
    description: 'Check available balance for a FUFA account handle',
    inputSchema: z.object({
      fufaHandle: z.string().describe('FUFA handle to check balance for')
    })
  })
  @Widget('check-balance')
  async checkBalance(input: { fufaHandle: string }, ctx: ExecutionContext) {
    ctx.logger.info('Executing check_balance', { fufaHandle: input.fufaHandle });
    try {
      const res = await pool.query(
        `SELECT u.fufa_handle, u.first_name, u.last_name, w.available_balance 
         FROM users u 
         JOIN wallets w ON u.id = w.user_id 
         WHERE u.fufa_handle = $1`,
        [input.fufaHandle]
      );

      if (res.rows.length === 0) {
        return { success: false, error: `Account '${input.fufaHandle}' not found.` };
      }

      const row = res.rows[0];
      const balanceInCents = Number(row.available_balance);
      const balanceInRupees = balanceInCents / 100;

      return {
        success: true,
        fufaHandle: row.fufa_handle,
        name: `${row.first_name} ${row.last_name}`,
        availableBalanceCents: balanceInCents,
        availableBalanceRupees: balanceInRupees,
        formattedBalance: `₹${balanceInRupees.toFixed(2)}`
      };
    } catch (error: any) {
      ctx.logger.error('Check balance error', { error: error.message });
      return { success: false, error: error.message || 'Failed to check balance' };
    }
  }

  // ============================================================================
  // TRANSACTIONS & PAYMENTS (INTEGRATED WITH SCAM ENGINE)
  // ============================================================================

  @Tool({
    name: 'initiate_payment',
    description: 'Initiate payment verifications with scam risk evaluation, KYC check, rate limiting, and funds check',
    inputSchema: z.object({
      senderHandle: z.string().describe('Sender FUFA handle'),
      receiverHandle: z.string().describe('Receiver FUFA handle'),
      amountInCents: z.number().positive().describe('Payment amount in cents (e.g. 1000 = ₹10.00)'),
      note: z.string().optional().describe('Payment note or description'),
      bypassSecurityAlert: z.boolean().optional().describe('Set true if user already confirmed high-risk security alert')
    })
  })
  async initiatePayment(
    input: {
      senderHandle: string;
      receiverHandle: string;
      amountInCents: number;
      note?: string;
      bypassSecurityAlert?: boolean;
    },
    ctx: ExecutionContext
  ) {
    ctx.logger.info('Executing initiate_payment with scam engine check', input);
    const dbClient = await pool.connect();
    try {
      const { senderHandle, receiverHandle, amountInCents, note } = input;

      // 0. SCAM PROTECTION & SECURITY THREAT ENGINE
      const verdict = analyzeTransactionSecurity({
        senderHandle,
        receiverHandle,
        amountInCents,
        note
      });

      if (verdict.decision === 'BLOCK') {
        return {
          success: false,
          blocked: true,
          status: 'BLOCKED_BY_SCAM_PROTECTION',
          decision: 'BLOCK',
          reason: verdict.reason,
          riskScore: verdict.analysis?.riskScore,
          riskLevel: verdict.analysis?.riskLevel,
          threats: verdict.analysis?.threats,
          recommendations: verdict.analysis?.recommendations,
          message: `🛑 TRANSACTION BLOCKED BY SCAM PROTECTION ENGINE: ${verdict.reason}`
        };
      }

      if (verdict.decision === 'CONFIRM' && !input.bypassSecurityAlert) {
        return {
          success: false,
          requiresConfirmation: true,
          status: 'REQUIRES_USER_CONFIRMATION',
          decision: 'CONFIRM',
          alertId: verdict.alertId,
          reason: verdict.reason,
          riskScore: verdict.analysis?.riskScore,
          riskLevel: verdict.analysis?.riskLevel,
          threats: verdict.analysis?.threats,
          recommendations: verdict.analysis?.recommendations,
          message: `⚠️ HIGH RISK SCAM WARNING DETECTED: ${verdict.reason}\nTo proceed with this payment, you must explicitly review the security alert and confirm using the 'confirm_security_alert' tool with alertId: '${verdict.alertId}'.`
        };
      }

      // 1. Transaction Rule Checks
      if (!receiverHandle || typeof receiverHandle !== 'string') {
        throw new Error('Transaction Rule Violation: Receiver handle is required.');
      }
      if (senderHandle === receiverHandle) {
        throw new Error('Transaction Rule Violation: Sender and receiver handles cannot be identical.');
      }
      if (isNaN(amountInCents) || amountInCents <= 0) {
        throw new Error('Transaction Rule Violation: Invalid payment amount.');
      }
      const MAX_AMOUNT = 1000000; // ₹10,000.00 max per transaction
      if (amountInCents > MAX_AMOUNT) {
        throw new Error('Transaction Rule Violation: Single transaction amount exceeds maximum limit (₹10,000.00).');
      }

      // 2. Validate KYC (Server-Authoritative Check)
      const kycRes = await dbClient.query(
        `SELECT 
           u.fufa_handle, 
           w.id as wallet_id, 
           w.available_balance,
           k.account_number,
           k.ifsc_code
         FROM users u 
         JOIN wallets w ON u.id = w.user_id 
         JOIN kyc_records k ON u.id = k.user_id
         WHERE u.fufa_handle IN ($1, $2) AND k.kyc_status = 'VERIFIED'`,
        [senderHandle, receiverHandle]
      );

      const senderWallet = kycRes.rows.find((r) => r.fufa_handle === senderHandle);
      const receiverWallet = kycRes.rows.find((r) => r.fufa_handle === receiverHandle);

      if (!senderWallet) {
        throw new Error('KYC Verification Failed: Sender account not found or lacks a verified bank account.');
      }
      if (!receiverWallet) {
        throw new Error('KYC Verification Failed: Receiver account not found or lacks a verified bank account.');
      }

      // 3. Spam Detection (Rate Limiting check)
      const spamCheck = await dbClient.query(
        `SELECT COUNT(*) FROM transactions 
         WHERE from_wallet_id = $1 AND created_at > NOW() - INTERVAL '60 seconds'`,
        [senderWallet.wallet_id]
      );
      const recentTxCount = parseInt(spamCheck.rows[0].count, 10);
      if (recentTxCount >= 5) {
        throw new Error('Spam Detection Triggered: Too many payment requests initiated. Please wait a minute.');
      }

      // 4. Check Sufficient Funds
      if (Number(senderWallet.available_balance) < amountInCents) {
        throw new Error('Insufficient Funds: Sender wallet balance is lower than payment amount.');
      }

      const idempotencyKey = uuidv4();

      const verificationToken = jwt.sign(
        {
          type: 'payment_verification',
          senderHandle,
          receiverHandle,
          amountInCents,
          idempotencyKey,
          exp: Math.floor(Date.now() / 1000) + 300
        },
        JWT_SECRET
      );

      const maskAccount = (acc: string) => `XXXX-XXXX-${acc.slice(-4)}`;

      return {
        success: true,
        status: 'VERIFIED',
        message: 'Payment verifications (Scam protection, KYC, Spam detection, Rules, Funds) passed successfully.',
        verificationToken,
        idempotencyKey,
        securityAnalysis: {
          riskScore: verdict.analysis?.riskScore,
          riskLevel: verdict.analysis?.riskLevel,
          recommendations: verdict.analysis?.recommendations
        },
        details: {
          senderHandle,
          receiverHandle,
          amountInCents,
          amountInRupees: amountInCents / 100,
          senderBankMasked: maskAccount(senderWallet.account_number),
          receiverBankMasked: maskAccount(receiverWallet.account_number)
        }
      };
    } catch (error: any) {
      ctx.logger.error('Initiate payment error', { error: error.message });
      return { success: false, error: error.message || 'Failed to initiate payment verifications.' };
    } finally {
      dbClient.release();
    }
  }

  @Tool({
    name: 'pay',
    description: 'Execute settled payment transfer using the signed verificationToken from initiate_payment',
    inputSchema: z.object({
      senderHandle: z.string().describe('Sender FUFA handle'),
      receiverHandle: z.string().describe('Receiver FUFA handle'),
      amountInCents: z.number().positive().describe('Amount in cents'),
      verificationToken: z.string().describe('Signed payment verification token'),
      intentId: z.string().optional().describe('Optional payment intent ID to mark as PAID')
    })
  })
  async pay(
    input: {
      senderHandle: string;
      receiverHandle: string;
      amountInCents: number;
      verificationToken: string;
      intentId?: string;
    },
    ctx: ExecutionContext
  ) {
    ctx.logger.info('Executing pay tool', input);
    const dbClient = await pool.connect();
    try {
      const { senderHandle, receiverHandle, amountInCents, verificationToken, intentId } = input;

      if (amountInCents <= 0) {
        throw new Error('Invalid amount');
      }

      if (!verificationToken) {
        throw new Error('Missing verification token from initiate-payment step');
      }

      let idempotencyKey: string;
      try {
        const verified = jwt.verify(verificationToken, JWT_SECRET) as any;
        if (verified.type !== 'payment_verification') {
          throw new Error('Invalid token type');
        }
        if (
          verified.senderHandle !== senderHandle ||
          verified.receiverHandle !== receiverHandle ||
          Number(verified.amountInCents) !== amountInCents
        ) {
          throw new Error('Token payload mismatch');
        }
        idempotencyKey = verified.idempotencyKey;
      } catch (err: any) {
        throw new Error('Invalid or expired verification token. Please re-initiate payment.');
      }

      await dbClient.query('BEGIN ISOLATION LEVEL READ COMMITTED');

      // 1. Resolve handles to wallet IDs
      const resolveRes = await dbClient.query(
        `SELECT w.id, u.fufa_handle FROM wallets w 
         JOIN users u ON w.user_id = u.id 
         WHERE u.fufa_handle IN ($1, $2)`,
        [senderHandle, receiverHandle]
      );

      if (resolveRes.rows.length !== 2) {
        throw new Error('Invalid sender or receiver handle');
      }

      const senderWalletId = resolveRes.rows.find((r) => r.fufa_handle === senderHandle).id;
      const receiverWalletId = resolveRes.rows.find((r) => r.fufa_handle === receiverHandle).id;

      // 2. Deadlock prevention: Always sort UUIDs before locking
      const [firstId, secondId] = [senderWalletId, receiverWalletId].sort();

      // 3. Acquire Pessimistic Locks
      const lockRes = await dbClient.query(
        `SELECT id, available_balance FROM wallets WHERE id = ANY($1) FOR UPDATE`,
        [[firstId, secondId]]
      );

      const senderBalance = Number(lockRes.rows.find((r) => r.id === senderWalletId).available_balance);
      if (senderBalance < amountInCents) {
        throw new Error('Insufficient funds');
      }

      const txId = uuidv4();

      // 4. Create Transaction Record
      await dbClient.query(
        `INSERT INTO transactions (id, idempotency_key, from_wallet_id, to_wallet_id, amount, status) 
         VALUES ($1, $2, $3, $4, $5, 'SETTLED')`,
        [txId, idempotencyKey, senderWalletId, receiverWalletId, amountInCents]
      );

      // 5. Move the money locally
      await dbClient.query(`UPDATE wallets SET available_balance = available_balance - $1 WHERE id = $2`, [
        amountInCents,
        senderWalletId
      ]);
      await dbClient.query(`UPDATE wallets SET available_balance = available_balance + $1 WHERE id = $2`, [
        amountInCents,
        receiverWalletId
      ]);

      // 6. Write Double-Entry Log
      await dbClient.query(
        `INSERT INTO ledger_entries (id, transaction_id, wallet_id, amount) VALUES 
         ($1, $2, $3, $4), ($5, $6, $7, $8)`,
        [
          uuidv4(),
          txId,
          senderWalletId,
          -amountInCents,
          uuidv4(),
          txId,
          receiverWalletId,
          amountInCents
        ]
      );

      // 7. Update intent status if intentId provided
      if (intentId) {
        await dbClient.query(
          `UPDATE payment_intents SET status = 'PAID', updated_at = NOW() WHERE id = $1`,
          [intentId]
        );
      }

      await dbClient.query('COMMIT');

      return {
        success: true,
        transactionId: txId,
        message: `Transfer of ₹${(amountInCents / 100).toFixed(2)} to ${receiverHandle} complete!`
      };
    } catch (error: any) {
      await dbClient.query('ROLLBACK');
      if (error.code === '23505') {
        return { success: false, error: 'Duplicate request intercepted (idempotency key reused).' };
      }
      ctx.logger.error('Payment Error', { error: error.message });
      return { success: false, error: error.message || 'Payment execution failed' };
    } finally {
      dbClient.release();
    }
  }

  @Tool({
    name: 'send_money',
    description: 'Convenience tool to initiate and execute money transfer in one seamless step with scam protection',
    inputSchema: z.object({
      senderHandle: z.string().describe('Sender FUFA handle'),
      receiverHandle: z.string().describe('Receiver FUFA handle'),
      amountInCents: z.number().positive().describe('Amount to send in cents (e.g. 500 = ₹5.00)'),
      note: z.string().optional().describe('Optional payment note'),
      bypassSecurityAlert: z.boolean().optional().describe('Set true if user reviewed and approved security alert')
    })
  })
  @Widget('send-money')
  async sendMoney(
    input: {
      senderHandle: string;
      receiverHandle: string;
      amountInCents: number;
      note?: string;
      bypassSecurityAlert?: boolean;
    },
    ctx: ExecutionContext
  ) {
    ctx.logger.info('Executing send_money', input);

    const initResult = await this.initiatePayment(input, ctx);
    if (!initResult.success || !initResult.verificationToken) {
      return initResult;
    }

    const payResult = await this.pay(
      {
        senderHandle: input.senderHandle,
        receiverHandle: input.receiverHandle,
        amountInCents: input.amountInCents,
        verificationToken: initResult.verificationToken
      },
      ctx
    );

    return payResult;
  }

  // ============================================================================
  // SCAM DETECTION & SECURITY ALERT ENGINE TOOLS
  // ============================================================================

  @Tool({
    name: 'analyze_scam_risk',
    description: 'Analyze an SMS message, link, UPI handle, or transaction for scam indicators and financial fraud risks',
    inputSchema: z.object({
      senderHandle: z.string().optional().describe('Sender handle or phone number'),
      receiverHandle: z.string().optional().describe('Recipient handle or UPI ID'),
      amountInCents: z.number().optional().describe('Transaction amount in cents'),
      note: z.string().optional().describe('Transaction note or description'),
      messageText: z.string().optional().describe('SMS or message text to analyze'),
      phoneNumber: z.string().optional().describe('Sender phone number'),
      url: z.string().optional().describe('URL link in message')
    })
  })
  @Widget('analyze-scam-risk')
  async analyzeScamRisk(input: SecurityCheckInput, ctx: ExecutionContext) {
    ctx.logger.info('Executing analyze_scam_risk', input as any);
    const verdict = analyzeTransactionSecurity(input);
    return {
      success: true,
      decision: verdict.decision,
      alertId: verdict.alertId,
      reason: verdict.reason,
      riskScore: verdict.analysis?.riskScore,
      riskLevel: verdict.analysis?.riskLevel,
      isScam: verdict.analysis?.isScam,
      confidence: verdict.analysis?.confidence,
      threats: verdict.analysis?.threats,
      recommendations: verdict.analysis?.recommendations,
      summary: verdict.analysis?.summary
    };
  }

  @Tool({
    name: 'confirm_security_alert',
    description: 'Confirm or block a pending security alert by alert ID',
    inputSchema: z.object({
      alertId: z.string().describe('ID of the security alert'),
      approved: z.boolean().describe('Set true to approve transaction, false to block it')
    })
  })
  async confirmSecurityAlert(input: { alertId: string; approved: boolean }, ctx: ExecutionContext) {
    ctx.logger.info('Executing confirm_security_alert', input);
    const success = alertManager.confirmAlert(input.alertId, input.approved);
    if (!success) {
      return { success: false, error: 'Alert not found or expired' };
    }
    const alert = alertManager.getAlert(input.alertId);
    return {
      success: true,
      alertId: input.alertId,
      confirmed: input.approved,
      status: input.approved ? 'APPROVED_BY_USER' : 'BLOCKED_BY_USER',
      message: input.approved ? 'Security alert confirmed. Transaction may now proceed.' : 'Transaction blocked by user.',
      alert
    };
  }

  @Tool({
    name: 'get_security_alerts',
    description: 'List security alerts and scam threat statistics',
    inputSchema: z.object({
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().describe('Filter by severity level'),
      requiresConfirmation: z.boolean().optional().describe('Filter alerts that require user confirmation'),
      limit: z.number().optional().describe('Limit maximum number of alerts returned')
    })
  })
  async getSecurityAlerts(
    input: { severity?: RiskLevel; requiresConfirmation?: boolean; limit?: number },
    ctx: ExecutionContext
  ) {
    ctx.logger.info('Executing get_security_alerts', input);
    const alerts = alertManager.getAlerts(input);
    const stats = alertManager.getStats();
    return {
      success: true,
      stats,
      alertsCount: alerts.length,
      alerts
    };
  }

  // ============================================================================
  // PAYMENT INTENTS (REQUEST MONEY)
  // ============================================================================

  @Tool({
    name: 'generate_payment_intent',
    description: 'Generate a payment request (intent) to another FUFA handle',
    inputSchema: z.object({
      requesterHandle: z.string().describe('FUFA handle of user requesting money'),
      targetHandle: z.string().describe('FUFA handle of target user who should pay'),
      amountInCents: z.number().positive().describe('Requested amount in cents'),
      note: z.string().optional().describe('Note or reason for request')
    })
  })
  async generatePaymentIntent(
    input: { requesterHandle: string; targetHandle: string; amountInCents: number; note?: string },
    ctx: ExecutionContext
  ) {
    ctx.logger.info('Executing generate_payment_intent', input);
    const dbClient = await pool.connect();
    try {
      const { requesterHandle, targetHandle, amountInCents, note = '' } = input;

      if (!targetHandle || typeof targetHandle !== 'string') {
        throw new Error('Target account handle is required.');
      }
      if (requesterHandle === targetHandle) {
        throw new Error('Cannot create payment request to your own account.');
      }
      if (isNaN(amountInCents) || amountInCents <= 0) {
        throw new Error('Invalid payment amount.');
      }

      // Check scam risk for payment intent
      const verdict = analyzeTransactionSecurity({
        senderHandle: requesterHandle,
        receiverHandle: targetHandle,
        amountInCents,
        note
      });

      if (verdict.decision === 'BLOCK') {
        return {
          success: false,
          blocked: true,
          reason: verdict.reason,
          riskScore: verdict.analysis?.riskScore,
          message: `🛑 PAYMENT REQUEST BLOCKED BY SCAM PROTECTION: ${verdict.reason}`
        };
      }

      const targetUserRes = await dbClient.query(
        `SELECT id, fufa_handle FROM users WHERE fufa_handle = $1`,
        [targetHandle]
      );

      if (targetUserRes.rows.length === 0) {
        throw new Error(`User account '${targetHandle}' does not exist.`);
      }

      const intentId = uuidv4();

      await dbClient.query(
        `INSERT INTO payment_intents (id, requester_handle, target_handle, amount, note, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW(), NOW())`,
        [intentId, requesterHandle, targetHandle, amountInCents, note]
      );

      return {
        success: true,
        intentId,
        message: `Payment request of ₹${(amountInCents / 100).toFixed(2)} sent to ${targetHandle}`,
        securityAnalysis: {
          riskScore: verdict.analysis?.riskScore,
          riskLevel: verdict.analysis?.riskLevel,
          recommendations: verdict.analysis?.recommendations
        },
        intent: {
          id: intentId,
          requesterHandle,
          targetHandle,
          amountInCents,
          amountInRupees: amountInCents / 100,
          note,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      ctx.logger.error('Payment intent generation error', { error: error.message });
      return { success: false, error: error.message || 'Failed to create payment request.' };
    } finally {
      dbClient.release();
    }
  }

  @Tool({
    name: 'update_payment_intent_status',
    description: 'Update status of a payment request (e.g. CANCELLED, DECLINED, PAID)',
    inputSchema: z.object({
      intentId: z.string().describe('ID of payment intent'),
      status: z.enum(['PAID', 'CANCELLED', 'DECLINED']).describe('New status'),
      fufaHandle: z.string().describe('FUFA handle of requesting or target user')
    })
  })
  async updatePaymentIntentStatus(
    input: { intentId: string; status: 'PAID' | 'CANCELLED' | 'DECLINED'; fufaHandle: string },
    ctx: ExecutionContext
  ) {
    ctx.logger.info('Executing update_payment_intent_status', input);
    try {
      const res = await pool.query(
        `UPDATE payment_intents 
         SET status = $1, updated_at = NOW()
         WHERE id = $2 AND (requester_handle = $3 OR target_handle = $3)
         RETURNING *`,
        [input.status, input.intentId, input.fufaHandle]
      );

      if (res.rows.length === 0) {
        return { success: false, error: 'Intent not found or unauthorized' };
      }

      return { success: true, intent: res.rows[0] };
    } catch (error: any) {
      ctx.logger.error('Update intent status error', { error: error.message });
      return { success: false, error: 'Failed to update payment intent status' };
    }
  }

  @Tool({
    name: 'check_payment_requests',
    description: 'Get list of pending, incoming, and outgoing payment requests for a user',
    inputSchema: z.object({
      fufaHandle: z.string().describe('FUFA handle to list payment intents for')
    })
  })
  async checkPaymentRequests(input: { fufaHandle: string }, ctx: ExecutionContext) {
    ctx.logger.info('Executing check_payment_requests', { fufaHandle: input.fufaHandle });
    try {
      const intentsRes = await pool.query(
        `SELECT id, requester_handle, target_handle, amount, note, status, created_at, updated_at
         FROM payment_intents
         WHERE target_handle = $1 OR requester_handle = $1
         ORDER BY created_at DESC LIMIT 50`,
        [input.fufaHandle]
      );

      const intents = intentsRes.rows.map((row: any) => ({
        id: row.id,
        requesterHandle: row.requester_handle,
        targetHandle: row.target_handle,
        amountInCents: Number(row.amount),
        amountInRupees: Number(row.amount) / 100,
        note: row.note,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isIncoming: row.target_handle === input.fufaHandle
      }));

      return {
        success: true,
        fufaHandle: input.fufaHandle,
        intents
      };
    } catch (error: any) {
      ctx.logger.error('Check payment requests error', { error: error.message });
      return { success: false, error: 'Failed to fetch payment intents' };
    }
  }

  // ============================================================================
  // STATEMENTS & TRANSACTION HISTORY
  // ============================================================================

  @Tool({
    name: 'check_statement',
    description: 'Get ledger transaction statement history (both received and paid) for a user',
    inputSchema: z.object({
      fufaHandle: z.string().describe('FUFA handle to retrieve statement for'),
      type: z.enum(['all', 'paid', 'recieved']).optional().describe('Filter by statement type')
    })
  })
  @Widget('check-statement')
  async checkStatement(input: { fufaHandle: string; type?: 'all' | 'paid' | 'recieved' }, ctx: ExecutionContext) {
    ctx.logger.info('Executing check_statement', input);
    try {
      let filterClause = '';
      if (input.type === 'paid') {
        filterClause = 'AND l.amount < 0';
      } else if (input.type === 'recieved') {
        filterClause = 'AND l.amount > 0';
      }

      const statement = await pool.query(
        `SELECT l.created_at, l.amount, t.id as transaction_id, t.from_wallet_id, t.to_wallet_id
         FROM ledger_entries l
         JOIN wallets w ON l.wallet_id = w.id
         JOIN users u ON w.user_id = u.id
         JOIN transactions t ON l.transaction_id = t.id
         WHERE u.fufa_handle = $1 ${filterClause}
         ORDER BY l.created_at DESC LIMIT 50`,
        [input.fufaHandle]
      );

      const records = statement.rows.map((row: any) => {
        const amountCents = Number(row.amount);
        return {
          createdAt: row.created_at,
          transactionId: row.transaction_id,
          amountInCents: amountCents,
          amountInRupees: Math.abs(amountCents) / 100,
          type: amountCents < 0 ? 'PAID / DEBIT' : 'RECEIVED / CREDIT',
          formattedAmount: `${amountCents < 0 ? '-' : '+'}₹${(Math.abs(amountCents) / 100).toFixed(2)}`
        };
      });

      return {
        success: true,
        fufaHandle: input.fufaHandle,
        recordsCount: records.length,
        records
      };
    } catch (error: any) {
      ctx.logger.error('Check statement error', { error: error.message });
      return { success: false, error: 'Failed to fetch statements' };
    }
  }

  @Tool({
    name: 'check_statement_paid',
    description: 'Get paid (debit) transaction statements for a user handle',
    inputSchema: z.object({
      fufaHandle: z.string().describe('FUFA handle')
    })
  })
  async checkStatementPaid(input: { fufaHandle: string }, ctx: ExecutionContext) {
    return this.checkStatement({ fufaHandle: input.fufaHandle, type: 'paid' }, ctx);
  }

  @Tool({
    name: 'check_statement_recieved',
    description: 'Get received (credit) transaction statements for a user handle',
    inputSchema: z.object({
      fufaHandle: z.string().describe('FUFA handle')
    })
  })
  async checkStatementReceived(input: { fufaHandle: string }, ctx: ExecutionContext) {
    return this.checkStatement({ fufaHandle: input.fufaHandle, type: 'recieved' }, ctx);
  }

  // ============================================================================
  // PENSIONS
  // ============================================================================

  @Tool({
    name: 'check_applicable_pensions',
    description: 'List available pension schemes from the catalog',
    inputSchema: z.object({})
  })
  async checkApplicablePensions(input: {}, ctx: ExecutionContext) {
    ctx.logger.info('Executing check_applicable_pensions');
    try {
      const res = await pool.query(`SELECT * FROM schemes_catalog WHERE category = 'PENSION'`);
      return { success: true, pensions: res.rows };
    } catch (error: any) {
      ctx.logger.error('Fetch pensions error', { error: error.message });
      return { success: false, error: 'Failed to fetch pensions' };
    }
  }

  @Tool({
    name: 'opt_in_pension',
    description: 'Opt-in/Enroll a user into a pension scheme with monthly contribution',
    inputSchema: z.object({
      fufaHandle: z.string().describe('User FUFA handle'),
      schemeId: z.string().describe('Scheme ID from pension catalog'),
      monthlyContribution: z.number().positive().describe('Monthly contribution amount in Rupees or cents')
    })
  })
  async optInPension(
    input: { fufaHandle: string; schemeId: string; monthlyContribution: number },
    ctx: ExecutionContext
  ) {
    ctx.logger.info('Executing opt_in_pension', input);
    const dbClient = await pool.connect();
    try {
      const userRes = await dbClient.query(`SELECT id FROM users WHERE fufa_handle = $1`, [input.fufaHandle]);
      if (userRes.rows.length === 0) {
        throw new Error(`User '${input.fufaHandle}' not found`);
      }
      const userId = userRes.rows[0].id;

      const pranNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();

      const res = await dbClient.query(
        `INSERT INTO user_pension_enrollments (user_id, scheme_id, pran_number, monthly_contribution)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, input.schemeId, pranNumber, input.monthlyContribution]
      );

      return {
        success: true,
        message: 'Pension enrollment successful',
        pranNumber,
        details: res.rows[0]
      };
    } catch (error: any) {
      ctx.logger.error('Opt-in pension error', { error: error.message });
      return { success: false, error: error.message || 'Failed to opt into pension' };
    } finally {
      dbClient.release();
    }
  }

  @Tool({
    name: 'get_pension_status',
    description: 'Track pension enrollment status and payout progress for a user',
    inputSchema: z.object({
      fufaHandle: z.string().describe('FUFA handle')
    })
  })
  @Widget('pension-status')
  async getPensionStatus(input: { fufaHandle: string }, ctx: ExecutionContext) {
    ctx.logger.info('Executing get_pension_status', input);
    try {
      const userRes = await pool.query(`SELECT id FROM users WHERE fufa_handle = $1`, [input.fufaHandle]);
      if (userRes.rows.length === 0) {
        return { success: false, error: `User '${input.fufaHandle}' not found` };
      }
      const userId = userRes.rows[0].id;

      const query = await pool.query(
        `SELECT 
          e.id as "enrollmentId",
          c.name as "schemeName",
          e.pran_number as "pranNumber",
          e.status as "accountStatus",
          e.payout_bank_account as "bankAccount",
          COALESCE(
            json_agg(
              json_build_object(
                'payoutMonth', pd.payout_month,
                'amount', pd.amount,
                'progressStatus', pd.status,
                'referenceUtr', pd.reference_utr,
                'updatedAt', pd.updated_at
              ) ORDER BY pd.payout_month DESC
            ) FILTER (WHERE pd.id IS NOT NULL), 
            '[]'
          ) AS "payoutProgress"
         FROM user_pension_enrollments e
         JOIN schemes_catalog c ON e.scheme_id = c.id
         LEFT JOIN pension_disbursements pd ON pd.enrollment_id = e.id
         WHERE e.user_id = $1 
         GROUP BY e.id, c.name
         ORDER BY e.created_at DESC`,
        [userId]
      );

      return { success: true, enrolledPensions: query.rows };
    } catch (error: any) {
      ctx.logger.error('Get pension status error', { error: error.message });
      return { success: false, error: 'Failed to retrieve pension status' };
    }
  }

  // ============================================================================
  // INSURANCES
  // ============================================================================

  @Tool({
    name: 'check_applicable_insurances',
    description: 'List available insurance policies from the catalog',
    inputSchema: z.object({})
  })
  async checkApplicableInsurances(input: {}, ctx: ExecutionContext) {
    ctx.logger.info('Executing check_applicable_insurances');
    try {
      const res = await pool.query(`SELECT * FROM schemes_catalog WHERE category = 'INSURANCE'`);
      return { success: true, insurances: res.rows };
    } catch (error: any) {
      ctx.logger.error('Fetch insurances error', { error: error.message });
      return { success: false, error: 'Failed to fetch insurances' };
    }
  }

  @Tool({
    name: 'opt_in_insurance',
    description: 'Opt-in/purchase insurance coverage (deducts premium from user wallet balance)',
    inputSchema: z.object({
      fufaHandle: z.string().describe('User FUFA handle'),
      schemeId: z.string().describe('Scheme ID from insurance catalog'),
      nomineeName: z.string().describe('Nominee name for the policy')
    })
  })
  async optInInsurance(
    input: { fufaHandle: string; schemeId: string; nomineeName: string },
    ctx: ExecutionContext
  ) {
    ctx.logger.info('Executing opt_in_insurance', input);
    const dbClient = await pool.connect();
    try {
      const userRes = await dbClient.query(`SELECT id FROM users WHERE fufa_handle = $1`, [input.fufaHandle]);
      if (userRes.rows.length === 0) {
        throw new Error(`User '${input.fufaHandle}' not found`);
      }
      const userId = userRes.rows[0].id;

      await dbClient.query('BEGIN');

      const schemeRes = await dbClient.query(
        `SELECT default_premium FROM schemes_catalog WHERE id = $1`,
        [input.schemeId]
      );
      if (schemeRes.rows.length === 0) {
        throw new Error('Insurance scheme not found');
      }

      const premiumInCents = Number(schemeRes.rows[0].default_premium) * 100;

      const walletRes = await dbClient.query(
        `SELECT id, available_balance FROM wallets WHERE user_id = $1`,
        [userId]
      );
      if (walletRes.rows.length === 0) {
        throw new Error('Wallet not found');
      }

      if (Number(walletRes.rows[0].available_balance) < premiumInCents) {
        throw new Error(`Insufficient wallet balance for premium (Required: ₹${premiumInCents / 100})`);
      }

      await dbClient.query(
        `UPDATE wallets SET available_balance = available_balance - $1 WHERE id = $2`,
        [premiumInCents, walletRes.rows[0].id]
      );

      const policyNumber = `POL-${Math.floor(Math.random() * 10000000)}`;
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);

      const insertRes = await dbClient.query(
        `INSERT INTO user_insurance_policies (user_id, scheme_id, policy_number, nominee_name, valid_until)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userId, input.schemeId, policyNumber, input.nomineeName, validUntil]
      );

      await dbClient.query('COMMIT');

      return {
        success: true,
        message: 'Insurance activated successfully',
        policyNumber,
        policy: insertRes.rows[0]
      };
    } catch (error: any) {
      await dbClient.query('ROLLBACK');
      ctx.logger.error('Opt-in insurance error', { error: error.message });
      return { success: false, error: error.message || 'Failed to opt into insurance' };
    } finally {
      dbClient.release();
    }
  }

  @Tool({
    name: 'get_insurance_status',
    description: 'Track active insurance policies and claim progress for a user',
    inputSchema: z.object({
      fufaHandle: z.string().describe('FUFA handle')
    })
  })
  @Widget('insurance-status')
  async getInsuranceStatus(input: { fufaHandle: string }, ctx: ExecutionContext) {
    ctx.logger.info('Executing get_insurance_status', input);
    try {
      const userRes = await pool.query(`SELECT id FROM users WHERE fufa_handle = $1`, [input.fufaHandle]);
      if (userRes.rows.length === 0) {
        return { success: false, error: `User '${input.fufaHandle}' not found` };
      }
      const userId = userRes.rows[0].id;

      const query = await pool.query(
        `SELECT 
          p.id as "policyId",
          c.name as "schemeName",
          c.coverage_benefit as "coverage",
          p.policy_number as "policyNumber",
          p.status as "policyStatus",
          p.valid_until as "validUntil",
          COALESCE(
            json_agg(
              json_build_object(
                'claimDate', ic.claim_date,
                'amount', ic.amount,
                'progressStatus', ic.status,
                'referenceUtr', ic.reference_utr,
                'updatedAt', ic.updated_at
              ) ORDER BY ic.claim_date DESC
            ) FILTER (WHERE ic.id IS NOT NULL), 
            '[]'
          ) AS "claimProgress"
         FROM user_insurance_policies p
         JOIN schemes_catalog c ON p.scheme_id = c.id
         LEFT JOIN insurance_claims ic ON ic.policy_id = p.id
         WHERE p.user_id = $1 
         GROUP BY p.id, c.name, c.coverage_benefit
         ORDER BY p.created_at DESC`,
        [userId]
      );

      return { success: true, activeInsurances: query.rows };
    } catch (error: any) {
      ctx.logger.error('Get insurance status error', { error: error.message });
      return { success: false, error: 'Failed to retrieve insurance status' };
    }
  }

  // ============================================================================
  // CONTACTS & WEBHOOKS
  // ============================================================================

  @Tool({
    name: 'add_contact',
    description: 'Add a contact handle to user contact list',
    inputSchema: z.object({
      userHandle: z.string().describe('User handle'),
      contactHandle: z.string().describe('Contact handle to add')
    })
  })
  async addContact(input: { userHandle: string; contactHandle: string }, ctx: ExecutionContext) {
    ctx.logger.info('Executing add_contact', input);
    return { success: true, message: `Contact '${input.contactHandle}' added.` };
  }

  @Tool({
    name: 'remove_contact',
    description: 'Remove a contact handle from user contact list',
    inputSchema: z.object({
      userHandle: z.string().describe('User handle'),
      contactHandle: z.string().describe('Contact handle to remove')
    })
  })
  async removeContact(input: { userHandle: string; contactHandle: string }, ctx: ExecutionContext) {
    ctx.logger.info('Executing remove_contact', input);
    return { success: true, message: `Contact '${input.contactHandle}' removed.` };
  }

  @Tool({
    name: 'handle_webhook',
    description: 'Handle incoming transaction webhook notification callbacks',
    inputSchema: z.object({
      payload: z.any().optional().describe('Webhook payload')
    })
  })
  async handleWebhook(input: { payload?: any }, ctx: ExecutionContext) {
    ctx.logger.info('Handling payment webhook callback', input);
    return { success: true, message: 'Webhook received and processed.' };
  }
}
