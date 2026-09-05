import SkeletonLoader from '@/components/SkeletonLoader';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Modals / Forms State
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', location: '' });
  
  const [showAddStock, setShowAddStock] = useState(false);
  const [newStock, setNewStock] = useState({ warehouseId: '', productId: '', quantity: 0 });
  
  const [expandedWarehouses, setExpandedWarehouses] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      const [whRes, invRes, prodRes] = await Promise.all([
        fetch('http://127.0.0.1:5006/api/inventory/warehouses', { headers }),
        fetch('http://127.0.0.1:5006/api/inventory/all', { headers }),
        fetch('http://127.0.0.1:5006/api/inventory/products', { headers })
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
      const res = await fetch('http://127.0.0.1:5006/api/inventory/warehouses', {
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
      const res = await fetch('http://127.0.0.1:5006/api/inventory/stock', {
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

  if (loading) return <SkeletonLoader type='default' />;

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

        {/* Warehouses List */}
        <div className="row">
          {warehouses.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted">
              No warehouses found. Click "+ New Warehouse" to begin.
            </div>
          ) : (
            warehouses.map(warehouse => {
              const rawWhInventory = inventory.filter(inv => inv.warehouseId?._id === warehouse._id || inv.warehouseId === warehouse._id);
              const whInventoryMap = {};
              rawWhInventory.forEach(inv => {
                const pId = inv.productId?._id || inv.productId;
                if (!whInventoryMap[pId]) {
                  whInventoryMap[pId] = { ...inv };
                } else {
                  whInventoryMap[pId].availableStock += inv.availableStock;
                  whInventoryMap[pId].allocatedStock += inv.allocatedStock;
                }
              });
              const whInventory = Object.values(whInventoryMap);

              return (
                <div className="col-12 mb-4" key={warehouse._id}>
                  <div className="card shadow-sm border-0">
                    <div 
                      className="card-header bg-white py-3 d-flex justify-content-between align-items-center"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpandedWarehouses(prev => ({...prev, [warehouse._id]: !prev[warehouse._id]}))}
                    >
                      <div className="d-flex align-items-center">
                        <i 
                          className="fa fa-chevron-right text-secondary me-3"
                          style={{ 
                            transform: expandedWarehouses[warehouse._id] ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                          }}
                        ></i>
                        <div>
                          <h5 className="mb-0 text-dark fw-bold"><i className="fa fa-building text-secondary me-2"></i>{warehouse.name}</h5>
                          <small className="text-muted"><i className="fa fa-map-marker-alt me-1"></i>{warehouse.location}</small>
                        </div>
                      </div>
                      <span className="badge bg-light text-dark border px-3 py-2 fs-6">
                        {whInventory.length} SKUs in Stock
                      </span>
                    </div>
                    
                    <div 
                      style={{ 
                        maxHeight: expandedWarehouses[warehouse._id] ? '2000px' : '0px', 
                        overflow: 'hidden',
                        transition: 'max-height 0.4s ease-in-out',
                        opacity: expandedWarehouses[warehouse._id] ? 1 : 0,
                        transitionProperty: 'max-height, opacity',
                        transitionDuration: '0.4s, 0.3s'
                      }}
                    >
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light">
                              <tr>
                                <th className="ps-4">Product SKU</th>
                                <th>Product Name</th>
                                <th>Available Stock</th>
                                <th>Allocated (Pending Ship)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {whInventory.length === 0 ? (
                                <tr>
                                  <td colSpan="4" className="text-center py-4 text-muted">
                                    No inventory records for this warehouse. Click "+ Add Stock" to receive items.
                                  </td>
                                </tr>
                              ) : (
                                whInventory.map(inv => (
                                  <tr key={inv._id || Math.random()}>
                                    <td className="ps-4"><span className="badge bg-secondary">{inv.productId?.sku || 'Unknown'}</span></td>
                                    <td className="fw-medium">{inv.productId?.name || 'Unknown Product'}</td>
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
                  </div>
                </div>
              );
            })
          )}
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
