'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';

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
  const theme = useTheme();
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
        type: statementType
      });
    } catch (error) {
      console.error('Check statement error:', error);
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
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
        <div style={{ fontSize: '14px', fontWeight: 500 }}>Fetching Ledger Records...</div>
      </div>
    );
  }

  if (data?.success && data?.records) {
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
              Transaction Statement
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: subTextColor, fontFamily: 'monospace' }}>
              {data.fufaHandle} • {data.recordsCount} Total Entries
            </p>
          </div>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
            color: isDark ? '#93c5fd' : '#1e40af',
            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe'}`
          }}>
            LIVE STATEMENT
          </span>
        </div>

        {data.records.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
            borderRadius: '16px',
            border: `1px dashed ${borderColor}`,
            color: subTextColor
          }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No transaction records found for this query.</p>
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
              const amountColor = isDebit ? '#ef4444' : '#10b981';
              const badgeBg = isDebit ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2') : (isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5');

              return (
                <div
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                    border: `1px solid ${borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: badgeBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      color: amountColor
                    }}>
                      {isDebit ? '📤' : '📥'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                        {record.type}
                      </div>
                      <div style={{ fontSize: '11px', color: subTextColor, fontFamily: 'monospace', marginTop: '2px' }}>
                        {new Date(record.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: amountColor,
                      fontFamily: 'Outfit, sans-serif'
                    }}>
                      {isDebit ? '-' : '+'}{record.formattedAmount}
                    </div>
                    <div style={{ fontSize: '10px', color: subTextColor, fontFamily: 'monospace', marginTop: '2px' }}>
                      Tx: {record.transactionId.substring(0, 8)}
                    </div>
                  </div>
                </div>
              );
            })}
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
      maxWidth: '460px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(16px)'
    }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#ffffff',
          boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.5)'
        }}>
          📋
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.3px' }}>
            Check Statement
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: subTextColor }}>
            Filter and retrieve ledger transaction history
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '6px' }}>
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

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '8px' }}>
          Statement Category Filter
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {(['all', 'paid', 'recieved'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setStatementType(type)}
              disabled={loading}
              style={{
                padding: '10px',
                borderRadius: '10px',
                border: `1px solid ${statementType === type ? '#3b82f6' : inputBorder}`,
                background: statementType === type
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : inputBg,
                color: statementType === type ? '#ffffff' : textColor,
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize'
              }}
            >
              {type === 'recieved' ? 'Received' : type}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleCheckStatement}
        disabled={loading || !fufaHandle}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: loading || !fufaHandle
            ? isDark ? '#334155' : '#cbd5e1'
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: loading || !fufaHandle
            ? isDark ? '#64748b' : '#94a3b8'
            : '#ffffff',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'Outfit, sans-serif',
          cursor: loading || !fufaHandle ? 'not-allowed' : 'pointer',
          boxShadow: loading || !fufaHandle ? 'none' : '0 10px 20px -5px rgba(59, 130, 246, 0.4)',
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
            Retrieving Statement...
          </>
        ) : (
          'Generate Statement →'
        )}
      </button>
    </div>
  );
}
