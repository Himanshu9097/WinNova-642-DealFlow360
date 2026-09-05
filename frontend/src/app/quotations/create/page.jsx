'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QuotationIntelligencePanel from '../../../components/QuotationIntelligencePanel';
import { createQuotation } from '../../../services/quotationService';
import { getDeal } from '../../../services/dealService';
import { getCompanySettings } from '../../../services/companyService';

function CreateQuotationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dealId = searchParams.get('dealId');
  const [deal, setDeal] = useState(null);
  const [maxAllowedDiscount, setMaxAllowedDiscount] = useState(8);
  
  const [formatType, setFormatType] = useState('Commercial');
  const [discountPct, setDiscountPct] = useState(0);
  const [lines, setLines] = useState([
    { productId: 'prod-1', name: 'Outdoor Camera IP68 8MP', quantity: 100, unitPrice: 13000 }
  ]);

  useEffect(() => {
    if (dealId) {
      getDeal(dealId).then(data => setDeal(data.deal)).catch(console.error);
    }
    getCompanySettings()
      .then(data => setMaxAllowedDiscount(data.maxAllowedDiscount || 8))
      .catch(console.error);
  }, [dealId]);

  const [compliance, setCompliance] = useState([
    { requirement: 'Ingress Protection', required: 'IP68', offered: 'IP68', status: 'PASS' },
    { requirement: 'Resolution', required: '8MP', offered: '8MP', status: 'PASS' },
    { requirement: 'Power', required: 'PoE+', offered: 'PoE+', status: 'PASS' },
    { requirement: 'Warranty', required: '2 Years', offered: '2 Years', status: 'PASS' }
  ]);

  const addLine = () => {
    setLines([...lines, { productId: `prod-${Math.floor(Math.random()*100)}`, name: 'New Item', quantity: 1, unitPrice: 0 }]);
  };

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const removeLine = (index) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const totals = useMemo(() => {
    let gross = 0;
    lines.forEach(l => {
      gross += (l.quantity * l.unitPrice);
    });
    const discount = (gross * discountPct) / 100;
    const net = gross - discount;
    const margin = net * 0.15; // Mock margin calculation
    return { gross, discount, net, margin };
  }, [lines, discountPct]);

  // Derived mock intelligence data
  const intelligenceData = {
    totalValue: totals.net,
    discountPct: discountPct,
    allowedDiscount: maxAllowedDiscount,
    marginPct: 15,
    riskScore: discountPct > maxAllowedDiscount ? 75 : 20,
    compliance: formatType === 'Technical + Commercial' ? compliance : null,
    formatType: formatType,
    approvalState: discountPct > maxAllowedDiscount ? 'Approval Required' : 'No Approval Required'
  };

  const handleSave = async () => {
    try {
      const newQ = await createQuotation({
        dealId,
        formatType,
        totalValue: totals.net,
        discountPct,
        marginPct: 15,
        riskScore: intelligenceData.riskScore,
        lines: lines.map(l => ({...l, lineTotal: l.quantity * l.unitPrice})),
        totals,
        compliance: formatType === 'Technical + Commercial' ? compliance : []
      });
      if (dealId) {
        router.push(`/deals/${dealId}`);
      } else {
        router.push(`/quotations/${newQ._id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating quotation');
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{color: '#D6536D'}}>New Quotation Builder</h2>
          <span className="text-muted">Construct and evaluate your commercial offer.</span>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => router.back()}>Cancel</button>
          <button className="btn btn-primary px-4" style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}} onClick={handleSave}>
            Save Quotation
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          {/* Section 1: Setup */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white" style={{ borderBottom: '2px solid #f8f9fa' }}>
              <h5 className="mb-0">1. Quotation Setup</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label text-muted small fw-bold">Deal Reference</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={deal ? `${deal.dealNumber} - ${deal.title}` : 'No deal linked'}
                    disabled
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label text-muted small fw-bold">Quotation Type</label>
                  <div className="d-flex gap-3">
                    {['Commercial', 'Technical + Commercial', 'Bid / Tender'].map(type => (
                      <div className="form-check" key={type}>
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="formatType" 
                          id={`type-${type}`}
                          checked={formatType === type}
                          onChange={() => setFormatType(type)}
                        />
                        <label className="form-check-label" htmlFor={`type-${type}`}>
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Compliance (Conditional) */}
          {formatType === 'Technical + Commercial' && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white" style={{ borderBottom: '2px solid #f8f9fa' }}>
                <h5 className="mb-0">2. Technical Compliance Check</h5>
              </div>
              <div className="card-body p-0">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Requirement</th>
                      <th>Required</th>
                      <th>Offered</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compliance.map((c, i) => (
                      <tr key={i}>
                        <td>{c.requirement}</td>
                        <td>{c.required}</td>
                        <td>
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            value={c.offered} 
                            onChange={(e) => {
                              const newC = [...compliance];
                              newC[i].offered = e.target.value;
                              newC[i].status = e.target.value === c.required ? 'PASS' : 'FAIL';
                              setCompliance(newC);
                            }}
                          />
                        </td>
                        <td>
                          <span className={`badge bg-${c.status === 'PASS' ? 'success' : 'danger'}`}>{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Products & Pricing */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center" style={{ borderBottom: '2px solid #f8f9fa' }}>
              <h5 className="mb-0">{formatType === 'Technical + Commercial' ? '3' : '2'}. Products & Pricing</h5>
              <button className="btn btn-sm btn-outline-primary" onClick={addLine}>+ Add Item</button>
            </div>
            <div className="card-body p-0">
              <table className="table mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Product/Service</th>
                    <th style={{width: '100px'}}>Qty</th>
                    <th style={{width: '150px'}}>Unit Price</th>
                    <th style={{width: '150px'}}>Line Total</th>
                    <th style={{width: '50px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td>
                        <input type="text" className="form-control form-control-sm" value={line.name} onChange={e => updateLine(index, 'name', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="form-control form-control-sm" value={line.quantity} onChange={e => updateLine(index, 'quantity', Number(e.target.value))} />
                      </td>
                      <td>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input type="number" className="form-control" value={line.unitPrice} onChange={e => updateLine(index, 'unitPrice', Number(e.target.value))} />
                        </div>
                      </td>
                      <td>₹{(line.quantity * line.unitPrice).toLocaleString()}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeLine(index)}><i className="fa fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-light border-top d-flex justify-content-end">
                <div style={{width: '300px'}}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal:</span>
                    <span>₹{totals.gross.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                    <span className="text-muted">Discount %:</span>
                    <input type="number" className="form-control form-control-sm w-25 text-end" value={discountPct} onChange={e => setDiscountPct(Number(e.target.value))} />
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Discount Value:</span>
                    <span className="text-danger">-₹{totals.discount.toLocaleString()}</span>
                  </div>
                  <hr/>
                  <div className="d-flex justify-content-between">
                    <strong className="fs-5">Grand Total:</strong>
                    <strong className="fs-5">₹{totals.net.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Intelligence Panel */}
        <div className="col-md-4">
          <QuotationIntelligencePanel data={intelligenceData} />
        </div>
      </div>
    </div>
  );
}

export default function CreateQuotation() {
  return (
    <Suspense fallback={<div className="container mt-5">Loading...</div>}>
      <CreateQuotationInner />
    </Suspense>
  );
}
