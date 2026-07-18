import { SecurityAlert, AnalysisResult, RiskLevel } from './types.js';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';

dotenv.config();

const CONFIRMATION_THRESHOLD = parseInt(process.env.CONFIRMATION_THRESHOLD || '70', 10);

export class AlertManager extends EventEmitter {
  private alerts: Map<string, SecurityAlert> = new Map();

  constructor() {
    super();
  }

  // Create an alert from an AnalysisResult
  public createAlert(result: AnalysisResult, forceConfirmation = false): SecurityAlert | null {
    // We only generate alerts for Medium, High or Critical risks
    if (result.riskLevel === RiskLevel.LOW) {
      return null;
    }

    const requiresConfirmation = forceConfirmation || result.riskScore >= CONFIRMATION_THRESHOLD;

    // Severity-based description/title prefixes
    let title = 'Security Alert';
    if (result.riskLevel === RiskLevel.CRITICAL) {
      title = 'CRITICAL Scam Attempt Detected';
    } else if (result.riskLevel === RiskLevel.HIGH) {
      title = 'High Risk Potential Scam Detected';
    } else if (result.riskLevel === RiskLevel.MEDIUM) {
      title = 'Suspicious Activity Warning';
    }

    const alert: SecurityAlert = {
      id: uuidv4(),
      analysisId: result.id,
      severity: result.riskLevel,
      title,
      description: result.summary,
      requiresConfirmation,
      confirmed: null, // Pending status
      createdAt: new Date().toISOString()
    };

    // If confirmation is required, set an expiration window of 5 minutes
    if (requiresConfirmation) {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);
      alert.expiresAt = expiresAt.toISOString();
    }

    this.alerts.set(alert.id, alert);
    this.emit('alert', alert);
    return alert;
  }

  // Get alert by ID
  public getAlert(id: string): SecurityAlert | undefined {
    return this.alerts.get(id);
  }

  // Update alert confirmation status
  public confirmAlert(id: string, confirmed: boolean): boolean {
    const alert = this.alerts.get(id);
    if (!alert) return false;

    // Check expiration
    if (alert.expiresAt && new Date(alert.expiresAt) < new Date()) {
      alert.confirmed = false; // Automatically marked as blocked/denied on timeout
      return false;
    }

    alert.confirmed = confirmed;
    this.emit('resolve', alert);
    return true;
  }

  // Get all alerts with optional filtering
  public getAlerts(filters?: {
    severity?: RiskLevel;
    requiresConfirmation?: boolean;
    confirmed?: boolean | null;
    limit?: number;
  }): SecurityAlert[] {
    let list = Array.from(this.alerts.values());

    if (filters) {
      if (filters.severity) {
        list = list.filter((a) => a.severity === filters.severity);
      }
      if (filters.requiresConfirmation !== undefined) {
        list = list.filter((a) => a.requiresConfirmation === filters.requiresConfirmation);
      }
      if (filters.confirmed !== undefined) {
        list = list.filter((a) => a.confirmed === filters.confirmed);
      }
    }

    // Sort by createdAt desc
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filters?.limit) {
      list = list.slice(0, filters.limit);
    }

    return list;
  }

  // Get system statistics
  public getStats(): {
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    mediumAlerts: number;
    pendingConfirmations: number;
    confirmedBlocked: number;
    confirmedAllowed: number;
  } {
    const alertsList = Array.from(this.alerts.values());

    return {
      totalAlerts: alertsList.length,
      criticalAlerts: alertsList.filter((a) => a.severity === RiskLevel.CRITICAL).length,
      highAlerts: alertsList.filter((a) => a.severity === RiskLevel.HIGH).length,
      mediumAlerts: alertsList.filter((a) => a.severity === RiskLevel.MEDIUM).length,
      pendingConfirmations: alertsList.filter((a) => a.requiresConfirmation && a.confirmed === null).length,
      confirmedBlocked: alertsList.filter((a) => a.requiresConfirmation && a.confirmed === false).length,
      confirmedAllowed: alertsList.filter((a) => a.requiresConfirmation && a.confirmed === true).length
    };
  }

  // Clear all alerts (useful for testing)
  public clear(): void {
    this.alerts.clear();
  }
}

// Export singleton instance
export const alertManager = new AlertManager();
