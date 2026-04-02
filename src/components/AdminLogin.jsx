import { useState } from 'react';
import { Lock, Eye, EyeOff, LogIn, X } from 'lucide-react';
import { loginAdmin } from '../utils/api';
export default function AdminLogin({ onSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginAdmin(username, password);
      sessionStorage.setItem('admin_token', data.token);
      onSuccess(data.token);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="admin-login-overlay" onClick={onClose}>
      <div className="glass-card admin-login-card" onClick={(e) => e.stopPropagation()}>
        <button className="admin-login-close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="admin-login-icon">
          <Lock size={28} />
        </div>
        <h2>Admin Login</h2>
        <p className="admin-login-subtitle">Enter your credentials to access the admin dashboard</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <div className="admin-login-error">{error}</div>}
          <button
            type="submit"
            className="btn-primary"
            disabled={!username.trim() || !password.trim() || loading}
          >
            {loading ? 'Logging in...' : <>
              <LogIn size={18} /> Login
            </>}
          </button>
        </form>
      </div>
    </div>
  );
}
