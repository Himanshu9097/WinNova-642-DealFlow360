// Mock data for Billing & Invoicing
let MOCK_INVOICES = [
  {
    _id: 'INV-2026-001',
    invoiceNumber: 'INV-2026-001',
    customerId: { 
      _id: 'cust-1', 
      name: 'Acme Corp', 
      contact: 'John Doe', 
      email: 'john.doe@acmecorp.com', 
      address: '100 Silicon Way, San Jose, CA 95134' 
    },
    dealId: { _id: 'deal-1', title: 'Acme Security Upgrade' },
    quotationRef: 'QTN-2026-001',
    issueDate: '2026-08-15',
    dueDate: '2026-09-15',
    paymentTerms: 'Net 30',
    status: 'Pending',
    items: [
      { id: 1, description: 'Outdoor Camera IP68 8MP (100 units)', quantity: 100, unitPrice: 11050, total: 1105000 },
      { id: 2, description: 'PoE+ Injector High Capacity (100 units)', quantity: 100, unitPrice: 1350, total: 135000 }
    ],
    subtotal: 1240000,
    taxRate: 18,
    taxAmount: 223200,
    total: 1463200,
    paidAmount: 500000,
    balanceDue: 963200,
    currency: 'USD',
    notes: 'Standard 2-year warranty included. Payment due in 30 days.',
    paymentHistory: [
      {
        _id: 'pay-101',
        paymentNumber: 'PAY-2026-001',
        date: '2026-08-25',
        amount: 500000,
        method: 'Wire Transfer',
        reference: 'WT-ACME-88219',
        notes: 'Initial 34% milestone payment received.'
      }
    ],
    remindersSent: [
      { date: '2026-09-01', recipient: 'john.doe@acmecorp.com' }
    ]
  },
  {
    _id: 'INV-2026-002',
    invoiceNumber: 'INV-2026-002',
    customerId: { 
      _id: 'cust-2', 
      name: 'GlobalTech Inc', 
      contact: 'Sarah Jenkins', 
      email: 'sjenkins@globaltech.com', 
      address: '450 Innovation Blvd, Austin, TX 78701' 
    },
    dealId: { _id: 'deal-2', title: 'GlobalTech Servers' },
    quotationRef: 'QTN-2026-002',
    issueDate: '2026-07-20',
    dueDate: '2026-08-20',
    paymentTerms: 'Net 30',
    status: 'Overdue',
    items: [
      { id: 1, description: 'Enterprise Rackmount Servers Tier-2', quantity: 5, unitPrice: 90000, total: 450000 }
    ],
    subtotal: 450000,
    taxRate: 18,
    taxAmount: 81000,
    total: 531000,
    paidAmount: 150000,
    balanceDue: 381000,
    currency: 'USD',
    notes: 'Requires rack mounting documentation upon final disbursement.',
    paymentHistory: [
      {
        _id: 'pay-102',
        paymentNumber: 'PAY-2026-002',
        date: '2026-07-28',
        amount: 150000,
        method: 'Credit Card',
        reference: 'CC-AUTH-77312',
        notes: 'Deposit paid via corporate Amex.'
      }
    ],
    remindersSent: [
      { date: '2026-08-22', recipient: 'sjenkins@globaltech.com' },
      { date: '2026-08-30', recipient: 'sjenkins@globaltech.com' }
    ]
  },
  {
    _id: 'INV-2026-003',
    invoiceNumber: 'INV-2026-003',
    customerId: { 
      _id: 'cust-3', 
      name: 'City Municipality', 
      contact: 'Director Marcus Vance', 
      email: 'mvance@citygov.org', 
      address: '1 Civic Center Plaza, Chicago, IL 60602' 
    },
    dealId: { _id: 'deal-3', title: 'City Surveillance Tender' },
    quotationRef: 'QTN-2026-003',
    issueDate: '2026-09-01',
    dueDate: '2026-10-01',
    paymentTerms: 'Net 30',
    status: 'Pending',
    items: [
      { id: 1, description: 'Municipal CCTV Hardware Milestone 1', quantity: 1, unitPrice: 2100000, total: 2100000 }
    ],
    subtotal: 2100000,
    taxRate: 18,
    taxAmount: 378000,
    total: 2478000,
    paidAmount: 1000000,
    balanceDue: 1478000,
    currency: 'USD',
    notes: 'Government contract tender #GT-2026-991.',
    paymentHistory: [
      {
        _id: 'pay-103',
        paymentNumber: 'PAY-2026-003',
        date: '2026-09-03',
        amount: 1000000,
        method: 'Bank Wire',
        reference: 'FED-WIRE-992100',
        notes: 'Advance mobilization fund received.'
      }
    ],
    remindersSent: []
  },
  {
    _id: 'INV-2026-004',
    invoiceNumber: 'INV-2026-004',
    customerId: { 
      _id: 'cust-4', 
      name: 'EduNet Solutions', 
      contact: 'David Miller', 
      email: 'dmiller@edunet.edu', 
      address: '77 Campus Road, Boston, MA 02115' 
    },
    dealId: { _id: 'deal-4', title: 'EduNet Network Refresh' },
    quotationRef: 'QTN-2026-004',
    issueDate: '2026-08-01',
    dueDate: '2026-08-31',
    paymentTerms: 'Net 30',
    status: 'Paid',
    items: [
      { id: 1, description: 'Core Network Switches 48-Port PoE', quantity: 10, unitPrice: 55000, total: 550000 },
      { id: 2, description: 'Cat6A Structured Cabling & Termination', quantity: 1, unitPrice: 300000, total: 300000 }
    ],
    subtotal: 850000,
    taxRate: 18,
    taxAmount: 153000,
    total: 1003000,
    paidAmount: 1003000,
    balanceDue: 0,
    currency: 'USD',
    notes: 'Full settlement received on delivery and signoff.',
    paymentHistory: [
      {
        _id: 'pay-104',
        paymentNumber: 'PAY-2026-004',
        date: '2026-08-28',
        amount: 1003000,
        method: 'ACH Transfer',
        reference: 'ACH-EDUNET-5512',
        notes: 'Final settlement cleared.'
      }
    ],
    remindersSent: []
  },
  {
    _id: 'INV-2026-005',
    invoiceNumber: 'INV-2026-005',
    customerId: { 
      _id: 'cust-5', 
      name: 'NexaHealth Systems', 
      contact: 'Dr. Elena Rostova', 
      email: 'erostova@nexahealth.org', 
      address: '900 Medical Center Way, Seattle, WA 98104' 
    },
    dealId: { _id: 'deal-5', title: 'Hospital IoT Monitoring' },
    quotationRef: 'QTN-2026-005',
    issueDate: '2026-09-04',
    dueDate: '2026-09-19',
    paymentTerms: 'Net 15',
    status: 'Draft',
    items: [
      { id: 1, description: 'Patient Vital Sensor Hubs & Gateway (20 Units)', quantity: 20, unitPrice: 16000, total: 320000 }
    ],
    subtotal: 320000,
    taxRate: 18,
    taxAmount: 57600,
    total: 377600,
    paidAmount: 0,
    balanceDue: 377600,
    currency: 'USD',
    notes: 'Draft awaiting formal signoff from procurement department.',
    paymentHistory: [],
    remindersSent: []
  }
];

export const getInvoices = async () => {
  return Promise.resolve(JSON.parse(JSON.stringify(MOCK_INVOICES)));
};

export const getInvoiceById = async (id) => {
  const invoice = MOCK_INVOICES.find(inv => inv._id === id || inv.invoiceNumber === id);
  if (!invoice) return Promise.reject(new Error('Invoice not found'));
  return Promise.resolve(JSON.parse(JSON.stringify(invoice)));
};

export const recordPayment = async (invoiceId, paymentData) => {
  const invoice = MOCK_INVOICES.find(inv => inv._id === invoiceId || inv.invoiceNumber === invoiceId);
  if (!invoice) return Promise.reject(new Error('Invoice not found'));

  const amount = parseFloat(paymentData.amount);
  if (isNaN(amount) || amount <= 0) {
    return Promise.reject(new Error('Invalid payment amount'));
  }

  const paymentRecord = {
    _id: `pay-${Date.now()}`,
    paymentNumber: `PAY-2026-${String(invoice.paymentHistory.length + 1).padStart(3, '0')}`,
    date: paymentData.date || new Date().toISOString().split('T')[0],
    amount: amount,
    method: paymentData.method || 'Wire Transfer',
    reference: paymentData.reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    notes: paymentData.notes || 'Payment recorded by Finance'
  };

  invoice.paymentHistory.push(paymentRecord);
  invoice.paidAmount = Math.min(invoice.total, invoice.paidAmount + amount);
  invoice.balanceDue = Math.max(0, invoice.total - invoice.paidAmount);

  if (invoice.balanceDue === 0) {
    invoice.status = 'Paid';
  } else if (invoice.status === 'Draft') {
    invoice.status = 'Pending';
  }

  return Promise.resolve(JSON.parse(JSON.stringify(invoice)));
};

export const sendPaymentReminder = async (invoiceId) => {
  const invoice = MOCK_INVOICES.find(inv => inv._id === invoiceId || inv.invoiceNumber === invoiceId);
  if (!invoice) return Promise.reject(new Error('Invoice not found'));

  const reminder = {
    date: new Date().toISOString().split('T')[0],
    recipient: invoice.customerId?.email || 'customer@example.com'
  };

  invoice.remindersSent = invoice.remindersSent || [];
  invoice.remindersSent.push(reminder);

  return Promise.resolve({
    success: true,
    message: `Payment reminder successfully emailed to ${reminder.recipient}`,
    reminder
  });
};

export const createInvoice = async (data) => {
  const newId = `INV-2026-${String(MOCK_INVOICES.length + 1).padStart(3, '0')}`;
  
  const subtotal = (data.items || []).reduce((acc, item) => acc + (Number(item.quantity || 1) * Number(item.unitPrice || 0)), 0);
  const taxRate = data.taxRate !== undefined ? Number(data.taxRate) : 18;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const newInvoice = {
    _id: newId,
    invoiceNumber: newId,
    customerId: {
      _id: `cust-${Date.now()}`,
      name: data.customerName || 'New Client',
      contact: data.customerContact || 'Accounts Payable',
      email: data.customerEmail || 'billing@client.com',
      address: data.customerAddress || 'Client Corporate Office'
    },
    dealId: { _id: `deal-${Date.now()}`, title: data.dealTitle || 'Custom Deal' },
    quotationRef: data.quotationRef || 'QTN-DIRECT',
    issueDate: data.issueDate || new Date().toISOString().split('T')[0],
    dueDate: data.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    paymentTerms: data.paymentTerms || 'Net 30',
    status: data.status || 'Pending',
    items: data.items && data.items.length > 0 ? data.items.map((item, idx) => ({
      id: idx + 1,
      description: item.description || 'Item',
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unitPrice || 0),
      total: Number(item.quantity || 1) * Number(item.unitPrice || 0)
    })) : [
      { id: 1, description: 'Professional Services & Delivery', quantity: 1, unitPrice: subtotal || 10000, total: subtotal || 10000 }
    ],
    subtotal,
    taxRate,
    taxAmount,
    total,
    paidAmount: 0,
    balanceDue: total,
    currency: 'USD',
    notes: data.notes || 'Thank you for your business. Please remit payment by due date.',
    paymentHistory: [],
    remindersSent: []
  };

  MOCK_INVOICES.unshift(newInvoice);
  return Promise.resolve(JSON.parse(JSON.stringify(newInvoice)));
};

export const getBillingSummaryMetrics = async () => {
  const invoices = await getInvoices();
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue');
  const overdueAmount = overdueInvoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

  const pendingInvoices = invoices.filter(inv => inv.status === 'Pending');
  const pendingAmount = pendingInvoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

  const collectionRate = totalInvoiced > 0 ? ((totalCollected / totalInvoiced) * 100).toFixed(1) : 0;

  return Promise.resolve({
    totalInvoiced,
    totalCollected,
    totalOutstanding,
    overdueAmount,
    overdueCount: overdueInvoices.length,
    pendingAmount,
    pendingCount: pendingInvoices.length,
    collectionRate,
    totalCount: invoices.length
  });
};
