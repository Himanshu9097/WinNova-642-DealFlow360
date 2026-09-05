
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Link } from 'react-router-dom';
import { createDeal } from '@/services/dealService';
import { getCustomers } from '@/services/customerService';

export default function CreateDeal() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    stage: 'Discovery',
    riskLevel: 'Low'
  });
  const [lines, setLines] = useState([{ productId: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    getCustomers().then(setCustomers).catch(console.error);

    fetch('http://127.0.0.1:5006/api/products', { headers })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(console.error);

    fetch('http://127.0.0.1:5006/api/inventory/all', { headers })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setInventory(data); })
      .catch(console.error);
  }, []);

  // Get total available stock for a product across ALL warehouses
  const getTotalStock = (productId) => {
    if (!productId) return 0;
    return inventory
      .filter(i => (i.productId?._id || i.productId) === productId)
      .reduce((sum, i) => sum + (i.availableStock || 0), 0);
  };

  // Auto-calculate estimated value
  const estimatedValue = useMemo(() => {
    return lines.reduce((total, line) => {
      const product = products.find(p => p._id === line.productId);
      if (product) return total + (product.basePrice * line.quantity);
      return total;
    }, 0);
  }, [lines, products]);

  // Check stock availability per line
  const stockStatus = useMemo(() => {
    return lines.map(line => {
      if (!line.productId) return { available: 0, ok: true, empty: true };
      const totalStock = getTotalStock(line.productId);
      return { available: totalStock, ok: totalStock >= line.quantity, empty: false };
    });
  }, [lines, inventory, products]);

  const allStockOk = stockStatus.every(s => s.empty || s.ok);
  const hasProducts = lines.some(l => l.productId);

  const addLine = () => setLines([...lines, { productId: '', quantity: 1 }]);

  const removeLine = (index) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index, field, value) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allStockOk) {
      alert('Cannot create deal — some products do not have enough stock.');
      return;
    }
    setLoading(true);
    try {
      await createDeal({
        ...formData,
        value: estimatedValue,
        dealNumber: `D-${Date.now().toString().slice(-6)}`,
        productLines: lines.filter(l => l.productId).map(l => {
          const product = products.find(p => p._id === l.productId);
          return {
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: product?.basePrice || 0
          };
        })
      });
      navigate('/deals');
    } catch (err) {
      console.error(err);
      alert('Failed to create deal');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{color: '#D6536D'}} className="mb-0">Create New Deal</h2>
            <span className="text-muted">Select products and quantities. Warehouse allocation is handled by Operations.</span>
          </div>
          <Link to="/deals" className="btn btn-secondary">Back to Pipeline</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Left: Deal Info + Products */}
            <div className="col-lg-7">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3 border-bottom-0">
                  <h6 className="mb-0 fw-bold text-uppercase text-muted"><i className="fa fa-info-circle me-2"></i>Deal Details</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Deal Title</label>
                    <input type="text" className="form-control" placeholder="e.g. Enterprise Security Upgrade" 
                      value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Customer</label>
                    <select className="form-select" value={formData.customerId}
                      onChange={(e) => setFormData({...formData, customerId: e.target.value})} required>
                      <option value="">Select a Customer...</option>
                      {customers.map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Lines */}
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom-0">
                  <h6 className="mb-0 fw-bold text-uppercase text-muted"><i className="fa fa-boxes me-2"></i>Products</h6>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={addLine}>
                    <i className="fa fa-plus me-1"></i> Add Product
                  </button>
                </div>
                <div className="card-body p-0">
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{width: '35%'}}>Product</th>
                        <th style={{width: '10%'}}>Qty</th>
                        <th style={{width: '12%'}}>Base Price</th>
                        <th style={{width: '12%'}}>Line Total</th>
                        <th style={{width: '24%'}}>Stock Availability</th>
                        <th style={{width: '7%'}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, i) => {
                        const product = products.find(p => p._id === line.productId);
                        const lineTotal = product ? product.basePrice * line.quantity : 0;
                        const status = stockStatus[i];
                        return (
                          <tr key={i} className={!status.empty && !status.ok ? 'table-danger' : ''}>
                            <td>
                              <select className="form-select form-select-sm" value={line.productId}
                                onChange={(e) => updateLine(i, 'productId', e.target.value)}>
                                <option value="">Select product...</option>
                                {products.map(p => (
                                  <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input type="number" className="form-control form-control-sm" min="1"
                                value={line.quantity}
                                onChange={(e) => updateLine(i, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} />
                            </td>
                            <td className="text-muted">
                              {product ? `₹${product.basePrice?.toLocaleString()}` : '-'}
                            </td>
                            <td className="fw-bold">
                              {lineTotal > 0 ? `₹${lineTotal.toLocaleString()}` : '-'}
                            </td>
                            <td>
                               {!status.empty ? (() => {
                                 const pct = status.available === 0 ? 100 : Math.min(100, Math.round((line.quantity / status.available) * 100));
                                 const remaining = status.available - line.quantity;
                                 const barColor = remaining < 0 ? '#dc3545' : remaining < status.available * 0.2 ? '#ffc107' : '#28a745';
                                 return (
                                   <div style={{minWidth: '120px'}}>
                                     <div className="d-flex justify-content-between" style={{fontSize: '0.72rem'}}>
                                       <span className={remaining < 0 ? 'text-danger fw-bold' : 'text-muted'}>
                                         {remaining < 0
                                           ? `⚠ Short by ${Math.abs(remaining)}`
                                           : `${remaining} remaining`}
                                       </span>
                                       <span className="text-muted">{status.available} total</span>
                                     </div>
                                     <div className="progress mt-1" style={{height: '6px', borderRadius: '3px', backgroundColor: '#e9ecef'}}>
                                       <div
                                         className="progress-bar"
                                         style={{
                                           width: `${Math.min(pct, 100)}%`,
                                           backgroundColor: barColor,
                                           transition: 'width 0.3s ease, background-color 0.3s ease'
                                         }}
                                       />
                                     </div>
                                     <div style={{fontSize: '0.68rem'}} className="text-muted mt-1">
                                       {line.quantity} of {status.available} used
                                     </div>
                                   </div>
                                 );
                               })() : (
                                 <span className="text-muted small">—</span>
                               )}
                             </td>
                            <td>
                              {lines.length > 1 && (
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeLine(i)}>
                                  <i className="fa fa-times"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="col-lg-5">
              <div className="card shadow-sm border-0 sticky-top" style={{ top: '80px', borderTop: '4px solid #D6536D' }}>
                <div className="card-body">
                  <h6 className="text-uppercase text-muted fw-bold mb-3"><i className="fa fa-calculator me-2"></i>Deal Summary</h6>
                  <hr />

                  <div className="mb-3">
                    <div className="text-muted small mb-1">Selected Products</div>
                    {lines.filter(l => l.productId).map((line, i) => {
                      const product = products.find(p => p._id === line.productId);
                      return product ? (
                        <div key={i} className="d-flex justify-content-between small py-1 border-bottom">
                          <span>{product.name} × {line.quantity}</span>
                          <span className="fw-bold">₹{(product.basePrice * line.quantity).toLocaleString()}</span>
                        </div>
                      ) : null;
                    })}
                    {!hasProducts && (
                      <div className="text-muted small fst-italic py-1">No products selected yet</div>
                    )}
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-5 fw-bold">Estimated Value</span>
                    <span className="fs-4 fw-bold" style={{ color: '#D6536D' }}>
                      ₹{estimatedValue.toLocaleString()}
                    </span>
                  </div>

                  {/* Role info */}
                  <div className="alert alert-light border py-2 small mb-3">
                    <i className="fa fa-info-circle me-1 text-info"></i>
                    <strong>Warehouse</strong> allocation will be assigned by the <strong>Operations</strong> team.
                    <strong> Discounts</strong> are managed by <strong>Finance</strong> during the Quotation stage.
                  </div>

                  {!allStockOk && hasProducts && (
                    <div className="alert alert-danger py-2 small mb-3">
                      <i className="fa fa-exclamation-triangle me-1"></i>
                      <strong>Cannot create deal</strong> — one or more products don't have sufficient stock across all warehouses.
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary w-100 py-2" 
                    style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}} 
                    disabled={loading || !hasProducts || !allStockOk}>
                    {loading ? (
                      <><i className="fa fa-spinner fa-spin me-2"></i>Creating...</>
                    ) : (
                      <><i className="fa fa-check me-2"></i>Create Deal — ₹{estimatedValue.toLocaleString()}</>
                    )}
                  </button>

                  {!hasProducts && (
                    <div className="text-center text-muted small mt-2">Select at least one product</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
