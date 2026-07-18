import { RiskLevel, ThreatIndicator } from './types.js';
import dotenv from 'dotenv';

dotenv.config();

const SCAM_THRESHOLD = parseInt(process.env.SCAM_THRESHOLD || '50', 10);

/**
 * Aggregates threat indicators, computes the final risk score (0-100),
 * risk level (LOW to CRITICAL), isScam flag, and confidence.
 */
export function calculateRisk(
  threats: ThreatIndicator[],
  baseScore = 0
): {
  riskScore: number;
  riskLevel: RiskLevel;
  isScam: boolean;
  confidence: number;
  recommendations: string[];
} {
  // Aggregate threat scores. We use a dampening factor so multiple threats
  // increase the score but don't just exceed 100 instantly.
  let aggregatedScore = baseScore;

  if (threats.length > 0) {
    // Sort threats by severity desc
    const sortedThreats = [...threats].sort((a, b) => b.score - a.score);

    // The highest score is the primary driver
    aggregatedScore += sortedThreats[0].score;

    // Additional threats add diminishing value
    for (let i = 1; i < sortedThreats.length; i++) {
      const remainingSpace = 100 - aggregatedScore;
      aggregatedScore += (sortedThreats[i].score / 100) * remainingSpace * 0.5;
    }
  }

  // Cap score between 0 and 100
  const riskScore = Math.min(100, Math.max(0, Math.round(aggregatedScore)));

  // Map score to risk level
  let riskLevel = RiskLevel.LOW;
  if (riskScore >= 85) {
    riskLevel = RiskLevel.CRITICAL;
  } else if (riskScore >= 60) {
    riskLevel = RiskLevel.HIGH;
  } else if (riskScore >= 30) {
    riskLevel = RiskLevel.MEDIUM;
  }

  const isScam = riskScore >= SCAM_THRESHOLD;

  // Confidence is determined by number of threat indicators and their severity
  let confidence = 0.5; // Base confidence
  if (threats.length === 1) {
    const severity = threats[0].severity;
    if (severity === RiskLevel.CRITICAL) confidence = 0.85;
    else if (severity === RiskLevel.HIGH) confidence = 0.75;
    else if (severity === RiskLevel.MEDIUM) confidence = 0.6;
    else confidence = 0.5;
  } else if (threats.length > 1) {
    const hasCriticalOrHigh = threats.some((t) => t.severity === RiskLevel.CRITICAL || t.severity === RiskLevel.HIGH);
    confidence = hasCriticalOrHigh ? 0.95 : 0.8;
  } else {
    // No threats detected
    confidence = 0.9; // Highly confident it is safe
  }

  // Generate actionable recommendations based on detected threats
  const recommendations: string[] = [];

  if (threats.length === 0) {
    recommendations.push('No threats detected. Standard precautions apply.');
  } else {
    // Add specific recommendations based on threat types
    const threatTypes = new Set(threats.map((t) => t.type));

    if (threatTypes.has('urgency_language') || threatTypes.has('psychological_pressure')) {
      recommendations.push(
        "Verify the sender's identity through official channels before taking action. Do not let urgency rush you."
      );
    }
    if (threatTypes.has('suspicious_url') || threatTypes.has('typosquatting') || threatTypes.has('suspicious_tld')) {
      recommendations.push(
        'Do NOT click on any link in the message. Navigate directly to the official website of the service.'
      );
    }
    if (threatTypes.has('credential_request') || threatTypes.has('otp_interception')) {
      recommendations.push(
        'NEVER share passwords, OTPs, or PINs. Financial institutions and government agencies will never ask for them.'
      );
    }
    if (threatTypes.has('suspicious_sender') || threatTypes.has('sender_spoofing') || threatTypes.has('blacklisted_recipient')) {
      recommendations.push('Block this sender/recipient and report the transaction to your financial institution.');
    }
    if (
      threatTypes.has('high_amount_txn') ||
      threatTypes.has('suspicious_recipient') ||
      threatTypes.has('velocity_anomaly')
    ) {
      recommendations.push(
        "Double-check the recipient's identity and banking details. For high-value transactions, verify via a voice call."
      );
    }
    if (threatTypes.has('upi_payment_payload')) {
      recommendations.push(
        'Verify the merchant name and payment amount on the UPI application before entering your UPI PIN.'
      );
    }

    // Always add a general safety catch-all for scams
    recommendations.push(
      'If you suspect fraud, report it immediately to the National Cyber Crime Portal (cybercrime.gov.in) or call 1930.'
    );
  }

  return {
    riskScore,
    riskLevel,
    isScam,
    confidence,
    recommendations
  };
}

/**
 * Heuristics Rules Engine Utilities
 * Provides shared algorithms for detecting brand impersonation,
 * string similarity, entropy analysis, and keyword scanning.
 */

// Calculate Levenshtein Distance between two strings
// Used for typosquatting/homograph attack detection
export function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  let i, j, val;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      val = a[i - 1] === b[j - 1] ? 0 : 1;
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + val // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

// Check if domain is typosquatting any of the trusted domains
// Returns the trusted domain name if it is a close match, otherwise null
export function detectBrandImpersonation(domain: string, trustedDomains: string[]): string | null {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
  const parts = cleanDomain.split('.');
  const mainPart = parts[0];

  for (const trusted of trustedDomains) {
    const trustedParts = trusted.split('.');
    const trustedMain = trustedParts[0];

    // Exact match is not impersonation
    if (cleanDomain === trusted.toLowerCase() || cleanDomain.endsWith('.' + trusted.toLowerCase())) {
      continue;
    }

    const distance = getLevenshteinDistance(mainPart, trustedMain);

    if (
      (distance > 0 && distance <= 2 && trustedMain.length >= 3) ||
      (mainPart.includes(trustedMain) && mainPart.length > trustedMain.length && mainPart.length <= trustedMain.length + 10)
    ) {
      return trusted;
    }
  }
  return null;
}

// Calculate Shannon Entropy of a string to detect randomized strings
export function getShannonEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;

  const frequencies: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

// Helper: Scan text for keywords and calculate aggregated weight
export interface KeywordMatch {
  term: string;
  matchedEvidence: string;
  weight: number;
}

export function scanKeywords(
  text: string,
  keywords: Array<{ term: string; weight: number; indianContext?: boolean }>
): KeywordMatch[] {
  const lowerText = text.toLowerCase();
  const matches: KeywordMatch[] = [];

  for (const item of keywords) {
    const escapedTerm = item.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedTerm}\\b|${escapedTerm}`, 'gi');
    const hasMatch = regex.test(lowerText);

    if (hasMatch) {
      matches.push({
        term: item.term,
        matchedEvidence: item.term,
        weight: item.weight
      });
    }
  }

  return matches;
}
