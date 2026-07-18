'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

interface BalanceData {
  success: boolean;
  fufaHandle?: string;
  name?: string;
  availableBalanceRupees?: number;
  availableBalanceCents?: number;
  formattedBalance?: string;
  error?: string;
}

export default function CheckBalanceWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const [fufaHandle, setFufaHandle] = useState('');
  const [loading, setLoading] = useState(false);

  const data = getToolOutput<BalanceData>();

  const handleCheckBalance = async () => {
    if (!fufaHandle) {
      alert('Please enter a FUFA handle');
      return;
    }
    setLoading(true);
    try {
      await callTool('check_balance', { fufaHandle });
    } catch (error) {
      console.error('Check balance error:', error);
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
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
        <div style={{ fontSize: '14px', fontWeight: 500 }}>Connecting to Wallet Service...</div>
      </div>
    );
  }

  if (data?.success && data?.availableBalanceRupees !== undefined) {
    return (
      <div style={{
        padding: '28px',
        background: isDark
          ? 'linear-gradient(145deg, rgba(30, 58, 138, 0.9), rgba(30, 64, 175, 0.95))'
          : 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
        borderRadius: '24px',
        border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.4)' : '#bfdbfe'}`,
        color: isDark ? '#ffffff' : '#1e3a8a',
        boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.25)',
        maxWidth: '440px',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isDark ? 'rgba(255,255,255,0.15)' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              👤
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                {data.name}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.8, fontFamily: 'monospace' }}>
                {data.fufaHandle}
              </p>
            </div>
          </div>
          <span style={{
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            background: isDark ? 'rgba(59,130,246,0.3)' : '#2563eb',
            color: '#ffffff',
            letterSpacing: '0.5px'
          }}>
            VERIFIED
          </span>
        </div>

        <div style={{
          background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.7)',
          padding: '24px 20px',
          borderRadius: '18px',
          textAlign: 'center',
          marginBottom: '18px',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`,
          backdropFilter: 'blur(8px)'
        }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Available Wallet Balance
          </p>
          <div style={{
            fontSize: '44px',
            fontWeight: 800,
            fontFamily: 'Outfit, sans-serif',
            color: isDark ? '#fef08a' : '#d97706',
            letterSpacing: '-1px'
          }}>
            {data.formattedBalance}
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', opacity: 0.75 }}>
            Equivalent to <strong>{data.availableBalanceCents?.toLocaleString()}</strong> paise
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          fontSize: '13px'
        }}>
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
            padding: '12px',
            borderRadius: '12px',
            textAlign: 'center',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`
          }}>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.7, textTransform: 'uppercase' }}>In Rupees</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '17px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              ₹{data.availableBalanceRupees?.toFixed(2)}
            </p>
          </div>
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
            padding: '12px',
            borderRadius: '12px',
            textAlign: 'center',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`
          }}>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.7, textTransform: 'uppercase' }}>In Cents / Paise</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '17px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              {data.availableBalanceCents}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div style={{
        padding: '24px',
        background: isDark
          ? 'linear-gradient(145deg, rgba(127, 29, 29, 0.9), rgba(153, 27, 27, 0.95))'
          : 'linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%)',
        borderRadius: '20px',
        border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fca5a5'}`,
        color: isDark ? '#ffffff' : '#991b1b',
        boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '28px' }}>❌</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Account Error</h3>
        </div>
        <p style={{ margin: 0, fontSize: '14px' }}>{data.error}</p>
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
      maxWidth: '420px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(16px)'
    }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#ffffff',
          boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.5)'
        }}>
          💳
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.3px' }}>
            Check Balance
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: subTextColor }}>
            Retrieve live account wallet metrics
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '600',
          color: subTextColor,
          marginBottom: '6px'
        }}>
          FUFA Account Handle
        </label>
        <input
          type="text"
          placeholder="e.g. john.doe@fufa"
          value={fufaHandle}
          onChange={(e) => setFufaHandle(e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '12px',
            border: `1px solid ${inputBorder}`,
            background: inputBg,
            color: textColor,
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.6 : 1
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleCheckBalance}
        disabled={loading || !fufaHandle}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: loading || !fufaHandle
            ? isDark ? '#334155' : '#cbd5e1'
            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: loading || !fufaHandle
            ? isDark ? '#64748b' : '#94a3b8'
            : '#ffffff',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'Outfit, sans-serif',
          cursor: loading || !fufaHandle ? 'not-allowed' : 'pointer',
          boxShadow: loading || !fufaHandle ? 'none' : '0 10px 20px -5px rgba(59, 130, 246, 0.4)',
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
            Fetching Balance...
          </>
        ) : (
          'Check Account Balance →'
        )}
      </button>
    </div>
  );
}
