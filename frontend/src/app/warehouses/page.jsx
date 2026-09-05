'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Modals / Forms State
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', location: '' });
  
  const [showAddStock, setShowAddStock] = useState(false);
  const [newStock, setNewStock] = useState({ warehouseId: '', productId: '', quantity: 0 });
  
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      const [whRes, invRes, prodRes] = await Promise.all([
        fetch('http://localhost:5006/api/inventory/warehouses', { headers }),
        fetch('http://localhost:5006/api/inventory/all', { headers }),
        fetch('http://localhost:5006/api/inventory/products', { headers })
      ]);

      if (whRes.ok) setWarehouses(await whRes.json());
      if (invRes.ok) setInventory(await invRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (error) {
      console.error('Failed to fetch warehouse data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5006/api/inventory/warehouses', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWarehouse)
      });
      if (res.ok) {
        setShowAddWarehouse(false);
        setNewWarehouse({ name: '', location: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create warehouse', error);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5006/api/inventory/stock', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newStock,
          quantity: parseInt(newStock.quantity, 10)
        })
      });
      if (res.ok) {
        setShowAddStock(false);
        setNewStock({ warehouseId: '', productId: '', quantity: 0 });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to add stock', error);
    }
  };

  if (loading) return <div className="container mt-5">Loading inventory data...</div>;

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'OPERATIONS']}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-5" style={{color: '#D6536D'}}>Warehouses & Inventory</h1>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => setShowAddWarehouse(true)}>+ New Warehouse</button>
            <button className="btn btn-primary" onClick={() => setShowAddStock(true)}>+ Add Stock</button>
          </div>
        </div>

        {/* Dashboard KPIs */}
        <div className="row mb-5">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 border-start border-4 border-info">
              <div className="card-body">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Total Locations</h6>
                <h2 className="mb-0">{warehouses.length}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 border-start border-4 border-success">
              <div className="card-body">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Total Units in Stock</h6>
                <h2 className="mb-0">{inventory.reduce((acc, inv) => acc + inv.availableStock, 0)}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 border-start border-4 border-warning">
              <div className="card-body">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Units Allocated (Pending Ship)</h6>
                <h2 className="mb-0">{inventory.reduce((acc, inv) => acc + inv.allocatedStock, 0)}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Matrix Table */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0">Global Inventory Matrix</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Warehouse</th>
                    <th>Location</th>
                    <th>Product SKU</th>
                    <th>Product Name</th>
                    <th>Available Stock</th>
                    <th>Allocated Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No inventory records found. Click "+ Add Stock" to begin.
                      </td>
                    </tr>
                  ) : (
                    inventory.map(inv => (
                      <tr key={inv._id}>
                        <td><strong>{inv.warehouseId?.name}</strong></td>
                        <td>{inv.warehouseId?.location}</td>
                        <td><span className="badge bg-secondary">{inv.productId?.sku}</span></td>
                        <td>{inv.productId?.name}</td>
                        <td><span className="fs-5 fw-bold text-success">{inv.availableStock}</span></td>
                        <td className="text-muted">{inv.allocatedStock}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ADD WAREHOUSE MODAL (Simulated with simple conditional render for now) */}
        {showAddWarehouse && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title">Create New Warehouse</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddWarehouse(false)}></button>
                </div>
                <form onSubmit={handleCreateWarehouse}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Warehouse Name</label>
                      <input type="text" className="form-control" required value={newWarehouse.name} onChange={e => setNewWarehouse({...newWarehouse, name: e.target.value})} placeholder="e.g. Bangalore Depot" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Location (City/Region)</label>
                      <input type="text" className="form-control" value={newWarehouse.location} onChange={e => setNewWarehouse({...newWarehouse, location: e.target.value})} placeholder="e.g. Bangalore, KA" />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setShowAddWarehouse(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Warehouse</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ADD STOCK MODAL */}
        {showAddStock && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title">Add / Receive Stock</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddStock(false)}></button>
                </div>
                <form onSubmit={handleAddStock}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Destination Warehouse</label>
                      <select className="form-select" required value={newStock.warehouseId} onChange={e => setNewStock({...newStock, warehouseId: e.target.value})}>
                        <option value="">Select Warehouse...</option>
                        {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Product</label>
                      <select className="form-select" required value={newStock.productId} onChange={e => setNewStock({...newStock, productId: e.target.value})}>
                        <option value="">Select Product...</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.sku} - {p.name}</option>)}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quantity to Add</label>
                      <input type="number" className="form-control" required min="1" value={newStock.quantity} onChange={e => setNewStock({...newStock, quantity: e.target.value})} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setShowAddStock(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Stock</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
