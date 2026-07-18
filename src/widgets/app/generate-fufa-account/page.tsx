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
          <span style={{ fontSize: '32px' }}>🎉</span>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Account Created!</h3>
        </div>
        <div style={{
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>FUFA Handle:</strong> {data.fufaHandle}
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>User ID:</strong> {data.userId?.substring(0, 8)}...
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
            Your account is ready with verified KYC. You can now sign in!
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
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Creation Failed</h3>
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
      maxWidth: '450px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 'bold' }}>
          📝 Create FUFA Account
        </h2>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.7 }}>
          Register and get verified KYC instantly
        </p>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            Email
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              First Name
            </label>
            <input
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
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
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              Last Name
            </label>
            <input
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
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
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            Bank Account Number
          </label>
          <input
            type="text"
            placeholder="1234567890"
            value={formData.accNo}
            onChange={(e) => handleChange('accNo', e.target.value)}
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

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            IFSC Code
          </label>
          <input
            type="text"
            placeholder="SBIN0001234"
            value={formData.ifsc}
            onChange={(e) => handleChange('ifsc', e.target.value)}
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

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Min 6 characters"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
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

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
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
      </div>

      <button
        onClick={handleCreateAccount}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: loading
            ? isDark ? '#4b5563' : '#d1d5db'
            : isDark ? '#10b981' : '#059669',
          color: loading
            ? isDark ? '#9ca3af' : '#6b7280'
            : '#ffffff',
          fontSize: '15px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
            Creating Account...
          </>
        ) : (
          <>
            <span>✨</span>
            Create Account
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
