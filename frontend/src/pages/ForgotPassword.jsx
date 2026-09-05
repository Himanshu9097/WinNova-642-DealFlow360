import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (loading || user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('http://127.0.0.1:5006/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'If that email exists in our system, we have sent a reset link.');
      } else {
        setError(data.error || 'Failed to process request');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h2 className="fw-bolder text-dark mb-1">Forgot Password</h2>
            <p className="text-muted small">Enter your email address and we'll send you a link to reset your password.</p>
          </div>
          
          {error && <div className="alert alert-danger p-3 text-center border-0 rounded-3 small fw-bold shadow-sm">{error}</div>}
          {message && <div className="alert alert-success p-3 text-center border-0 rounded-3 small fw-bold shadow-sm">{message}</div>}
          
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="form-floating mb-4">
              <input type="email" required className="form-control bg-light border-0 shadow-none" id="floatingInput" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ borderRadius: '10px' }} />
              <label htmlFor="floatingInput" className="text-muted">Email address</label>
            </div>
            
            <button type="submit" className="btn w-100 py-3 fw-bold text-white shadow-sm" style={{ backgroundColor: '#D6536D', borderRadius: '10px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

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
