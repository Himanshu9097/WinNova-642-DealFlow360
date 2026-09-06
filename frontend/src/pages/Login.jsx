import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [leftWidth, setLeftWidth] = useState(30); // percentage width for left column
  const [isDragging, setIsDragging] = useState(false);
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

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const containerWidth = window.innerWidth;
      const newWidthPct = (e.clientX / containerWidth) * 100;
      // Clamp between 10% and 75%
      const clamped = Math.min(Math.max(newWidthPct, 10), 75);
      setLeftWidth(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isDragging]);

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

  // Calculate dynamic font scale based on left panel width
  const fontRem = Math.min(Math.max(leftWidth * 0.16 + 1.0, 1.5), 8.5);
  const letterSpacingEm = Math.min(Math.max(leftWidth * 0.009 + 0.1, 0.12), 0.45);

  return (
    <div className="d-flex vh-100 overflow-hidden bg-white position-relative" style={{ userSelect: isDragging ? 'none' : 'auto' }}>
      {/* Left Column: Draggable Vertical ODOO HACKATHON Banner */}
      <div 
        className="d-none d-lg-flex flex-column align-items-center justify-content-center position-relative overflow-hidden" 
        style={{ 
          width: `${leftWidth}%`,
          height: '100vh',
          backgroundColor: '#060911',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(225, 29, 72, 0.15) 0%, transparent 80%),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 32px',
          color: '#ffffff',
          userSelect: 'none',
          transition: isDragging ? 'none' : 'width 0.1s ease-out'
        }}
      >
        {/* Parallel Vertical Columns: ODOO and HACKATHON side-by-side */}
        <div 
          className="d-flex flex-row align-items-center justify-content-center h-100 text-nowrap"
          style={{ 
            gap: `${Math.min(Math.max(leftWidth * 0.06, 0.5), 3.5)}rem`,
            userSelect: 'none'
          }}
        >
          {/* Parallel Column 1: ODOO */}
          <div 
            className="fw-black text-uppercase font-monospace d-flex align-items-center justify-content-center"
            style={{ 
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              height: '88vh',
              fontSize: `${Math.min(Math.max(leftWidth * 0.12 + 0.9, 1.4), 6.5)}rem`,
              fontWeight: 900,
              letterSpacing: `${letterSpacingEm * 1.2}em`,
              color: '#ffffff',
              textShadow: isDragging ? '0 0 40px rgba(225, 29, 72, 0.7)' : '0 0 25px rgba(225, 29, 72, 0.35)',
              opacity: 0.98,
              transition: 'font-size 0.05s linear, letter-spacing 0.05s linear'
            }}
          >
            ODOO
          </div>

          {/* Parallel Column 2: HACKATHON */}
          <div 
            className="fw-black text-uppercase font-monospace d-flex align-items-center justify-content-center"
            style={{ 
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              height: '88vh',
              fontSize: `${Math.min(Math.max(leftWidth * 0.10 + 0.7, 1.2), 5.5)}rem`,
              fontWeight: 900,
              letterSpacing: `${letterSpacingEm}em`,
              color: '#fda4af',
              textShadow: isDragging ? '0 0 40px rgba(225, 29, 72, 0.8)' : '0 0 25px rgba(225, 29, 72, 0.4)',
              opacity: 0.95,
              transition: 'font-size 0.05s linear, letter-spacing 0.05s linear'
            }}
          >
            HACKATHON
          </div>
        </div>
      </div>

      {/* Interactive Draggable Split Divider */}
      <div 
        className="d-none d-lg-flex position-relative align-items-center justify-content-center h-100"
        onMouseDown={handleMouseDown}
        title="Drag to resize panels"
        style={{ 
          width: '14px',
          marginLeft: '-7px',
          marginRight: '-7px',
          zIndex: 50,
          cursor: 'col-resize',
          userSelect: 'none'
        }}
      >
        <div 
          className="h-100"
          style={{ 
            width: isDragging ? '4px' : '2px',
            backgroundColor: isDragging ? '#e11d48' : 'rgba(0, 0, 0, 0.15)',
            boxShadow: isDragging ? '0 0 12px rgba(225, 29, 72, 0.9)' : 'none',
            transition: 'width 0.15s, background-color 0.15s'
          }}
        />
        {/* Drag Pill Icon */}
        <div 
          className="position-absolute rounded-pill d-flex align-items-center justify-content-center shadow-sm"
          style={{ 
            width: '20px', 
            height: '40px', 
            border: '1px solid rgba(255, 255, 255, 0.25)',
            fontSize: '0.7rem',
            color: '#ffffff',
            backgroundColor: isDragging ? '#e11d48' : '#0f172a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            cursor: 'col-resize'
          }}
        >
          <span style={{ transform: 'rotate(90deg)', fontSize: '0.8rem', fontWeight: 'bold', lineHeight: 1 }}>:::</span>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="col-12 flex-grow-1 d-flex flex-column justify-content-center px-4 px-md-5" style={{ width: `${100 - leftWidth}%` }}>
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
