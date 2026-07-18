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

  if (data?.success && data?.availableBalanceRupees !== undefined) {
    return (
      <div style={{
        padding: '24px',
        background: isDark
          ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '12px',
        border: `2px solid ${isDark ? '#3b82f6' : '#93c5fd'}`,
        color: isDark ? '#ffffff' : '#1e3a8a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontSize: '40px' }}>💰</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              {data.name}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
              {data.fufaHandle}
            </p>
          </div>
        </div>

        <div style={{
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', opacity: 0.8 }}>
            Available Balance
          </p>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: isDark ? '#fbbf24' : '#d97706'
          }}>
            {data.formattedBalance}
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '11px', opacity: 0.7 }}>
            {data.availableBalanceCents} paise
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          fontSize: '13px'
        }}>
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, opacity: 0.7 }}>In Rupees</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
              ₹{data.availableBalanceRupees?.toFixed(2)}
            </p>
          </div>
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, opacity: 0.7 }}>In Paise</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
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
      maxWidth: '400px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
          💳 Check Balance
        </h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
          View your FUFA wallet balance
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '6px'
        }}>
          FUFA Handle
        </label>
        <input
          type="text"
          placeholder="e.g. john.doe@fufa"
          value={fufaHandle}
          onChange={(e) => setFufaHandle(e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`,
            background: inputBg,
            color: textColor,
            fontSize: '14px',
            boxSizing: 'border-box',
            opacity: loading ? 0.6 : 1
          }}
        />
      </div>

      <button
        onClick={handleCheckBalance}
        disabled={loading || !fufaHandle}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: loading || !fufaHandle
            ? isDark ? '#4b5563' : '#d1d5db'
            : isDark ? '#3b82f6' : '#2563eb',
          color: loading || !fufaHandle
            ? isDark ? '#9ca3af' : '#6b7280'
            : '#ffffff',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading || !fufaHandle ? 'not-allowed' : 'pointer',
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
            Checking...
          </>
        ) : (
          <>
            <span>🔍</span>
            Check Balance
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
