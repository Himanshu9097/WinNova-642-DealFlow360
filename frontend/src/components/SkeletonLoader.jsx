export default function SkeletonLoader({ type = 'default' }) {
  if (type === 'table') {
    return (
      <div className="container-fluid px-4 py-4">
        <h2 className="placeholder-glow mb-4"><span className="placeholder col-3 rounded" style={{backgroundColor: '#e9ecef'}}></span></h2>
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="placeholder-glow">
              <div className="placeholder col-12 mb-3 rounded" style={{height: '50px', backgroundColor: '#e9ecef'}}></div>
              <div className="placeholder col-12 mb-2 rounded" style={{height: '40px', backgroundColor: '#f8f9fa'}}></div>
              <div className="placeholder col-12 mb-2 rounded" style={{height: '40px', backgroundColor: '#f8f9fa'}}></div>
              <div className="placeholder col-12 mb-2 rounded" style={{height: '40px', backgroundColor: '#f8f9fa'}}></div>
              <div className="placeholder col-12 mb-2 rounded" style={{height: '40px', backgroundColor: '#f8f9fa'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'kanban') {
    return (
      <div className="container-fluid px-4 py-4">
        <h2 className="placeholder-glow mb-4"><span className="placeholder col-2 rounded" style={{backgroundColor: '#e9ecef'}}></span></h2>
        <div className="row g-3 overflow-auto flex-nowrap">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="col-12 col-md-4 col-lg-3">
              <div className="bg-light rounded-3 p-3 placeholder-glow h-100 border">
                <div className="placeholder col-6 mb-4 rounded" style={{height: '24px', backgroundColor: '#e9ecef'}}></div>
                <div className="card border-0 mb-3"><div className="card-body placeholder col-12 rounded" style={{height: '110px', backgroundColor: '#fff'}}></div></div>
                <div className="card border-0 mb-3"><div className="card-body placeholder col-12 rounded" style={{height: '110px', backgroundColor: '#fff'}}></div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default detailed page
  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between mb-4 placeholder-glow">
        <div className="placeholder col-3 rounded" style={{height: '35px', backgroundColor: '#e9ecef'}}></div>
        <div className="placeholder col-2 rounded" style={{height: '35px', backgroundColor: '#e9ecef'}}></div>
      </div>
      <div className="row">
        <div className="col-md-7">
          <div className="placeholder-glow mb-4"><div className="placeholder col-12 rounded" style={{height: '300px', backgroundColor: '#f8f9fa'}}></div></div>
        </div>
        <div className="col-md-5">
          <div className="placeholder-glow"><div className="placeholder col-12 rounded" style={{height: '150px', backgroundColor: '#f8f9fa'}}></div></div>
          <div className="placeholder-glow mt-3"><div className="placeholder col-12 rounded" style={{height: '150px', backgroundColor: '#f8f9fa'}}></div></div>
        </div>
      </div>
    </div>
  );
}
