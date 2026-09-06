import SkeletonLoader from '@/components/SkeletonLoader';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getApprovals, processApproval } from '@/services/approvalService';
import { Link, useNavigate } from 'react-router-dom';

export default function ApprovalsWorkspace() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [expandedAppId, setExpandedAppId] = useState(null);

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
                pendingApprovals.map(app => {
                  const quote = typeof app.quotationId === 'object' ? app.quotationId : null;
                  const isExpanded = expandedAppId === app._id;

                  return (
                    <div key={app._id} className="card shadow-sm border-0 mb-3" style={{ borderLeft: '5px solid #ffc107' }}>
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-7">
                            <div className="d-flex align-items-center mb-2">
                              <span className="badge bg-light text-dark border me-2">{app.requestNumber}</span>
                              <span className="fw-bold text-dark">{app.type}</span>
                            </div>
                            <p className="mb-1">{app.details}</p>
                            <div className="small text-muted d-flex align-items-center gap-2 flex-wrap mt-2">
                              <strong>Reference:</strong> 
                              {quote ? (
                                <Link to={`/quotations/${quote._id}`} className="fw-bold text-decoration-none" style={{ color: '#D6536D' }}>
                                  {quote.quoteNumber} <i className="fa fa-external-link me-2" style={{ fontSize: '0.8rem' }}></i>
                                </Link>
                              ) : (
                                <span>{app.dealId?.title || 'N/A'}</span>
                              )}
                              &bull; 
                              <strong>Requested By:</strong> {app.requesterId?.name || app.requester?.name || 'System'}
                            </div>
                          </div>
                          <div className="col-md-2 text-end border-end pe-4">
                            <div className="text-muted small">Value at Risk</div>
                            <div className="fs-5 fw-bold">₹{app.amountAtRisk?.toLocaleString() || app.amount?.toLocaleString() || 0}</div>
                          </div>
                          <div className="col-md-3 text-end">
                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex justify-content-end gap-2">
                                <button 
                                  className="btn btn-outline-danger btn-sm" 
                                  disabled={processing === app._id}
                                  onClick={() => handleAction(app._id, 'REJECT')}
                                >
                                  Reject
                                </button>
                                <button 
                                  className="btn btn-success btn-sm" 
                                  disabled={processing === app._id}
                                  onClick={() => handleAction(app._id, 'APPROVE')}
                                >
                                  {processing === app._id ? 'Processing...' : 'Approve'}
                                </button>
                              </div>
                              {quote && (
                                <button 
                                  className="btn btn-sm btn-outline-secondary w-100 mt-1"
                                  onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
                                >
                                  <i className={`fa ${isExpanded ? 'fa-chevron-up' : 'fa-list'} me-1`}></i> 
                                  {isExpanded ? 'Hide Product Details' : 'Inspect Quotation Products'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Inline Quotation Breakdown for Finance */}
                        {isExpanded && quote && (
                          <div className="mt-3 pt-3 border-top bg-light p-3 rounded">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="mb-0 fw-bold text-dark">
                                <i className="fa fa-box-open me-2 text-primary"></i> 
                                Products & Financial Breakdown ({quote.quoteNumber})
                              </h6>
                              <Link to={`/quotations/${quote._id}`} className="btn btn-sm btn-outline-primary fw-bold">
                                Open Full Quotation Page &rarr;
                              </Link>
                            </div>

                            <table className="table table-sm table-bordered bg-white mb-3 align-middle">
                              <thead className="table-light">
                                <tr>
                                  <th>Product / Item</th>
                                  <th className="text-center">Qty</th>
                                  <th className="text-end">Base Price</th>
                                  <th className="text-center">Discount %</th>
                                  <th className="text-end">Line Net Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {quote.lines?.map((l, i) => (
                                  <tr key={i}>
                                    <td className="fw-semibold">{l.name || (l.productId ? `Product ${l.productId.slice(-6)}` : 'Custom Item')}</td>
                                    <td className="text-center">{l.quantity}</td>
                                    <td className="text-end">₹{(l.unitPrice || 0).toLocaleString()}</td>
                                    <td className="text-center">{l.discountPct || 0}%</td>
                                    <td className="text-end fw-bold">₹{(l.lineTotal || 0).toLocaleString()}</td>
                                  </tr>
                                ))}
                                {(!quote.lines || quote.lines.length === 0) && (
                                  <tr><td colSpan="5" className="text-center text-muted">No items recorded.</td></tr>
                                )}
                              </tbody>
                            </table>

                            <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded border">
                              <div className="small">
                                <span className="text-muted me-3">Customer: <strong>{quote.customerId?.name || 'N/A'}</strong></span>
                                <span className="text-muted me-3">Discount: <strong className="text-danger">{quote.discountPct || 0}%</strong></span>
                                {quote.proposedDiscountPct && (
                                  <span className="text-warning fw-bold">Proposed Counter: {quote.proposedDiscountPct}%</span>
                                )}
                              </div>
                              <div className="fw-bold fs-6">
                                Grand Total: <span style={{ color: '#D6536D' }}>₹{(quote.totals?.net || quote.totalValue || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })
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
                      {pastApprovals.map(app => {
                        const quote = typeof app.quotationId === 'object' ? app.quotationId : null;
                        return (
                          <tr key={app._id}>
                            <td>{app.requestNumber}</td>
                            <td>{app.type}</td>
                            <td>
                              {quote ? (
                                <Link to={`/quotations/${quote._id}`} className="fw-bold text-decoration-none" style={{ color: '#D6536D' }}>
                                  {quote.quoteNumber}
                                </Link>
                              ) : (
                                app.dealId?.title || app.reference?.title || 'N/A'
                              )}
                            </td>
                            <td>{app.requesterId?.name || app.requester?.name || 'System'}</td>
                            <td>
                              <span className={`badge bg-${app.status === 'Approved' ? 'success' : 'danger'}`}>
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
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
