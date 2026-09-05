'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import { getDeals, updateDealStage } from '../../services/dealService';

const STAGES = ['Discovery', 'Proposal', 'Negotiation', 'Closed Won'];

export default function DealList() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeals().then(data => {
      setDeals(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const moveDeal = (dealId, newStage) => {
    updateDealStage(dealId, newStage).then(() => {
      setDeals([...deals.map(d => d._id === dealId ? { ...d, stage: newStage } : d)]);
    });
  };

  if (loading) return <div className="container mt-5">Loading deals...</div>;

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
      <div className="container-fluid px-4 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{color: '#D6536D'}} className="mb-0">Deals Pipeline</h2>
            <span className="text-muted">Manage your opportunities</span>
          </div>
          <button className="btn btn-primary" style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}}>
            + New Deal
          </button>
        </div>

        {/* Kanban Board */}
        <div className="row g-3 overflow-auto flex-nowrap" style={{ minHeight: '65vh', paddingBottom: '20px' }}>
          {STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            
            return (
              <div key={stage} className="col-12 col-md-4 col-lg-3 d-flex flex-column" style={{ minWidth: '320px' }}>
                <div className="bg-light rounded-3 p-3 h-100 border shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 fw-bold text-uppercase text-secondary">{stage}</h6>
                    <span className="badge bg-secondary rounded-pill">{stageDeals.length}</span>
                  </div>
                  <div className="text-muted small mb-3">
                    Total: ${totalValue.toLocaleString()}
                  </div>
                  
                  <div className="d-flex flex-column gap-3">
                    {stageDeals.map(deal => (
                      <div key={deal._id} className="card border-0 shadow-sm deal-card">
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span className="small fw-bold text-muted">{deal.dealNumber}</span>
                            <span className={`badge bg-${deal.riskLevel === 'Critical' ? 'danger' : deal.riskLevel === 'High' ? 'warning' : 'success'}`} style={{fontSize: '0.65rem'}}>
                              {deal.riskLevel} Risk
                            </span>
                          </div>
                          
                          <h6 className="card-title mb-1">
                            <Link href={`/deals/${deal._id}`} className="text-decoration-none text-dark">
                              {deal.title}
                            </Link>
                          </h6>
                          <div className="small text-muted mb-3">
                            <i className="fa fa-building me-1"></i> {deal.customerId?.name}
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="fw-bold text-success">${deal.value?.toLocaleString()}</div>
                            {/* Dropdown for moving stages manually since we don't have drag and drop library installed */}
                            <div className="dropdown">
                              <button className="btn btn-sm btn-light border text-muted dropdown-toggle py-0 px-2" data-bs-toggle="dropdown" aria-expanded="false" style={{fontSize: '0.75rem'}}>
                                Move
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{fontSize: '0.85rem'}}>
                                {STAGES.map(s => (
                                  <li key={s}>
                                    <button 
                                      className={`dropdown-item ${s === deal.stage ? 'active' : ''}`}
                                      onClick={() => moveDeal(deal._id, s)}
                                    >
                                      {s}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="text-center p-4 border border-dashed rounded text-muted small">
                        No deals in this stage
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .deal-card { transition: transform 0.2s, box-shadow 0.2s; border-left: 4px solid #D6536D !important; }
        .deal-card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
        .border-dashed { border-style: dashed !important; }
      `}} />
    </ProtectedRoute>
  );
}
