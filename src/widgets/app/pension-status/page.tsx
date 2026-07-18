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
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
        <div style={{ fontSize: '14px', fontWeight: 500 }}>Connecting to Pension Portal...</div>
      </div>
    );
  }

  if (data?.success && data?.enrolledPensions) {
    return (
      <div style={{
        padding: '28px',
        background: cardBg,
        borderRadius: '24px',
        border: `1px solid ${borderColor}`,
        color: textColor,
        maxWidth: '560px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              Pension Enrollments
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: subTextColor }}>
              {data.enrolledPensions.length} Active Scheme(s) Enrolled
            </p>
          </div>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            background: isDark ? 'rgba(139, 92, 246, 0.2)' : '#f3e8ff',
            color: isDark ? '#c084fc' : '#7e22ce',
            border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : '#e9d5ff'}`
          }}>
            NATIONAL PENSION SYSTEM
          </span>
        </div>

        {data.enrolledPensions.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
            borderRadius: '16px',
            border: `1px dashed ${borderColor}`,
            color: subTextColor
          }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No active pension enrollments found for this account.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.enrolledPensions.map((pension, idx) => (
              <div
                key={idx}
                style={{
                  padding: '20px',
                  borderRadius: '18px',
                  background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                  border: `1px solid ${borderColor}`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: '#ffffff'
                    }}>
                      🏦
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                        {pension.schemeName}
                      </h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: subTextColor, fontFamily: 'monospace' }}>
                        PRAN: {pension.pranNumber}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: pension.accountStatus === 'ACTIVE'
                      ? isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5'
                      : isDark ? 'rgba(100, 116, 139, 0.2)' : '#f1f5f9',
                    color: pension.accountStatus === 'ACTIVE'
                      ? isDark ? '#34d399' : '#047857'
                      : subTextColor
                  }}>
                    {pension.accountStatus}
                  </span>
                </div>

                <div style={{
                  background: isDark ? 'rgba(0,0,0,0.25)' : '#f8fafc',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  marginBottom: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <span style={{ color: subTextColor }}>Linked Bank Account:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{pension.bankAccount}</strong>
                </div>

                {pension.payoutProgress && pension.payoutProgress.length > 0 && (
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 700, color: subTextColor, textTransform: 'uppercase' }}>
                      Recent Disbursements
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {pension.payoutProgress.map((payout, pidx) => (
                        <div
                          key={pidx}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: isDark ? 'rgba(0,0,0,0.15)' : '#ffffff',
                            border: `1px solid ${borderColor}`,
                            fontSize: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>{payout.payoutMonth}</span>
                            <span style={{ fontSize: '11px', color: subTextColor, marginLeft: '8px' }}>({payout.progressStatus})</span>
                          </div>
                          <strong style={{ color: '#10b981', fontFamily: 'Outfit, sans-serif', fontSize: '14px' }}>
                            ₹{(payout.amount / 100).toFixed(2)}
                          </strong>
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
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#ffffff',
          boxShadow: '0 8px 16px -4px rgba(139, 92, 246, 0.5)'
        }}>
          🏦
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.3px' }}>
            Pension Status
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: subTextColor }}>
            Track NPS enrollments and payout progress
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '6px' }}>
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
            outline: 'none'
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleGetStatus}
        disabled={loading || !fufaHandle}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: loading || !fufaHandle
            ? isDark ? '#334155' : '#cbd5e1'
            : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          color: loading || !fufaHandle
            ? isDark ? '#64748b' : '#94a3b8'
            : '#ffffff',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'Outfit, sans-serif',
          cursor: loading || !fufaHandle ? 'not-allowed' : 'pointer',
          boxShadow: loading || !fufaHandle ? 'none' : '0 10px 20px -5px rgba(139, 92, 246, 0.4)',
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
            Checking Pension Status...
          </>
        ) : (
          'Check Pension Status →'
        )}
      </button>
    </div>
  );
}
