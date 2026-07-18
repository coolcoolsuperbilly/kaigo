'use client';

import { useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';
import '../style.css';
export const dynamic = 'force-dynamic';

interface StatementRecord {
  createdAt: string;
  transactionId: string;
  amountInCents: number;
  amountInRupees: number;
  type: string;
  formattedAmount: string;
}

interface StatementData {
  success: boolean;
  fufaHandle?: string;
  recordsCount?: number;
  records?: StatementRecord[];
  error?: string;
}

export default function CheckStatementWidget() {
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const [fufaHandle, setFufaHandle] = useState('');
  const [statementType, setStatementType] = useState<'all' | 'paid' | 'recieved'>('all');
  const [loading, setLoading] = useState(false);

  const data = getToolOutput<StatementData>();

  const handleCheckStatement = async () => {
    if (!fufaHandle) {
      alert('Please enter a FUFA handle');
      return;
    }
    setLoading(true);
    try {
      await callTool('check_statement', {
        fufaHandle,
        type: statementType,
      });
    } catch (error) {
      console.error('Check statement error:', error);
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
          <span className="nf-eyebrow">Fetching Ledger Records...</span>
        </div>
      </div>
    );
  }

  // 2. DATA / RECORDS VIEW STATE
  if (data?.success && data?.records) {
    return (
      <div className="nf-wrapper" style={{ maxWidth: '560px' }}>
        <div className="nf-card">
          <div className="nf-hero nf-hero--neutral" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="nf-brand-mark">Live Ledger</div>
              <h2 className="nf-hero-title">Transaction Statement</h2>
              <p className="nf-hero-sub">
                {data.fufaHandle} • {data.recordsCount} Total Entries
              </p>
            </div>
            <span className="nf-rating-chip">LIVE STATEMENT</span>
          </div>

          <div className="nf-body">
            {data.records.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                background: 'var(--nf-surface)',
                borderRadius: 'var(--nf-radius)',
                border: '1px dashed var(--nf-border)',
                color: 'var(--nf-text-muted)'
              }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
                  No transaction records found for this query.
                </p>
              </div>
            ) : (
              <div style={{
                maxHeight: '380px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingRight: '4px'
              }}>
                {data.records.map((record, idx) => {
                  const isDebit = record.type.includes('PAID');
                  const amountColor = isDebit ? 'var(--nf-red-soft)' : 'var(--nf-green)';

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 'var(--nf-radius)',
                        background: 'var(--nf-surface)',
                        border: '1px solid var(--nf-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: 'var(--nf-radius-sm)',
                          background: 'var(--nf-surface-2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px'
                        }}>
                          {isDebit ? '📤' : '📥'}
                        </div>
                        <div>
                          <div className="nf-value" style={{ textTransform: 'uppercase' }}>
                            {record.type}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--nf-text-dim)', marginTop: '2px' }}>
                            {new Date(record.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 800,
                          color: amountColor
                        }}>
                          {record.formattedAmount}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--nf-text-faint)', marginTop: '2px', fontFamily: 'monospace' }}>
                          Tx: {record.transactionId.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. INITIAL FORM FILTER STATE
  return (
    <div className="nf-wrapper">
      <div className="nf-card">
        <div className="nf-hero nf-hero--neutral">
          <div className="nf-brand-mark">Live Ledger</div>
          <h2 className="nf-hero-title">Check Statement</h2>
          <p className="nf-hero-sub">Filter and retrieve ledger transaction history</p>
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

          <div className="nf-field" style={{ marginBottom: '24px' }}>
            <label className="nf-field-label">Statement Category Filter</label>
            <div className="nf-row-3">
              {(['all', 'paid', 'recieved'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setStatementType(type)}
                  disabled={loading}
                  className={`nf-btn ${statementType === type ? 'nf-btn-primary' : 'nf-btn-ghost'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {type === 'recieved' ? 'Received' : type}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="nf-cta"
            onClick={handleCheckStatement}
            disabled={loading || !fufaHandle}
          >
            {loading ? 'Fetching Statement...' : 'Get Statement →'}
          </button>
        </div>
      </div>
    </div>
  );
}