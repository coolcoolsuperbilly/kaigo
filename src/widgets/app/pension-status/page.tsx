'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

interface PayoutProgress {
  payoutMonth: string;
  amount: number;
  progressStatus: string;
  referenceUtr: string;
  updatedAt: string;
}

interface PensionEnrollment {
  enrollmentId: string;
  schemeName: string;
  pranNumber: string;
  accountStatus: string;
  bankAccount: string;
  payoutProgress: PayoutProgress[];
}

interface PensionStatusData {
  success: boolean;
  enrolledPensions?: PensionEnrollment[];
  error?: string;
}

export default function PensionStatusWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const [fufaHandle, setFufaHandle] = useState('');
  const [loading, setLoading] = useState(false);

  const data = getToolOutput<PensionStatusData>();

  const handleGetStatus = async () => {
    if (!fufaHandle) {
      alert('Please enter a FUFA handle');
      return;
    }
    setLoading(true);
    try {
      await callTool('get_pension_status', { fufaHandle });
    } catch (error) {
      console.error('Get pension status error:', error);
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

  if (data?.success && data?.enrolledPensions) {
    return (
      <div style={{
        padding: '24px',
        background: bgColor,
        borderRadius: '12px',
        border: `1px solid ${borderColor}`,
        color: textColor,
        maxWidth: '600px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 'bold' }}>
            🏦 Pension Status
          </h2>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.7 }}>
            {data.enrolledPensions.length} active enrollment(s)
          </p>
        </div>

        {data.enrolledPensions.length === 0 ? (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            borderRadius: '8px',
            color: isDark ? '#9ca3af' : '#6b7280'
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>No active pension enrollments</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.enrolledPensions.map((pension, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  background: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>📋</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold' }}>
                      {pension.schemeName}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
                      PRAN: {pension.pranNumber}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: pension.accountStatus === 'ACTIVE'
                      ? isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'
                      : isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)',
                    color: pension.accountStatus === 'ACTIVE'
                      ? isDark ? '#10b981' : '#059669'
                      : isDark ? '#9ca3af' : '#6b7280'
                  }}>
                    {pension.accountStatus}
                  </span>
                </div>

                <div style={{
                  background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontSize: '12px'
                }}>
                  <p style={{ margin: '0 0 4px 0', opacity: 0.7 }}>Bank Account</p>
                  <p style={{ margin: 0, fontFamily: 'monospace', fontWeight: '600' }}>
                    {pension.bankAccount}
                  </p>
                </div>

                {pension.payoutProgress && pension.payoutProgress.length > 0 && (
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600' }}>
                      💰 Payout History:
                    </p>
                    <div style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      border: `1px solid ${borderColor}`,
                      borderRadius: '4px'
                    }}>
                      {pension.payoutProgress.map((payout, pidx) => (
                        <div
                          key={pidx}
                          style={{
                            padding: '8px 10px',
                            borderBottom: pidx < pension.payoutProgress.length - 1 ? `1px solid ${borderColor}` : 'none',
                            fontSize: '11px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <p style={{ margin: 0, fontWeight: '600' }}>
                              {payout.payoutMonth}
                            </p>
                            <p style={{ margin: '2px 0 0 0', opacity: 0.7 }}>
                              {payout.progressStatus}
                            </p>
                          </div>
                          <p style={{ margin: 0, fontWeight: 'bold', color: isDark ? '#10b981' : '#059669' }}>
                            ₹{(payout.amount / 100).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
      maxWidth: '450px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
          🏦 Pension Status
        </h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
          Track your pension enrollments and payouts
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '4px'
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

      <button
        onClick={handleGetStatus}
        disabled={loading || !fufaHandle}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: loading || !fufaHandle
            ? isDark ? '#4b5563' : '#d1d5db'
            : isDark ? '#8b5cf6' : '#7c3aed',
          color: loading || !fufaHandle
            ? isDark ? '#9ca3af' : '#6b7280'
            : '#ffffff',
          fontSize: '15px',
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
            Loading...
          </>
        ) : (
          <>
            <span>📊</span>
            Check Status
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
