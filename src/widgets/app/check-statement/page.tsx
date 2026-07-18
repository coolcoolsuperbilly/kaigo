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

  if (data?.success && data?.records) {
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
            📊 Transaction Statement
          </h2>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.7 }}>
            {data.fufaHandle} • {data.recordsCount} transactions
          </p>
        </div>

        {data.records.length === 0 ? (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            borderRadius: '8px',
            color: isDark ? '#9ca3af' : '#6b7280'
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>No transactions found</p>
          </div>
        ) : (
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {data.records.map((record, idx) => {
              const isDebit = record.type.includes('PAID');
              const amountColor = isDebit
                ? isDark ? '#ef4444' : '#dc2626'
                : isDark ? '#10b981' : '#059669';

              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    borderBottom: idx < data.records!.length - 1 ? `1px solid ${borderColor}` : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: idx % 2 === 0 ? 'transparent' : isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontSize: '16px' }}>
                        {isDebit ? '📤' : '📥'}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>
                        {record.type}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '11px',
                      opacity: 0.6,
                      fontFamily: 'monospace'
                    }}>
                      {new Date(record.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: amountColor,
                      fontFamily: 'monospace'
                    }}>
                      {record.formattedAmount}
                    </p>
                    <p style={{
                      margin: '2px 0 0 0',
                      fontSize: '11px',
                      opacity: 0.6
                    }}>
                      ID: {record.transactionId.substring(0, 8)}...
                    </p>
                  </div>
                </div>
              );
            })}
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
      maxWidth: '500px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
          📋 Check Statement
        </h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
          View your transaction history
        </p>
      </div>

      <div style={{ marginBottom: '14px' }}>
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

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '6px'
        }}>
          Statement Type
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {(['all', 'paid', 'recieved'] as const).map(type => (
            <button
              key={type}
              onClick={() => setStatementType(type)}
              disabled={loading}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: `2px solid ${statementType === type ? (isDark ? '#3b82f6' : '#2563eb') : borderColor}`,
                background: statementType === type
                  ? isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)'
                  : 'transparent',
                color: statementType === type
                  ? isDark ? '#3b82f6' : '#2563eb'
                  : textColor,
                fontSize: '12px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                textTransform: 'capitalize'
              }}
            >
              {type === 'recieved' ? 'Received' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleCheckStatement}
        disabled={loading || !fufaHandle}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: loading || !fufaHandle
            ? isDark ? '#4b5563' : '#d1d5db'
            : isDark ? '#3b82f6' : '#2563eb',
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
            View Statement
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
