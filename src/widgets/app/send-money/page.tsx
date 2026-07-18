'use client';

import { useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';
import { Check } from 'lucide-react';
import '../style.css';

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

  const isFormIncomplete = !formData.senderHandle || !formData.receiverHandle || !formData.amountInCents;

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
          <span className="nf-eyebrow">Initializing Payment Engine...</span>
        </div>
      </div>
    );
  }

  // 2. SUCCESS STATE
  if (data?.success && data?.transactionId) {
    return (
      <div className="nf-wrapper">
        <div className="nf-card">
          <div className="nf-hero nf-hero--low">
            <span className="nf-brand-mark">Ledger</span>
            <h3 className="nf-hero-title">Transfer Complete</h3>
            <div className="nf-score-row">
              <div className="nf-rating-chip">
                <Check size={11} />
                SETTLED IN LEDGER
              </div>
            </div>
          </div>
          <div className="nf-body">
            <div className="nf-row-between">
              <span className="nf-eyebrow">Transaction ID</span>
              <span className="nf-value" style={{ fontFamily: 'monospace' }}>
                {data.transactionId?.substring(0, 12)}...
              </span>
            </div>
            {data.message && (
              <>
                <hr className="nf-divider" />
                <p className="nf-synopsis">{data.message}</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. BLOCKED STATE
  if (data?.blocked) {
    return (
      <div className="nf-wrapper">
        <div className="nf-card">
          <div className="nf-hero nf-hero--critical">
            <span className="nf-brand-mark">Blocked</span>
            <h3 className="nf-hero-title">Transaction Blocked</h3>
            <p className="nf-hero-sub">Scam prevention engine intervened</p>
          </div>
          <div className="nf-body">
            <p className="nf-synopsis">
              <strong style={{ color: 'var(--nf-text)' }}>Reason:</strong> {data.reason}
            </p>
            {data.riskScore !== undefined && (
              <>
                <hr className="nf-divider" />
                <div className="nf-row-between">
                  <span className="nf-eyebrow">Risk Score</span>
                  <span className="nf-value">{data.riskScore}/100</span>
                </div>
                <div className="nf-row-between">
                  <span className="nf-eyebrow">Risk Level</span>
                  <span className="nf-value">{data.riskLevel}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. REQUIRES CONFIRMATION STATE
  if (data?.requiresConfirmation) {
    return (
      <div className="nf-wrapper">
        <div className="nf-card">
          <div className="nf-hero nf-hero--medium">
            <span className="nf-brand-mark">Security Check</span>
            <h3 className="nf-hero-title">Confirmation Required</h3>
            <p className="nf-hero-sub">Heuristic risk flag triggered</p>
          </div>
          <div className="nf-body">
            <p className="nf-synopsis">{data.reason}</p>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12.5px',
                color: 'var(--nf-text-muted)',
                cursor: 'pointer',
                marginBottom: '16px',
                fontWeight: 500
              }}
            >
              <input
                type="checkbox"
                checked={bypassAlert}
                onChange={(e) => setBypassAlert(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--nf-amber)', cursor: 'pointer' }}
              />
              I have verified the recipient and accept full risk
            </label>

            <button
              type="button"
              onClick={handleSendMoney}
              disabled={!bypassAlert || loading}
              className="nf-cta"
              style={{ background: !bypassAlert || loading ? undefined : 'var(--nf-red)' }}
            >
              {loading ? 'Executing Transfer...' : 'Override & Send Money →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. DEFAULT FORM STATE
  return (
    <div className="nf-wrapper">
      <div className="nf-card">
        <div className="nf-hero nf-hero--neutral">
          <span className="nf-brand-mark">Ledger</span>
          <h3 className="nf-hero-title">Send Money</h3>
          <p className="nf-hero-sub">Instant peer-to-peer ledger transfer</p>
        </div>

        <div className="nf-body">
          <div className="nf-row-2">
            <div className="nf-field">
              <label className="nf-field-label">Sender Handle</label>
              <input
                type="text"
                className="nf-input"
                placeholder="john.doe@fufa"
                value={formData.senderHandle}
                onChange={(e) => handleChange('senderHandle', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="nf-field">
              <label className="nf-field-label">Recipient Handle</label>
              <input
                type="text"
                className="nf-input"
                placeholder="jane.smith@fufa"
                value={formData.receiverHandle}
                onChange={(e) => handleChange('receiverHandle', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="nf-field">
            <label className="nf-field-label">Amount (in ₹ Rupees)</label>
            <div className="nf-prefix-group">
              <span className="nf-prefix">₹</span>
              <input
                type="number"
                className="nf-input"
                placeholder="500.00"
                value={formData.amountInCents}
                onChange={(e) => handleChange('amountInCents', e.target.value)}
                disabled={loading}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="nf-field">
            <label className="nf-field-label">Note / Reference (Optional)</label>
            <input
              type="text"
              className="nf-input"
              placeholder="Payment note"
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="button"
            onClick={handleSendMoney}
            disabled={loading || isFormIncomplete}
            className="nf-cta"
          >
            {loading ? 'Processing Transfer...' : 'Send Funds Now →'}
          </button>
        </div>
      </div>
    </div>
  );
}