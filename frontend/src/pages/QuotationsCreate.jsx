import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import QuotationIntelligencePanel from '@/components/QuotationIntelligencePanel';
import { createQuotation } from '@/services/quotationService';
import { getDeal } from '@/services/dealService';
import { getCompanySettings } from '@/services/companyService';

function CreateQuotationInner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dealId = searchParams.get('dealId');
  const [deal, setDeal] = useState(null);
  const [maxAllowedDiscount, setMaxAllowedDiscount] = useState(8);
  const [companyProducts, setCompanyProducts] = useState([]);
  const [companyInventory, setCompanyInventory] = useState([]);
  
  const [formatType, setFormatType] = useState('Commercial');
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (dealId) {
      getDeal(dealId).then(data => setDeal(data.deal)).catch(console.error);
    }
    getCompanySettings()
      .then(data => setMaxAllowedDiscount(data.maxAllowedDiscount || 8))
      .catch(console.error);
      
    const token = localStorage.getItem('token');
    // Fetch products
    fetch('http://127.0.0.1:5006/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setCompanyProducts(data))
    .catch(console.error);
    
    // Fetch inventory
    fetch('http://127.0.0.1:5006/api/inventory/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setCompanyInventory(data))
  }, [dealId]);

  // Pre-fill lines if the deal has products and companyProducts are loaded
  useEffect(() => {
    if (deal && deal.products && deal.products.length > 0 && companyProducts.length > 0 && lines.length === 0) {
      const initialLines = deal.products.map(p => {
        const prodId = typeof p.productId === 'object' ? p.productId?._id : p.productId;
        const prod = companyProducts.find(cp => cp._id === prodId);
        if (!prod) return null;
        return {
          productId: prod._id,
          name: prod.name,
          quantity: p.quantity,
          unitPrice: prod.basePrice || 0,
          cost: prod.cost || 0,
          maxDiscount: prod.maxDiscount !== undefined ? prod.maxDiscount : maxAllowedDiscount,
          discountPct: 0
        };
      }).filter(Boolean);
      
      if (initialLines.length > 0) {
        setLines(initialLines);
      }
    }
  }, [deal, companyProducts, lines.length, maxAllowedDiscount]);

  const [compliance, setCompliance] = useState([
    { requirement: 'Ingress Protection', required: 'IP68', offered: 'IP68', status: 'PASS' },
    { requirement: 'Resolution', required: '8MP', offered: '8MP', status: 'PASS' },
    { requirement: 'Power', required: 'PoE+', offered: 'PoE+', status: 'PASS' },
    { requirement: 'Warranty', required: '2 Years', offered: '2 Years', status: 'PASS' }
  ]);

  const addLine = () => {
    setLines([...lines, { productId: '', name: '', quantity: 1, unitPrice: 0, maxDiscount: 100 }]);
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
    let discount = 0;
    let totalCost = 0;
    lines.forEach(l => {
      const lineTotal = l.quantity * l.unitPrice;
      gross += lineTotal;
      totalCost += l.quantity * (l.cost || 0);
      if (l.discountPct) {
        discount += lineTotal * (l.discountPct / 100);
      }
    });
    const net = gross - discount;
    // Real margin: (net revenue - cost) / net revenue * 100
    const marginPct = net > 0 && totalCost > 0 ? Math.round(((net - totalCost) / net) * 100) : net > 0 ? 100 : 0;
    
    // Calculate overall effective discount %
    const overallDiscountPct = gross > 0 ? Math.round((discount / gross) * 100) : 0;
    
    return { gross, discount, net, totalCost, marginPct, overallDiscountPct };
  }, [lines]);

  const hasFulfillmentRisk = useMemo(() => {
    return lines.some(line => {
      if (!line.productId) return false;
      const totalStock = companyInventory
        .filter(inv => inv.productId?._id === line.productId || inv.productId === line.productId)
        .reduce((sum, inv) => sum + inv.availableStock, 0);
      return line.quantity > totalStock;
    });
  }, [lines, companyInventory]);

  // Effective max discount = strictest product maxDiscount (Company Policy removed as requested)
  const effectiveMaxDiscount = useMemo(() => {
    const productLimits = lines
      .filter(l => l.productId && l.maxDiscount !== undefined)
      .map(l => l.maxDiscount);
    return productLimits.length > 0 ? Math.min(...productLimits) : 100;
  }, [lines]);

  const simulatedRiskScore = useMemo(() => {
    let score = 10;
    if (totals.overallDiscountPct > effectiveMaxDiscount) {
      score += Math.min((totals.overallDiscountPct - effectiveMaxDiscount) * 5, 50);
    }
    if (hasFulfillmentRisk) score += 30;
    if (totals.net > 1000000) score += 10;
    return Math.min(Math.round(score), 100);
  }, [totals.overallDiscountPct, effectiveMaxDiscount, hasFulfillmentRisk, totals.net]);


  const intelligenceData = {
    totalValue: totals.net,
    discountPct: totals.overallDiscountPct,
    allowedDiscount: effectiveMaxDiscount,
    productLimits: lines.filter(l => l.productId).map(l => ({ name: l.name, maxDiscount: l.maxDiscount })),
    marginPct: totals.marginPct,
    riskScore: simulatedRiskScore,
    compliance: formatType === 'Technical + Commercial' ? compliance : null,
    formatType: formatType,
    approvalState: totals.overallDiscountPct > effectiveMaxDiscount ? 'Approval Required' : 'No Approval Required',
    hasFulfillmentRisk
  };

  const handleSave = async () => {
    if (lines.length === 0) {
      toast.warning('Please add at least one product.');
      return;
    }
    
    // We no longer block saving if discount exceeds max limit.
    // It will just trigger 'Approval Required' state.
    
    try {
      const newQ = await createQuotation({
        dealId,
        formatType,
        totalValue: totals.net,
        discountPct: totals.overallDiscountPct,
        marginPct: totals.marginPct,
        riskScore: intelligenceData.riskScore,
        lines: lines.map(l => ({...l, lineTotal: l.quantity * l.unitPrice})),
        totals,
        compliance: formatType === 'Technical + Commercial' ? compliance : []
      });
      toast.success('Quotation saved successfully!');
      if (dealId) {
        navigate(`/deals/${dealId}`);
      } else {
        navigate(`/quotations/${newQ._id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error creating quotation');
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
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate(-1)}>Cancel</button>
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
                    <th style={{width: '80px'}}>Qty</th>
                    <th style={{width: '130px'}}>Base Price</th>
                    <th style={{width: '140px'}}>Discount %</th>
                    <th style={{width: '130px'}}>Line Total</th>
                    <th style={{width: '50px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => {
                    const gross = line.quantity * line.unitPrice;
                    const lineDiscount = line.discountPct ? gross * (line.discountPct / 100) : 0;
                    const lineNet = gross - lineDiscount;
                    const overLimit = line.productId && line.discountPct > Math.min(line.maxDiscount ?? 100, maxAllowedDiscount);
                    return (
                      <tr key={index} className={overLimit ? 'table-danger' : ''}>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={line.productId}
                            onChange={e => {
                              const prodId = e.target.value;
                              const prod = companyProducts.find(p => p._id === prodId);
                              if (prod) {
                                const newLines = [...lines];
                                newLines[index].productId = prod._id;
                                newLines[index].name = prod.name;
                                newLines[index].unitPrice = prod.basePrice || 0;
                                newLines[index].cost = prod.cost || 0;
                                newLines[index].maxDiscount = prod.maxDiscount !== undefined ? prod.maxDiscount : maxAllowedDiscount;
                                newLines[index].discountPct = 0;
                                setLines(newLines);
                              } else {
                                updateLine(index, 'productId', '');
                                updateLine(index, 'name', '');
                              }
                            }}
                          >
                            <option value="">Select Product...</option>
                            {companyProducts.map(p => (
                              <option key={p._id} value={p._id}>{p.sku} - {p.name}</option>
                            ))}
                          </select>
                          {line.cost > 0 && (
                            <div className="text-muted" style={{fontSize:'0.7rem'}}>Cost: ₹{line.cost.toLocaleString()}</div>
                          )}
                        </td>
                        <td>
                          <input type="number" className="form-control form-control-sm" min="1"
                            value={line.quantity}
                            onChange={e => updateLine(index, 'quantity', Math.max(1, Number(e.target.value)))} />
                        </td>
                        <td>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text">₹</span>
                            <input type="number" className="form-control" value={line.unitPrice}
                              onChange={e => updateLine(index, 'unitPrice', Number(e.target.value))} />
                          </div>
                        </td>
                        <td>
                          <div className="input-group input-group-sm">
                            <input
                              type="number" min="0"
                              className={`form-control ${overLimit ? 'border-danger' : ''}`}
                              value={line.discountPct || 0}
                              onChange={e => updateLine(index, 'discountPct', Number(e.target.value))}
                            />
                            <span className="input-group-text">%</span>
                          </div>
                          {line.productId && (
                            <div style={{fontSize:'0.68rem'}} className={overLimit ? 'text-danger fw-bold' : 'text-muted'}>
                              Max: {Math.min(line.maxDiscount ?? 100, maxAllowedDiscount)}%
                              {overLimit && ' ⚠ Over limit'}
                            </div>
                          )}
                        </td>
                        <td className="fw-bold">
                          <div>₹{lineNet.toLocaleString()}</div>
                          {lineDiscount > 0 && (
                            <div className="text-danger" style={{fontSize:'0.7rem'}}>-₹{lineDiscount.toLocaleString()}</div>
                          )}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => removeLine(index)}>
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Totals Footer */}
              <div className="p-3 bg-light border-top d-flex justify-content-end">
                <div style={{width: '320px'}}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal (Gross):</span>
                    <span>₹{totals.gross.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-danger">
                    <span>Total Discount:</span>
                    <span>-₹{totals.discount.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-muted small">
                    <span>Total Cost (internal):</span>
                    <span>₹{totals.totalCost.toLocaleString()}</span>
                  </div>
                  <hr/>
                  <div className="d-flex justify-content-between mb-1">
                    <strong className="fs-5">Grand Total (Net):</strong>
                    <strong className="fs-5">₹{totals.net.toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="small text-muted">Margin:</span>
                    <span className={`small fw-bold text-${totals.marginPct > 20 ? 'success' : totals.marginPct > 0 ? 'warning' : 'secondary'}`}>
                      {totals.totalCost > 0 ? `${totals.marginPct}%` : 'N/A (no cost data)'}
                    </span>
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
