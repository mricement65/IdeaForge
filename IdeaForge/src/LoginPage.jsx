import { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // No real auth – just transition to Dashboard
    onLogin();
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleSubmit}>
        {/* Branding */}
        <div className="login-logo">
          <div className="login-logo-icon">⚡</div>
          <span className="login-logo-text">IdeaForge</span>
        </div>
        <p className="login-subtitle">Sign in to your workspace</p>

        {/* Email */}
        <div className="login-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="login-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit */}
        <button type="submit" className="login-btn">
          Sign In
        </button>

        {/* Extra links */}
        <div className="login-extras">
          <a href="#forgot">Forgot password?</a>
          <span>
            No account?{' '}
            <a href="#signup">Sign up</a>
          </span>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
