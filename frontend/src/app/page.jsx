'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5006/api/deals')
      .then(res => res.json())
      .then(data => setDeals(data))
      .catch(console.error);
  }, []);

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-4" style={{color: '#D6536D'}}>Deal Health & Operations Dashboard</h1>
          <p className="lead">Overview of active deals, pipeline value, and approvals.</p>
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-md-3">
          <div className="card shadow-sm border-0" style={{borderLeft: '4px solid #D6536D'}}>
            <div className="card-body">
              <h5 className="card-title text-muted">Active Deals</h5>
              <h2 className="mb-0">{deals.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0" style={{borderLeft: '4px solid #28a745'}}>
            <div className="card-body">
              <h5 className="card-title text-muted">Pipeline Value</h5>
              <h2 className="mb-0">$ {deals.reduce((acc, deal) => acc + (deal.value || 0), 0).toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0" style={{borderLeft: '4px solid #ffc107'}}>
            <div className="card-body">
              <h5 className="card-title text-muted">Pending Approvals</h5>
              <h2 className="mb-0">{deals.filter(d => d.approvalStatus === 'Pending').length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0" style={{borderLeft: '4px solid #dc3545'}}>
            <div className="card-body">
              <h5 className="card-title text-muted">High Risk Deals</h5>
              <h2 className="mb-0">{deals.filter(d => d.riskLevel === 'Critical' || d.riskLevel === 'High').length}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white" style={{ borderBottom: '2px solid #f8f9fa' }}>
              <h4 className="mb-0">Recent Deals</h4>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Deal ID</th>
                    <th>Title</th>
                    <th>Stage</th>
                    <th>Value</th>
                    <th>Risk</th>
                    <th>Approval</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-4">No deals found. Go to Admin to seed data.</td></tr>
                  ) : (
                    deals.map(deal => (
                      <tr key={deal._id}>
                        <td><strong>{deal.dealNumber}</strong></td>
                        <td>{deal.title}</td>
                        <td><span className={`badge bg-${deal.stage === 'Closed Won' ? 'success' : 'secondary'}`}>{deal.stage}</span></td>
                        <td>${deal.value?.toLocaleString()}</td>
                        <td><span className={`badge bg-${deal.riskLevel === 'Critical' ? 'danger' : deal.riskLevel === 'High' ? 'warning' : 'success'}`}>{deal.riskLevel}</span></td>
                        <td>{deal.approvalStatus}</td>
                        <td><a href={`/deals/${deal._id}`} className="btn btn-sm btn-outline-primary">View</a></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
