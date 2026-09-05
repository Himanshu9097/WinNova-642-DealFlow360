
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const [deals, setDeals] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      navigate('/b2b/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://127.0.0.1:5006/api/deals', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDeals(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="display-4" style={{color: '#D6536D'}}>Deal Health & Operations Dashboard</h1>
            <p className="lead">Overview of active deals, pipeline value, and approvals.</p>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-md-3">
            <div className="card text-white mb-3 shadow-sm" style={{ backgroundColor: '#D6536D' }}>
              <div className="card-body">
                <h5 className="card-title">Active Deals</h5>
                <h2 className="card-text">{deals.length}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-success mb-3 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Pipeline Value</h5>
                <h2 className="card-text">
                  ₹{deals.reduce((acc, deal) => acc + (deal.value || 0), 0).toLocaleString()}
                </h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-warning mb-3 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Pending Approvals</h5>
                <h2 className="card-text">
                  {deals.filter(d => d.status === 'NEGOTIATION').length}
                </h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-info mb-3 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Avg. Margin</h5>
                <h2 className="card-text">
                  {deals.length > 0 
                    ? (deals.reduce((acc, deal) => acc + (deal.targetMargin || 0), 0) / deals.length).toFixed(1) 
                    : 0}%
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                <h4 style={{color: '#D6536D'}}><i className="fa fa-list me-2"></i>Recent Deals</h4>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Deal Title</th>
                        <th>Customer</th>
                        <th>Value</th>
                        <th>Margin</th>
                        <th>Status</th>
                        <th className="pe-4 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deals.map(deal => (
                        <tr key={deal._id}>
                          <td className="ps-4 fw-medium">{deal.title}</td>
                          <td>{deal.customerId?.name || 'Unknown'}</td>
                          <td>₹{(deal.value || 0).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${deal.targetMargin < 15 ? 'bg-danger' : 'bg-success'}`}>
                              {deal.targetMargin}%
                            </span>
                          </td>
                          <td>
                            <span className={`badge rounded-pill ${deal.status === 'WON' ? 'bg-success' : deal.status === 'NEGOTIATION' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                              {deal.status}
                            </span>
                          </td>
                          <td className="pe-4 text-end">
                            <a href={`/deals/${deal._id}`} className="btn btn-sm btn-outline-secondary">View Details</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
