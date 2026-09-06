
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LiveChatWindow from '@/components/LiveChatWindow';

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
    <div className="container-fluid px-4 mt-4">
      <div className="row">
        {/* Left Column: Quotation Details */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-lg border-0 rounded-4 h-100">
            <div className="card-header bg-dark text-white p-4" style={{borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem'}}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">Quotation {quote.quoteNumber}</h2>
              <span className="text-light opacity-75">Prepared for: {deal?.customerId?.name || quote?.customerId?.name || 'Valued Customer'}</span>
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
        
        <div className="card-body p-4 bg-white">
          {((quote.compliance && quote.compliance.length > 0) || (requirements && requirements.length > 0)) && (
            <div className="row mb-4">
              <div className="col-12">
                <h5 className="text-uppercase text-muted mb-3" style={{letterSpacing: '1px'}}>Technical Compliance Summary</h5>
                <p className="lead fs-6">Your specified requirements have been reviewed and matched with our proposed solution.</p>
                <div className="d-flex flex-wrap gap-3 mt-3">
                  {(quote.compliance || requirements || []).map((req, idx) => (
                    <div key={req._id || idx} className="border p-3 rounded bg-light" style={{minWidth: '180px'}}>
                      <h6 className="mb-1">{req.requirement || req.label}</h6>
                      <div className="text-success fw-bold"><i className="fa fa-check-circle me-1"></i> {req.offered || req.offeredValue}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <h5 className="text-uppercase text-muted mb-3" style={{letterSpacing: '1px'}}>Commercial Offer</h5>
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
              {quote.lines?.map((l, i) => (
                <tr key={i}>
                  <td>{l.name || (l.productId ? `Product ${l.productId.slice(-6)}` : 'Item')}</td>
                  <td className="text-center">{l.quantity}</td>
                  <td className="text-end">₹{(l.unitPrice || 0).toLocaleString()}</td>
                  <td className="text-end fw-bold">₹{(l.lineTotal || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="row">
            <div className="col-md-6 offset-md-6">
              <div className="p-3 bg-light rounded">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{(quote.totals?.gross || 0).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Discount</span>
                  <span className="text-danger">-₹{(quote.totals?.discount || 0).toLocaleString()}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="fs-5 fw-bold">Total (Net)</span>
                  <span className="fs-5 fw-bold" style={{color: '#D6536D'}}>₹{(quote.totals?.net || 0).toLocaleString()}</span>
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
          <LiveChatWindow 
            conversationId={`quote_${quote._id}`}
            recipientName="Sales Representative"
            senderName={deal?.customerId?.name || quote?.customerId?.name || 'Customer'}
            senderRole="customer"
            accentColor="#D6536D"
          />
        </div>
      </div>
    </div>
  );
}
