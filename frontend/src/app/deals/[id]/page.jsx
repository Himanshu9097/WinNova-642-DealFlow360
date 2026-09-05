'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function DealDetail() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quote Builder State
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetch(`http://localhost:5006/api/deals/${params.id}`)
        .then(res => res.json())
        .then(json => {
          setData(json);
          setLoading(false);
        })
        .catch(console.error);
    }
  }, [params.id]);

  if (loading || !data) return <div className="container mt-5">Loading...</div>;

  const { deal, requirements, quotations } = data;
  const quote = quotations[0] || null;

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{color: '#D6536D'}}>{deal.title}</h2>
          <span className="text-muted">Deal ID: {deal.dealNumber} | Customer: {deal.customerId?.name}</span>
        </div>
        <div>
          <span className={`badge bg-${deal.stage === 'Closed Won' ? 'success' : 'secondary'} me-2`}>{deal.stage}</span>
          <span className={`badge bg-${deal.riskLevel === 'Critical' ? 'danger' : deal.riskLevel === 'High' ? 'warning' : 'success'}`}>{deal.riskLevel} Risk</span>
        </div>
      </div>

      <div className="row">
        {/* Left Column: Requirements & Products */}
        <div className="col-md-7">
          
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white" style={{ borderBottom: '2px solid #f8f9fa' }}>
              <h5 className="mb-0">Technical Requirements</h5>
            </div>
            <div className="card-body p-0">
              <table className="table mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Specification</th>
                    <th>Required</th>
                    <th>Offered</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((req) => (
                    <tr key={req._id}>
                      <td>{req.label} {req.mandatory && <span className="text-danger">*</span>}</td>
                      <td>{req.requiredValue}</td>
                      <td>{req.offeredValue}</td>
                      <td>
                        <span className={`badge bg-${req.status === 'PASS' ? 'success' : 'danger'}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {requirements.length === 0 && (
                    <tr><td colSpan={4} className="text-muted text-center py-3">No technical requirements listed.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white" style={{ borderBottom: '2px solid #f8f9fa' }}>
              <h5 className="mb-0">Smart Quotation Builder</h5>
            </div>
            <div className="card-body">
              {quote ? (
                <div>
                  <p>Existing Quote: <strong>{quote.quoteNumber}</strong></p>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.lines.map((l, i) => (
                        <tr key={i}>
                          <td>Product {l.productId}</td>
                          <td>{l.quantity}</td>
                          <td>₹{l.unitPrice}</td>
                          <td>{l.discountPct}%</td>
                          <td>₹{l.lineTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <h5>Gross: ₹{quote.totals?.gross}</h5>
                    <h5>Discount: ₹{quote.totals?.discount}</h5>
                    <h5 className="text-success">Net: ₹{quote.totals?.net}</h5>
                  </div>
                </div>
              ) : (
                <div className="alert alert-info">
                  No quotation has been built yet.
                  <br /><br />
                  <button className="btn btn-primary btn-sm">Build Commercial Quote</button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Engine Intelligence & Approvals */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 mb-4" style={{borderTop: '4px solid #17a2b8'}}>
            <div className="card-body">
              <h5 className="card-title text-info"><i className="fa fa-robot me-2"></i> Deal Intelligence Engine</h5>
              <hr />
              <div className="mb-3">
                <label className="text-muted small text-uppercase">Technical Compliance</label>
                <div className="fs-5 text-success"><i className="fa fa-check-circle me-1"></i> All Mandatory Requirements Met</div>
              </div>
              <div className="mb-3">
                <label className="text-muted small text-uppercase">Margin Analysis</label>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-5">Est. Margin</span>
                  <span className="fs-5 fw-bold text-success">₹{deal.estimatedMargin.toLocaleString()}</span>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-muted small text-uppercase">Discount Governance</label>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Requested vs Allowed</span>
                  <span><strong>{discount}%</strong> / 10%</span>
                </div>
                {discount > 10 && (
                  <div className="alert alert-danger mt-2 mb-0 py-2 small">
                    <i className="fa fa-exclamation-triangle me-1"></i> Approval Required (Exceeds Tier)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Approval Status</h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <div className={`spinner-grow spinner-grow-sm text-${deal.approvalStatus === 'Pending' ? 'warning' : 'success'} me-2`}></div>
                <strong>{deal.approvalStatus}</strong>
              </div>
              {deal.approvalStatus === 'Pending' && (
                <div className="mt-3">
                  <button className="btn btn-success w-100 mb-2">Approve Deal</button>
                  <button className="btn btn-outline-danger w-100">Reject / Request Change</button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
