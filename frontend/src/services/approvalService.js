const MOCK_APPROVALS = [
  {
    _id: 'app-1',
    requestNumber: 'APP-2026-001',
    type: 'Quotation Discount',
    reference: { id: 'QTN-2026-001', title: 'QTN-2026-001 (Acme Corp)' },
    requester: { name: 'Priya Mehta', role: 'Sales Manager' },
    status: 'Pending',
    details: 'Discount of 15% requested on security upgrade (Limit: 8%)',
    amount: 1240000,
    requestedAt: new Date(Date.now() - 40000000).toISOString()
  },
  {
    _id: 'app-2',
    requestNumber: 'APP-2026-002',
    type: 'Deal Margin Risk',
    reference: { id: 'DL-1002', title: 'GlobalTech Servers' },
    requester: { name: 'Amit Kumar', role: 'Sales Rep' },
    status: 'Pending',
    details: 'Deal risk classified as Medium, requires manager sign-off.',
    amount: 450000,
    requestedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'app-3',
    requestNumber: 'APP-2026-003',
    type: 'Credit Limit Exception',
    reference: { id: 'DL-1004', title: 'EduNet Network Refresh' },
    requester: { name: 'Priya Mehta', role: 'Sales Manager' },
    status: 'Approved',
    details: 'Customer credit limit exceeded by $50,000.',
    amount: 850000,
    requestedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

export const getApprovals = async () => {
  return Promise.resolve([...MOCK_APPROVALS]);
};

export const processApproval = async (id, action, comment) => {
  const approval = MOCK_APPROVALS.find(a => a._id === id);
  if (approval) {
    approval.status = action === 'APPROVE' ? 'Approved' : 'Rejected';
    approval.actionedAt = new Date().toISOString();
    approval.comment = comment;
  }
  return Promise.resolve(approval);
};
