'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuotation } from '../../../../services/quotationService';

export default function QuotationPreview() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="container mt-5 text-center">Loading Preview...</div>;
  if (!quote) return <div className="container mt-5 text-center">Quotation not found.</div>;

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{maxWidth: '850px'}}>
        
        <div className="d-flex justify-content-between mb-4 no-print">
          <button className="btn btn-outline-secondary" onClick={() => router.back()}>
            &larr; Back
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <i className="fa fa-print me-2"></i> Print / Save PDF
          </button>
        </div>

        {/* Paper Document Container */}
        <div className="card border-0 shadow-sm p-5 bg-white rounded-0">
          
          {/* Header */}
          <div className="row mb-5 border-bottom pb-4">
            <div className="col-6">
              <h1 className="fw-bold" style={{color: '#D6536D', fontSize: '2rem', margin: 0}}>DealFlow360</h1>
              <p className="text-muted mt-2 mb-0">123 Business Avenue, Tech Park<br/>San Francisco, CA 94107<br/>contact@dealflow360.com</p>
            </div>
            <div className="col-6 text-end">
              <h2 className="text-uppercase text-secondary mb-3">Quotation</h2>
              <table className="table table-sm table-borderless mb-0 float-end w-auto text-start">
                <tbody>
                  <tr><td className="text-muted fw-bold pe-4">Quote No:</td><td>{quote.quoteNumber}</td></tr>
                  <tr><td className="text-muted fw-bold pe-4">Date:</td><td>{new Date(quote.updatedAt).toLocaleDateString()}</td></tr>
                  <tr><td className="text-muted fw-bold pe-4">Valid Until:</td><td>{new Date(new Date(quote.updatedAt).getTime() + 30*24*60*60*1000).toLocaleDateString()}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Info */}
          <div className="row mb-5">
            <div className="col-6">
              <h6 className="text-uppercase text-muted fw-bold mb-2">Quotation For:</h6>
              <div className="fs-5 fw-bold">{quote.customerId?.name}</div>
              <div>Attention: Procurement Department</div>
              <div>Project: {quote.dealId?.title}</div>
            </div>
            <div className="col-6 text-end">
              {quote.formatType === 'Technical + Commercial' && (
                <div className="badge bg-light text-dark border p-2">
                  Technical & Commercial Offer
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <table className="table mb-5 border">
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{width: '5%'}}>#</th>
                <th style={{width: '45%'}}>Description</th>
                <th className="text-center" style={{width: '10%'}}>Qty</th>
                <th className="text-end" style={{width: '20%'}}>Unit Price</th>
                <th className="text-end" style={{width: '20%'}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lines?.map((line, idx) => (
                <tr key={idx}>
                  <td className="text-center">{idx + 1}</td>
                  <td>{line.name}</td>
                  <td className="text-center">{line.quantity}</td>
                  <td className="text-end">₹{line.unitPrice.toLocaleString()}</td>
                  <td className="text-end">₹{line.lineTotal.toLocaleString()}</td>
                </tr>
              ))}
              {(!quote.lines || quote.lines.length === 0) && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No items</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="row mb-5">
            <div className="col-6">
              {/* Optional space for notes */}
            </div>
            <div className="col-6">
              <table className="table table-sm table-borderless text-end mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted w-50">Subtotal:</td>
                    <td className="w-50">₹{quote.totals?.gross.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Discount:</td>
                    <td className="text-danger">-₹{quote.totals?.discount.toLocaleString()}</td>
                  </tr>
                  <tr className="border-top border-dark">
                    <td className="fw-bold pt-2 fs-5">Grand Total:</td>
                    <td className="fw-bold pt-2 fs-5">₹{quote.totals?.net.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical Compliance */}
          {quote.compliance && quote.compliance.length > 0 && (
            <div className="mb-5">
              <h6 className="text-uppercase text-muted fw-bold mb-3">Technical Specifications Summary</h6>
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Requirement</th>
                    <th>Our Specification</th>
                    <th className="text-center">Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.compliance.map((c, i) => (
                    <tr key={i}>
                      <td>{c.requirement}</td>
                      <td>{c.offered}</td>
                      <td className="text-center fw-bold text-success">COMPLIES</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Terms */}
          <div className="mt-auto border-top pt-4">
            <h6 className="text-uppercase text-muted fw-bold mb-2">Terms & Conditions</h6>
            <ul className="small text-muted mb-0 ps-3">
              <li>Prices are exclusive of applicable taxes unless specified otherwise.</li>
              <li>Delivery will be made within 60-90 days of purchase order confirmation.</li>
              <li>Payment terms: 50% advance, 50% on delivery.</li>
              <li>Standard warranty applies to all items as per manufacturer guidelines.</li>
            </ul>
          </div>

        </div>
        
        {/* CSS for printing */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body { background-color: white !important; margin: 0; padding: 0; }
            .no-print, header, nav, footer, .sidebar { display: none !important; }
            main { margin: 0 !important; padding: 0 !important; }
            .card { box-shadow: none !important; padding: 0 !important; }
            .container { max-width: 100% !important; padding: 0 !important; }
            .bg-light.min-vh-100 { background: white !important; padding: 0 !important; }
          }
        `}} />
      </div>
    </div>
  );
}
