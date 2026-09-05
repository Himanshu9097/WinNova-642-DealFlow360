import { getAuthHeaders } from '../utils/auth';

const API_URL = 'http://127.0.0.1:5006/api';

export const getInvoices = async () => {
  const res = await fetch(`${API_URL}/billing`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
};

export const getInvoiceById = async (id) => {
  const res = await fetch(`${API_URL}/billing/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch invoice');
  return res.json();
};

export const recordPayment = async (invoiceId, paymentData) => {
  const res = await fetch(`${API_URL}/billing/${invoiceId}/pay`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  });
  if (!res.ok) throw new Error('Failed to record payment');
  return res.json();
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

  return {
    totalInvoiced,
    totalCollected,
    totalOutstanding,
    overdueAmount,
    overdueCount: overdueInvoices.length,
    pendingAmount,
    pendingCount: pendingInvoices.length,
    collectionRate,
    totalCount: invoices.length
  };
};

export const createInvoice = async (data) => {
  // Mock as backend handles this automatically currently via Deal "Closed Won" hook
  return Promise.resolve({});
};

export const sendPaymentReminder = async (invoiceId) => {
  // Mock functionality
  return Promise.resolve({ success: true });
};
