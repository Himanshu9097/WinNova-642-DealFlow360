import { useAuth } from '@/context/AuthContext';
import { useLocation, Link } from 'react-router-dom';

export default function Navbar() {
  const { user, company, logout } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPublicPortal = pathname.startsWith('/customer/quote/');
  
  if (isAuthPage || !user || isPublicPortal) return null;

  // Customer Portal Navbar
  if (user.role === 'CUSTOMER') {
    return (
      <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container-fluid px-4">
          <Link className="navbar-brand fw-bold" to="/b2b/dashboard" style={{ color: '#D6536D', fontSize: '1.5rem' }}>
            DealFlow360 <span className="badge bg-light text-muted small ms-1" style={{ fontSize: '0.6rem' }}>B2B PORTAL</span>
          </Link>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-medium">
              <li className="nav-item"><Link className="nav-link" to="/b2b/dashboard">Dashboard</Link></li>
            </ul>
            <div className="d-flex align-items-center">
              <div className="text-end me-3">
                <div className="fw-bold text-dark lh-1">{user.name}</div>
                <small className="text-muted" style={{fontSize: '0.75rem'}}>{company?.name} • Customer</small>
              </div>
              <button onClick={logout} className="btn btn-sm btn-outline-secondary">Logout</button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const isRole = (roles) => roles.includes(user.role);

  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold" to="/" style={{ color: '#D6536D', fontSize: '1.5rem' }}>
          DealFlow360
        </Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-medium">
            <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
            
            {/* Sales & Deals */}
            {isRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']) && (
              <li className="nav-item"><Link className="nav-link" to="/deals">Deals</Link></li>
            )}
            {isRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']) && (
              <li className="nav-item"><Link className="nav-link" to="/quotations">Quotations</Link></li>
            )}
            
            {/* Approvals */}
            {isRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'FINANCE']) && (
              <li className="nav-item"><Link className="nav-link" to="/approvals">Approvals</Link></li>
            )}
            
            {/* Fulfillment & Billing */}
            {isRole(['COMPANY_ADMIN', 'OPERATIONS']) && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/warehouses">Warehouses</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/fulfillment">Fulfillment</Link></li>
              </>
            )}
            {isRole(['COMPANY_ADMIN', 'FINANCE']) && (
              <li className="nav-item"><Link className="nav-link" to="/billing">Billing</Link></li>
            )}
            
            {/* Customers */}
            {isRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']) && (
              <li className="nav-item"><Link className="nav-link" to="/customers">Customers</Link></li>
            )}

            {/* Admin */}
            {isRole(['COMPANY_ADMIN']) && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Admin</a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/admin/users">Users</Link></li>
                  <li><Link className="dropdown-item" to="/admin/products">Products</Link></li>
                  <li><Link className="dropdown-item" to="/admin/settings">Company Settings</Link></li>
                </ul>
              </li>
            )}
          </ul>
          
          <div className="d-flex align-items-center">
            <div className="text-end me-3">
              <div className="fw-bold text-dark lh-1">{user.name}</div>
              <small className="text-muted" style={{fontSize: '0.75rem'}}>{company?.name} • {user.role.replace('_', ' ')}</small>
            </div>
            <button onClick={logout} className="btn btn-sm btn-outline-secondary">Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
}
