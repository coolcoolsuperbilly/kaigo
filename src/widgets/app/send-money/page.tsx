'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

interface SendMoneyData {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
  blocked?: boolean;
  requiresConfirmation?: boolean;
  alertId?: string;
  reason?: string;
  riskScore?: number;
  riskLevel?: string;
}

export default function SendMoneyWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const [formData, setFormData] = useState({
    senderHandle: '',
    receiverHandle: '',
    amountInCents: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [bypassAlert, setBypassAlert] = useState(false);

  const data = getToolOutput<SendMoneyData>();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendMoney = async () => {
    if (!formData.senderHandle || !formData.receiverHandle || !formData.amountInCents) {
      alert('Please fill in all required fields');
      return;
    }
    const amount = parseFloat(formData.amountInCents);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await callTool('send_money', {
        senderHandle: formData.senderHandle,
        receiverHandle: formData.receiverHandle,
        amountInCents: Math.round(amount * 100),
        note: formData.note || undefined,
        bypassSecurityAlert: bypassAlert
      });
    } catch (error) {
      console.error('Send money error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const inputBg = isDark ? '#111827' : '#f9fafb';

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

  if (data?.success && data?.transactionId) {
    return (
      <div style={{
        padding: '24px',
        background: isDark
          ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
          : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        borderRadius: '12px',
        border: `2px solid ${isDark ? '#10b981' : '#6ee7b7'}`,
        color: isDark ? '#ffffff' : '#065f46'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '32px' }}>✅</span>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Transfer Complete!</h3>
        </div>
        <div style={{
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Transaction ID:</strong> {data.transactionId?.substring(0, 12)}...
          </p>
          <p style={{ margin: 0 }}>
            {data.message}
          </p>
        </div>
      </div>
    );
  }

  if (data?.blocked) {
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
          <span style={{ fontSize: '32px' }}>🛑</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Transaction Blocked</h3>
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
          <strong>Reason:</strong> {data.reason}
        </p>
        {data.riskScore !== undefined && (
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            <p style={{ margin: '0 0 4px 0' }}>
              <strong>Risk Score:</strong> {data.riskScore}/100
            </p>
            <p style={{ margin: 0 }}>
              <strong>Risk Level:</strong> {data.riskLevel}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (data?.requiresConfirmation) {
    return (
      <div style={{
        padding: '24px',
        background: isDark
          ? 'linear-gradient(135deg, #92400e 0%, #b45309 100%)'
          : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '12px',
        border: `2px solid ${isDark ? '#f59e0b' : '#fbbf24'}`,
        color: isDark ? '#ffffff' : '#92400e'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Security Alert</h3>
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
          <strong>Alert:</strong> {data.reason}
        </p>
        {data.riskScore !== undefined && (
          <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '12px' }}>
            <p style={{ margin: '0 0 4px 0' }}>
              <strong>Risk Score:</strong> {data.riskScore}/100
            </p>
            <p style={{ margin: 0 }}>
              <strong>Risk Level:</strong> {data.riskLevel}
            </p>
          </div>
        )}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          cursor: 'pointer',
          marginBottom: '12px'
        }}>
          <input
            type="checkbox"
            checked={bypassAlert}
            onChange={(e) => setBypassAlert(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          I understand the risk and want to proceed
        </label>
        <button
          onClick={handleSendMoney}
          disabled={!bypassAlert || loading}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            background: !bypassAlert || loading
              ? isDark ? '#4b5563' : '#d1d5db'
              : isDark ? '#ef4444' : '#dc2626',
            color: !bypassAlert || loading
              ? isDark ? '#9ca3af' : '#6b7280'
              : '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: !bypassAlert || loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Proceed with Transfer'}
        </button>
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
      maxWidth: '420px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
          💸 Send Money
        </h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
          Transfer funds to another FUFA account
        </p>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          Your Handle (Sender)
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
            fontSize: '13px',
            boxSizing: 'border-box',
            opacity: loading ? 0.6 : 1
          }}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          Recipient Handle
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
            fontSize: '13px',
            boxSizing: 'border-box',
            opacity: loading ? 0.6 : 1
          }}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          Amount (in Rupees)
        </label>
        <input
          type="number"
          placeholder="e.g. 100.50"
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
            fontSize: '13px',
            boxSizing: 'border-box',
            opacity: loading ? 0.6 : 1
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          Note (Optional)
        </label>
        <textarea
          placeholder="Payment note or description"
          value={formData.note}
          onChange={(e) => handleChange('note', e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '6px',
            border: `1px solid ${borderColor}`,
            background: inputBg,
            color: textColor,
            fontSize: '13px',
            boxSizing: 'border-box',
            opacity: loading ? 0.6 : 1,
            minHeight: '60px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      <button
        onClick={handleSendMoney}
        disabled={loading || !formData.senderHandle || !formData.receiverHandle || !formData.amountInCents}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: loading || !formData.senderHandle || !formData.receiverHandle || !formData.amountInCents
            ? isDark ? '#4b5563' : '#d1d5db'
            : isDark ? '#10b981' : '#059669',
          color: loading || !formData.senderHandle || !formData.receiverHandle || !formData.amountInCents
            ? isDark ? '#9ca3af' : '#6b7280'
            : '#ffffff',
          fontSize: '15px',
          fontWeight: '600',
          cursor: loading || !formData.senderHandle || !formData.receiverHandle || !formData.amountInCents ? 'not-allowed' : 'pointer',
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
            Sending...
          </>
        ) : (
          <>
            <span>📤</span>
            Send Money
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
