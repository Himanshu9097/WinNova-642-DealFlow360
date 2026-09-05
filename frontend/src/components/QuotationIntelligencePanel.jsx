'use client';

import React from 'react';

export default function QuotationIntelligencePanel({ data }) {
  const isDiscountHigh = data.discountPct > (data.allowedDiscount || 0);

  return (
    <div className="card shadow-sm border-0 mb-4" style={{borderTop: '4px solid #17a2b8'}}>
      <div className="card-body">
        <h5 className="card-title text-info"><i className="fa fa-robot me-2"></i> Quotation Intelligence</h5>
        <hr />
        
        <div className="mb-3">
          <label className="text-muted small text-uppercase">Quotation Value</label>
          <div className="fs-5 fw-bold text-dark">₹{(data.totalValue || 0).toLocaleString()}</div>
        </div>

        <div className="mb-3">
          <label className="text-muted small text-uppercase">Discount Governance</label>
          <div className="d-flex justify-content-between align-items-center">
            <span>Requested: <strong>{data.discountPct}%</strong></span>
            <span className="text-muted">Allowed: {data.allowedDiscount}%</span>
          </div>
          {isDiscountHigh && (
            <div className="alert alert-danger mt-2 mb-0 py-2 small">
              <i className="fa fa-exclamation-triangle me-1"></i> Discount Policy Exceeded
              <br/>
              <span className="text-muted">Manager approval required</span>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="text-muted small text-uppercase">Margin (Internal Only)</label>
          <div className="fs-5 fw-bold text-success">{data.marginPct}%</div>
        </div>

        <div className="mb-3">
          <label className="text-muted small text-uppercase">Risk Score</label>
          <div className={`fs-5 fw-bold text-${data.riskScore > 60 ? 'danger' : data.riskScore > 30 ? 'warning' : 'success'}`}>
            {data.riskScore} / 100
          </div>
          {data.riskScore > 60 && <div className="small text-danger">High Risk</div>}
        </div>

        {data.formatType === 'Technical + Commercial' && data.compliance && (
          <div className="mb-3">
            <label className="text-muted small text-uppercase">Technical Compliance</label>
            {data.compliance.every(c => c.status === 'PASS') ? (
              <div className="fs-5 text-success"><i className="fa fa-check-circle me-1"></i> {data.compliance.length} / {data.compliance.length} PASS</div>
            ) : (
              <div className="fs-5 text-danger"><i className="fa fa-times-circle me-1"></i> Compliance Failed</div>
            )}
          </div>
        )}

        <div className="mb-3">
          <label className="text-muted small text-uppercase">Approval State</label>
          <div className={`d-flex align-items-center mb-1 text-${data.approvalState?.includes('Pending') || data.approvalState?.includes('Required') ? 'warning' : data.approvalState === 'Approved' ? 'success' : 'secondary'}`}>
            {data.approvalState?.includes('Pending') || data.approvalState?.includes('Required') ? (
              <i className="fa fa-exclamation-circle me-2"></i>
            ) : data.approvalState === 'Approved' ? (
              <i className="fa fa-check-circle me-2"></i>
            ) : null}
            <strong>{data.approvalState || 'No Approval Required'}</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
