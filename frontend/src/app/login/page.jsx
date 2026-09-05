'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Login failed');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="text-center mb-4 fw-bold" style={{ color: '#D6536D' }}>DealFlow360</h3>
          <h5 className="text-center mb-4 text-muted">Welcome to DealFlow360</h5>
          
          {error && <div className="alert alert-danger p-2 text-center">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" required className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="form-label">Password</label>
              <input type="password" required className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn w-100 fw-bold text-white mb-3" style={{ backgroundColor: '#D6536D' }}>
              Login
            </button>
            <div className="text-center">
              <a href="#" className="text-muted text-decoration-none small">Forgot Password?</a>
            </div>
            <hr className="my-4" />
            <div className="text-center">
              <span className="text-muted small">Don't have a company account?</span>
              <br/>
              <button type="button" className="btn btn-outline-secondary btn-sm mt-2" onClick={() => router.push('/register')}>
                Register Your Company
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
