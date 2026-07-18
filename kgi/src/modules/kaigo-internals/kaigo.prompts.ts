import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

export class KaigoPrompts {
  @Prompt({
    name: 'kaigo_help',
    description: 'Get help with Kaigo Financial Manager operations and Scam Protection capabilities',
    arguments: [
      {
        name: 'operation',
        description: 'The operation to get help with (optional, e.g. send_money, scam_protection, check_balance, pensions, insurance)',
        required: false
      }
    ]
  })
  async getHelp(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating kaigo help prompt', { operation: args.operation });

    const operation = args.operation;

    if (operation) {
      const helpText = this.getOperationHelp(operation);
      return [
        {
          role: 'user' as const,
          content: `How do I use the ${operation} feature in Kaigo Financial Manager?`
        },
        {
          role: 'assistant' as const,
          content: helpText
        }
      ];
    }

    return [
      {
        role: 'user' as const,
        content: 'How do I use Kaigo Financial Manager and Scam Protection?'
      },
      {
        role: 'assistant' as const,
        content: `Welcome to **Kaigo Financial Manager & Threat Intelligence Scam Shield**! Here are the key operations:

1. **Scam Protection & Security Threat Engine** 🛡️
   - \`analyze_scam_risk\`: Analyze SMS, emails, links, UPI handles, or transactions for phishing, typosquatting, blacklisted handles, and scam keywords.
   - \`confirm_security_alert\`: Review and approve/block a pending high/medium risk alert.
   - \`get_security_alerts\`: View active security warnings and threat metrics.

2. **Authentication & Registration**
   - \`sign_in\`: Authenticate with your FUFA handle and password.
   - \`generate_fufa_account\`: Register a new FUFA handle and verified bank wallet.

3. **Balance & Payments (Protected)**
   - \`check_balance\`: View your wallet balance.
   - \`initiate_payment\`: Validate scam risks, KYC, anti-spam rate limits, and available funds.
   - \`pay\`: Execute double-entry settled fund transfer using the verification token.
   - \`send_money\`: Instantly send money to another FUFA handle in one step with scam detection.

4. **Payment Requests (Intents)**
   - \`generate_payment_intent\`: Request money from another FUFA user (analyzed for fraud).
   - \`check_payment_requests\`: Check pending incoming and outgoing payment requests.
   - \`update_payment_intent_status\`: Accept, cancel, or decline a payment request.

5. **Statements & History**
   - \`check_statement\`: View full ledger statements (both received and paid).
   - \`check_statement_paid\`: View debit transactions.
   - \`check_statement_recieved\`: View credit transactions.

6. **Pensions & Insurance**
   - \`check_applicable_pensions\`: Explore available government/private pension schemes.
   - \`opt_in_pension\`: Enroll in a pension scheme and generate a PRAN number.
   - \`get_pension_status\`: Track pension enrollment and disbursement status.
   - \`check_applicable_insurances\`: View available insurance policies.
   - \`opt_in_insurance\`: Activate insurance coverage (premium auto-deducted).
   - \`get_insurance_status\`: View active insurance policies and claim progress.

Ask me anytime to perform any of these financial or scam prevention operations!`
      }
    ];
  }

  private getOperationHelp(operation: string): string {
    const helps: Record<string, string> = {
      scam_protection: 'Use `analyze_scam_risk` to scan any suspicious SMS message, website link, phone number, or payment handle before executing transactions. If an alert requires confirmation, use `confirm_security_alert`.',
      send_money: 'Use `send_money` to transfer funds directly to another FUFA handle. Automatically checked against scam blacklists and heuristic rules. Example: send_money(senderHandle="granny.dou@fufa", receiverHandle="john.doe@fufa", amountInCents=500)',
      check_balance: 'Use `check_balance` to check the current wallet balance. Example: check_balance(fufaHandle="granny.dou@fufa")',
      initiate_payment: 'Use `initiate_payment` to verify scam risk, KYC, anti-spam, rules, and funds before paying.',
      pay: 'Use `pay` with a verificationToken from initiate_payment to execute the atomic ledger transfer.',
      pensions: 'Use `check_applicable_pensions` to view catalog schemes, `opt_in_pension` to enroll, and `get_pension_status` to track payouts.',
      insurance: 'Use `check_applicable_insurances` to view insurance catalog, `opt_in_insurance` to purchase coverage, and `get_insurance_status` to track claims.',
      statement: 'Use `check_statement` to get full double-entry transaction history with timestamps and IDs.'
    };

    return helps[operation] || `Help for operation '${operation}': Call Kaigo tools with required parameters such as fufaHandle, amount, or schemeId.`;
  }
}
