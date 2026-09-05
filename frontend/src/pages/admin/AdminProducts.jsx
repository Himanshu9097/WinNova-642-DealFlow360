import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    sku: '', name: '', description: '',
    basePrice: '', cost: '', billingType: 'One-time', maxDiscount: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5006/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const payload = { ...formData };
      payload.basePrice = Number(payload.basePrice);
      payload.cost = Number(payload.cost);
      payload.maxDiscount = Number(payload.maxDiscount || 0);
      
      const url = editingId 
        ? `http://127.0.0.1:5006/api/products/${editingId}`
        : `http://127.0.0.1:5006/api/products`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setFormData({ sku: '', name: '', description: '', basePrice: '', cost: '', billingType: 'One-time', maxDiscount: 0 });
        setShowForm(false);
        setEditingId(null);
        fetchProducts();
      } else {
        alert('Failed to save product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (prod) => {
    setFormData({
      sku: prod.sku, name: prod.name, description: prod.description,
      basePrice: prod.basePrice, cost: prod.cost, billingType: prod.billingType || 'One-time',
      maxDiscount: prod.maxDiscount || 0
    });
    setEditingId(prod._id);
    setShowForm(true);
  };
  
  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5006/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <SkeletonLoader type='table' />;

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN']}>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{color: '#D6536D'}}>Company Products</h2>
          <button 
            className="btn btn-primary" 
            style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}}
            onClick={() => {
              setFormData({ sku: '', name: '', description: '', basePrice: '', cost: '', billingType: 'One-time', maxDiscount: 0 });
              setEditingId(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>
        
        {showForm && (
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white pt-4 border-bottom-0">
              <h5 className="mb-0">{editingId ? 'Edit Product' : 'Create New Product'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">SKU</label>
                    <input type="text" className="form-control" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Product Name</label>
                    <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Base Price (₹)</label>
                    <input type="number" step="0.01" className="form-control" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} required />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Cost (₹)</label>
                    <input type="number" step="0.01" className="form-control" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Max Discount (%)</label>
                    <input type="number" step="1" max="100" min="0" className="form-control" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} />
                  </div>
                  <div className="col-md-3 mb-4">
                    <label className="form-label">Billing Type</label>
                    <select className="form-select" value={formData.billingType} onChange={e => setFormData({...formData, billingType: e.target.value})}>
                      <option value="One-time">One-time</option>
                      <option value="Monthly">Monthly Recurring</option>
                      <option value="Annual">Annual Recurring</option>
                    </select>
                  </div>
                </div>
                <div className="text-end">
                  <button type="submit" className="btn btn-primary px-4" style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}}>
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">SKU</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Cost</th>
                    <th>Max Discount</th>
                    <th>Billing Type</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-4">No products found. Create one above!</td></tr>
                  ) : (
                    products.map(p => (
                      <tr key={p._id}>
                        <td className="ps-4 fw-medium text-muted">{p.sku}</td>
                        <td className="fw-bold">{p.name}</td>
                        <td className="text-success">₹{p.basePrice?.toLocaleString()}</td>
                        <td className="text-danger">₹{p.cost?.toLocaleString()}</td>
                        <td>{p.maxDiscount || 0}%</td>
                        <td><span className="badge bg-secondary">{p.billingType || 'One-time'}</span></td>
                        <td className="text-end pe-4">
                          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(p)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
