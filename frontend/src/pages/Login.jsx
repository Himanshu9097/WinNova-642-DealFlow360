import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      if (user.role === 'CUSTOMER') {
        navigate('/b2b/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.location.href = '/';
    }
  }, [searchParams]);

  if (loading || user) {
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5006/api/auth/google';
  };

  const handleGithubLogin = () => {
    window.location.href = 'http://localhost:5006/api/auth/github';
  };

  return (
    <div className="d-flex vh-100 overflow-hidden bg-white">
      {/* Left Column: Visual/Brand */}
      <div className="d-none d-lg-flex col-lg-6 align-items-center justify-content-center position-relative" style={{ backgroundColor: '#1a1a2e', background: 'linear-gradient(135deg, #1a1a2e 0%, #D6536D 100%)' }}>
        <div className="position-absolute w-100 h-100" style={{ opacity: 0.1, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="text-white text-center position-relative z-index-1 p-5">
          <h1 className="display-4 fw-bolder mb-3" style={{ letterSpacing: '-1px' }}>DealFlow<span style={{ color: '#ffb6b9' }}>360</span></h1>
          <p className="lead fw-light text-white-50 mb-0">The modern operating system for closing deals, managing inventory, and seamless billing.</p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="col-12 col-lg-6 d-flex flex-column justify-content-center px-4 px-md-5">
        <div className="mx-auto w-100" style={{ maxWidth: '420px' }}>
          
          <div className="text-center mb-5 d-lg-none">
            <h2 className="fw-bolder" style={{ color: '#D6536D' }}>DealFlow360</h2>
          </div>

          <div className="mb-4">
            <h2 className="fw-bolder text-dark mb-1">Welcome back</h2>
            <p className="text-muted small">Enter your credentials to access your workspace.</p>
          </div>
          
          {error && <div className="alert alert-danger p-3 text-center border-0 rounded-3 small fw-bold shadow-sm">{error}</div>}
          
          <form onSubmit={handleLogin} className="mb-4">
            <div className="form-floating mb-3">
              <input type="email" required className="form-control bg-light border-0 shadow-none" id="floatingInput" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ borderRadius: '10px' }} />
              <label htmlFor="floatingInput" className="text-muted">Email address</label>
            </div>
            
            <div className="form-floating mb-3">
              <input type="password" required className="form-control bg-light border-0 shadow-none" id="floatingPassword" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ borderRadius: '10px' }} />
              <label htmlFor="floatingPassword" className="text-muted">Password</label>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="rememberMe" />
                <label className="form-check-label small text-muted" htmlFor="rememberMe">Remember me</label>
              </div>
              <button type="button" className="btn btn-link text-decoration-none p-0 m-0 align-baseline small fw-bold" onClick={() => navigate('/forgot-password')} style={{ color: '#D6536D' }}>Forgot password?</button>
            </div>
            
            <button type="submit" className="btn w-100 py-3 fw-bold text-white shadow-sm" style={{ backgroundColor: '#D6536D', borderRadius: '10px' }}>
              Sign In
            </button>
          </form>

          <div className="position-relative mt-4 mb-4 text-center">
            <hr className="text-muted opacity-25" />
            <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Or continue with</span>
          </div>

          <div className="d-grid gap-3 mb-5">
            <button type="button" className="btn btn-light border py-2 d-flex align-items-center justify-content-center" onClick={handleGoogleLogin} style={{ borderRadius: '10px' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="20" height="20" className="me-3" />
              <span className="fw-bold text-dark">Google</span>
            </button>
            <button type="button" className="btn btn-dark py-2 d-flex align-items-center justify-content-center" onClick={handleGithubLogin} style={{ borderRadius: '10px' }}>
              <i className="fa fa-github fa-lg me-3 text-white"></i>
              <span className="fw-bold text-white">GitHub</span>
            </button>
          </div>

          <div className="text-center mt-auto">
            <span className="text-muted small">Don't have a workspace? </span>
            <button type="button" className="btn btn-link text-decoration-none fw-bold p-0 m-0 align-baseline" onClick={() => navigate('/register')} style={{ color: '#D6536D' }}>
              Register your company
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
