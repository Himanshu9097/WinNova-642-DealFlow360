'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function FulfillmentDetail({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5006/api/fulfillment/${resolvedParams.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          
          if (data.status === 'Ready') {
            fetchRecommendation(token);
          }
        }
      } catch (error) {
        console.error('Failed to fetch order', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [resolvedParams.id]);

  const fetchRecommendation = async (token) => {
    try {
      const res = await fetch(`http://localhost:5006/api/fulfillment/${resolvedParams.id}/recommendation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendation(data);
      }
    } catch (error) {
      console.error('Failed to get recommendation', error);
    }
  };

  const handleAcceptSplit = async () => {
    setAllocating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5006/api/fulfillment/${resolvedParams.id}/allocate`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lineAllocations: recommendation })
      });
      if (res.ok) {
        router.push('/fulfillment');
      }
    } catch (error) {
      console.error('Failed to allocate', error);
      setAllocating(false);
    }
  };

  if (loading) return <div className="container mt-5">Loading order details...</div>;
  if (!order) return <div className="container mt-5">Order not found.</div>;

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'OPERATIONS']}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 mb-0">Fulfillment: {order.orderNumber}</h1>
            <span className={`badge bg-${order.status === 'Ready' ? 'info' : 'primary'}`}>{order.status}</span>
          </div>
          <button className="btn btn-outline-secondary" onClick={() => router.push('/fulfillment')}>Back to Queue</button>
        </div>

        <div className="row">
          <div className="col-md-8">
            {/* Products Table */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">Order Lines</h5>
              </div>
              <div className="card-body p-0">
                <table className="table mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Product</th>
                      <th>Required Qty</th>
                      <th>Allocated</th>
                      <th>Backorder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lines?.map(line => (
                      <tr key={line._id}>
                        <td><strong>{line.name}</strong></td>
                        <td>{line.requiredQuantity}</td>
                        <td className="text-success">{line.allocatedQuantity}</td>
                        <td className="text-danger">{line.backorderQuantity > 0 ? line.backorderQuantity : 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Smart Split Recommendation */}
            {order.status === 'Ready' && recommendation && (
              <div className="card border-0 shadow-sm border-start border-4 border-primary">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-primary">Recommended Fulfillment Split</h5>
                  <span className="badge bg-light text-dark border">AI Optimized</span>
                </div>
                <div className="card-body">
                  {recommendation.map((rec, i) => (
                    <div key={i} className="mb-4 pb-3 border-bottom">
                      <h6>{rec.productName} <span className="text-muted">(Req: {rec.requiredQuantity})</span></h6>
                      <div className="row mt-3">
                        {rec.allocations.map((alloc, j) => (
                          <div key={j} className="col-md-4">
                            <div className="p-3 bg-light rounded text-center border">
                              <span className="d-block text-muted small">{alloc.warehouseName}</span>
                              <strong className="fs-4 text-success">{alloc.quantity}</strong> units
                            </div>
                          </div>
                        ))}
                      </div>
                      {rec.backorderQuantity > 0 && (
                        <div className="alert alert-warning mt-3 mb-0">
                          <strong>Warning:</strong> Insufficient stock. {rec.backorderQuantity} units will be placed on backorder.
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="d-flex justify-content-between align-items-center mt-4 bg-light p-3 rounded">
                    <div>
                      <p className="mb-0 text-muted">Estimated Shipments: <strong className="text-dark">Auto</strong></p>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-secondary">Manual Override</button>
                      <button className="btn btn-primary" onClick={handleAcceptSplit} disabled={allocating}>
                        {allocating ? 'Allocating...' : 'Accept Suggested Split'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="col-md-4">
            {/* Customer Info */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title">Customer</h5>
                <h4 style={{color: '#D6536D'}}>{order.customerId?.name}</h4>
                <p className="text-muted mb-0">Deal: {order.dealId?.title}</p>
                <p className="text-muted">Expected: {order.deliveryTimeline || 'Standard (60 days)'}</p>
              </div>
            </div>

            {/* Technical Requirements Handoff */}
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title">Technical Requirements</h5>
                <ul className="list-group list-group-flush mt-3">
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    IP Rating
                    <span className="badge bg-success rounded-pill">IP68</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    Resolution
                    <span className="badge bg-success rounded-pill">8MP</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    Power
                    <span className="badge bg-success rounded-pill">PoE+</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
                    Warranty
                    <span className="badge bg-success rounded-pill">2 Years</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
