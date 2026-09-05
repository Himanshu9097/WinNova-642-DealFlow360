
import React from 'react';

export default function QuotationStatusBadge({ status }) {
  let badgeClass = 'secondary';
  
  switch (status) {
    case 'Draft':
      badgeClass = 'secondary';
      break;
    case 'Under Review':
    case 'Negotiation':
      badgeClass = 'info';
      break;
    case 'Approval Required':
    case 'Pending Manager Approval':
    case 'Pending Finance Approval':
      badgeClass = 'warning';
      break;
    case 'Approved':
    case 'Accepted':
      badgeClass = 'success';
      break;
    case 'Sent':
      badgeClass = 'primary';
      break;
    case 'Rejected':
    case 'Expired':
    case 'Returned for Revision':
      badgeClass = 'danger';
      break;
    default:
      badgeClass = 'secondary';
  }

  return (
    <span className={`badge bg-${badgeClass}`}>
      {status}
    </span>
  );
}
