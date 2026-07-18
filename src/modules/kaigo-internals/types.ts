export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ThreatIndicator {
  type: string;
  severity: RiskLevel;
  score: number;
  description: string;
  evidence?: string;
}

export interface AnalysisResult {
  id: string;
  riskScore: number;
  riskLevel: RiskLevel;
  isScam: boolean;
  confidence: number;
  threats: ThreatIndicator[];
  recommendations: string[];
  summary: string;
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  analysisId: string;
  severity: RiskLevel;
  title: string;
  description: string;
  requiresConfirmation: boolean;
  confirmed: boolean | null; // null = pending, true = allowed/confirmed, false = blocked
  expiresAt?: string;
  createdAt: string;
}

export type PolicyDecision = 'ALLOW' | 'CONFIRM' | 'BLOCK';

export interface PolicyVerdict {
  decision: PolicyDecision;
  alertId?: string;
  reason: string;
  analysis?: AnalysisResult;
}
