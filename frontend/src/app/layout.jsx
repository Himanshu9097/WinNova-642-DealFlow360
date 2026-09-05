export const metadata = {
  title: "DealFlow360",
  description: "Intelligent B2B Sales Operations Platform",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/odoo_styles.css" />
      </head>
      <body className="o_id_2472 o_website_url_home" is-ready="true">
        <div id="wrapwrap" className="o_openerp_website o_footer_effect_enable">
          
          <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container-fluid px-4">
              <a className="navbar-brand fw-bold" href="/" style={{ color: '#D6536D', fontSize: '1.5rem' }}>
                DealFlow360
              </a>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-medium">
                  <li className="nav-item"><a className="nav-link" href="/">Dashboard</a></li>
                  <li className="nav-item"><a className="nav-link" href="/deals">Deals</a></li>
                  <li className="nav-item"><a className="nav-link" href="/quotations">Quotations</a></li>
                  <li className="nav-item"><a className="nav-link" href="/bids">Bids</a></li>
                  <li className="nav-item"><a className="nav-link" href="/approvals">Approvals</a></li>
                  <li className="nav-item"><a className="nav-link" href="/fulfillment">Fulfillment</a></li>
                  <li className="nav-item"><a className="nav-link" href="/billing">Billing</a></li>
                  <li className="nav-item"><a className="nav-link" href="/customers">Customers</a></li>
                  <li className="nav-item"><a className="nav-link" href="/admin">Admin</a></li>
                </ul>
              </div>
            </div>
          </header>

          <main style={{ marginTop: '70px', padding: '20px' }}>
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
