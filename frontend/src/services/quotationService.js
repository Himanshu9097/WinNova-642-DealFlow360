// Mock data for quotations if backend is not available
const MOCK_QUOTATIONS = [
  {
    _id: 'QTN-2026-001',
    quoteNumber: 'QTN-2026-001',
    dealId: { _id: 'deal-1', title: 'Acme Security Upgrade' },
    customerId: { _id: 'cust-1', name: 'Acme Corp' },
    formatType: 'Technical + Commercial',
    status: 'Approval Required',
    totalValue: 1240000,
    discountPct: 15,
    marginPct: 9.7,
    riskScore: 72,
    updatedAt: new Date().toISOString(),
    lines: [
      { productId: 'prod-1', name: 'Outdoor Camera IP68 8MP', quantity: 100, unitPrice: 13000, discountPct: 15, lineTotal: 1105000 },
      { productId: 'prod-2', name: 'PoE+ Injector', quantity: 100, unitPrice: 1500, discountPct: 10, lineTotal: 135000 }
    ],
    totals: { gross: 1450000, discount: 210000, net: 1240000, margin: 120280 },
    compliance: [
      { requirement: 'Ingress Protection', required: 'IP68', offered: 'IP68', status: 'PASS' },
      { requirement: 'Resolution', required: '8MP', offered: '8MP', status: 'PASS' },
      { requirement: 'Power', required: 'PoE+', offered: 'PoE+', status: 'PASS' },
      { requirement: 'Warranty', required: '2 Years', offered: '2 Years', status: 'PASS' }
    ],
    allowedDiscount: 8,
    approvalState: 'Pending Manager Approval',
    riskImpact: 'High',
    marginImpact: 'High',
    events: [
      { id: 1, text: 'Quotation created', date: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, text: 'Technical compliance checked', date: new Date(Date.now() - 80000000).toISOString() },
      { id: 3, text: 'Discount changed from 8% to 15%', date: new Date(Date.now() - 50000000).toISOString() },
      { id: 4, text: 'Approval triggered', date: new Date(Date.now() - 40000000).toISOString() }
    ]
  },
  {
    _id: 'QTN-2026-002',
    quoteNumber: 'QTN-2026-002',
    dealId: { _id: 'deal-2', title: 'GlobalTech Servers' },
    customerId: { _id: 'cust-2', name: 'GlobalTech Inc' },
    formatType: 'Commercial',
    status: 'Sent',
    totalValue: 450000,
    discountPct: 5,
    marginPct: 22.4,
    riskScore: 25,
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    lines: [],
    totals: { gross: 473684, discount: 23684, net: 450000, margin: 100800 },
    compliance: [],
    allowedDiscount: 10,
    approvalState: 'Approved',
    events: []
  },
  {
    _id: 'QTN-2026-003',
    quoteNumber: 'QTN-2026-003',
    dealId: { _id: 'deal-3', title: 'City Surveillance Tender' },
    customerId: { _id: 'cust-3', name: 'City Municipality' },
    formatType: 'Bid / Tender',
    status: 'Negotiation',
    totalValue: 5500000,
    discountPct: 20,
    marginPct: 8.5,
    riskScore: 85,
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
    lines: [],
    totals: { gross: 6875000, discount: 1375000, net: 5500000, margin: 467500 },
    compliance: [],
    allowedDiscount: 15,
    approvalState: 'Approved',
    events: []
  }
];

export const getQuotations = async () => {
  // In a real scenario, this would be:
  // const res = await fetch('http://localhost:5006/api/quotations');
  // return res.json();
  return Promise.resolve(MOCK_QUOTATIONS);
};

export const getQuotation = async (id) => {
  // const res = await fetch(`http://localhost:5006/api/quotations/${id}`);
  // return res.json();
  const q = MOCK_QUOTATIONS.find(q => q._id === id || q.quoteNumber === id);
  return Promise.resolve(q || null);
};

export const createQuotation = async (data) => {
  console.log("Mock create quotation:", data);
  const newQ = {
    ...data,
    _id: `QTN-${Math.floor(Math.random() * 100000)}`,
    quoteNumber: `QTN-2026-NEW`,
    status: 'Draft',
    updatedAt: new Date().toISOString()
  };
  MOCK_QUOTATIONS.push(newQ);
  return Promise.resolve(newQ);
};

export const submitForApproval = async (id, currentQuote) => {
  let quote = MOCK_QUOTATIONS.find(q => q._id === id || q.quoteNumber === id);
  if (!quote && currentQuote) {
    quote = currentQuote;
  }
  if (quote) {
    quote.status = 'Approval Required';
    quote.approvalState = 'Pending Manager Approval';
    if (!quote.events) quote.events = [];
    quote.events.push({
      id: Date.now(),
      text: 'Submitted for approval',
      date: new Date().toISOString()
    });
  }
  return Promise.resolve(quote);
};

export const updateQuotation = async (id, data) => {
  const index = MOCK_QUOTATIONS.findIndex(q => q._id === id || q.quoteNumber === id);
  if (index !== -1) {
    const updated = {
      ...MOCK_QUOTATIONS[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    if (!updated.events) updated.events = [];
    updated.events.push({
      id: Date.now(),
      text: 'Quotation updated',
      date: new Date().toISOString()
    });
    MOCK_QUOTATIONS[index] = updated;
    return Promise.resolve(updated);
  }
  return Promise.resolve(null);
};
