import SkeletonLoader from '@/components/SkeletonLoader';

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getQuotation, submitForApproval } from '@/services/quotationService';
import QuotationStatusBadge from '@/components/QuotationStatusBadge';
import { useAuth } from '@/context/AuthContext';
import { Chatbox } from '@talkjs/react-components';

export default function QuotationDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const { user } = useAuth();
  
  const portalUrl = quote?.customerToken ? `${window.location.origin}/customer/quote/${quote.customerToken}` : null;

  useEffect(() => {
    if (params.id) {
      getQuotation(params.id)
        .then(data => {
          setQuote(data);
          setLoading(false);
        })
        .catch(console.error);
    }
  }, [params.id]);

  if (loading) return <SkeletonLoader type='default' />;
  if (!quote) return <div className="container mt-5">Quotation not found.</div>;

  const tabs = ['Overview', 'Products', 'Compliance', 'Pricing', 'Approvals', 'Negotiation', 'Activity'];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const updated = await submitForApproval(quote._id, quote);
      setQuote({...updated});
    } catch (e) {
      console.error(e);
      alert('Failed to submit for approval');
    }
    setSubmitting(false);
  };

  return (
    <div className="container">
      <div className="mb-4">
        <button className="btn btn-link px-0 text-decoration-none" onClick={() => navigate('/quotations')}>
          &larr; Back to Quotations
        </button>
      </div>

      {/* Top Summary Section */}
      <div className="card shadow-sm border-0 mb-4 bg-light">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-5">
              <h3 className="mb-1">{quote.quoteNumber}</h3>
              <p className="mb-1 text-muted">{quote.customerId?.name} | {quote.formatType}</p>
              <div><QuotationStatusBadge status={quote.status} /></div>
              {portalUrl && (
                <div className="mt-3 bg-white border rounded p-2 d-inline-block">
                  <span className="text-muted small d-block mb-1">Customer Portal Link:</span>
                  <div className="input-group input-group-sm">
                    <input type="text" className="form-control" value={portalUrl} readOnly />
                    <button className="btn btn-outline-secondary" type="button" onClick={() => navigator.clipboard.writeText(portalUrl)}>Copy</button>
                  </div>
                </div>
              )}
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-4">
                <div>
                  <div className="text-muted small">Total Value</div>
                  <div className="fs-5 fw-bold">₹{(quote.totalValue || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted small">Margin / Risk</div>
                  <div className="fs-6"><span className="text-success">{quote.marginPct}%</span> / <span className={`text-${quote.riskScore > 60 ? 'danger' : 'success'}`}>{quote.riskScore}</span></div>
                </div>
              </div>
              {quote.approvalState && quote.approvalState !== 'Approved' && (
                <div className="mt-2 text-warning small fw-bold">
                  <i className="fa fa-exclamation-triangle me-1"></i> {quote.approvalState}
                </div>
              )}
            </div>
            <div className="col-md-3 text-end">
              <div className="d-flex flex-column gap-2">
                <button 
                  className="btn btn-primary btn-sm w-100" 
                  onClick={handleSubmit} 
                  disabled={submitting || quote.approvalState?.includes('Pending') || quote.approvalState === 'Approved'}
                >
                  {submitting ? 'Submitting...' : 'Submit for Approval'}
                </button>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary btn-sm w-50" onClick={() => navigate(`/quotations/${quote._id}/edit`)}>Edit</button>
                  <button className="btn btn-outline-secondary btn-sm w-50" onClick={() => navigate(`/quotations/${quote._id}/preview`)}>
                    Preview PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {tabs.map(tab => (
          <li className="nav-item" key={tab}>
            <button 
              className={`nav-link text-dark ${activeTab === tab ? 'active fw-bold' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{ borderBottomColor: activeTab === tab ? '#D6536D' : 'transparent', borderBottomWidth: activeTab === tab ? '3px' : '1px' }}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      <div className="card shadow-sm border-0 mb-5">
        <div className="card-body">
          
          {activeTab === 'Overview' && (
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-3">General Information</h5>
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr><td className="text-muted w-25">Deal:</td><td>{quote.dealId?.title}</td></tr>
                    <tr><td className="text-muted">Customer:</td><td>{quote.customerId?.name}</td></tr>
                    <tr><td className="text-muted">Type:</td><td>{quote.formatType}</td></tr>
                    <tr><td className="text-muted">Last Updated:</td><td>{new Date(quote.updatedAt).toLocaleString()}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Products' && (
            <div>
              <h5 className="mb-3">Quotation Items</h5>
              <table className="table table-hover">
                <thead className="bg-light">
                  <tr>
                    <th>Product/Service</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Discount</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lines?.map((line, i) => (
                    <tr key={i}>
                      <td>{line.name}</td>
                      <td>{line.quantity}</td>
                      <td>₹{line.unitPrice.toLocaleString()}</td>
                      <td>{line.discountPct}%</td>
                      <td>₹{line.lineTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!quote.lines || quote.lines.length === 0) && (
                    <tr><td colSpan="5" className="text-center text-muted py-3">No products added.</td></tr>
                  )}
                </tbody>
              </table>
              <div className="d-flex justify-content-end mt-4">
                <div style={{width: '300px'}}>
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <span>Subtotal:</span>
                    <span>₹{quote.totals?.gross.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <span>Discount:</span>
                    <span className="text-danger">-₹{quote.totals?.discount.toLocaleString()}</span>
                  </div>
                  <hr className="my-2"/>
                  <div className="d-flex justify-content-between fs-5 fw-bold">
                    <span>Grand Total:</span>
                    <span>₹{quote.totals?.net.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Compliance' && (
            <div>
              <h5 className="mb-3">Technical Requirements Compliance</h5>
              {quote.compliance && quote.compliance.length > 0 ? (
                <table className="table table-hover">
                  <thead className="bg-light">
                    <tr>
                      <th>Requirement</th>
                      <th>Required</th>
                      <th>Offered</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.compliance.map((c, i) => (
                      <tr key={i}>
                        <td>{c.requirement}</td>
                        <td>{c.required}</td>
                        <td>{c.offered}</td>
                        <td>
                          <span className={`badge bg-${c.status === 'PASS' ? 'success' : 'danger'}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">No technical compliance data for this quotation.</p>
              )}
            </div>
          )}

          {activeTab === 'Pricing' && (
            <div>
              <h5 className="mb-3">Margin & Discount Governance</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="card border-0 bg-light mb-3">
                    <div className="card-body">
                      <h6>Discount Policy</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Requested Discount:</span>
                        <strong className={quote.discountPct > quote.allowedDiscount ? 'text-danger' : 'text-success'}>
                          {quote.discountPct}%
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between text-muted">
                        <span>Allowed Discount:</span>
                        <span>{quote.allowedDiscount}%</span>
                      </div>
                      {quote.discountPct > quote.allowedDiscount && (
                        <div className="alert alert-danger py-2 mt-3 mb-0 small">
                          <i className="fa fa-exclamation-triangle"></i> Discount policy exceeded. {quote.riskImpact} risk impact.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-0 bg-light mb-3">
                    <div className="card-body">
                      <h6>Margin Analysis (Internal)</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Net Revenue:</span>
                        <span>₹{quote.totals?.net.toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Gross Margin:</span>
                        <span className="text-success">₹{quote.totals?.margin.toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Margin %:</span>
                        <span className="text-success">{quote.marginPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Approvals' && (
            <div>
              <h5 className="mb-3">Approval Chain</h5>
              <div className="d-flex align-items-center mb-4">
                <div className="fs-5 me-3">
                  <span className={`badge bg-${quote.approvalState === 'Approved' ? 'success' : 'warning'}`}>
                    {quote.approvalState || 'No Approval Required'}
                  </span>
                </div>
                {quote.approvalState?.includes('Pending') && (
                  <span className="text-muted">Waiting on action from management.</span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Negotiation' && (
            <div>
              <h5 className="mb-3">Live Customer Negotiation</h5>
              <p className="text-muted mb-4">Chat directly with the customer regarding this quotation. Messages will appear in real-time on their portal.</p>
              <div className="border rounded bg-light d-flex justify-content-center overflow-hidden shadow-sm" style={{ height: '500px' }}>
                <Chatbox
                  appId="tSQSAHl9"
                  userId={`user_${user._id}`}
                  conversationId={`quote_${quote._id}`}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'Activity' && (
            <div>
              <h5 className="mb-3">Timeline Activity</h5>
              <div className="timeline">
                {quote.events && quote.events.length > 0 ? (
                  quote.events.map((e) => (
                    <div className="d-flex mb-3" key={e.id}>
                      <div className="me-3 text-muted small" style={{minWidth: '150px'}}>
                        {new Date(e.date).toLocaleString()}
                      </div>
                      <div className="position-relative ps-3" style={{borderLeft: '2px solid #e9ecef'}}>
                        <div className="position-absolute bg-primary rounded-circle" style={{width: '10px', height: '10px', left: '-6px', top: '5px'}}></div>
                        {e.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No activity recorded.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
