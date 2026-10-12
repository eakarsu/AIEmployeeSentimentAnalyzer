import { useState } from 'react';
import api from '../api';

const demoEmail = import.meta.env.VITE_DEMO_EMAIL || '';
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || '';
const demoCredentialsAvailable = import.meta.env.DEV
  && import.meta.env.VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL === 'true'
  && Boolean(demoEmail && demoPassword);

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    if (!demoCredentialsAvailable) return;
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-section">
          <div className="logo-icon-large">🧠</div>
          <h1>SentimentAI</h1>
          <p className="subtitle">AI-Powered Employee Sentiment Analyzer</p>
        </div>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <button
          type="button"
          className="btn-autofill"
          onClick={fillDemoCredentials}
          disabled={loading || !demoCredentialsAvailable}
          title={demoCredentialsAvailable ? 'Fill the configured local demo account' : 'Demo credentials are not configured for this development session'}
        >
          Fill Demo Credentials
        </button>
        {!demoCredentialsAvailable && (
          <p className="demo-login-note">Demo credentials are available only in configured local development sessions.</p>
        )}
      </div>
    </div>
  );
}
