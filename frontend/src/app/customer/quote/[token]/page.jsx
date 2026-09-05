'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function CustomerPortal() {
  const params = useParams();
  // We mock fetching quote by token. For now, fetch the first deal's quote.
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counterDiscount, setCounterDiscount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Mock token resolution by simply fetching all deals and grabbing the seeded one.
    fetch(`http://127.0.0.1:5006/api/deals`)
      .then(res => res.json())
      .then(json => {
        const deal = json[0];
        fetch(`http://127.0.0.1:5006/api/deals/${deal._id}`)
          .then(res => res.json())
          .then(dealData => {
            setData(dealData);
            setLoading(false);
          });
      })
      .catch(console.error);
  }, [params.token]);

  if (loading || !data) return <div className="container mt-5 text-center">Loading Secure Portal...</div>;

  const { deal, requirements, quotations } = data;
  
  // Use a mocked quote if none exists to demonstrate the UI
  const mockQuote = {
    quoteNumber: 'QT-2026-001',
    lines: [
      { productId: 'CAM-IP68-8M', quantity: 100, unitPrice: 250, discountPct: 12, lineTotal: 22000 },
      { productId: 'SUB-MON-01', quantity: 12, unitPrice: 50, discountPct: 0, lineTotal: 600 }
    ],
    totals: { gross: 25600, discount: 3000, net: 22600 }
  };
  const quote = quotations[0] || mockQuote;

  const handleCounter = () => {
    setSubmitted(true);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0 mb-5 rounded-4">
        <div className="card-header bg-dark text-white p-4" style={{borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem'}}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">Quotation {quote.quoteNumber}</h2>
              <span className="text-light opacity-75">Prepared for: {deal.customerId?.name || 'Customer'}</span>
            </div>
            <div>
              <span className="badge bg-primary fs-5 px-3 py-2">Valid for 30 Days</span>
            </div>
          </div>
        </div>
        
        <div className="card-body p-5 bg-white">
          <div className="row mb-5">
            <div className="col-12">
              <h4 className="text-uppercase text-muted mb-3" style={{letterSpacing: '1px'}}>Technical Compliance Summary</h4>
              <p className="lead">Your specified requirements have been reviewed and matched with our proposed solution.</p>
              <div className="d-flex gap-3 mt-3">
                {requirements.map((req) => (
                  <div key={req._id} className="border p-3 rounded bg-light" style={{minWidth: '200px'}}>
                    <h6 className="mb-1">{req.label}</h6>
                    <div className="text-success fw-bold"><i className="fa fa-check-circle me-1"></i> {req.offeredValue}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h4 className="text-uppercase text-muted mb-3" style={{letterSpacing: '1px'}}>Commercial Offer</h4>
          <table className="table table-bordered mb-4">
            <thead className="table-light">
              <tr>
                <th>Description</th>
                <th className="text-center">Quantity</th>
                <th className="text-end">Unit Price</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lines.map((l, i) => (
                <tr key={i}>
                  <td>{l.productId}</td>
                  <td className="text-center">{l.quantity}</td>
                  <td className="text-end">₹{l.unitPrice}</td>
                  <td className="text-end fw-bold">₹{l.lineTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="row">
            <div className="col-md-6 offset-md-6">
              <div className="p-4 bg-light rounded">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{quote.totals?.gross}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Discount</span>
                  <span className="text-danger">-₹{quote.totals?.discount}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="fs-4 fw-bold">Total (Net)</span>
                  <span className="fs-4 fw-bold" style={{color: '#D6536D'}}>₹{quote.totals?.net}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-footer bg-light p-4" style={{borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem'}}>
          {!submitted ? (
            <div className="row align-items-center">
              <div className="col-md-6">
                <h5 className="mb-3">Negotiation / Comments</h5>
                <div className="input-group">
                  <input type="number" className="form-control form-control-lg" placeholder="Propose new discount %" value={counterDiscount} onChange={(e) => setCounterDiscount(e.target.value)} />
                  <button className="btn btn-outline-secondary btn-lg" type="button" onClick={handleCounter}>Submit Counter-Offer</button>
                </div>
                <small className="text-muted mt-2 d-block">Submitting a counter-offer will pause the current validity and request a new review cycle from your seller.</small>
              </div>
              <div className="col-md-6 text-end">
                <button className="btn btn-success btn-lg px-5">Accept & Sign Order</button>
              </div>
            </div>
          ) : (
            <div className="alert alert-success fs-5 mb-0 text-center py-4">
              <i className="fa fa-check-circle me-2"></i> Your counter-offer has been submitted securely to your seller. You will be notified once the new terms are reviewed!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
