'use client';
import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import { getCustomers } from '../../services/customerService';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers().then(data => {
      setCustomers(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
      <div className="container-fluid px-4 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-0" style={{color: '#D6536D'}}>Customers Directory</h2>
            <span className="text-muted">Manage your client organizations and key contacts.</span>
          </div>
          <Link href="/customers/create" className="btn btn-primary" style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}}>
            + New Customer
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center mt-5">Loading customers...</div>
        ) : customers.length > 0 ? (
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-body p-0">
              <table className="table mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Industry</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c._id}>
                      <td className="fw-bold">{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.industry || '-'}</td>
                      <td>{c.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-body py-5 text-center text-muted">
              <i className="fs-1 mb-3">🏢</i>
              <h4>No Customers Yet</h4>
              <p>Click the button above to add your first client organization.</p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
