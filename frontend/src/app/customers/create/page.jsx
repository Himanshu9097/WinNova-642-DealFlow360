'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Link from 'next/link';
import { createCustomer } from '../../../services/customerService';

export default function CreateCustomer() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCustomer(formData);
      router.push('/customers');
    } catch (error) {
      console.error(error);
      alert('Failed to create customer');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{color: '#D6536D'}} className="mb-0">Create New Customer</h2>
            <span className="text-muted">Enter the details for the new client organization.</span>
          </div>
          <Link href="/customers" className="btn btn-secondary">
            Back to Directory
          </Link>
        </div>

        <div className="card shadow-sm border-0" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-bold text-uppercase">Customer Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Acme Corp" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label text-muted small fw-bold text-uppercase">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="e.g. contact@acmecorp.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-bold text-uppercase">Industry</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Technology" 
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-bold text-uppercase">Phone</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="e.g. +1 234 567 8900" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100" style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}} disabled={loading}>
                {loading ? 'Saving...' : 'Create Customer'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
