import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';
import { Settings as SettingsIcon, User, Lock, Shield, AlertCircle, CheckCircle2, Mail } from 'lucide-react';

/**
 * Settings Page
 *
 * User settings: profile info, password change, 2FA management.
 */
export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security' | 'email'>('profile');

  return (
    <div className="settings-page">
      <div className="page-header">
        <SettingsIcon size={28} />
        <div>
          <h1>Settings</h1>
          <p>Manage your account preferences</p>
        </div>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────────── */}
      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} />
          Profile
        </button>
        <button
          className={`tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <Lock size={18} />
          Password
        </button>
        <button
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={18} />
          Security
        </button>
        <button
          className={`tab ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          <Mail size={18} />
          Email Setup
        </button>
      </div>

      {/* ─── Tab Content ─────────────────────────────────────────── */}
      <div className="settings-content">
        {activeTab === 'profile' && <ProfileTab user={user} onUpdate={refreshUser} />}
        {activeTab === 'password' && <PasswordTab />}
        {activeTab === 'security' && <SecurityTab user={user} onUpdate={refreshUser} />}
        {activeTab === 'email' && <EmailTab />}
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────
function ProfileTab({ user, onUpdate }: { user: ReturnType<typeof useAuth>['user']; onUpdate: () => Promise<void> }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.put('/user/profile', { name, email });
      setMessage(response.data.message);
      await onUpdate();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-card">
      <h2>Profile Information</h2>
      <p className="settings-description">Update your name and email address.</p>

      {message && <div className="alert alert-success"><CheckCircle2 size={18} /><span>{message}</span></div>}
      {error && <div className="alert alert-error"><AlertCircle size={18} /><span>{error}</span></div>}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="settings-name">Name</label>
          <input id="settings-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="settings-email">Email</label>
          <input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

// ─── Password Tab ─────────────────────────────────────────────────────
function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.put('/user/password', {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(response.data.message);
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-card">
      <h2>Change Password</h2>
      <p className="settings-description">Update your password to keep your account secure.</p>

      {message && <div className="alert alert-success"><CheckCircle2 size={18} /><span>{message}</span></div>}
      {error && <div className="alert alert-error"><AlertCircle size={18} /><span>{error}</span></div>}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="current-password">Current Password</label>
          <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-new-password">Confirm New Password</label>
          <input id="confirm-new-password" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required autoComplete="new-password" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────
function SecurityTab({ user, onUpdate }: { user: ReturnType<typeof useAuth>['user']; onUpdate: () => Promise<void> }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [confirmCode, setConfirmCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const enable2FA = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/two-factor/enable');
      setQrCode(response.data.qr_code);
      setRecoveryCodes(response.data.recovery_codes);
      setMessage('Scan the QR code with your authenticator app, then enter the code to confirm.');
    } catch {
      setError('Failed to enable 2FA.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirm2FA = async () => {
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/two-factor/confirm', { code: confirmCode });
      setMessage('Two-factor authentication is now active!');
      setQrCode('');
      setConfirmCode('');
      await onUpdate();
    } catch {
      setError('Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    setIsLoading(true);
    setError('');
    try {
      await api.delete('/auth/two-factor/disable');
      setMessage('Two-factor authentication disabled.');
      setRecoveryCodes([]);
      await onUpdate();
    } catch {
      setError('Failed to disable 2FA.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-card">
      <h2>Two-Factor Authentication</h2>
      <p className="settings-description">
        Add an extra layer of security with TOTP-based two-factor authentication.
      </p>

      {message && <div className="alert alert-success"><CheckCircle2 size={18} /><span>{message}</span></div>}
      {error && <div className="alert alert-error"><AlertCircle size={18} /><span>{error}</span></div>}

      {user?.two_factor_enabled ? (
        <div className="security-status">
          <div className="status-badge status-enabled">
            <Shield size={18} />
            2FA is enabled
          </div>
          <button onClick={disable2FA} className="btn btn-danger" disabled={isLoading}>
            {isLoading ? 'Disabling...' : 'Disable 2FA'}
          </button>
        </div>
      ) : (
        <div className="security-setup">
          {!qrCode ? (
            <button onClick={enable2FA} className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Setting up...' : 'Enable 2FA'}
            </button>
          ) : (
            <div className="twofa-setup">
              <div className="qr-code" dangerouslySetInnerHTML={{ __html: qrCode }} />
              <div className="form-group">
                <label htmlFor="confirm-2fa-code">Enter code from authenticator</label>
                <input
                  id="confirm-2fa-code"
                  type="text"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <button onClick={confirm2FA} className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          )}
        </div>
      )}

      {recoveryCodes.length > 0 && (
        <div className="recovery-codes">
          <h3>Recovery Codes</h3>
          <p>Save these codes in a safe place. Each can only be used once.</p>
          <div className="codes-grid">
            {recoveryCodes.map((code, i) => (
              <code key={i}>{code}</code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Email Setup Tab ──────────────────────────────────────────────────
function EmailTab() {
  const [mailHost, setMailHost] = useState('');
  const [mailPort, setMailPort] = useState('');
  const [mailUsername, setMailUsername] = useState('');
  const [mailPassword, setMailPassword] = useState('');
  const [mailEncryption, setMailEncryption] = useState('');
  const [mailFromAddress, setMailFromAddress] = useState('');
  const [mailFromName, setMailFromName] = useState('');
  const [testRecipientEmail, setTestRecipientEmail] = useState('gregmarresurreccion4105@gmail.com');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings/email');
        const settings = response.data.settings;
        setMailHost(settings.mail_host || '');
        setMailPort(settings.mail_port || '');
        setMailUsername(settings.mail_username || '');
        setMailPassword(settings.mail_password || '');
        setMailEncryption(settings.mail_encryption || '');
        setMailFromAddress(settings.mail_from_address || '');
        setMailFromName(settings.mail_from_name || '');
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Failed to load email settings.');
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.put('/settings/email', {
        mail_host: mailHost,
        mail_port: mailPort,
        mail_username: mailUsername,
        mail_password: mailPassword,
        mail_encryption: mailEncryption,
        mail_from_address: mailFromAddress,
        mail_from_name: mailFromName,
      });
      setMessage(response.data.message || 'Email settings saved successfully.');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to save email settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    setMessage('');
    setError('');
    setIsTesting(true);

    try {
      const response = await api.post('/settings/email/test', {
        mail_host: mailHost,
        mail_port: mailPort,
        mail_username: mailUsername,
        mail_password: mailPassword,
        mail_encryption: mailEncryption,
        mail_from_address: mailFromAddress,
        mail_from_name: mailFromName,
        recipient_email: testRecipientEmail || undefined,
      });
      setMessage(response.data.message || 'Test email sent successfully.');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
      setError(axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to send test email.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="settings-card">
      <h2>Email Configuration</h2>
      <p className="settings-description">Configure the SMTP settings for outbound emails and system notifications.</p>

      {message && <div className="alert alert-success"><CheckCircle2 size={18} /><span>{message}</span></div>}
      {error && <div className="alert alert-error"><AlertCircle size={18} /><span>{error}</span></div>}

      <form onSubmit={handleSubmit} className="settings-form">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="mail-host">SMTP Host</label>
            <input id="mail-host" type="text" value={mailHost} onChange={(e) => setMailHost(e.target.value)} placeholder="smtp.mailtrap.io" />
          </div>
          <div className="form-group">
            <label htmlFor="mail-port">SMTP Port</label>
            <input id="mail-port" type="text" value={mailPort} onChange={(e) => setMailPort(e.target.value)} placeholder="2525" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="mail-username">SMTP Username</label>
            <input id="mail-username" type="text" value={mailUsername} onChange={(e) => setMailUsername(e.target.value)} placeholder="username" />
          </div>
          <div className="form-group">
            <label htmlFor="mail-password">SMTP Password</label>
            <input id="mail-password" type="password" value={mailPassword} onChange={(e) => setMailPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="mail-encryption">Encryption</label>
          <select 
            id="mail-encryption" 
            value={mailEncryption} 
            onChange={(e) => setMailEncryption(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-lg, 8px)',
              border: '1px solid var(--border, #e4e4e7)',
              backgroundColor: 'var(--bg-primary, #ffffff)',
              color: 'var(--text-primary, #09090b)',
            }}
          >
            <option value="">None (Clear Text)</option>
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="mail-from-address">Sender Email (From Address)</label>
            <input id="mail-from-address" type="email" value={mailFromAddress} onChange={(e) => setMailFromAddress(e.target.value)} placeholder="noreply@tarragonmanila.com" />
          </div>
          <div className="form-group">
            <label htmlFor="mail-from-name">Sender Name (From Name)</label>
            <input id="mail-from-name" type="text" value={mailFromName} onChange={(e) => setMailFromName(e.target.value)} placeholder="Tarragon Manila" />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border, #e4e4e7)', marginTop: '2rem', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary, #09090b)' }}>Test Configuration</h3>
          <p className="settings-description" style={{ marginBottom: '1rem' }}>Send a test email to verify that your SMTP setup works correctly.</p>
          <div className="form-group" style={{ maxWidth: '400px' }}>
            <label htmlFor="test-recipient">Recipient Email Address</label>
            <input 
              id="test-recipient" 
              type="email" 
              value={testRecipientEmail} 
              onChange={(e) => setTestRecipientEmail(e.target.value)} 
              placeholder="gregmarresurreccion4105@gmail.com" 
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || isTesting}>
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleTestConnection} disabled={isSubmitting || isTesting} style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border, #e4e4e7)',
            color: 'var(--text-primary, #09090b)',
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-lg, 8px)',
            cursor: 'pointer',
            fontWeight: 500,
          }}>
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </form>
    </div>
  );
}
