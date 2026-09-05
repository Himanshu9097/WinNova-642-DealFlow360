
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Chatbox } from '@talkjs/react-components';

export default function CustomerPortal() {
  const params = useParams();
  // We mock fetching quote by token. For now, fetch the first deal's quote.
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counterDiscount, setCounterDiscount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:5006/api/quotations/portal/${params.token}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          setData({ error: json.error });
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setData({ error: 'Failed to load portal.' });
        setLoading(false);
      });
  }, [params.token]);

  if (loading || !data) return <div className="container mt-5 text-center">Loading Secure Portal...</div>;

  if (data.error) return <div className="container mt-5 text-center text-danger"><h3>{data.error}</h3></div>;

  const { deal, requirements, quote } = data;

  const handleCounter = async () => {
    if (!counterDiscount) return;
    try {
      const res = await fetch(`http://127.0.0.1:5006/api/quotations/portal/${params.token}/counter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposedDiscount: Number(counterDiscount) })
      });
      if (res.ok) {
        setSubmitted(true);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5006/api/quotations/portal/${params.token}/accept`, { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-fluid px-4 mt-5">
      <div className="row">
        {/* Left Column: Quotation Details */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-lg border-0 rounded-4 h-100">
            <div className="card-header bg-dark text-white p-4" style={{borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem'}}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">Quotation {quote.quoteNumber}</h2>
              <span className="text-light opacity-75">Prepared for: {deal.customerId?.name || 'Customer'}</span>
            </div>
            <div>
              {quote.status === 'Accepted' && <span className="badge bg-success fs-5 px-3 py-2">Accepted</span>}
              {quote.status === 'Negotiating' && <span className="badge bg-warning text-dark fs-5 px-3 py-2">Awaiting Seller Review</span>}
              {quote.status === 'Rejected by Seller' && <span className="badge bg-danger fs-5 px-3 py-2">Offer Rejected</span>}
              {!['Accepted', 'Negotiating', 'Rejected by Seller'].includes(quote.status) && (
                <span className="badge bg-primary fs-5 px-3 py-2">Valid for 30 Days</span>
              )}
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
          {quote.status === 'Accepted' ? (
            <div className="alert alert-success fs-5 mb-0 text-center py-4 border-0">
              <i className="fa fa-check-circle me-2"></i> This quotation has been accepted and your order is being processed!
            </div>
          ) : quote.status === 'Negotiating' ? (
            <div className="alert alert-warning fs-5 mb-0 text-center py-4 border-0 text-dark">
              <i className="fa fa-clock-o me-2"></i> Your counter-offer is currently being reviewed by the seller.
            </div>
          ) : quote.status === 'Rejected by Seller' ? (
            <div className="alert alert-danger fs-5 mb-0 text-center py-4 border-0">
              <i className="fa fa-times-circle me-2"></i> Your counter-offer was rejected. Please contact your sales representative.
            </div>
          ) : (
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
                <button className="btn btn-success btn-lg px-5" onClick={handleAccept}>Accept & Sign Order</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

        {/* Right Column: Live Chat */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-lg border-0 rounded-4 h-100">
            <div className="card-header bg-white border-0 p-4">
              <h4 className="mb-0 text-dark"><i className="fa fa-comments me-2" style={{color: '#D6536D'}}></i> Live Chat with Sales</h4>
              <p className="text-muted small mb-0 mt-1">Have questions or want to negotiate? Send us a message!</p>
            </div>
            <div className="card-body p-0" style={{ minHeight: '600px' }}>
              <Chatbox
                appId="tSQSAHl9"
                userId={`cust_${deal.customerId._id}`}
                conversationId={`quote_${quote._id}`}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
