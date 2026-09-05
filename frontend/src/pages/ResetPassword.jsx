import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (loading || user) {
    return null;
  }

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('http://127.0.0.1:5006/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('Your password has been successfully reset. You can now log in.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="container mt-5 text-center">
        <h3 className="text-danger">Invalid Reset Link</h3>
        <p>This password reset link is invalid or incomplete.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Return to Login</button>
      </div>
    );
  }

  return (
    <div className="d-flex vh-100 overflow-hidden bg-white">
      {/* Left Column: Visual/Brand */}
      <div className="d-none d-lg-flex col-lg-6 align-items-center justify-content-center position-relative" style={{ backgroundColor: '#1a1a2e', background: 'linear-gradient(135deg, #1a1a2e 0%, #D6536D 100%)' }}>
        <div className="position-absolute w-100 h-100" style={{ opacity: 0.1, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="text-white text-center position-relative z-index-1 p-5">
          <h1 className="display-4 fw-bolder mb-3" style={{ letterSpacing: '-1px' }}>DealFlow<span style={{ color: '#ffb6b9' }}>360</span></h1>
          <p className="lead fw-light text-white-50 mb-0">Securely recover your access to your workspace.</p>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="col-12 col-lg-6 d-flex flex-column justify-content-center px-4 px-md-5">
        <div className="mx-auto w-100" style={{ maxWidth: '420px' }}>
          
          <div className="text-center mb-5 d-lg-none">
            <h2 className="fw-bolder" style={{ color: '#D6536D' }}>DealFlow360</h2>
          </div>

          <div className="mb-4">
            <h2 className="fw-bolder text-dark mb-1">Set New Password</h2>
            <p className="text-muted small">Choose a strong new password for your account.</p>
          </div>
          
          {error && <div className="alert alert-danger p-3 text-center border-0 rounded-3 small fw-bold shadow-sm">{error}</div>}
          {message && <div className="alert alert-success p-3 text-center border-0 rounded-3 small fw-bold shadow-sm">{message}</div>}
          
          {!message && (
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="form-floating mb-3">
                <input type="password" required className="form-control bg-light border-0 shadow-none" id="floatingPassword1" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} style={{ borderRadius: '10px' }} minLength={8} />
                <label htmlFor="floatingPassword1" className="text-muted">New Password</label>
              </div>
              <div className="form-floating mb-4">
                <input type="password" required className="form-control bg-light border-0 shadow-none" id="floatingPassword2" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ borderRadius: '10px' }} minLength={8} />
                <label htmlFor="floatingPassword2" className="text-muted">Confirm Password</label>
              </div>
              
              <button type="submit" className="btn w-100 py-3 fw-bold text-white shadow-sm" style={{ backgroundColor: '#D6536D', borderRadius: '10px' }} disabled={isSubmitting}>
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="text-center mt-5">
            <button type="button" className="btn btn-link text-decoration-none fw-bold p-0 m-0 align-baseline" onClick={() => navigate('/login')} style={{ color: '#6c757d' }}>
              <i className="fa fa-arrow-left me-2"></i> Back to login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
