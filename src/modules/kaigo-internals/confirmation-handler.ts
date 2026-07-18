import { alertManager } from './alert-manager.js';
import { AnalysisResult, RiskLevel, PolicyVerdict } from './types.js';

/**
 * Handles security confirmation policies for external orchestrators (LangGraph/MCP).
 * Evaluates whether an agent action should proceed, require explicit user approval,
 * or be blocked entirely.
 */
export class ConfirmationHandler {
  /**
   * Evaluates an agent action request based on its risk score and contextual metadata.
   */
  public static evaluatePolicy(
    result: AnalysisResult,
    actionContext?: {
      sensitiveData?: boolean;
      forceConfirm?: boolean;
    }
  ): PolicyVerdict {
    // 1. Critical scams or extreme risk levels are blocked outright
    if (result.riskLevel === RiskLevel.CRITICAL) {
      return {
        decision: 'BLOCK',
        reason: `Action blocked: Critical security risk detected (Score: ${result.riskScore}). Summary: ${result.summary}`,
        analysis: result
      };
    }

    // 2. High risk actions require explicit user confirmation
    if (result.riskLevel === RiskLevel.HIGH || actionContext?.forceConfirm) {
      const alert = alertManager.createAlert(result, true);
      return {
        decision: 'CONFIRM',
        alertId: alert?.id,
        reason: `Action requires confirmation: High risk indicators identified (Score: ${result.riskScore}). Summary: ${result.summary}`,
        analysis: result
      };
    }

    // 3. Medium risk actions that access sensitive data or are flagged as scam require confirmation
    if (result.riskLevel === RiskLevel.MEDIUM) {
      if (actionContext?.sensitiveData || result.isScam) {
        const alert = alertManager.createAlert(result, true);
        return {
          decision: 'CONFIRM',
          alertId: alert?.id,
          reason: `Action requires confirmation: Medium risk content accessing sensitive contexts (Score: ${result.riskScore}). Summary: ${result.summary}`,
          analysis: result
        };
      }

      // Otherwise, raise an alert but allow it (warn only)
      alertManager.createAlert(result);
      return {
        decision: 'ALLOW',
        reason: `Action allowed with warning: Minor indicators detected (Score: ${result.riskScore}).`,
        analysis: result
      };
    }

    // 4. Low risk is allowed immediately
    return {
      decision: 'ALLOW',
      reason: 'Action approved: Safe indicators.',
      analysis: result
    };
  }

  /**
   * Process confirmation response
   */
  public static resolveConfirmation(alertId: string, approved: boolean): boolean {
    return alertManager.confirmAlert(alertId, approved);
  }
}
