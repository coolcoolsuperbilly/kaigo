'use client';

import { useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';
import '../style.css';

export const dynamic = 'force-dynamic';

interface ClaimProgress {
  claimDate: string;
  amount: number;
  progressStatus: string;
  referenceUtr: string;
  updatedAt: string;
}

interface InsurancePolicy {
  policyId: string;
  schemeName: string;
  coverage: string;
  policyNumber: string;
  policyStatus: string;
  validUntil: string;
  claimProgress: ClaimProgress[];
}

interface InsuranceStatusData {
  success: boolean;
  activeInsurances?: InsurancePolicy[];
  error?: string;
}

export default function InsuranceStatusWidget() {
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const [fufaHandle, setFufaHandle] = useState('');
  const [loading, setLoading] = useState(false);

  const data = getToolOutput<InsuranceStatusData>();

  const handleGetStatus = async () => {
    if (!fufaHandle) {
      alert('Please enter a FUFA handle');
      return;
    }
    setLoading(true);
    try {
      await callTool('get_insurance_status', { fufaHandle });
    } catch (error) {
      console.error('Get insurance status error:', error);
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
          <span className="nf-eyebrow">Connecting to Insurance Portal...</span>
        </div>
      </div>
    );
  }

  // 2. DATA VIEW STATE
  if (data?.success && data?.activeInsurances) {
    return (
      <div className="nf-wrapper" style={{ maxWidth: '560px' }}>
        <div className="nf-card">
          <div
            className="nf-hero nf-hero--neutral"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <div className="nf-brand-mark">Insurance Portal</div>
              <h2 className="nf-hero-title">Active Insurance Policies</h2>
              <p className="nf-hero-sub">
                {data.activeInsurances.length} Active Coverage Plan(s)
              </p>
            </div>
            <span className="nf-rating-chip">VERIFIED COVERAGE</span>
          </div>

          <div className="nf-body">
            {data.activeInsurances.length === 0 ? (
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
                  No active insurance policies found for this account.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {data.activeInsurances.map((policy, idx) => (
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
                          🛡️
                        </div>
                        <div>
                          <div className="nf-value">{policy.schemeName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--nf-text-dim)', marginTop: '2px', fontFamily: 'monospace' }}>
                            Policy: {policy.policyNumber}
                          </div>
                        </div>
                      </div>
                      <span
                        className="nf-pill"
                        style={{
                          color: policy.policyStatus === 'ACTIVE' ? 'var(--nf-green)' : 'var(--nf-text-muted)',
                          borderColor: policy.policyStatus === 'ACTIVE' ? 'var(--nf-green)' : 'var(--nf-border-strong)'
                        }}
                      >
                        {policy.policyStatus}
                      </span>
                    </div>

                    <div className="nf-row-2" style={{ marginBottom: policy.claimProgress?.length ? '14px' : 0 }}>
                      <div
                        style={{
                          background: 'var(--nf-bg)',
                          padding: '10px 12px',
                          borderRadius: 'var(--nf-radius-sm)',
                          border: '1px solid var(--nf-border)'
                        }}
                      >
                        <span className="nf-eyebrow">Coverage Limit</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 800, color: 'var(--nf-amber)' }}>
                          ₹{(parseInt(policy.coverage) / 100).toLocaleString()}
                        </p>
                      </div>
                      <div
                        style={{
                          background: 'var(--nf-bg)',
                          padding: '10px 12px',
                          borderRadius: 'var(--nf-radius-sm)',
                          border: '1px solid var(--nf-border)'
                        }}
                      >
                        <span className="nf-eyebrow">Valid Until</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 700 }}>
                          {new Date(policy.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {policy.claimProgress && policy.claimProgress.length > 0 && (
                      <>
                        <hr className="nf-divider" style={{ margin: '12px 0' }} />
                        <p className="nf-section-title">Claim History</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {policy.claimProgress.map((claim, cidx) => (
                            <div
                              key={cidx}
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
                                <span style={{ fontWeight: 600 }}>{new Date(claim.claimDate).toLocaleDateString()}</span>
                                <span style={{ fontSize: '11px', color: 'var(--nf-text-faint)', marginLeft: '8px' }}>
                                  ({claim.progressStatus})
                                </span>
                              </div>
                              <strong style={{ color: 'var(--nf-amber)', fontSize: '14px' }}>
                                ₹{(claim.amount / 100).toFixed(2)}
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
            <h3 className="nf-hero-title">Insurance Lookup Error</h3>
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
          <span className="nf-brand-mark">Insurance Portal</span>
          <h3 className="nf-hero-title">Insurance Status</h3>
          <p className="nf-hero-sub">Track active coverage plans and claims</p>
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
            {loading ? 'Checking Insurance Status...' : 'Check Insurance Status →'}
          </button>
        </div>
      </div>
    </div>
  );
}