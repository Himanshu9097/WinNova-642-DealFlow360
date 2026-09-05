'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';

export default function FulfillmentPage() {
  const [fulfillments, setFulfillments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFulfillments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://127.0.0.1:5006/api/fulfillment', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFulfillments(data);
        }
      } catch (error) {
        console.error('Failed to fetch fulfillments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFulfillments();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Ready': return 'bg-info text-dark';
      case 'Allocating': return 'bg-warning text-dark';
      case 'Allocated': return 'bg-primary';
      case 'Partially Fulfilled': return 'bg-warning text-dark';
      case 'Shipped': return 'bg-secondary';
      case 'Delivered': return 'bg-success';
      default: return 'bg-light text-dark border';
    }
  };

  const kpis = {
    ready: fulfillments.filter(f => f.status === 'Ready').length,
    inFulfillment: fulfillments.filter(f => ['Allocating', 'Allocated', 'Partially Fulfilled', 'Shipped'].includes(f.status)).length,
    backorders: fulfillments.filter(f => f.status === 'Partially Fulfilled').length,
    deliveryRisk: 0 // Mock calculation could go here
  };

  if (loading) return <div className="container mt-5">Loading operations data...</div>;

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'OPERATIONS']}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-5" style={{color: '#D6536D'}}>Operations Center</h1>
        </div>

        {/* KPI Dashboard */}
        <div className="row mb-5">
          <div className="col-md-3">
            <div className="card shadow-sm border-0 border-start border-4 border-info">
              <div className="card-body">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Ready to Fulfill</h6>
                <h2 className="mb-0">{kpis.ready}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm border-0 border-start border-4 border-primary">
              <div className="card-body">
                <h6 className="text-muted text-uppercase fw-bold mb-2">In Fulfillment</h6>
                <h2 className="mb-0">{kpis.inFulfillment}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm border-0 border-start border-4 border-warning">
              <div className="card-body">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Backorders</h6>
                <h2 className="mb-0">{kpis.backorders}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm border-0 border-start border-4 border-danger">
              <div className="card-body">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Delivery Risk</h6>
                <h2 className="mb-0">{kpis.deliveryRisk}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment Queue */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0">Fulfillment Queue</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Deal</th>
                    <th>Total Items</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fulfillments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No active fulfillment orders.
                      </td>
                    </tr>
                  ) : (
                    fulfillments.map(f => (
                      <tr key={f._id}>
                        <td><strong>{f.orderNumber}</strong></td>
                        <td>{f.customerId?.name}</td>
                        <td>{f.dealId?.title}</td>
                        <td>
                          {f.lines?.reduce((acc, line) => acc + line.requiredQuantity, 0)} units
                        </td>
                        <td><span className={`badge ${getStatusBadge(f.status)}`}>{f.status}</span></td>
                        <td>
                          <Link href={`/fulfillment/${f._id}`} className="btn btn-sm btn-outline-primary">
                            Manage Order
                          </Link>
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
