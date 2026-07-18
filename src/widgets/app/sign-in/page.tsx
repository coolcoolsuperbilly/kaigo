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
        border: `1px solid ${borderColor}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
        <div style={{ fontSize: '14px', fontWeight: 500 }}>Initializing Secure Session...</div>
      </div>
    );
  }

  if (data?.success) {
    return (
      <div style={{
        padding: '28px',
        background: isDark
          ? 'linear-gradient(145deg, rgba(6, 78, 59, 0.9), rgba(4, 120, 87, 0.95))'
          : 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: '20px',
        border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0'}`,
        color: isDark ? '#ffffff' : '#065f46',
        boxShadow: '0 20px 30px -10px rgba(16, 185, 129, 0.25)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: isDark ? 'rgba(255,255,255,0.15)' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            ✨
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              Welcome Back!
            </h3>
            <span style={{
              display: 'inline-block',
              marginTop: '4px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              background: isDark ? 'rgba(255,255,255,0.2)' : '#10b981',
              color: '#ffffff',
              letterSpacing: '0.5px'
            }}>
              AUTHENTICATED
            </span>
          </div>
        </div>

        <div style={{
          background: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.7)',
          padding: '18px',
          borderRadius: '14px',
          fontSize: '14px',
          lineHeight: 1.6,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ opacity: 0.8 }}>Account Handle</span>
            <strong style={{ fontFamily: 'monospace' }}>{data.fufaHandle}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ opacity: 0.8 }}>User ID</span>
            <span style={{ fontFamily: 'monospace', opacity: 0.9 }}>{data.userId?.substring(0, 10)}...</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}` }}>
            <span style={{ fontWeight: 600 }}>Wallet Balance</span>
            <strong style={{ fontSize: '18px', color: isDark ? '#6ee7b7' : '#047857' }}>
              ₹{data.balanceInRupees?.toFixed(2) || '0.00'}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div style={{
        padding: '24px',
        background: isDark
          ? 'linear-gradient(145deg, rgba(127, 29, 29, 0.9), rgba(153, 27, 27, 0.95))'
          : 'linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%)',
        borderRadius: '20px',
        border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fca5a5'}`,
        color: isDark ? '#ffffff' : '#991b1b',
        boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '28px' }}>⚠️</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Authentication Error</h3>
        </div>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.95 }}>{data.error}</p>
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
      maxWidth: '420px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(16px)'
    }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#ffffff',
          boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.5)'
        }}>
          🔑
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.3px' }}>
            FUFA Sign In
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: subTextColor }}>
            Secure login to your wallet account
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: subTextColor,
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
            padding: '12px 14px',
            borderRadius: '12px',
            border: `1px solid ${inputBorder}`,
            background: inputBg,
            color: textColor,
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.6 : 1
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: subTextColor,
          marginBottom: '6px'
        }}>
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 14px',
              paddingRight: '44px',
              borderRadius: '12px',
              border: `1px solid ${inputBorder}`,
              background: inputBg,
              color: textColor,
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1
            }}
          />
          <button
            type="button"
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
              fontSize: '16px',
              opacity: 0.7,
              padding: '4px'
            }}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading || !fufaHandle || !password}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: loading || !fufaHandle || !password
            ? isDark ? '#334155' : '#cbd5e1'
            : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: loading || !fufaHandle || !password
            ? isDark ? '#64748b' : '#94a3b8'
            : '#ffffff',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'Outfit, sans-serif',
          cursor: loading || !fufaHandle || !password ? 'not-allowed' : 'pointer',
          boxShadow: loading || !fufaHandle || !password ? 'none' : '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
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
            Authenticating...
          </>
        ) : (
          'Sign In to Dashboard →'
        )}
      </button>
    </div>
  );
}
