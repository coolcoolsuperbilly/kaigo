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

  const cardBg = isDark
    ? 'linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.98))'
    : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const inputBg = isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff';
  const inputBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0';

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
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
        <div style={{ fontSize: '14px', fontWeight: 500 }}>Initializing Payment Engine...</div>
      </div>
    );
  }

  if (data?.success && data?.transactionId) {
    return (
      <div style={{
        padding: '28px',
        background: isDark
          ? 'linear-gradient(145deg, rgba(6, 78, 59, 0.9), rgba(4, 120, 87, 0.95))'
          : 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: '24px',
        border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.4)' : '#a7f3d0'}`,
        color: isDark ? '#ffffff' : '#065f46',
        boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.25)',
        maxWidth: '440px',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: isDark ? 'rgba(255,255,255,0.15)' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            ✅
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              Transfer Complete!
            </h3>
            <span style={{
              display: 'inline-block',
              marginTop: '4px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              background: isDark ? 'rgba(255,255,255,0.2)' : '#10b981',
              color: '#ffffff'
            }}>
              SETTLED IN LEDGER
            </span>
          </div>
        </div>

        <div style={{
          background: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.7)',
          padding: '20px',
          borderRadius: '16px',
          fontSize: '14px',
          lineHeight: 1.6,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ opacity: 0.8 }}>Transaction ID</span>
            <strong style={{ fontFamily: 'monospace' }}>{data.transactionId?.substring(0, 12)}...</strong>
          </div>
          <p style={{ margin: '12px 0 0 0', paddingTop: '12px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}`, fontSize: '13px' }}>
            {data.message}
          </p>
        </div>
      </div>
    );
  }

  if (data?.blocked) {
    return (
      <div style={{
        padding: '28px',
        background: isDark
          ? 'linear-gradient(145deg, rgba(127, 29, 29, 0.95), rgba(153, 27, 27, 0.98))'
          : 'linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%)',
        borderRadius: '24px',
        border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.4)' : '#fca5a5'}`,
        color: isDark ? '#ffffff' : '#7f1d1d',
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
        maxWidth: '440px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: isDark ? 'rgba(255,255,255,0.15)' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px'
          }}>
            🛑
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              Transaction Blocked
            </h3>
            <span style={{ fontSize: '12px', opacity: 0.85 }}>Scam Prevention Engine Intervened</span>
          </div>
        </div>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: 1.5, background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)', padding: '12px 14px', borderRadius: '12px' }}>
          <strong>Reason:</strong> {data.reason}
        </p>
        {data.riskScore !== undefined && (
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', opacity: 0.95 }}>
            <div>Risk Score: <strong>{data.riskScore}/100</strong></div>
            <div>Risk Level: <strong>{data.riskLevel}</strong></div>
          </div>
        )}
      </div>
    );
  }

  if (data?.requiresConfirmation) {
    return (
      <div style={{
        padding: '28px',
        background: isDark
          ? 'linear-gradient(145deg, rgba(146, 64, 14, 0.95), rgba(180, 83, 9, 0.98))'
          : 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)',
        borderRadius: '24px',
        border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.4)' : '#fde68a'}`,
        color: isDark ? '#ffffff' : '#92400e',
        boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.25)',
        maxWidth: '440px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: isDark ? 'rgba(255,255,255,0.15)' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px'
          }}>
            ⚠️
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              Security Confirmation Required
            </h3>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Heuristic Risk Flag Triggered</span>
          </div>
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: '14px', lineHeight: 1.5, background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)', padding: '12px 14px', borderRadius: '12px' }}>
          {data.reason}
        </p>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          cursor: 'pointer',
          marginBottom: '16px',
          fontWeight: 500
        }}>
          <input
            type="checkbox"
            checked={bypassAlert}
            onChange={(e) => setBypassAlert(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#f59e0b', cursor: 'pointer' }}
          />
          I have verified the recipient and accept full risk
        </label>
        <button
          type="button"
          onClick={handleSendMoney}
          disabled={!bypassAlert || loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: !bypassAlert || loading
              ? isDark ? '#475569' : '#cbd5e1'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 700,
            cursor: !bypassAlert || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? 'Executing Transfer...' : 'Override & Send Money →'}
        </button>
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
      maxWidth: '440px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(16px)'
    }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#ffffff',
          boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.5)'
        }}>
          💸
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.3px' }}>
            Send Money
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: subTextColor }}>
            Instant peer-to-peer ledger transfer
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '6px' }}>
            Sender Handle
          </label>
          <input
            type="text"
            placeholder="john.doe@fufa"
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
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '6px' }}>
            Recipient Handle
          </label>
          <input
            type="text"
            placeholder="jane.smith@fufa"
            value={formData.receiverHandle}
            onChange={(e) => handleChange('receiverHandle', e.target.value)}
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
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '6px' }}>
          Amount (in ₹ Rupees)
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: subTextColor }}>₹</span>
          <input
            type="number"
            placeholder="500.00"
            value={formData.amountInCents}
            onChange={(e) => handleChange('amountInCents', e.target.value)}
            disabled={loading}
            step="0.01"
            min="0"
            style={{
              width: '100%',
              padding: '10px 12px 10px 28px',
              borderRadius: '10px',
              border: `1px solid ${inputBorder}`,
              background: inputBg,
              color: textColor,
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'Outfit, sans-serif',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '6px' }}>
          Note / Reference (Optional)
        </label>
        <input
          type="text"
          placeholder="Payment note"
          value={formData.note}
          onChange={(e) => handleChange('note', e.target.value)}
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

      <button
        type="button"
        onClick={handleSendMoney}
        disabled={loading || !formData.senderHandle || !formData.receiverHandle || !formData.amountInCents}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: loading || !formData.senderHandle || !formData.receiverHandle || !formData.amountInCents
            ? isDark ? '#334155' : '#cbd5e1'
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: loading || !formData.senderHandle || !formData.receiverHandle || !formData.amountInCents
            ? isDark ? '#64748b' : '#94a3b8'
            : '#ffffff',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'Outfit, sans-serif',
          cursor: loading || !formData.senderHandle || !formData.receiverHandle || !formData.amountInCents ? 'not-allowed' : 'pointer',
          boxShadow: loading || !formData.senderHandle || !formData.receiverHandle || !formData.amountInCents ? 'none' : '0 10px 20px -5px rgba(16, 185, 129, 0.4)',
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
            Processing Transfer...
          </>
        ) : (
          'Send Funds Now →'
        )}
      </button>
    </div>
  );
}
