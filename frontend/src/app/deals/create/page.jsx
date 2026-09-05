'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Link from 'next/link';
import { createDeal } from '../../../services/dealService';
import { getCustomers } from '../../../services/customerService';

export default function CreateDeal() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    value: '',
    stage: 'Discovery',
    riskLevel: 'Low'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCustomers().then(setCustomers).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createDeal({
        ...formData,
        value: Number(formData.value),
        dealNumber: `D-${Date.now().toString().slice(-6)}`
      });
      router.push('/deals');
    } catch (err) {
      console.error(err);
      alert('Failed to create deal');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{color: '#D6536D'}} className="mb-0">Create New Deal</h2>
            <span className="text-muted">Enter the basic details for the new opportunity.</span>
          </div>
          <Link href="/deals" className="btn btn-secondary">
            Back to Pipeline
          </Link>
        </div>

        <div className="card shadow-sm border-0" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-bold text-uppercase">Deal Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Enterprise Security Upgrade" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label text-muted small fw-bold text-uppercase">Customer</label>
                <select 
                  className="form-select"
                  value={formData.customerId}
                  onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                  required
                >
                  <option value="">Select a Customer...</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-bold text-uppercase">Estimated Value (₹)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 500000" 
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary w-100" style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}} disabled={loading}>
                {loading ? 'Creating...' : 'Create Deal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
