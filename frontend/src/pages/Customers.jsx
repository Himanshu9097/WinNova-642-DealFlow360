import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Link } from 'react-router-dom';
import { getCustomers } from '@/services/customerService';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [provisionData, setProvisionData] = useState({ email: '', password: '', name: '' });
  const [provisioning, setProvisioning] = useState(false);
  const [provisionMsg, setProvisionMsg] = useState('');

  useEffect(() => {
    getCustomers().then(data => {
      setCustomers(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const openProvisionModal = (customer) => {
    setSelectedCustomer(customer);
    setProvisionData({ email: customer.email || '', password: '', name: customer.contactPerson || customer.name });
    setProvisionMsg('');
    setShowModal(true);
  };

  const handleProvision = async (e) => {
    e.preventDefault();
    setProvisioning(true);
    setProvisionMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5006/api/users/provision-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerId: selectedCustomer._id, ...provisionData })
      });
      const data = await res.json();
      if (res.ok) {
        setProvisionMsg('✅ Portal login created successfully! The customer can now log in.');
        setTimeout(() => setShowModal(false), 2000);
      } else {
        setProvisionMsg(`❌ ${data.error}`);
      }
    } catch (err) {
      setProvisionMsg('❌ Failed to provision login');
    }
    setProvisioning(false);
  };

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
      <div className="container-fluid px-4 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-0" style={{color: '#D6536D'}}>Customers Directory</h2>
            <span className="text-muted">Manage your client organizations and key contacts.</span>
          </div>
          <Link to="/customers/create" className="btn btn-primary" style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}}>
            + New Customer
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center mt-5">Loading customers...</div>
        ) : customers.length > 0 ? (
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-body p-0">
              <table className="table mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Industry</th>
                    <th>Phone</th>
                    <th className="text-end">Portal Access</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c._id}>
                      <td className="fw-bold">{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.industry || '-'}</td>
                      <td>{c.phone || '-'}</td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openProvisionModal(c)}
                        >
                          <i className="fa fa-key me-1"></i> Provision Login
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-body py-5 text-center text-muted">
              <i className="fs-1 mb-3">🏢</i>
              <h4>No Customers Yet</h4>
              <p>Click the button above to add your first client organization.</p>
            </div>
          </div>
        )}
      </div>

      {/* Provision Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  <i className="fa fa-user-plus me-2" style={{ color: '#D6536D' }}></i>
                  Provision B2B Portal Login
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleProvision}>
                <div className="modal-body">
                  <div className="alert alert-info border-0 small py-2">
                    <i className="fa fa-info-circle me-1"></i>
                    Creating a login for <strong>{selectedCustomer?.name}</strong>. The customer will use these credentials to access the B2B Portal.
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Contact Name</label>
                    <input 
                      type="text" className="form-control" 
                      value={provisionData.name} 
                      onChange={e => setProvisionData({...provisionData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Email <span className="text-danger">*</span></label>
                    <input 
                      type="email" className="form-control" 
                      value={provisionData.email} 
                      onChange={e => setProvisionData({...provisionData, email: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Temporary Password <span className="text-danger">*</span></label>
                    <input 
                      type="password" className="form-control" 
                      value={provisionData.password} 
                      onChange={e => setProvisionData({...provisionData, password: e.target.value})} 
                      required minLength="6"
                      placeholder="Min 6 characters"
                    />
                  </div>
                  {provisionMsg && (
                    <div className={`alert ${provisionMsg.startsWith('✅') ? 'alert-success' : 'alert-danger'} py-2 small`}>
                      {provisionMsg}
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white" style={{ backgroundColor: '#D6536D' }} disabled={provisioning}>
                    {provisioning ? <><i className="fa fa-spinner fa-spin me-1"></i> Creating...</> : <><i className="fa fa-check me-1"></i> Create Login</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

