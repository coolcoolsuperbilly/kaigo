/**
 * Threat Intelligence Database (In-Memory)
 * Stores lists of known malicious indicators, whitelisted domains,
 * and Indian banking/BFSI context patterns for the heuristic rules engine.
 */

// Known phishing, typosquatted, or temporary top-level domains (TLDs)
export const SUSPICIOUS_TLDS = new Set([
  "xyz",
  "top",
  "tk",
  "click",
  "gq",
  "cf",
  "ml",
  "ga",
  "fit",
  "loan",
  "win",
  "club",
  "work",
  "vip",
  "info",
  "cc",
  "ru",
  "su",
  "cn",
  "link",
  "online"
]);

// Whitelist of popular, highly trusted domains to prevent false positives
// and to perform domain typosquatting / distance comparison against
export const TRUSTED_DOMAINS = [
  // Global tech & finance
  "google.com",
  "apple.com",
  "microsoft.com",
  "amazon.com",
  "netflix.com",
  "paypal.com",
  "github.com",
  "facebook.com",
  "twitter.com",
  "linkedin.com",

  // Indian E-commerce & Tech
  "flipkart.com",
  "amazon.in",
  "myntra.com",
  "paytm.com",
  "phonepe.com",
  "bhimupi.org.in",

  // Indian Banking & Government (BFSI)
  "sbi.co.in",
  "statebankofindia.com",
  "onlinesbi.sbi",
  "onlinesbi.com",
  "hdfcbank.com",
  "icicibank.com",
  "axisbank.com",
  "kotak.com",
  "pnbindia.in",
  "bankofbaroda.in",
  "rbi.org.in",
  "uidai.gov.in", // Aadhaar
  "incometax.gov.in", // Income tax / PAN
  "npscra.nsdl.co.in", // National Pension System
  "licindia.in" // Life Insurance Corporation
];

// Keywords commonly associated with SMS phishing (Smishing)
// Structured with weights (high, medium, low severity)
export const SMS_SCAM_KEYWORDS = [
  // High Severity (Immediate action, threats, credentials)
  { term: "blocked", weight: 25, indianContext: false },
  { term: "suspended", weight: 25, indianContext: false },
  { term: "suspension", weight: 25, indianContext: false },
  { term: "verification required", weight: 20, indianContext: false },
  { term: "kyc", weight: 35, indianContext: true }, // Indian KYC scams are extremely common
  { term: "pan card", weight: 30, indianContext: true },
  { term: "aadhaar", weight: 30, indianContext: true },
  { term: "otp", weight: 25, indianContext: true },
  { term: "one time password", weight: 25, indianContext: false },
  { term: "verify your account", weight: 20, indianContext: false },
  { term: "verify", weight: 20, indianContext: false },
  { term: "update details", weight: 15, indianContext: false },

  // Medium Severity (Rewards, lotteries, urgent action)
  { term: "lottery", weight: 20, indianContext: false },
  { term: "lucky draw", weight: 20, indianContext: true },
  { term: "won price", weight: 15, indianContext: false },
  { term: "cashback", weight: 15, indianContext: true },
  { term: "reward points", weight: 15, indianContext: false },
  { term: "gift card", weight: 15, indianContext: false },
  { term: "part time job", weight: 20, indianContext: true },
  { term: "earn rs", weight: 20, indianContext: true },
  { term: "salary credit", weight: 15, indianContext: false },
  { term: "electricity bill", weight: 25, indianContext: true }, // Indian electricity bill disconnection scam
  { term: "power cut", weight: 25, indianContext: true },
  { term: "expired", weight: 20, indianContext: false },

  // Urgent Action Triggers
  { term: "immediately", weight: 15, indianContext: false },
  { term: "urgent", weight: 20, indianContext: false },
  { term: "action required", weight: 10, indianContext: false },
  { term: "hurry up", weight: 10, indianContext: false }
];

// Common scam sender formats
// e.g., short codes, random alphanumeric senders (very common in Indian SMS header format: e.g., "AD-SBIINB")
export const SUSPICIOUS_SENDER_PATTERNS = [
  /^[A-Z]{2}-[A-Z]{6}$/, // Standard Indian transactional header format, but scammers typosquat them (e.g. DZ-PAYTMM)
  /^\+?[0-9]{12}$/,      // International numbers sending local bank notices
  /^[0-9]{5}$/           // Short codes
];

// Known blacklisted entities (Mock DB for hackathon demo capability)
export const BLACKLISTED_DOMAINS = new Set([
  "sbi-security-verify.xyz",
  "hdfc-kyc-update.net",
  "paytm-rewards-claim.in",
  "aadhaar-pan-link.cc",
  "rbi-bonus-claim.top",
  "electricity-bill-pay.click",
  "sbi-netbanking-login.work",
  "verification-portal.online",
  "sbi-rewards-claim.in"
]);

export const BLACKLISTED_PHONE_NUMBERS = new Set([
  "+919876543210",
  "+919999988888",
  "+918888877777",
  "14000" // Telemarketing / scam prefix block in India
]);

export const BLACKLISTED_UPI_HANDLES = new Set([
  "scammer@ybl",
  "refund-manager@upi",
  "sbi-helpdesk@ybl",
  "paytm-rewards@paytm",
  "electricity-pay@okaxis",
  "scammer.account@fufa",
  "fake.refund@fufa"
]);

// Helper: check if domain is whitelisted
export function isWhitelisted(domain: string): boolean {
  const cleanDomain = domain.toLowerCase().trim();
  return TRUSTED_DOMAINS.some(trusted => 
    cleanDomain === trusted || cleanDomain.endsWith("." + trusted)
  );
}

// Helper: check if domain is blacklisted
export function isBlacklistedDomain(domain: string): boolean {
  const cleanDomain = domain.toLowerCase().trim();
  return BLACKLISTED_DOMAINS.has(cleanDomain);
}
