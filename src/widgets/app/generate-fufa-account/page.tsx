'use client';

import { useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

interface AccountData {
  success: boolean;
  token?: string;
  userId?: string;
  fufaHandle?: string;
  message?: string;
  error?: string;
}

export default function GenerateFufaAccountWidget() {
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    accNo: '',
    ifsc: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const data = getToolOutput<AccountData>();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAccount = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName ||
      !formData.accNo || !formData.ifsc || !formData.password) {
      alert('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await callTool('generate_fufa_account', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        accNo: formData.accNo,
        ifsc: formData.ifsc,
        password: formData.password
      });
    } catch (error) {
      console.error('Account creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 1. INITIALIZING / LOADING STATE
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
              border: '3px solid rgba(70, 211, 105, 0.2)',
              borderTopColor: 'var(--nf-green)'
            }}
          />
          <span className="nf-eyebrow">Initializing KYC Engine...</span>
        </div>
      </div>
    );
  }

  // 2. SUCCESS STATE (Account Created)
  if (data?.success) {
    return (
      <div className="nf-wrapper" style={{ maxWidth: '450px' }}>
        <div className="nf-card">
          <div className="nf-hero nf-hero--low" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '28px' }}>🎉</div>
              <div>
                <h3 className="nf-hero-title" style={{ margin: 0, fontSize: '20px' }}>Account Created!</h3>
              </div>
            </div>
            <span
              className="nf-rating-chip"
              style={{
                background: 'rgba(70, 211, 105, 0.15)',
                borderColor: 'rgba(70, 211, 105, 0.4)',
                color: 'var(--nf-green)'
              }}
            >
              KYC VERIFIED
            </span>
          </div>

          <div className="nf-body">
            <div style={{
              background: 'var(--nf-surface)',
              padding: '20px',
              borderRadius: 'var(--nf-radius)',
              border: '1px solid var(--nf-border)'
            }}>
              <div className="nf-row-between">
                <span className="nf-eyebrow" style={{ margin: 0 }}>FUFA Handle</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '14px' }}>{data.fufaHandle}</strong>
              </div>
              <div className="nf-row-between" style={{ marginBottom: '0' }}>
                <span className="nf-eyebrow" style={{ margin: 0 }}>User ID</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--nf-text-muted)' }}>{data.userId?.substring(0, 10)}...</span>
              </div>

              <hr className="nf-divider" />

              <p className="nf-synopsis" style={{ margin: 0, fontSize: '12px', color: 'var(--nf-text-dim)' }}>
                Opening wallet balance of <strong style={{ color: 'var(--nf-text)' }}>₹1,000.00</strong> credited. You can now start using FUFA services!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. REGISTRATION FORM STATE
  return (
    <div className="nf-wrapper" style={{ maxWidth: '460px' }}>
      <div className="nf-card">
        <div className="nf-hero nf-hero--neutral">
          <div className="nf-brand-mark">Registration</div>
          <h2 className="nf-hero-title">Create FUFA Account</h2>
          <p className="nf-hero-sub">Instant registration with verified KYC</p>
        </div>

        <div className="nf-body">
          <div style={{ maxHeight: '360px', overflowY: 'auto', paddingRight: '8px', marginBottom: '18px' }}>

            <div className="nf-field">
              <label className="nf-field-label">Email Address</label>
              <input
                type="email"
                className="nf-input"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="nf-row-2">
              <div className="nf-field">
                <label className="nf-field-label">First Name</label>
                <input
                  type="text"
                  className="nf-input"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="nf-field">
                <label className="nf-field-label">Last Name</label>
                <input
                  type="text"
                  className="nf-input"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="nf-row-2">
              <div className="nf-field">
                <label className="nf-field-label">Bank Account No</label>
                <input
                  type="text"
                  className="nf-input"
                  placeholder="1234567890"
                  value={formData.accNo}
                  onChange={(e) => handleChange('accNo', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="nf-field">
                <label className="nf-field-label">IFSC Code</label>
                <input
                  type="text"
                  className="nf-input"
                  placeholder="SBIN0001234"
                  value={formData.ifsc}
                  onChange={(e) => handleChange('ifsc', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="nf-row-2" style={{ marginBottom: 0 }}>
              <div className="nf-field" style={{ marginBottom: 0 }}>
                <label className="nf-field-label">Password</label>
                <input
                  type="password"
                  className="nf-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="nf-field" style={{ marginBottom: 0 }}>
                <label className="nf-field-label">Confirm Password</label>
                <input
                  type="password"
                  className="nf-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

          </div>

          <button
            type="button"
            onClick={handleCreateAccount}
            disabled={loading}
            className="nf-cta"
          >
            {loading ? (
              <>
                <span
                  className="nf-spin"
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff'
                  }}
                />
                Creating FUFA Account...
              </>
            ) : (
              'Complete Registration →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}