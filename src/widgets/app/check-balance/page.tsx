'use client';

import { useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';
import '../style.css';

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

  // State 1: SDK Not Ready
  if (!isReady) {
    return (
      <div className="nf-wrapper">
        <div className="nf-card">
          <div className="nf-hero nf-hero--neutral">
            <h3 className="nf-hero-title">Connecting...</h3>
            <p className="nf-hero-sub">Connecting to Wallet Service</p>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Success / Balance Data Loaded
  if (data?.success && data?.availableBalanceRupees !== undefined) {
    return (
      <div className="nf-wrapper">
        <div className="nf-card">
          <div className="nf-hero nf-hero--low">
            <span className="nf-brand-mark">{data.fufaHandle}</span>
            <h3 className="nf-hero-title">{data.name}</h3>

            <div className="nf-score-row">
              <div>
                <div className="nf-score nf-score--positive">{data.formattedBalance}</div>
                <div className="nf-score-label">Available Wallet Balance</div>
              </div>
              <div className="nf-rating-chip">VERIFIED</div>
            </div>
          </div>

          <div className="nf-body">
            <p className="nf-synopsis">
              Equivalent to <strong>{data.availableBalanceCents?.toLocaleString()}</strong> paise
            </p>

            <div className="nf-row-between">
              <span className="nf-eyebrow">In Rupees</span>
              <span className="nf-value">₹{data.availableBalanceRupees?.toFixed(2)}</span>
            </div>

            <div className="nf-row-between">
              <span className="nf-eyebrow">In Cents / Paise</span>
              <span className="nf-value">{data.availableBalanceCents}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Error Handling
  if (data?.error) {
    return (
      <div className="nf-wrapper">
        <div className="nf-card">
          <div className="nf-hero nf-hero--critical">
            <span className="nf-brand-mark">Failed</span>
            <h3 className="nf-hero-title">Account Error</h3>
            <p className="nf-hero-sub">{data.error}</p>
          </div>
          <div className="nf-body">
            <div className="nf-actions">
              <button
                className="nf-btn nf-btn-primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Default Form
  return (
    <div className="nf-wrapper">
      <div className="nf-card">
        <div className="nf-hero nf-hero--neutral">
          <span className="nf-brand-mark">Wallet</span>
          <h3 className="nf-hero-title">Check Balance</h3>
          <p className="nf-hero-sub">Retrieve live account wallet metrics</p>
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
            onClick={handleCheckBalance}
            disabled={loading || !fufaHandle}
          >
            {loading ? 'Fetching Balance...' : 'Check Account Balance →'}
          </button>
        </div>
      </div>
    </div>
  );
}