const MOCK_DEALS = [
  {
    _id: 'deal-1',
    dealNumber: 'DL-1001',
    title: 'Acme Security Upgrade',
    customerId: { _id: 'cust-1', name: 'Acme Corp', logo: 'A' },
    stage: 'Negotiation',
    value: 1450000,
    riskLevel: 'Low',
    approvalStatus: 'Approved',
    estimatedMargin: 120280,
    closeDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    owner: 'Amit Kumar'
  },
  {
    _id: 'deal-2',
    dealNumber: 'DL-1002',
    title: 'GlobalTech Servers Expansion',
    customerId: { _id: 'cust-2', name: 'GlobalTech Inc', logo: 'G' },
    stage: 'Proposal',
    value: 450000,
    riskLevel: 'Medium',
    approvalStatus: 'Pending',
    estimatedMargin: 100800,
    closeDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    owner: 'Priya Mehta'
  },
  {
    _id: 'deal-3',
    dealNumber: 'DL-1003',
    title: 'City Surveillance Tender',
    customerId: { _id: 'cust-3', name: 'City Municipality', logo: 'C' },
    stage: 'Discovery',
    value: 5500000,
    riskLevel: 'Critical',
    approvalStatus: 'Not Required',
    estimatedMargin: 467500,
    closeDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    owner: 'Rahul Sharma'
  },
  {
    _id: 'deal-4',
    dealNumber: 'DL-1004',
    title: 'EduNet Network Refresh',
    customerId: { _id: 'cust-4', name: 'EduNet Solutions', logo: 'E' },
    stage: 'Closed Won',
    value: 850000,
    riskLevel: 'Low',
    approvalStatus: 'Approved',
    estimatedMargin: 170000,
    closeDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    owner: 'Priya Mehta'
  }
];

export const getDeals = async () => {
  return Promise.resolve(MOCK_DEALS);
};

export const getDeal = async (id) => {
  const deal = MOCK_DEALS.find(d => d._id === id || d.dealNumber === id);
  if (!deal) return Promise.resolve(null);
  
  // Mock requirements
  const requirements = [
    { _id: 'req-1', label: 'Ingress Protection', requiredValue: 'IP68', offeredValue: 'IP68', mandatory: true, status: 'PASS' },
    { _id: 'req-2', label: 'Resolution', requiredValue: '8MP', offeredValue: '8MP', mandatory: true, status: 'PASS' }
  ];
  
  return Promise.resolve({ deal, requirements });
};

export const updateDealStage = async (id, newStage) => {
  const deal = MOCK_DEALS.find(d => d._id === id || d.dealNumber === id);
  if (deal) {
    deal.stage = newStage;
  }
  return Promise.resolve(deal);
};
