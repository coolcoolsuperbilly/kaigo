'use client';

import { useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../style.css';

export const dynamic = 'force-dynamic';

interface SignInData {
  success: boolean;
  token?: string;
  userId?: string;
  fufaHandle?: string;
  balanceInRupees?: number;
  message?: string;
  error?: string;
}

export default function SignInWidget() {
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const [fufaHandle, setFufaHandle] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const data = getToolOutput<SignInData>();

  const handleSignIn = async () => {
    if (!fufaHandle || !password) {
      alert('Please enter both handle and password');
      return;
    }
    setLoading(true);
    try {
      await callTool('sign_in', {
        fufaHandle,
        password
      });
    } catch (error) {
      console.error('Sign in error:', error);
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
          <span className="nf-eyebrow">Initializing Secure Session...</span>
        </div>
      </div>
    );
  }

  // 2. SUCCESS STATE
  if (data?.success) {
    return (
      <div className="nf-wrapper">
        <div className="nf-card">
          <div className="nf-hero nf-hero--low">
            <span className="nf-brand-mark">FUFA</span>
            <h3 className="nf-hero-title">Welcome Back</h3>
            <div className="nf-score-row">
              <div className="nf-rating-chip">AUTHENTICATED</div>
            </div>
          </div>
          <div className="nf-body">
            <div className="nf-row-between">
              <span className="nf-eyebrow">Account Handle</span>
              <span className="nf-value" style={{ fontFamily: 'monospace' }}>{data.fufaHandle}</span>
            </div>
            <div className="nf-row-between">
              <span className="nf-eyebrow">User ID</span>
              <span className="nf-value" style={{ fontFamily: 'monospace' }}>
                {data.userId?.substring(0, 10)}...
              </span>
            </div>
            <hr className="nf-divider" />
            <div className="nf-row-between" style={{ marginBottom: 0 }}>
              <span className="nf-eyebrow">Wallet Balance</span>
              <span className="nf-score nf-score--positive" style={{ fontSize: '20px' }}>
                ₹{data.balanceInRupees?.toFixed(2) || '0.00'}
              </span>
            </div>
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
            <h3 className="nf-hero-title">Authentication Error</h3>
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
          <span className="nf-brand-mark">FUFA</span>
          <h3 className="nf-hero-title">Sign In</h3>
          <p className="nf-hero-sub">Secure login to your wallet account</p>
        </div>

        <div className="nf-body">
          <div className="nf-field">
            <label className="nf-field-label">FUFA Handle</label>
            <input
              type="text"
              className="nf-input"
              placeholder="e.g. john.doe@fufa"
              value={fufaHandle}
              onChange={(e) => setFufaHandle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="nf-field">
            <label className="nf-field-label">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="nf-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingRight: '38px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: 'var(--nf-text-dim)',
                  display: 'flex',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading || !fufaHandle || !password}
            className="nf-cta"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
          </button>
        </div>
      </div>
    </div>
  );
}