
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const [deals, setDeals] = useState([]);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL', 'ACTIVE', 'COMPLETED'
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

  const activeDeals = deals.filter(d => d.stage !== 'Completed' && d.billingStatus !== 'Paid');
  const completedDeals = deals.filter(d => d.stage === 'Completed' || d.billingStatus === 'Paid');
  const pendingApprovals = deals.filter(d => d.approvalStatus === 'Pending' || d.stage === 'Negotiation').length;
  
  const margins = deals.map(d => d.targetMargin ?? d.estimatedMargin).filter(m => m !== undefined && m !== null);
  const avgMargin = margins.length > 0 ? (margins.reduce((a, b) => a + b, 0) / margins.length).toFixed(1) : '15.0';

  const displayedDeals = deals.filter(d => {
    const isCompleted = d.stage === 'Completed' || d.billingStatus === 'Paid';
    if (filterTab === 'ACTIVE') return !isCompleted;
    if (filterTab === 'COMPLETED') return isCompleted;
    return true;
  });

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="display-4" style={{color: '#D6536D'}}>Deal Health & Operations Dashboard</h1>
            <p className="lead">Overview of active deals, pipeline value, realized revenue, and approvals.</p>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="row g-3 mb-5">
          <div className="col-md-3">
            <div className="card shadow-sm h-100 border-0" style={{ backgroundColor: '#FFF0F3', borderLeft: '4px solid #D6536D' }}>
              <div className="card-body">
                <h6 className="card-title small text-uppercase fw-bold mb-2" style={{ color: '#A61C3C', letterSpacing: '0.5px' }}>
                  Active Deals
                </h6>
                <h2 className="card-text fw-bold mb-1 text-dark fs-1">{activeDeals.length}</h2>
                <small className="text-secondary fw-medium">In negotiation or fulfillment</small>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm h-100 border-0" style={{ backgroundColor: '#E6F4EA', borderLeft: '4px solid #137333' }}>
              <div className="card-body">
                <h6 className="card-title small text-uppercase fw-bold mb-2" style={{ color: '#137333', letterSpacing: '0.5px' }}>
                  Completed / Paid Revenue
                </h6>
                <h2 className="card-text fw-bold mb-1 fs-2" style={{ color: '#137333' }}>
                  ₹{completedDeals.reduce((acc, deal) => acc + (deal.value || 0), 0).toLocaleString()}
                </h2>
                <small className="text-secondary fw-medium">{completedDeals.length} orders settled</small>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm h-100 border-0" style={{ backgroundColor: '#FEF7E0', borderLeft: '4px solid #B06000' }}>
              <div className="card-body">
                <h6 className="card-title small text-uppercase fw-bold mb-2" style={{ color: '#B06000', letterSpacing: '0.5px' }}>
                  Pending Approvals
                </h6>
                <h2 className="card-text fw-bold mb-1 text-dark fs-1">{pendingApprovals}</h2>
                <small className="text-secondary fw-medium">Requires finance/risk review</small>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm h-100 border-0" style={{ backgroundColor: '#E8F0FE', borderLeft: '4px solid #1A73E8' }}>
              <div className="card-body">
                <h6 className="card-title small text-uppercase fw-bold mb-2" style={{ color: '#1A73E8', letterSpacing: '0.5px' }}>
                  Avg. Target Margin
                </h6>
                <h2 className="card-text fw-bold mb-1 fs-1" style={{ color: '#1A73E8' }}>{avgMargin}%</h2>
                <small className="text-secondary fw-medium">Across all catalog items</small>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Table Card */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom pt-4 pb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h4 className="mb-0 fw-bold" style={{color: '#D6536D'}}><i className="fa fa-list me-2"></i>Deals & Orders Overview</h4>
                
                {/* Section Filter Tabs */}
                <div className="btn-group btn-group-sm" role="group">
                  <button 
                    type="button" 
                    className={`btn ${filterTab === 'ALL' ? 'btn-danger' : 'btn-outline-secondary'}`}
                    onClick={() => setFilterTab('ALL')}
                    style={filterTab === 'ALL' ? { backgroundColor: '#D6536D', borderColor: '#D6536D' } : {}}
                  >
                    All Deals ({deals.length})
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${filterTab === 'COMPLETED' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setFilterTab('COMPLETED')}
                  >
                    ✓ Completed Section ({completedDeals.length})
                  </button>
                </div>
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
                      {displayedDeals.map(deal => {
                        const margin = deal.targetMargin ?? deal.estimatedMargin ?? 15;
                        const isCompleted = deal.stage === 'Completed' || deal.billingStatus === 'Paid';
                        const displayStatus = isCompleted ? 'Completed' : (deal.stage || 'Active');
                        
                        return (
                          <tr key={deal._id}>
                            <td className="ps-4 fw-medium">{deal.title}</td>
                            <td>{deal.customerId?.name || 'Unknown'}</td>
                            <td>₹{(deal.value || 0).toLocaleString()}</td>
                            <td>
                              <span className={`badge ${margin < 15 ? 'bg-danger' : 'bg-success'}`}>
                                {margin}%
                              </span>
                            </td>
                            <td>
                              <span className={`badge rounded-pill ${isCompleted ? 'bg-success px-3 py-2 fs-7' : deal.stage === 'Closed Won' ? 'bg-info text-dark' : deal.approvalStatus === 'Pending' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                                {isCompleted ? '✓ Completed' : displayStatus}
                              </span>
                            </td>
                            <td className="pe-4 text-end">
                              <a href={`/deals/${deal._id}`} className="btn btn-sm btn-outline-secondary">View Details</a>
                            </td>
                          </tr>
                        );
                      })}
                      {displayedDeals.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            No deals match the selected filter category ({filterTab}).
                          </td>
                        </tr>
                      )}
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
