'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

interface ScamAnalysisData {
  success: boolean;
  decision?: string;
  riskScore?: number;
  riskLevel?: string;
  isScam?: boolean;
  confidence?: number;
  reason?: string;
  threats?: string[];
  recommendations?: string[];
  summary?: string;
  error?: string;
}

export default function AnalyzeScamRiskWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const [formData, setFormData] = useState({
    senderHandle: '',
    receiverHandle: '',
    amountInCents: '',
    note: '',
    messageText: ''
  });
  const [loading, setLoading] = useState(false);

  const data = getToolOutput<ScamAnalysisData>();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    if (!formData.senderHandle && !formData.messageText) {
      alert('Please enter at least sender handle or message text');
      return;
    }

    setLoading(true);
    try {
      await callTool('analyze_scam_risk', {
        senderHandle: formData.senderHandle || undefined,
        receiverHandle: formData.receiverHandle || undefined,
        amountInCents: formData.amountInCents ? parseFloat(formData.amountInCents) * 100 : undefined,
        note: formData.note || undefined,
        messageText: formData.messageText || undefined
      });
    } catch (error) {
      console.error('Analyze scam risk error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  const cardBg = isDark
    ? 'linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.98))'
    : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const inputBg = isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff';
  const inputBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0';

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#10b981';
      default: return '#64748b';
    }
  };

  const getRiskBadgeBg = (level?: string) => {
    switch (level) {
      case 'CRITICAL': return isDark ? 'rgba(239,68,68,0.2)' : '#fee2e2';
      case 'HIGH': return isDark ? 'rgba(249,115,22,0.2)' : '#ffedd5';
      case 'MEDIUM': return isDark ? 'rgba(234,179,8,0.2)' : '#fef9c3';
      case 'LOW': return isDark ? 'rgba(16,185,129,0.2)' : '#d1fae5';
      default: return isDark ? 'rgba(100,116,139,0.2)' : '#f1f5f9';
    }
  };

  if (!isReady) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        color: subTextColor,
        background: cardBg,
        borderRadius: '20px',
        border: `1px solid ${borderColor}`
      }}>
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
        <div style={{ fontSize: '14px', fontWeight: 500 }}>Initializing Security Engine...</div>
      </div>
    );
  }

  if (data?.success && data?.riskLevel) {
    const riskColor = getRiskColor(data.riskLevel);
    const riskBg = getRiskBadgeBg(data.riskLevel);

    return (
      <div style={{
        padding: '28px',
        background: cardBg,
        borderRadius: '24px',
        border: `1px solid ${riskColor}`,
        color: textColor,
        maxWidth: '480px',
        boxShadow: `0 25px 50px -12px ${riskColor}33`,
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: riskBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              color: riskColor
            }}>
              🛡️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                Scam Risk Analysis
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: subTextColor }}>
                Verdict: <strong style={{ color: riskColor }}>{data.decision}</strong>
              </p>
            </div>
          </div>
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 800,
            background: riskBg,
            color: riskColor,
            letterSpacing: '0.5px',
            border: `1px solid ${riskColor}44`
          }}>
            {data.riskLevel}
          </span>
        </div>

        <div style={{
          background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
          padding: '18px',
          borderRadius: '16px',
          marginBottom: '16px',
          border: `1px solid ${borderColor}`
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: subTextColor, textTransform: 'uppercase' }}>Threat Score</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: riskColor, fontFamily: 'Outfit, sans-serif' }}>
                {data.riskScore}<span style={{ fontSize: '14px', opacity: 0.6 }}>/100</span>
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: subTextColor, textTransform: 'uppercase' }}>Confidence</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                {data.confidence !== undefined ? `${(data.confidence * 100).toFixed(0)}%` : 'N/A'}
              </p>
            </div>
          </div>
          {data.reason && (
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', lineHeight: 1.5, opacity: 0.9, paddingTop: '8px', borderTop: `1px solid ${borderColor}` }}>
              {data.reason}
            </p>
          )}
        </div>

        {data.threats && data.threats.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 700, color: subTextColor, textTransform: 'uppercase' }}>
              🚩 Identified Threat Flags
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.threats.map((threat, idx) => (
                <div key={idx} style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                  fontSize: '12px',
                  color: isDark ? '#fca5a5' : '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '8px' }}>🔴</span> {threat}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.recommendations && data.recommendations.length > 0 && (
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 700, color: subTextColor, textTransform: 'uppercase' }}>
              💡 Security Recommendations
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.recommendations.map((rec, idx) => (
                <div key={idx} style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                  fontSize: '12px',
                  color: isDark ? '#93c5fd' : '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🔹</span> {rec}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: '28px',
      background: cardBg,
      borderRadius: '24px',
      border: `1px solid ${borderColor}`,
      color: textColor,
      maxWidth: '480px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(16px)'
    }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#ffffff',
          boxShadow: '0 8px 16px -4px rgba(139, 92, 246, 0.5)'
        }}>
          🔍
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.3px' }}>
            Analyze Scam Risk
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: subTextColor }}>
            Real-time heuristic fraud threat scan
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '6px' }}>
          Sender Handle / Phone Number
        </label>
        <input
          type="text"
          placeholder="e.g. john.doe@fufa or +919876543210"
          value={formData.senderHandle}
          onChange={(e) => handleChange('senderHandle', e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '10px',
            border: `1px solid ${inputBorder}`,
            background: inputBg,
            color: textColor,
            fontSize: '13px',
            outline: 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '6px' }}>
          SMS / Message Text / Link URL
        </label>
        <textarea
          placeholder="Paste SMS body or link text here for scam analysis..."
          value={formData.messageText}
          onChange={(e) => handleChange('messageText', e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '10px',
            border: `1px solid ${inputBorder}`,
            background: inputBg,
            color: textColor,
            fontSize: '13px',
            outline: 'none',
            minHeight: '70px',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || (!formData.senderHandle && !formData.messageText)}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: loading || (!formData.senderHandle && !formData.messageText)
            ? isDark ? '#334155' : '#cbd5e1'
            : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          color: loading || (!formData.senderHandle && !formData.messageText)
            ? isDark ? '#64748b' : '#94a3b8'
            : '#ffffff',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'Outfit, sans-serif',
          cursor: loading || (!formData.senderHandle && !formData.messageText) ? 'not-allowed' : 'pointer',
          boxShadow: loading || (!formData.senderHandle && !formData.messageText) ? 'none' : '0 10px 20px -5px rgba(139, 92, 246, 0.4)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Analyzing Fraud Indicators...
          </>
        ) : (
          'Run Scam Security Scan →'
        )}
      </button>
    </div>
  );
}
