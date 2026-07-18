'use client';

import { useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';
import '../style.css';

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

  // 1. LOADING STATE
  if (!isReady) {
    return (
      <div className="nf-wrapper">
        <div className="nf-card nf-loading" style={{ flexDirection: 'column', gap: '16px' }}>
          <div
            className="nf-spin"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '3px solid rgba(229, 9, 20, 0.2)',
              borderTopColor: 'var(--nf-red)'
            }}
          />
          <span className="nf-eyebrow">Connecting to Pension Portal...</span>
        </div>
      </div>
    );
  }

  // 2. DATA VIEW STATE
  if (data?.success && data?.enrolledPensions) {
    return (
      <div className="nf-wrapper" style={{ maxWidth: '560px' }}>
        <div className="nf-card">
          <div
            className="nf-hero nf-hero--neutral"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <div className="nf-brand-mark">Pension Portal</div>
              <h2 className="nf-hero-title">Pension Enrollments</h2>
              <p className="nf-hero-sub">
                {data.enrolledPensions.length} Active Scheme(s) Enrolled
              </p>
            </div>
            <span className="nf-rating-chip">NATIONAL PENSION SYSTEM</span>
          </div>

          <div className="nf-body">
            {data.enrolledPensions.length === 0 ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  background: 'var(--nf-surface)',
                  borderRadius: 'var(--nf-radius)',
                  border: '1px dashed var(--nf-border)',
                  color: 'var(--nf-text-muted)'
                }}
              >
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
                  No active pension enrollments found for this account.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {data.enrolledPensions.map((pension, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--nf-radius)',
                      background: 'var(--nf-surface)',
                      border: '1px solid var(--nf-border)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: 'var(--nf-radius-sm)',
                            background: 'var(--nf-surface-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                          }}
                        >
                          🏦
                        </div>
                        <div>
                          <div className="nf-value">{pension.schemeName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--nf-text-dim)', marginTop: '2px', fontFamily: 'monospace' }}>
                            PRAN: {pension.pranNumber}
                          </div>
                        </div>
                      </div>
                      <span
                        className="nf-pill"
                        style={{
                          color: pension.accountStatus === 'ACTIVE' ? 'var(--nf-green)' : 'var(--nf-text-muted)',
                          borderColor: pension.accountStatus === 'ACTIVE' ? 'var(--nf-green)' : 'var(--nf-border-strong)'
                        }}
                      >
                        {pension.accountStatus}
                      </span>
                    </div>

                    <div className="nf-row-between" style={{ marginBottom: pension.payoutProgress?.length ? '14px' : 0 }}>
                      <span className="nf-eyebrow">Linked Bank Account</span>
                      <span className="nf-value" style={{ fontFamily: 'monospace' }}>{pension.bankAccount}</span>
                    </div>

                    {pension.payoutProgress && pension.payoutProgress.length > 0 && (
                      <>
                        <hr className="nf-divider" style={{ margin: '12px 0' }} />
                        <p className="nf-section-title">Recent Disbursements</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {pension.payoutProgress.map((payout, pidx) => (
                            <div
                              key={pidx}
                              style={{
                                padding: '10px 12px',
                                borderRadius: 'var(--nf-radius-sm)',
                                background: 'var(--nf-bg)',
                                border: '1px solid var(--nf-border)',
                                fontSize: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <span style={{ fontWeight: 600 }}>{payout.payoutMonth}</span>
                                <span style={{ fontSize: '11px', color: 'var(--nf-text-faint)', marginLeft: '8px' }}>
                                  ({payout.progressStatus})
                                </span>
                              </div>
                              <strong style={{ color: 'var(--nf-green)', fontSize: '14px' }}>
                                ₹{(payout.amount / 100).toFixed(2)}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. ERROR STATE
  if (data?.error) {
    return (
      <div className="nf-wrapper">
        <div className="nf-card">
          <div className="nf-hero nf-hero--critical">
            <span className="nf-brand-mark">Failed</span>
            <h3 className="nf-hero-title">Pension Lookup Error</h3>
            <p className="nf-hero-sub">{data.error}</p>
          </div>
          <div className="nf-body">
            <div className="nf-actions">
              <button className="nf-btn nf-btn-primary" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. DEFAULT FORM STATE
  return (
    <div className="nf-wrapper">
      <div className="nf-card">
        <div className="nf-hero nf-hero--neutral">
          <span className="nf-brand-mark">Pension Portal</span>
          <h3 className="nf-hero-title">Pension Status</h3>
          <p className="nf-hero-sub">Track NPS enrollments and payout progress</p>
        </div>

        <div className="nf-body">
          <div className="nf-field">
            <label className="nf-field-label">FUFA Account Handle</label>
            <input
              type="text"
              className="nf-input"
              placeholder="e.g. john.doe@fufa"
              value={fufaHandle}
              onChange={(e) => setFufaHandle(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="button"
            className="nf-cta"
            onClick={handleGetStatus}
            disabled={loading || !fufaHandle}
          >
            {loading ? 'Checking Pension Status...' : 'Check Pension Status →'}
          </button>
        </div>
      </div>
    </div>
  );
}