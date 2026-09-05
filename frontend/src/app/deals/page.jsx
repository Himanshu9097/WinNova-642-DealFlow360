'use client';

import { useEffect, useState } from 'react';

import ProtectedRoute from '../../components/ProtectedRoute';

export default function DealList() {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:5006/api/deals', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDeals(data);
      })
      .catch(console.error);
  }, []);

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{color: '#D6536D'}}>Deals Pipeline</h2>
          <button className="btn btn-primary">New Deal</button>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Deal ID</th>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Stage</th>
                  <th>Value</th>
                  <th>Risk</th>
                  <th>Approval</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deals.map(deal => (
                  <tr key={deal._id}>
                    <td><strong>{deal.dealNumber}</strong></td>
                    <td>{deal.title}</td>
                    <td>{deal.customerId?.name || 'Unknown'}</td>
                    <td><span className={`badge bg-${deal.stage === 'Closed Won' ? 'success' : 'secondary'}`}>{deal.stage}</span></td>
                    <td>₹{deal.value?.toLocaleString()}</td>
                    <td><span className={`badge bg-${deal.riskLevel === 'Critical' ? 'danger' : deal.riskLevel === 'High' ? 'warning' : 'success'}`}>{deal.riskLevel}</span></td>
                    <td>{deal.approvalStatus}</td>
                    <td><a href={`/deals/${deal._id}`} className="btn btn-sm btn-outline-primary">Open Engine</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
