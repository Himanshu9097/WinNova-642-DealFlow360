'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    companyName: '', companyEmail: '', companyPhone: '', industry: '',
    adminName: '', adminEmail: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth(); // We might auto-login or just redirect after success

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      const res = await fetch('http://127.0.0.1:5006/api/auth/register-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        // Auto-login
        await login(formData.adminEmail, formData.password);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-4 fw-bold text-center" style={{ color: '#D6536D' }}>Register Your Company</h3>
          
          {error && <div className="alert alert-danger p-2">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <h5 className="mb-3 text-muted border-bottom pb-2">Company Details</h5>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Company Name</label>
                <input type="text" required className="form-control" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Industry</label>
                <input type="text" className="form-control" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label">Company Email</label>
                <input type="email" required className="form-control" value={formData.companyEmail} onChange={e => setFormData({...formData, companyEmail: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Company Phone</label>
                <input type="text" className="form-control" value={formData.companyPhone} onChange={e => setFormData({...formData, companyPhone: e.target.value})} />
              </div>
            </div>

            <h5 className="mb-3 text-muted border-bottom pb-2">Admin User Details</h5>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Admin Name</label>
                <input type="text" required className="form-control" value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Admin Email</label>
                <input type="email" required className="form-control" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input type="password" required className="form-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Confirm Password</label>
                <input type="password" required className="form-control" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="btn w-100 fw-bold text-white" style={{ backgroundColor: '#D6536D' }}>
              Create Company Account
            </button>
            <div className="text-center mt-3">
              <a href="/login" className="text-muted text-decoration-none small">Already have an account? Login here</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
