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
  const bgColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const inputBg = isDark ? '#111827' : '#f9fafb';

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'CRITICAL':
        return isDark ? '#dc2626' : '#ef4444';
      case 'HIGH':
        return isDark ? '#f59e0b' : '#f97316';
      case 'MEDIUM':
        return isDark ? '#eab308' : '#eab308';
      case 'LOW':
        return isDark ? '#10b981' : '#22c55e';
      default:
        return isDark ? '#6b7280' : '#9ca3af';
    }
  };

  const getRiskIcon = (level?: string) => {
    switch (level) {
      case 'CRITICAL':
        return '🚨';
      case 'HIGH':
        return '⚠️';
      case 'MEDIUM':
        return '⚡';
      case 'LOW':
        return '✅';
      default:
        return '❓';
    }
  };

  if (!isReady) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: textColor,
        background: bgColor,
        borderRadius: '12px'
      }}>
        Initializing...
      </div>
    );
  }

  if (data?.success && data?.riskLevel) {
    const riskColor = getRiskColor(data.riskLevel);
    const riskIcon = getRiskIcon(data.riskLevel);

    return (
      <div style={{
        padding: '24px',
        background: bgColor,
        borderRadius: '12px',
        border: `2px solid ${riskColor}`,
        color: textColor,
        maxWidth: '500px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontSize: '40px' }}>{riskIcon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              Scam Risk Analysis
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.7 }}>
              Decision: <strong style={{ color: riskColor }}>{data.decision}</strong>
            </p>
          </div>
        </div>

        <div style={{
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.7 }}>Risk Score</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: riskColor }}>
                {data.riskScore}/100
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.7 }}>Risk Level</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: riskColor }}>
                {data.riskLevel}
              </p>
            </div>
          </div>
          {data.confidence !== undefined && (
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.7 }}>Confidence</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                {(data.confidence * 100).toFixed(0)}%
              </p>
            </div>
          )}
        </div>

        {data.reason && (
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '12px',
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Reason:</p>
            <p style={{ margin: 0 }}>{data.reason}</p>
          </div>
        )}

        {data.threats && data.threats.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600' }}>
              🚩 Detected Threats:
            </p>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '12px',
              lineHeight: '1.6'
            }}>
              {data.threats.map((threat, idx) => (
                <li key={idx} style={{ margin: '4px 0' }}>{threat}</li>
              ))}
            </ul>
          </div>
        )}

        {data.recommendations && data.recommendations.length > 0 && (
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600' }}>
              💡 Recommendations:
            </p>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '12px',
              lineHeight: '1.6'
            }}>
              {data.recommendations.map((rec, idx) => (
                <li key={idx} style={{ margin: '4px 0' }}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (data?.error) {
    return (
      <div style={{
        padding: '24px',
        background: isDark
          ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
          : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        borderRadius: '12px',
        border: `2px solid ${isDark ? '#ef4444' : '#fca5a5'}`,
        color: isDark ? '#ffffff' : '#7f1d1d'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '32px' }}>❌</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Error</h3>
        </div>
        <p style={{ margin: 0, fontSize: '14px' }}>{data.error}</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      background: bgColor,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      color: textColor,
      maxWidth: '500px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
          🔍 Analyze Scam Risk
        </h2>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.7 }}>
          Check transaction or message for fraud indicators
        </p>
      </div>

      <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '8px', marginBottom: '16px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            Sender Handle
          </label>
          <input
            type="text"
            placeholder="e.g. john.doe@fufa"
            value={formData.senderHandle}
            onChange={(e) => handleChange('senderHandle', e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              background: inputBg,
              color: textColor,
              fontSize: '12px',
              boxSizing: 'border-box',
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            Receiver Handle
          </label>
          <input
            type="text"
            placeholder="e.g. jane.smith@fufa"
            value={formData.receiverHandle}
            onChange={(e) => handleChange('receiverHandle', e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              background: inputBg,
              color: textColor,
              fontSize: '12px',
              boxSizing: 'border-box',
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            Amount (in Rupees)
          </label>
          <input
            type="number"
            placeholder="e.g. 500"
            value={formData.amountInCents}
            onChange={(e) => handleChange('amountInCents', e.target.value)}
            disabled={loading}
            step="0.01"
            min="0"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              background: inputBg,
              color: textColor,
              fontSize: '12px',
              boxSizing: 'border-box',
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            Note / Message
          </label>
          <textarea
            placeholder="Transaction note or SMS message text"
            value={formData.messageText || formData.note}
            onChange={(e) => handleChange('messageText', e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              background: inputBg,
              color: textColor,
              fontSize: '12px',
              boxSizing: 'border-box',
              opacity: loading ? 0.6 : 1,
              minHeight: '70px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || (!formData.senderHandle && !formData.messageText)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: loading || (!formData.senderHandle && !formData.messageText)
            ? isDark ? '#4b5563' : '#d1d5db'
            : isDark ? '#8b5cf6' : '#7c3aed',
          color: loading || (!formData.senderHandle && !formData.messageText)
            ? isDark ? '#9ca3af' : '#6b7280'
            : '#ffffff',
          fontSize: '14px',
          fontWeight: '600',
          cursor: loading || (!formData.senderHandle && !formData.messageText) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
            Analyzing...
          </>
        ) : (
          <>
            <span>🔎</span>
            Analyze Risk
          </>
        )}
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
