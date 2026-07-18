import { v4 as uuidv4 } from 'uuid';
import { RiskLevel, ThreatIndicator, AnalysisResult, PolicyVerdict } from './types.js';
import {
  BLACKLISTED_DOMAINS,
  BLACKLISTED_PHONE_NUMBERS,
  BLACKLISTED_UPI_HANDLES,
  SMS_SCAM_KEYWORDS,
  SUSPICIOUS_TLDS,
  TRUSTED_DOMAINS,
  isBlacklistedDomain,
  isWhitelisted
} from './threat-intel.js';
import {
  calculateRisk,
  detectBrandImpersonation,
  scanKeywords
} from './heuristics.js';
import { ConfirmationHandler } from './confirmation-handler.js';

export interface SecurityCheckInput {
  senderHandle?: string;
  receiverHandle?: string;
  amountInCents?: number;
  note?: string;
  messageText?: string;
  phoneNumber?: string;
  url?: string;
  forceConfirm?: boolean;
}

/**
 * Analyzes transaction, user handle, note/message, URLs, and metadata for scam risks.
 */
export function analyzeTransactionSecurity(input: SecurityCheckInput): PolicyVerdict {
  const threats: ThreatIndicator[] = [];
  const textToScan = [input.note || '', input.messageText || ''].filter(Boolean).join(' ');

  // 1. Check Recipient Handle / UPI / Phone Blacklists
  if (input.receiverHandle) {
    const handle = input.receiverHandle.toLowerCase().trim();
    if (BLACKLISTED_UPI_HANDLES.has(handle)) {
      threats.push({
        type: 'blacklisted_recipient',
        severity: RiskLevel.CRITICAL,
        score: 95,
        description: `Recipient handle '${input.receiverHandle}' is on the known cyber fraud blacklist!`,
        evidence: input.receiverHandle
      });
    }

    // Check if recipient handle impersonates a bank/brand (e.g. sbi-helpdesk@fufa, paytm-rewards@fufa)
    const handlePrefix = handle.split('@')[0];
    const impersonated = detectBrandImpersonation(handlePrefix + '.com', TRUSTED_DOMAINS);
    if (impersonated) {
      threats.push({
        type: 'brand_impersonation',
        severity: RiskLevel.HIGH,
        score: 75,
        description: `Recipient handle '${input.receiverHandle}' appears to impersonate trusted brand '${impersonated}'!`,
        evidence: input.receiverHandle
      });
    }
  }

  // 2. Check Phone Number Blacklists
  if (input.phoneNumber) {
    const phone = input.phoneNumber.trim();
    if (BLACKLISTED_PHONE_NUMBERS.has(phone)) {
      threats.push({
        type: 'blacklisted_phone',
        severity: RiskLevel.CRITICAL,
        score: 90,
        description: `Sender phone number '${input.phoneNumber}' is blacklisted for financial fraud!`,
        evidence: input.phoneNumber
      });
    }
  }

  // 3. Scan Message / Note Text for Scam Keywords (KYC, PAN, OTP, Electricity Bill, Lottery, Urgent)
  if (textToScan) {
    const keywordMatches = scanKeywords(textToScan, SMS_SCAM_KEYWORDS);
    if (keywordMatches.length > 0) {
      const highestWeightMatch = Math.max(...keywordMatches.map((m) => m.weight));
      const matchedTerms = keywordMatches.map((m) => m.term).join(', ');

      let severity = RiskLevel.MEDIUM;
      if (highestWeightMatch >= 30) severity = RiskLevel.CRITICAL;
      else if (highestWeightMatch >= 20) severity = RiskLevel.HIGH;

      threats.push({
        type: 'scam_keywords_detected',
        severity,
        score: Math.min(85, highestWeightMatch * 2.2),
        description: `Transaction note/message contains scam triggers: [${matchedTerms}]`,
        evidence: matchedTerms
      });
    }
  }

  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = textToScan.match(urlRegex);
  const urlsInText: string[] = matches ? Array.from(matches) : [];
  if (input.url) urlsInText.push(input.url);

  for (const rawUrl of urlsInText) {
    try {
      const parsedUrl = new URL(rawUrl);
      const hostname = parsedUrl.hostname.toLowerCase();
      const domainParts = hostname.split('.');
      const tld = domainParts[domainParts.length - 1];

      // Blacklist check
      if (isBlacklistedDomain(hostname)) {
        threats.push({
          type: 'blacklisted_domain',
          severity: RiskLevel.CRITICAL,
          score: 95,
          description: `URL '${rawUrl}' points to a known blacklisted phishing domain!`,
          evidence: hostname
        });
      }

      // Suspicious TLD check
      if (SUSPICIOUS_TLDS.has(tld)) {
        threats.push({
          type: 'suspicious_tld',
          severity: RiskLevel.HIGH,
          score: 65,
          description: `URL '${rawUrl}' uses high-risk suspicious TLD (.${tld}).`,
          evidence: tld
        });
      }

      // Brand Impersonation / Typosquatting
      if (!isWhitelisted(hostname)) {
        const brandImpersonated = detectBrandImpersonation(hostname, TRUSTED_DOMAINS);
        if (brandImpersonated) {
          threats.push({
            type: 'typosquatting',
            severity: RiskLevel.CRITICAL,
            score: 85,
            description: `Domain '${hostname}' is typosquatting/impersonating legitimate domain '${brandImpersonated}'!`,
            evidence: hostname
          });
        }
      }
    } catch {
      // Invalid URL format
    }
  }

  // 5. Amount Anomaly Check (Unusually high payment amount e.g. > ₹5,000 / 500,000 cents)
  if (input.amountInCents && input.amountInCents > 500000) {
    threats.push({
      type: 'high_amount_txn',
      severity: RiskLevel.HIGH,
      score: 55,
      description: `High value transaction (₹${(input.amountInCents / 100).toFixed(2)}). Voice or multi-factor verification recommended.`,
      evidence: `₹${(input.amountInCents / 100).toFixed(2)}`
    });
  }

  // Calculate aggregate risk using dampening formula
  const riskResult = calculateRisk(threats);

  let summary = `Security Analysis complete. Risk Score: ${riskResult.riskScore}/100 (${riskResult.riskLevel}).`;
  if (threats.length > 0) {
    summary += ` Detected threats: ${threats.map((t) => t.description).join(' | ')}`;
  } else {
    summary += ' No threat indicators found.';
  }

  const analysis: AnalysisResult = {
    id: uuidv4(),
    riskScore: riskResult.riskScore,
    riskLevel: riskResult.riskLevel,
    isScam: riskResult.isScam,
    confidence: riskResult.confidence,
    threats,
    recommendations: riskResult.recommendations,
    summary,
    createdAt: new Date().toISOString()
  };

  return ConfirmationHandler.evaluatePolicy(analysis, {
    sensitiveData: Boolean(input.amountInCents && input.amountInCents > 100000),
    forceConfirm: input.forceConfirm
  });
}
