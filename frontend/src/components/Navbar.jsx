'use client';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, company, logout } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  if (isAuthPage || !user) return null;

  const isRole = (roles) => roles.includes(user.role);

  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container-fluid px-4">
        <a className="navbar-brand fw-bold" href="/" style={{ color: '#D6536D', fontSize: '1.5rem' }}>
          DealFlow360
        </a>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-medium">
            <li className="nav-item"><a className="nav-link" href="/">Dashboard</a></li>
            
            {/* Sales & Deals */}
            {isRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']) && (
              <li className="nav-item"><a className="nav-link" href="/deals">Deals</a></li>
            )}
            {isRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']) && (
              <li className="nav-item"><a className="nav-link" href="/quotations">Quotations</a></li>
            )}
            
            {/* Approvals */}
            {isRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'FINANCE']) && (
              <li className="nav-item"><a className="nav-link" href="/approvals">Approvals</a></li>
            )}
            
            {/* Fulfillment & Billing */}
            {isRole(['COMPANY_ADMIN', 'OPERATIONS']) && (
              <>
                <li className="nav-item"><a className="nav-link" href="/warehouses">Warehouses</a></li>
                <li className="nav-item"><a className="nav-link" href="/fulfillment">Fulfillment</a></li>
              </>
            )}
            {isRole(['COMPANY_ADMIN', 'FINANCE']) && (
              <li className="nav-item"><a className="nav-link" href="/billing">Billing</a></li>
            )}
            
            {/* Customers */}
            {isRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']) && (
              <li className="nav-item"><a className="nav-link" href="/customers">Customers</a></li>
            )}

            {/* Admin */}
            {isRole(['COMPANY_ADMIN']) && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Admin</a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="/admin/users">Users</a></li>
                  <li><a className="dropdown-item" href="/admin/settings">Company Settings</a></li>
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
