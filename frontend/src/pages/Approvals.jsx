import SkeletonLoader from '@/components/SkeletonLoader';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getApprovals, processApproval } from '@/services/approvalService';

export default function ApprovalsWorkspace() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const loadApprovals = () => {
    getApprovals().then(data => {
      setApprovals(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleAction = async (id, action) => {
    setProcessing(id);
    try {
      await processApproval(id, action, `${action === 'APPROVE' ? 'Approved' : 'Rejected'} by manager`);
      setApprovals(approvals.map(a => a._id === id ? { ...a, status: action === 'APPROVE' ? 'Approved' : 'Rejected' } : a));
    } catch (err) {
      console.error(err);
      alert('Failed to process approval.');
    }
    setProcessing(null);
  };

  if (loading) return <SkeletonLoader type='table' />;

  const pendingApprovals = approvals.filter(a => a.status === 'Pending');
  const pastApprovals = approvals.filter(a => a.status !== 'Pending');

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'SALES_MANAGER', 'FINANCE']}>
      <div className="bg-light min-vh-100 py-4">
        <div className="container">
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 style={{color: '#D6536D'}} className="mb-0">Approvals Workspace</h2>
              <span className="text-muted">Review and process required exceptions</span>
            </div>
            <div>
              <span className="badge bg-warning text-dark fs-6 rounded-pill px-3 py-2">
                {pendingApprovals.length} Pending Actions
              </span>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <h5 className="mb-3 text-secondary fw-bold">Pending Review</h5>
              {pendingApprovals.length === 0 ? (
                <div className="alert alert-success border-0 shadow-sm">
                  <i className="fa fa-check-circle me-2"></i> No pending approvals. You are all caught up!
                </div>
              ) : (
                pendingApprovals.map(app => (
                  <div key={app._id} className="card shadow-sm border-0 mb-3" style={{ borderLeft: '5px solid #ffc107' }}>
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-7">
                          <div className="d-flex align-items-center mb-2">
                            <span className="badge bg-light text-dark border me-2">{app.requestNumber}</span>
                            <span className="fw-bold text-dark">{app.type}</span>
                          </div>
                          <p className="mb-1">{app.details}</p>
                          <div className="small text-muted">
                            <strong>Reference:</strong> {app.dealId?.title || app.quotationId?.quoteNumber || 'N/A'} &bull; 
                            <strong className="ms-2">Requested By:</strong> {app.requesterId?.name || app.requester?.name}
                          </div>
                        </div>
                        <div className="col-md-2 text-end border-end pe-4">
                          <div className="text-muted small">Value at Risk</div>
                          <div className="fs-5 fw-bold">₹{app.amountAtRisk?.toLocaleString() || app.amount?.toLocaleString()}</div>
                        </div>
                        <div className="col-md-3 text-end">
                          <button 
                            className="btn btn-outline-danger me-2" 
                            disabled={processing === app._id}
                            onClick={() => handleAction(app._id, 'REJECT')}
                          >
                            Reject
                          </button>
                          <button 
                            className="btn btn-success" 
                            disabled={processing === app._id}
                            onClick={() => handleAction(app._id, 'APPROVE')}
                          >
                            {processing === app._id ? 'Processing...' : 'Approve'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-12">
              <h5 className="mb-3 text-secondary fw-bold">Past Decisions</h5>
              <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Req #</th>
                        <th>Type</th>
                        <th>Reference</th>
                        <th>Requester</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastApprovals.map(app => (
                        <tr key={app._id}>
                          <td>{app.requestNumber}</td>
                          <td>{app.type}</td>
                          <td>{app.dealId?.title || app.quotationId?.quoteNumber || app.reference?.title || 'N/A'}</td>
                          <td>{app.requesterId?.name || app.requester?.name}</td>
                          <td>
                            <span className={`badge bg-${app.status === 'Approved' ? 'success' : 'danger'}`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {pastApprovals.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-4 text-muted">No past decisions</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
