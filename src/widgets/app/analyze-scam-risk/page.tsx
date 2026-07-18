'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';
import {
  Loader2,
  Search,
  RotateCcw,
  Flame,
  Check
} from 'lucide-react';
import '../style.css';

export const dynamic = 'force-dynamic';

interface ScamAnalysisData {
  success: boolean;
  decision?: 'BLOCK' | 'FLAG' | 'ALLOW' | 'MANUAL_REVIEW';
  riskScore?: number;
  riskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  isScam?: boolean;
  confidence?: number;
  reason?: string;
  threats?: string[];
  recommendations?: string[];
  summary?: string;
  error?: string;
}

export default function AnalyzeScamRiskWidget() {
  // theme is intentionally not used to drive palette — this tile keeps its
  // own dark "poster" identity regardless of host theme, same as a real
  // Netflix embed would.
  useTheme();
  const { isReady, getToolOutput, callTool } = useWidgetSDK();

  const [formData, setFormData] = useState({
    senderHandle: '',
    receiverHandle: '',
    amount: '',
    note: '',
    messageText: ''
  });
  const [loading, setLoading] = useState(false);
  const data = getToolOutput<ScamAnalysisData>();

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    if (!formData.senderHandle && !formData.messageText) return;
    setLoading(true);
    try {
      await callTool('analyze_scam_risk', {
        senderHandle: formData.senderHandle || undefined,
        receiverHandle: formData.receiverHandle || undefined,
        amountInCents: formData.amount ? Math.round(parseFloat(formData.amount) * 100) : undefined,
        note: formData.note || undefined,
        messageText: formData.messageText || undefined
      });
    } catch (error) {
      console.error('Analyze scam risk error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || (!formData.senderHandle && !formData.messageText);

  // Risk -> design-system severity classes (see netflix-style-guide.md).
  const getRiskTheme = (level?: string) => {
    switch (level) {
      case 'CRITICAL':
        return { hero: 'nf-hero--critical', score: 'nf-score--negative', label: 'CRITICAL' };
      case 'HIGH':
        return { hero: 'nf-hero--high', score: 'nf-score--negative', label: 'HIGH' };
      case 'MEDIUM':
        return { hero: 'nf-hero--medium', score: 'nf-score--caution', label: 'MEDIUM' };
      case 'LOW':
        return { hero: 'nf-hero--low', score: 'nf-score--positive', label: 'LOW' };
      default:
        return { hero: 'nf-hero--neutral', score: 'nf-score--positive', label: '' };
    }
  };

  if (!isReady) {
    return (
      <div className="nf-wrapper">
        <div className="nf-card nf-loading">
          <Loader2 className="nf-spin" size={22} color="#E50914" />
        </div>
      </div>
    );
  }

  const riskTheme = getRiskTheme(data?.riskLevel);
  const safetyScore = data?.riskScore !== undefined ? Math.max(0, 100 - data.riskScore) : undefined;

  return (
    <div className="nf-wrapper">
      <div className="nf-card">
        {data?.success && data?.riskLevel ? (
          <>
            <div className={`nf-hero ${riskTheme.hero}`}>
              <span className="nf-brand-mark">Threat Scan</span>
              <h3 className="nf-hero-title">
                {data.isScam ? 'Likely Scam Detected' : 'Scan Complete'}
              </h3>
              <p className="nf-hero-sub">Automated risk assessment result</p>

              <div className="nf-score-row">
                <div>
                  <div className={`nf-score ${riskTheme.score}`}>{safetyScore}%</div>
                  <div className="nf-score-label">Safety Score</div>
                </div>
                <div className="nf-rating-chip">
                  <Flame size={11} />
                  {riskTheme.label}
                </div>
              </div>
            </div>

            <div className="nf-body">
              <div className="nf-row-between">
                <span className="nf-eyebrow">Verdict</span>
                <span className="nf-value">{data.decision}</span>
              </div>

              {data.reason && <p className="nf-synopsis">{data.reason}</p>}

              {data.threats && data.threats.length > 0 && (
                <>
                  <p className="nf-section-title">Flagged For</p>
                  <div className="nf-pills">
                    {data.threats.map((threat, idx) => (
                      <span className="nf-pill" key={idx}>{threat}</span>
                    ))}
                  </div>
                </>
              )}

              {data.recommendations && data.recommendations.length > 0 && (
                <>
                  {data.threats && data.threats.length > 0 && <hr className="nf-divider" />}
                  <p className="nf-section-title">Recommended Actions</p>
                  <ul className="nf-list">
                    {data.recommendations.map((rec, idx) => (
                      <li className="nf-list-item" key={idx}>
                        <Check size={14} className="nf-list-icon" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="nf-actions">
                <button
                  type="button"
                  className="nf-btn nf-btn-ghost"
                  onClick={() => setFormData({ senderHandle: '', receiverHandle: '', amount: '', note: '', messageText: '' })}
                >
                  <RotateCcw size={14} />
                  New Scan
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="nf-hero nf-hero--neutral" style={{ paddingBottom: 20 }}>
              <span className="nf-brand-mark">Threat Scan</span>
              <h3 className="nf-hero-title">Scam Risk Analysis</h3>
              <p className="nf-hero-sub">Scan a handle, message, or link for threat indicators</p>
            </div>

            <div className="nf-body">
              <div className="nf-field">
                <label className="nf-field-label">Target Entity</label>
                <input
                  type="text"
                  placeholder="Phone, email, or handle"
                  value={formData.senderHandle}
                  onChange={(e) => handleChange('senderHandle', e.target.value)}
                  disabled={loading}
                  className="nf-input"
                />
              </div>

              <div className="nf-field">
                <label className="nf-field-label">Message / Link Payload</label>
                <textarea
                  placeholder="Paste the suspicious SMS, email body, or URL..."
                  value={formData.messageText}
                  onChange={(e) => handleChange('messageText', e.target.value)}
                  disabled={loading}
                  className="nf-textarea"
                />
              </div>

              <div className="nf-row-2">
                <div className="nf-field">
                  <label className="nf-field-label">Amount</label>
                  <div className="nf-prefix-group">
                    <span className="nf-prefix">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      disabled={loading}
                      className="nf-input"
                    />
                  </div>
                </div>
                <div className="nf-field">
                  <label className="nf-field-label">Context</label>
                  <input
                    type="text"
                    placeholder="Optional note..."
                    value={formData.note}
                    onChange={(e) => handleChange('note', e.target.value)}
                    disabled={loading}
                    className="nf-input"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isSubmitDisabled}
                className="nf-cta"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="nf-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search size={15} />
                    Analyze Risk
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}