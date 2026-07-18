'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';
import { useState } from 'react';

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
  const theme = useTheme();
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

  if (data?.success) {
    return (
      <div style={{
        padding: '24px',
        background: isDark
          ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
          : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        borderRadius: '12px',
        border: `2px solid ${isDark ? '#10b981' : '#6ee7b7'}`,
        color: isDark ? '#ffffff' : '#065f46'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '32px' }}>✅</span>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Sign In Successful!</h3>
        </div>
        <div style={{
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Handle:</strong> {data.fufaHandle}
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>User ID:</strong> {data.userId?.substring(0, 8)}...
          </p>
          <p style={{ margin: 0 }}>
            <strong>Balance:</strong> ₹{data.balanceInRupees?.toFixed(2) || '0.00'}
          </p>
        </div>
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
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Sign In Failed</h3>
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
      maxWidth: '400px'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
          🔐 FUFA Sign In
        </h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
          Enter your credentials to access your account
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '6px'
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
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`,
            background: inputBg,
            color: textColor,
            fontSize: '14px',
            boxSizing: 'border-box',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'text'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '6px'
        }}>
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 12px',
              paddingRight: '40px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              background: inputBg,
              color: textColor,
              fontSize: '14px',
              boxSizing: 'border-box',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'text'
            }}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              opacity: loading ? 0.6 : 1
            }}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <button
        onClick={handleSignIn}
        disabled={loading || !fufaHandle || !password}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: loading || !fufaHandle || !password
            ? isDark ? '#4b5563' : '#d1d5db'
            : isDark ? '#3b82f6' : '#2563eb',
          color: loading || !fufaHandle || !password
            ? isDark ? '#9ca3af' : '#6b7280'
            : '#ffffff',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading || !fufaHandle || !password ? 'not-allowed' : 'pointer',
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
            Signing in...
          </>
        ) : (
          <>
            <span>🔓</span>
            Sign In
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
