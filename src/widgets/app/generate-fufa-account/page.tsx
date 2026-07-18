'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';
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
  const theme = useTheme();
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
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
        <div style={{ fontSize: '14px', fontWeight: 500 }}>Initializing KYC Engine...</div>
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
        borderRadius: '24px',
        border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.4)' : '#a7f3d0'}`,
        color: isDark ? '#ffffff' : '#065f46',
        boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.25)',
        maxWidth: '450px',
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
            fontSize: '24px'
          }}>
            🎉
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              Account Created!
            </h3>
            <span style={{
              display: 'inline-block',
              marginTop: '4px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              background: isDark ? 'rgba(255,255,255,0.2)' : '#10b981',
              color: '#ffffff'
            }}>
              KYC VERIFIED
            </span>
          </div>
        </div>

        <div style={{
          background: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.7)',
          padding: '20px',
          borderRadius: '16px',
          fontSize: '14px',
          lineHeight: 1.6,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ opacity: 0.8 }}>FUFA Handle</span>
            <strong style={{ fontFamily: 'monospace' }}>{data.fufaHandle}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ opacity: 0.8 }}>User ID</span>
            <span style={{ fontFamily: 'monospace', opacity: 0.9 }}>{data.userId?.substring(0, 10)}...</span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9, paddingTop: '10px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}` }}>
            Opening wallet balance of ₹1,000.00 credited. You can now start using FUFA services!
          </p>
        </div>
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
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#ffffff',
          boxShadow: '0 8px 16px -4px rgba(6, 182, 212, 0.5)'
        }}>
          📝
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.3px' }}>
            Create FUFA Account
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: subTextColor }}>
            Instant registration with verified KYC
          </p>
        </div>
      </div>

      <div style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '6px', marginBottom: '16px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '4px' }}>Email Address</label>
          <input
            type="email"
            placeholder="john.doe@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, fontSize: '13px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '4px' }}>First Name</label>
            <input
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, fontSize: '13px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '4px' }}>Last Name</label>
            <input
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '4px' }}>Bank Account No</label>
            <input
              type="text"
              placeholder="1234567890"
              value={formData.accNo}
              onChange={(e) => handleChange('accNo', e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, fontSize: '13px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '4px' }}>IFSC Code</label>
            <input
              type="text"
              placeholder="SBIN0001234"
              value={formData.ifsc}
              onChange={(e) => handleChange('ifsc', e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, fontSize: '13px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: subTextColor, marginBottom: '4px' }}>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCreateAccount}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: loading
            ? isDark ? '#334155' : '#cbd5e1'
            : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'Outfit, sans-serif',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 10px 20px -5px rgba(6, 182, 212, 0.4)',
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
            Creating FUFA Account...
          </>
        ) : (
          'Complete Registration →'
        )}
      </button>
    </div>
  );
}
