import SkeletonLoader from '@/components/SkeletonLoader';

import React, { useEffect, useState } from 'react';
import { getQuotations, deleteQuotation } from '@/services/quotationService';
import QuotationStatusBadge from '@/components/QuotationStatusBadge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ConfirmModal';

export default function QuotationsList() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuotations = () => {
    getQuotations()
      .then(data => {
        setQuotations(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteQuotation(deleteTarget.id);
      toast.success('Quotation deleted successfully!');
      setQuotations(quotations.filter(q => q._id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete quotation');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <SkeletonLoader type='table' />;

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="row mb-4 align-items-center">
          <div className="col-md-8">
            <h1 className="display-5" style={{color: '#D6536D'}}>Quotations</h1>
            <p className="lead text-muted mb-0">Create, review and manage commercial, technical and tender quotations.</p>
          </div>
          <div className="col-md-4 text-end">
            <Link to="/quotations/create" className="btn btn-primary fw-bold px-4 py-2" style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}}>
              + Create Quotation
            </Link>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center" style={{ borderBottom: '2px solid #f8f9fa' }}>
            <div className="d-flex gap-3">
              <input type="text" className="form-control form-control-sm" placeholder="Search..." style={{width: '200px'}} />
              <select className="form-select form-select-sm" style={{width: '150px'}}>
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Approval Required">Approval Required</option>
                <option value="Approved">Approved</option>
              </select>
              <select className="form-select form-select-sm" style={{width: '150px'}}>
                <option value="">All Types</option>
                <option value="Commercial">Commercial</option>
                <option value="Technical + Commercial">Technical + Commercial</option>
                <option value="Bid / Tender">Bid / Tender</option>
              </select>
            </div>
          </div>
          
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Quotation Number</th>
                    <th>Customer</th>
                    <th>Deal</th>
                    <th>Type</th>
                    <th>Total Value</th>
                    <th>Discount</th>
                    <th>Margin %</th>
                    <th>Risk Score</th>
                    <th>Approval Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-5 text-muted">
                        No quotations found. Click &quot;Create Quotation&quot; to start.
                      </td>
                    </tr>
                  ) : (
                    quotations.map(quote => (
                      <tr key={quote._id}>
                        <td><strong>{quote.quoteNumber}</strong></td>
                        <td>{quote.customerId?.name}</td>
                        <td>{quote.dealId?.title}</td>
                        <td><span className="badge bg-light text-dark border">{quote.formatType}</span></td>
                        <td>₹{(quote.totalValue || 0).toLocaleString()}</td>
                        <td>{quote.discountPct}%</td>
                        <td><span className="text-success">{quote.marginPct}%</span></td>
                        <td>
                          <span className={`badge bg-${quote.riskScore > 60 ? 'danger' : quote.riskScore > 30 ? 'warning' : 'success'}`}>
                            {quote.riskScore}
                          </span>
                        </td>
                        <td><QuotationStatusBadge status={quote.status} /></td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link to={`/quotations/${quote._id}`} className="btn btn-sm btn-outline-primary">
                              View
                            </Link>
                            <button 
                              className="btn btn-sm btn-outline-danger" 
                              title="Delete Quotation"
                              onClick={() => setDeleteTarget({ id: quote._id, quoteNumber: quote.quoteNumber })}
                            >
                              <i className="fa fa-trash me-1"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <ConfirmModal 
          isOpen={Boolean(deleteTarget)}
          title={`Delete Quotation ${deleteTarget?.quoteNumber || ''}?`}
          message="Are you sure you want to delete this quotation permanently? This action cannot be undone."
          confirmText="Delete Permanently"
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      </div>
    </ProtectedRoute>
  );
}
