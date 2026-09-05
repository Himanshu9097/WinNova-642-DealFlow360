
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Link } from 'react-router-dom';
import { createCustomer } from '@/services/customerService';

export default function CreateCustomer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCustomer(formData);
      navigate('/customers');
    } catch (error) {
      console.error(error);
      alert('Failed to create customer');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{color: '#D6536D'}} className="mb-0 fw-bold">Add New Customer</h2>
            <span className="text-muted">Enter the details for the new client organization.</span>
          </div>
          <Link to="/customers" className="btn btn-outline-secondary px-4">
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Left Column - Company Info */}
            <div className="col-lg-7">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white py-3 border-bottom-0">
                  <h6 className="mb-0 fw-bold text-uppercase text-muted"><i className="fa fa-building me-2"></i>Organization Profile</h6>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <label className="form-label small fw-bold">Company Name <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg bg-light border-0" 
                      placeholder="e.g. Acme Corporation" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required 
                    />
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Industry</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0" 
                        placeholder="e.g. Technology" 
                        value={formData.industry}
                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Website</label>
                      <input 
                        type="url" 
                        className="form-control bg-light border-0" 
                        placeholder="https://acmecorp.com" 
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold">Billing Address</label>
                    <textarea 
                      className="form-control bg-light border-0" 
                      rows="3" 
                      placeholder="Full registered address..." 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="col-lg-5">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white py-3 border-bottom-0">
                  <h6 className="mb-0 fw-bold text-uppercase text-muted"><i className="fa fa-address-book me-2"></i>Primary Contact</h6>
                </div>
                <div className="card-body bg-light rounded-bottom">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Contact Person</label>
                    <input 
                      type="text" 
                      className="form-control border-0 shadow-sm" 
                      placeholder="e.g. Jane Doe" 
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Email Address <span className="text-danger">*</span></label>
                    <input 
                      type="email" 
                      className="form-control border-0 shadow-sm" 
                      placeholder="jane@acmecorp.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required 
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control border-0 shadow-sm" 
                      placeholder="+1 (555) 123-4567" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  
                  <hr className="text-muted opacity-25" />
                  
                  <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary btn-lg shadow-sm" style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}} disabled={loading}>
                      {loading ? <i className="fa fa-spinner fa-spin me-2"></i> : <i className="fa fa-check me-2"></i>}
                      {loading ? 'Saving...' : 'Create Customer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
