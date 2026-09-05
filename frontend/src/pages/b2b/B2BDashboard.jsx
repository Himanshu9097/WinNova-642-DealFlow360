import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Chatbox } from '@talkjs/react-components';

const API = 'http://127.0.0.1:5006/api/b2b';

function getHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  };
}

export default function B2BDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [deals, setDeals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/dashboard`, { headers: getHeaders() }).then(r => r.json()),
      fetch(`${API}/quotations`, { headers: getHeaders() }).then(r => r.json()),
      fetch(`${API}/deals`, { headers: getHeaders() }).then(r => r.json()),
      fetch(`${API}/invoices`, { headers: getHeaders() }).then(r => r.json())
    ]).then(([dashData, quoteData, dealData, invData]) => {
      setStats(dashData);
      setQuotations(Array.isArray(quoteData) ? quoteData : []);
      setDeals(Array.isArray(dealData) ? dealData : []);
      setInvoices(Array.isArray(invData) ? invData : []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" style={{ color: '#D6536D' }} role="status"></div>
        <p className="mt-3 text-muted">Loading your dashboard...</p>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'fa-th-large' },
    { key: 'quotations', label: 'Quotations', icon: 'fa-file-alt' },
    { key: 'deals', label: 'Deals', icon: 'fa-handshake' },
    { key: 'invoices', label: 'Invoices', icon: 'fa-file-invoice-dollar' },
    { key: 'messages', label: 'Messages', icon: 'fa-comments' }
  ];

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ color: '#D6536D' }}>
            <i className="fa fa-briefcase me-2"></i>B2B Portal
          </h2>
          <span className="text-muted">Welcome back, {user?.name}. Here's your business overview.</span>
        </div>
        <span className="badge bg-light text-dark border px-3 py-2">
          <i className="fa fa-building me-1"></i> Customer Portal
        </span>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #D6536D' }}>
              <div className="card-body">
                <div className="text-muted small text-uppercase fw-bold">Active Deals</div>
                <div className="fs-3 fw-bold" style={{ color: '#D6536D' }}>{stats.activeDeals}</div>
                <div className="text-muted small">{stats.totalDeals} total</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #28a745' }}>
              <div className="card-body">
                <div className="text-muted small text-uppercase fw-bold">Pipeline Value</div>
                <div className="fs-3 fw-bold text-success">₹{(stats.pipelineValue || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #ffc107' }}>
              <div className="card-body">
                <div className="text-muted small text-uppercase fw-bold">Pending Quotes</div>
                <div className="fs-3 fw-bold text-warning">{stats.pendingQuotations}</div>
                <div className="text-muted small">{stats.totalQuotations} total</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #dc3545' }}>
              <div className="card-body">
                <div className="text-muted small text-uppercase fw-bold">Outstanding</div>
                <div className="fs-3 fw-bold text-danger">₹{(stats.totalOutstanding || 0).toLocaleString()}</div>
                <div className="text-muted small">{stats.unpaidInvoices} unpaid invoices</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {tabs.map(tab => (
          <li className="nav-item" key={tab.key}>
            <button
              className={`nav-link ${activeTab === tab.key ? 'active fw-bold' : 'text-dark'}`}
              onClick={() => setActiveTab(tab.key)}
              style={{ borderBottomColor: activeTab === tab.key ? '#D6536D' : 'transparent', borderBottomWidth: activeTab === tab.key ? '3px' : '1px' }}
            >
              <i className={`fa ${tab.icon} me-2`}></i>{tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          {activeTab === 'overview' && (
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-3"><i className="fa fa-file-alt me-2 text-muted"></i>Recent Quotations</h5>
                {quotations.slice(0, 5).map(q => (
                  <div key={q._id} className="d-flex justify-content-between align-items-center border-bottom py-3">
                    <div>
                      <div className="fw-bold">{q.quoteNumber}</div>
                      <div className="text-muted small">{q.dealId?.title || 'N/A'}</div>
                    </div>
                    <div className="text-end">
                      <span className={`badge bg-${q.status === 'Accepted' ? 'success' : q.status === 'Rejected' ? 'danger' : q.status === 'Negotiating' ? 'info' : 'warning'}`}>
                        {q.status}
                      </span>
                      <div className="text-muted small mt-1">₹{(q.totals?.net || 0).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {quotations.length === 0 && <p className="text-muted">No quotations yet.</p>}
              </div>
              <div className="col-md-6">
                <h5 className="mb-3"><i className="fa fa-file-invoice-dollar me-2 text-muted"></i>Recent Invoices</h5>
                {invoices.slice(0, 5).map(inv => (
                  <div key={inv._id} className="d-flex justify-content-between align-items-center border-bottom py-3">
                    <div>
                      <div className="fw-bold">{inv.invoiceNumber}</div>
                      <div className="text-muted small">Due: {new Date(inv.dueDate).toLocaleDateString()}</div>
                    </div>
                    <div className="text-end">
                      <span className={`badge bg-${inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'}`}>
                        {inv.status}
                      </span>
                      <div className="fw-bold mt-1">₹{(inv.total || 0).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && <p className="text-muted">No invoices yet.</p>}
              </div>
            </div>
          )}

          {activeTab === 'quotations' && (
            <div>
              <h5 className="mb-3">All Quotations</h5>
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Quote #</th>
                    <th>Deal</th>
                    <th>Gross</th>
                    <th>Discount</th>
                    <th>Net Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map(q => (
                    <tr key={q._id}>
                      <td className="fw-bold">{q.quoteNumber}</td>
                      <td>{q.dealId?.title || '-'}</td>
                      <td>₹{(q.totals?.gross || 0).toLocaleString()}</td>
                      <td className="text-danger">-₹{(q.totals?.discount || 0).toLocaleString()}</td>
                      <td className="fw-bold">₹{(q.totals?.net || 0).toLocaleString()}</td>
                      <td>
                        <span className={`badge bg-${q.status === 'Accepted' ? 'success' : q.status === 'Rejected' ? 'danger' : q.status === 'Negotiating' ? 'info' : 'warning'}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="text-muted small">{new Date(q.createdAt).toLocaleDateString()}</td>
                      <td>
                        {q.customerToken && (
                          <Link to={`/customer/quote/${q.customerToken}`} className="btn btn-sm btn-outline-primary">
                            View / Negotiate
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                  {quotations.length === 0 && (
                    <tr><td colSpan="8" className="text-center text-muted py-4">No quotations found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'deals' && (
            <div>
              <h5 className="mb-3">All Deals</h5>
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Deal #</th>
                    <th>Title</th>
                    <th>Value</th>
                    <th>Stage</th>
                    <th>Risk</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map(d => (
                    <tr key={d._id}>
                      <td className="fw-bold">{d.dealNumber}</td>
                      <td>{d.title}</td>
                      <td>₹{(d.value || 0).toLocaleString()}</td>
                      <td>
                        <span className={`badge bg-${d.stage === 'Closed Won' ? 'success' : d.stage === 'Lost' ? 'danger' : 'secondary'}`}>
                          {d.stage}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${d.riskLevel === 'High' ? 'danger' : d.riskLevel === 'Medium' ? 'warning' : 'success'}`}>
                          {d.riskLevel || 'Low'}
                        </span>
                      </td>
                      <td className="text-muted small">{new Date(d.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {deals.length === 0 && (
                    <tr><td colSpan="6" className="text-center text-muted py-4">No deals found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
              <h5 className="mb-3">All Invoices</h5>
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Invoice #</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Subtotal</th>
                    <th>Tax</th>
                    <th>Total</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv._id}>
                      <td className="fw-bold">{inv.invoiceNumber}</td>
                      <td>{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td>₹{(inv.subtotal || 0).toLocaleString()}</td>
                      <td>₹{(inv.taxAmount || 0).toLocaleString()}</td>
                      <td className="fw-bold">₹{(inv.total || 0).toLocaleString()}</td>
                      <td className="fw-bold text-danger">₹{(inv.balanceDue || 0).toLocaleString()}</td>
                      <td>
                        <span className={`badge bg-${inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr><td colSpan="8" className="text-center text-muted py-4">No invoices found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h5 className="mb-3">Messages</h5>
              <p className="text-muted mb-4">Chat with your account managers directly about any quotation or deal.</p>
              <div className="border rounded bg-light d-flex justify-content-center overflow-hidden shadow-sm" style={{ height: '500px' }}>
                <Chatbox
                  appId="tSQSAHl9"
                  userId={`cust_${user?.customerId || user?._id}`}
                  conversationId={`b2b_${user?.customerId || user?._id}`}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
