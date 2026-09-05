'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  getInvoices, 
  getBillingSummaryMetrics, 
  recordPayment, 
  sendPaymentReminder, 
  createInvoice 
} from '../../services/billingService';

export default function BillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, Pending, Overdue, Paid, ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notification, setNotification] = useState(null);

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Record payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'Wire Transfer',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Create invoice form state
  const [createForm, setCreateForm] = useState({
    customerName: '',
    customerContact: '',
    customerEmail: '',
    customerAddress: '',
    dealTitle: '',
    quotationRef: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    paymentTerms: 'Net 30',
    taxRate: 18,
    notes: 'Thank you for your business. Remit payment to Acme Technologies.',
    items: [
      { description: 'Hardware Implementation & Licensing', quantity: 1, unitPrice: 250000 }
    ]
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, metricData] = await Promise.all([
        getInvoices(),
        getBillingSummaryMetrics()
      ]);
      setInvoices(invData);
      setMetrics(metricData);
    } catch (err) {
      console.error('Error loading billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Tab filter
      if (activeTab === 'Pending' && inv.status !== 'Pending') return false;
      if (activeTab === 'Overdue' && inv.status !== 'Overdue') return false;
      if (activeTab === 'Paid' && inv.status !== 'Paid') return false;

      // Status dropdown filter
      if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;

      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(query);
        const matchCustomer = inv.customerId?.name?.toLowerCase().includes(query);
        const matchDeal = inv.dealId?.title?.toLowerCase().includes(query);
        const matchRef = inv.quotationRef?.toLowerCase().includes(query);
        if (!matchNumber && !matchCustomer && !matchDeal && !matchRef) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, activeTab, statusFilter, searchQuery]);

  // All payment transactions flat list for ledger tab
  const allPayments = useMemo(() => {
    const list = [];
    invoices.forEach(inv => {
      (inv.paymentHistory || []).forEach(pay => {
        list.push({
          ...pay,
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customerId?.name,
          invoiceTotal: inv.total
        });
      });
    });
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [invoices]);

  // Open Record Payment Modal
  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.balanceDue > 0 ? invoice.balanceDue : '',
      method: 'Wire Transfer',
      reference: `WT-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      notes: `Payment for ${invoice.invoiceNumber}`
    });
    setShowPaymentModal(true);
  };

  // Submit Payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const updated = await recordPayment(selectedInvoice._id, paymentForm);
      setShowPaymentModal(false);
      triggerNotification(`Payment of $${Number(paymentForm.amount).toLocaleString()} successfully recorded for ${selectedInvoice.invoiceNumber}.`, 'success');
      await loadData();
      if (showViewModal) {
        setSelectedInvoice(updated);
      }
    } catch (err) {
      alert(err.message || 'Failed to record payment');
    }
  };

  // Send Reminder
  const handleSendReminder = async (invoiceId, invoiceNumber) => {
    try {
      const res = await sendPaymentReminder(invoiceId);
      triggerNotification(res.message || `Payment reminder sent for ${invoiceNumber}`, 'info');
      await loadData();
    } catch (err) {
      alert('Failed to send reminder');
    }
  };

  // View Invoice
  const handleOpenViewModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  // Line items helper for create invoice modal
  const handleItemChange = (index, field, value) => {
    const updated = [...createForm.items];
    updated[index][field] = value;
    setCreateForm({ ...createForm, items: updated });
  };

  const handleAddItem = () => {
    setCreateForm({
      ...createForm,
      items: [...createForm.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    if (createForm.items.length <= 1) return;
    const updated = createForm.items.filter((_, i) => i !== index);
    setCreateForm({ ...createForm, items: updated });
  };

  const computedCreateSubtotal = useMemo(() => {
    return createForm.items.reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
  }, [createForm.items]);

  const computedCreateTax = useMemo(() => {
    return (computedCreateSubtotal * Number(createForm.taxRate || 0)) / 100;
  }, [computedCreateSubtotal, createForm.taxRate]);

  const computedCreateTotal = computedCreateSubtotal + computedCreateTax;

  // Submit Create Invoice
  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (!createForm.customerName.trim()) {
      alert('Please enter a Customer Name');
      return;
    }

    try {
      const newInv = await createInvoice(createForm);
      setShowCreateModal(false);
      triggerNotification(`New Invoice ${newInv.invoiceNumber} created successfully!`, 'success');
      // Reset form
      setCreateForm({
        customerName: '',
        customerContact: '',
        customerEmail: '',
        customerAddress: '',
        dealTitle: '',
        quotationRef: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        paymentTerms: 'Net 30',
        taxRate: 18,
        notes: 'Thank you for your business. Remit payment to Acme Technologies.',
        items: [{ description: 'Hardware Implementation & Licensing', quantity: 1, unitPrice: 250000 }]
      });
      await loadData();
    } catch (err) {
      alert('Failed to create invoice');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Invoice #', 'Customer', 'Deal', 'Issue Date', 'Due Date', 'Status', 'Total ($)', 'Paid ($)', 'Balance Due ($)'];
    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      `"${inv.customerId?.name || ''}"`,
      `"${inv.dealId?.title || ''}"`,
      inv.issueDate,
      inv.dueDate,
      inv.status,
      inv.total,
      inv.paidAmount,
      inv.balanceDue
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dealflow_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper badge for status
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="badge bg-success-subtle text-success border border-success px-2 py-1 rounded-pill fw-semibold">✓ Paid</span>;
      case 'Pending':
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning px-2 py-1 rounded-pill fw-semibold">⏳ Pending</span>;
      case 'Overdue':
        return <span className="badge bg-danger-subtle text-danger border border-danger px-2 py-1 rounded-pill fw-semibold">⚠ Overdue</span>;
      case 'Draft':
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary px-2 py-1 rounded-pill fw-semibold">Draft</span>;
      default:
        return <span className="badge bg-light text-dark border px-2 py-1 rounded-pill">{status}</span>;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'FINANCE']}>
      <div className="min-vh-100 bg-light py-4">
        <div className="container-fluid px-4 px-lg-5">

          {/* Toast / Notification Banner */}
          {notification && (
            <div className={`alert alert-${notification.type} alert-dismissible fade show shadow-sm border-0 d-flex align-items-center mb-4`} role="alert">
              <span className="me-2 fs-5">
                {notification.type === 'success' ? '✅' : notification.type === 'info' ? 'ℹ️' : '⚠️'}
              </span>
              <div>{notification.msg}</div>
              <button type="button" className="btn-close ms-auto" onClick={() => setNotification(null)}></button>
            </div>
          )}

          {/* Header Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2 className="fw-bold mb-0" style={{ color: '#D6536D' }}>Billing & Invoicing</h2>
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1 small">
                  Finance Workspace
                </span>
              </div>
              <p className="text-muted mb-0">
                Track enterprise receivables, record settlements, issue tax invoices, and monitor collection health.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button 
                onClick={handleExportCSV}
                className="btn btn-outline-secondary shadow-sm bg-white d-flex align-items-center gap-2"
                title="Export current table to CSV"
              >
                <span>📥</span> Export CSV
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn text-white shadow-sm d-flex align-items-center gap-2 fw-semibold px-3"
                style={{ backgroundColor: '#D6536D', borderColor: '#D6536D' }}
              >
                <span>+</span> Create Invoice
              </button>
            </div>
          </div>

          {/* Financial KPI Summary Cards */}
          {metrics && (
            <div className="row g-3 mb-4">
              {/* Card 1: Total Invoiced */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-body p-3 p-xl-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted fw-semibold small text-uppercase">Total Receivables</span>
                      <span className="p-2 rounded-circle bg-primary-subtle text-primary" style={{ fontSize: '1rem' }}>
                        📊
                      </span>
                    </div>
                    <h3 className="fw-bold mb-1 text-dark">${metrics.totalInvoiced.toLocaleString()}</h3>
                    <div className="small text-muted">
                      Across <strong>{metrics.totalCount}</strong> issued invoices
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Collected */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-3 h-100" style={{ borderLeft: '4px solid #198754' }}>
                  <div className="card-body p-3 p-xl-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted fw-semibold small text-uppercase">Total Collected</span>
                      <span className="p-2 rounded-circle bg-success-subtle text-success" style={{ fontSize: '1rem' }}>
                        💰
                      </span>
                    </div>
                    <h3 className="fw-bold mb-1 text-success">${metrics.totalCollected.toLocaleString()}</h3>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          role="progressbar" 
                          style={{ width: `${metrics.collectionRate}%` }} 
                        />
                      </div>
                      <span className="small text-success fw-bold">{metrics.collectionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Pending Invoices */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-3 h-100" style={{ borderLeft: '4px solid #ffc107' }}>
                  <div className="card-body p-3 p-xl-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted fw-semibold small text-uppercase">Pending Receivables</span>
                      <span className="p-2 rounded-circle bg-warning-subtle text-warning-emphasis" style={{ fontSize: '1rem' }}>
                        ⏳
                      </span>
                    </div>
                    <h3 className="fw-bold mb-1 text-warning-emphasis">${metrics.pendingAmount.toLocaleString()}</h3>
                    <div className="small text-muted">
                      <strong>{metrics.pendingCount}</strong> invoices within grace period
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Overdue Alert */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card border-0 shadow-sm rounded-3 h-100" style={{ borderLeft: '4px solid #dc3545' }}>
                  <div className="card-body p-3 p-xl-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted fw-semibold small text-uppercase">Overdue Risk</span>
                      <span className="p-2 rounded-circle bg-danger-subtle text-danger" style={{ fontSize: '1rem' }}>
                        ⚠️
                      </span>
                    </div>
                    <h3 className="fw-bold mb-1 text-danger">${metrics.overdueAmount.toLocaleString()}</h3>
                    <div className="small text-danger fw-semibold">
                      {metrics.overdueCount > 0 ? `Requires prompt follow-up (${metrics.overdueCount} account)` : 'No overdue accounts'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs & Filter Bar Card */}
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                {/* Tabs */}
                <div className="nav nav-pills gap-2">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`nav-link px-3 py-2 rounded-pill fw-semibold ${activeTab === 'all' ? 'active' : 'text-secondary bg-light'}`}
                    style={activeTab === 'all' ? { backgroundColor: '#D6536D' } : {}}
                  >
                    All Invoices <span className="badge bg-white text-dark ms-1 rounded-pill">{invoices.length}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('Pending')}
                    className={`nav-link px-3 py-2 rounded-pill fw-semibold ${activeTab === 'Pending' ? 'active' : 'text-secondary bg-light'}`}
                    style={activeTab === 'Pending' ? { backgroundColor: '#ffc107', color: '#000' } : {}}
                  >
                    Pending <span className="badge bg-light text-dark ms-1 rounded-pill">{invoices.filter(i => i.status === 'Pending').length}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('Overdue')}
                    className={`nav-link px-3 py-2 rounded-pill fw-semibold ${activeTab === 'Overdue' ? 'active' : 'text-secondary bg-light'}`}
                    style={activeTab === 'Overdue' ? { backgroundColor: '#dc3545' } : {}}
                  >
                    Overdue <span className="badge bg-white text-danger ms-1 rounded-pill">{invoices.filter(i => i.status === 'Overdue').length}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('Paid')}
                    className={`nav-link px-3 py-2 rounded-pill fw-semibold ${activeTab === 'Paid' ? 'active' : 'text-secondary bg-light'}`}
                    style={activeTab === 'Paid' ? { backgroundColor: '#198754' } : {}}
                  >
                    Settled <span className="badge bg-white text-success ms-1 rounded-pill">{invoices.filter(i => i.status === 'Paid').length}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('ledger')}
                    className={`nav-link px-3 py-2 rounded-pill fw-semibold ${activeTab === 'ledger' ? 'active' : 'text-secondary bg-light'}`}
                    style={activeTab === 'ledger' ? { backgroundColor: '#495057' } : {}}
                  >
                    Payment Ledger <span className="badge bg-white text-dark ms-1 rounded-pill">{allPayments.length}</span>
                  </button>
                </div>

                {/* Search & Filter Controls */}
                {activeTab !== 'ledger' && (
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <div className="input-group shadow-sm" style={{ maxWidth: '280px' }}>
                      <span className="input-group-text bg-white border-end-0 text-muted">🔍</span>
                      <input 
                        type="text" 
                        className="form-control border-start-0" 
                        placeholder="Search invoice or client..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearchQuery('')}>×</button>
                      )}
                    </div>

                    <select 
                      className="form-select shadow-sm" 
                      style={{ width: 'auto' }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Paid">Paid</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          {loading ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="spinner-border text-danger mx-auto mb-3" role="status"></div>
              <p className="text-muted">Loading billing ledgers and invoices...</p>
            </div>
          ) : activeTab === 'ledger' ? (
            /* TAB: PAYMENT LEDGER */
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-dark">Chronological Payment Audit Ledger</h5>
                <span className="text-muted small">Total Recorded: <strong>${allPayments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</strong></span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted small text-uppercase">
                    <tr>
                      <th className="ps-4">Receipt #</th>
                      <th>Date</th>
                      <th>Invoice #</th>
                      <th>Customer</th>
                      <th>Method</th>
                      <th>Transaction Ref</th>
                      <th>Amount</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPayments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5 text-muted">No recorded payments found in ledger.</td>
                      </tr>
                    ) : (
                      allPayments.map(payment => (
                        <tr key={payment._id}>
                          <td className="ps-4 fw-bold text-dark">{payment.paymentNumber}</td>
                          <td className="text-muted">{payment.date}</td>
                          <td>
                            <span className="badge bg-light text-dark border">{payment.invoiceNumber}</span>
                          </td>
                          <td className="fw-semibold text-dark">{payment.customerName}</td>
                          <td>
                            <span className="badge bg-info-subtle text-info-emphasis border px-2 py-1">
                              {payment.method}
                            </span>
                          </td>
                          <td className="font-monospace small text-muted">{payment.reference}</td>
                          <td className="fw-bold text-success fs-6">${payment.amount.toLocaleString()}</td>
                          <td className="text-muted small text-truncate" style={{ maxWidth: '220px' }}>
                            {payment.notes || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* TAB: INVOICES TABLE */
            <div className="card border-0 shadow-sm rounded-3">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted small text-uppercase">
                    <tr>
                      <th className="ps-4 py-3">Invoice Details</th>
                      <th className="py-3">Customer & Deal</th>
                      <th className="py-3">Due Date</th>
                      <th className="py-3 text-end">Total Amount</th>
                      <th className="py-3 text-center" style={{ minWidth: '160px' }}>Payment Status</th>
                      <th className="py-3 text-center">Status</th>
                      <th className="py-3 text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5">
                          <div className="text-muted">
                            <div className="fs-1 mb-2">📄</div>
                            <div className="fw-bold fs-6">No Invoices Match Your Criteria</div>
                            <small>Try clearing your filters or create a new invoice.</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map(inv => {
                        const isOverdue = inv.status === 'Overdue';
                        const percentPaid = inv.total > 0 ? Math.round((inv.paidAmount / inv.total) * 100) : 0;

                        return (
                          <tr key={inv._id}>
                            {/* Invoice Details */}
                            <td className="ps-4">
                              <div className="fw-bold text-dark d-flex align-items-center gap-2">
                                <span>{inv.invoiceNumber}</span>
                                {inv.quotationRef && (
                                  <span className="badge bg-light text-muted border small" style={{ fontSize: '0.7rem' }}>
                                    {inv.quotationRef}
                                  </span>
                                )}
                              </div>
                              <small className="text-muted">Issued: {inv.issueDate}</small>
                            </td>

                            {/* Customer & Deal */}
                            <td>
                              <div className="fw-bold text-dark">{inv.customerId?.name}</div>
                              <small className="text-muted">{inv.dealId?.title || 'Direct Billing'}</small>
                            </td>

                            {/* Due Date */}
                            <td>
                              <div className={`fw-semibold ${isOverdue ? 'text-danger' : 'text-dark'}`}>
                                {inv.dueDate}
                              </div>
                              <small className="text-muted">
                                {isOverdue ? (
                                  <span className="text-danger fw-bold">Past Due</span>
                                ) : (
                                  inv.paymentTerms || 'Net 30'
                                )}
                              </small>
                            </td>

                            {/* Total Amount */}
                            <td className="text-end">
                              <div className="fw-bold text-dark fs-6">
                                ${inv.total.toLocaleString()}
                              </div>
                              <small className="text-muted">
                                Tax: ${inv.taxAmount?.toLocaleString() || 0}
                              </small>
                            </td>

                            {/* Payment Progress */}
                            <td className="px-3">
                              <div className="d-flex justify-content-between small mb-1">
                                <span className="text-success fw-bold">${inv.paidAmount.toLocaleString()}</span>
                                <span className="text-muted">${inv.balanceDue.toLocaleString()} due</span>
                              </div>
                              <div className="progress" style={{ height: '6px' }}>
                                <div 
                                  className={`progress-bar ${inv.status === 'Paid' ? 'bg-success' : isOverdue ? 'bg-danger' : 'bg-warning'}`}
                                  style={{ width: `${percentPaid}%` }}
                                />
                              </div>
                            </td>

                            {/* Status */}
                            <td className="text-center">
                              {renderStatusBadge(inv.status)}
                            </td>

                            {/* Actions */}
                            <td className="text-end pe-4">
                              <div className="d-flex justify-content-end gap-1">
                                <button 
                                  onClick={() => handleOpenViewModal(inv)}
                                  className="btn btn-sm btn-outline-secondary"
                                  title="View & Print Invoice"
                                >
                                  View
                                </button>
                                
                                {inv.balanceDue > 0 && (
                                  <button 
                                    onClick={() => handleOpenPaymentModal(inv)}
                                    className="btn btn-sm btn-outline-success fw-semibold"
                                    title="Record payment receipt"
                                  >
                                    Pay
                                  </button>
                                )}

                                {inv.status !== 'Paid' && inv.status !== 'Draft' && (
                                  <button 
                                    onClick={() => handleSendReminder(inv._id, inv.invoiceNumber)}
                                    className="btn btn-sm btn-outline-warning"
                                    title="Send payment reminder email"
                                  >
                                    🔔
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: VIEW & PRINT INVOICE                               */}
      {/* ========================================================= */}
      {showViewModal && selectedInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content shadow-lg border-0">
              
              {/* Modal Header */}
              <div className="modal-header bg-light border-bottom d-print-none">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modal-title fw-bold text-dark">Invoice: {selectedInvoice.invoiceNumber}</h5>
                  {renderStatusBadge(selectedInvoice.status)}
                </div>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>

              {/* Printable Invoice Body */}
              <div className="modal-body p-4 p-md-5" id="printable-invoice">
                {/* Brand & Invoice Meta */}
                <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                  <div>
                    <h3 className="fw-bold mb-1" style={{ color: '#D6536D' }}>Acme Technologies Inc.</h3>
                    <p className="text-muted small mb-0">Enterprise Software & Security Solutions</p>
                    <p className="text-muted small mb-0">100 Technology Park, Suite 400</p>
                    <p className="text-muted small mb-0">finance@acmetechnologies.com | +1 (800) 555-DEAL</p>
                  </div>
                  <div className="text-end">
                    <h2 className="fw-bold text-secondary mb-1">INVOICE</h2>
                    <div className="fw-bold text-dark fs-5">{selectedInvoice.invoiceNumber}</div>
                    <div className="text-muted small">Date: <strong>{selectedInvoice.issueDate}</strong></div>
                    <div className="text-muted small">Due Date: <strong>{selectedInvoice.dueDate}</strong></div>
                    <div className="text-muted small">Terms: <strong>{selectedInvoice.paymentTerms || 'Net 30'}</strong></div>
                  </div>
                </div>

                {/* Billed To & Deal References */}
                <div className="row mb-4">
                  <div className="col-6">
                    <h6 className="text-uppercase text-muted small fw-bold mb-2">Billed To:</h6>
                    <div className="fw-bold text-dark fs-6">{selectedInvoice.customerId?.name}</div>
                    <div className="text-muted small">{selectedInvoice.customerId?.contact}</div>
                    <div className="text-muted small">{selectedInvoice.customerId?.email}</div>
                    <div className="text-muted small">{selectedInvoice.customerId?.address || 'Corporate Headquarters'}</div>
                  </div>
                  <div className="col-6 text-end">
                    <h6 className="text-uppercase text-muted small fw-bold mb-2">Order References:</h6>
                    <div className="small"><strong>Deal:</strong> {selectedInvoice.dealId?.title || 'Direct Order'}</div>
                    {selectedInvoice.quotationRef && (
                      <div className="small"><strong>Quote Ref:</strong> {selectedInvoice.quotationRef}</div>
                    )}
                    <div className="small"><strong>Currency:</strong> {selectedInvoice.currency || 'USD'}</div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="table-responsive mb-4">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light text-muted small text-uppercase">
                      <tr>
                        <th style={{ width: '5%' }}>#</th>
                        <th>Description</th>
                        <th className="text-center" style={{ width: '12%' }}>Qty</th>
                        <th className="text-end" style={{ width: '20%' }}>Unit Price</th>
                        <th className="text-end" style={{ width: '22%' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedInvoice.items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="text-muted">{idx + 1}</td>
                          <td className="fw-semibold text-dark">{item.description}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">${Number(item.unitPrice).toLocaleString()}</td>
                          <td className="text-end fw-bold">${Number(item.total || (item.quantity * item.unitPrice)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary */}
                <div className="row justify-content-end mb-4">
                  <div className="col-md-6 col-lg-5">
                    <div className="bg-light p-3 rounded-3 border">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Subtotal:</span>
                        <span className="fw-semibold text-dark">${selectedInvoice.subtotal?.toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Tax ({selectedInvoice.taxRate || 18}% GST/VAT):</span>
                        <span className="fw-semibold text-dark">${selectedInvoice.taxAmount?.toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between border-top pt-2 mb-2">
                        <span className="fw-bold text-dark fs-6">Grand Total:</span>
                        <span className="fw-bold fs-5" style={{ color: '#D6536D' }}>${selectedInvoice.total?.toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between text-success mb-2">
                        <span>Paid to Date:</span>
                        <span className="fw-semibold">-${selectedInvoice.paidAmount?.toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between border-top pt-2">
                        <span className="fw-bold text-dark">Balance Due:</span>
                        <span className={`fw-bold fs-5 ${selectedInvoice.balanceDue > 0 ? 'text-danger' : 'text-success'}`}>
                          ${selectedInvoice.balanceDue?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment History Section */}
                {selectedInvoice.paymentHistory && selectedInvoice.paymentHistory.length > 0 && (
                  <div className="border-top pt-3 mb-4">
                    <h6 className="fw-bold text-secondary text-uppercase small mb-2">Payment Receipts Applied:</h6>
                    <table className="table table-sm table-bordered small">
                      <thead className="table-light">
                        <tr>
                          <th>Payment #</th>
                          <th>Date</th>
                          <th>Method</th>
                          <th>Reference Code</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.paymentHistory.map((p, i) => (
                          <tr key={i}>
                            <td>{p.paymentNumber}</td>
                            <td>{p.date}</td>
                            <td>{p.method}</td>
                            <td className="font-monospace">{p.reference}</td>
                            <td className="text-end text-success fw-bold">${p.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Remittance & Notes */}
                <div className="border-top pt-3 text-muted small">
                  <div className="row">
                    <div className="col-md-7">
                      <strong>Payment Instructions / Wire Remittance:</strong>
                      <div>Bank: Silicon Valley Commercial Bank</div>
                      <div>Routing: 121000358 | Account: 9940-2810-4491</div>
                      <div>Beneficiary: Acme Technologies Inc.</div>
                    </div>
                    <div className="col-md-5 text-md-end mt-2 mt-md-0">
                      <strong>Notes:</strong>
                      <p className="mb-0">{selectedInvoice.notes || 'Payment is requested via bank wire or approved corporate ACH.'}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-light d-print-none">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-dark" 
                  onClick={() => window.print()}
                >
                  🖨️ Print / Save PDF
                </button>
                {selectedInvoice.balanceDue > 0 && (
                  <button 
                    type="button" 
                    className="btn btn-success fw-semibold"
                    onClick={() => {
                      setShowViewModal(false);
                      handleOpenPaymentModal(selectedInvoice);
                    }}
                  >
                    💰 Record Payment
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECORD PAYMENT                                    */}
      {/* ========================================================= */}
      {showPaymentModal && selectedInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <form onSubmit={handleSubmitPayment}>
                <div className="modal-header bg-light border-bottom">
                  <div>
                    <h5 className="modal-title fw-bold text-dark">Record Payment Receipt</h5>
                    <span className="text-muted small">Invoice: {selectedInvoice.invoiceNumber} ({selectedInvoice.customerId?.name})</span>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
                </div>

                <div className="modal-body p-4">
                  {/* Balance Summary Box */}
                  <div className="bg-light p-3 rounded-3 border mb-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small text-muted">Invoice Total: <strong>${selectedInvoice.total?.toLocaleString()}</strong></div>
                      <div className="small text-muted">Already Paid: <strong className="text-success">${selectedInvoice.paidAmount?.toLocaleString()}</strong></div>
                    </div>
                    <div className="text-end">
                      <div className="small text-muted text-uppercase fw-bold">Remaining Balance</div>
                      <div className="fs-5 fw-bold text-danger">${selectedInvoice.balanceDue?.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Payment Amount */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Payment Amount ($) <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="1" 
                        max={selectedInvoice.balanceDue} 
                        required 
                        className="form-control"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      />
                    </div>
                    <small className="text-muted">Enter partial amount or keep full remaining balance.</small>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Payment Method</label>
                    <select 
                      className="form-select"
                      value={paymentForm.method}
                      onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    >
                      <option value="Wire Transfer">Wire Transfer</option>
                      <option value="ACH Transfer">ACH Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Corporate Check">Corporate Check</option>
                      <option value="Bank Draft">Bank Draft</option>
                    </select>
                  </div>

                  {/* Reference ID */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Transaction / Bank Ref ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. WT-992109 or Check #4891"
                      value={paymentForm.reference}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    />
                  </div>

                  {/* Date */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Receipt Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    />
                  </div>

                  {/* Notes */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Audit Notes</label>
                    <textarea 
                      className="form-control" 
                      rows="2"
                      placeholder="Notes for finance audit log..."
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPaymentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success fw-semibold px-4">
                    Confirm & Apply Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE INVOICE                                    */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content shadow-lg border-0">
              <form onSubmit={handleSubmitCreate}>
                <div className="modal-header bg-light border-bottom">
                  <div>
                    <h5 className="modal-title fw-bold text-dark">Create New Customer Invoice</h5>
                    <span className="text-muted small">Generate tax invoice for billed deal or commercial contract</span>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                </div>

                <div className="modal-body p-4">
                  {/* Customer Information */}
                  <h6 className="fw-bold text-secondary text-uppercase small mb-3">1. Customer Information</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Customer / Account Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        required 
                        className="form-control" 
                        placeholder="e.g. Apex Global Corp"
                        value={createForm.customerName}
                        onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Contact Person</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Rachel Adams"
                        value={createForm.customerContact}
                        onChange={(e) => setCreateForm({ ...createForm, customerContact: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Billing Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="e.g. ap@apexcorp.com"
                        value={createForm.customerEmail}
                        onChange={(e) => setCreateForm({ ...createForm, customerEmail: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Billing Address</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. 500 Financial Plaza, New York, NY"
                        value={createForm.customerAddress}
                        onChange={(e) => setCreateForm({ ...createForm, customerAddress: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Order & Terms Details */}
                  <h6 className="fw-bold text-secondary text-uppercase small mb-3">2. Order & Payment Terms</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Associated Deal Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Cloud Migration Phase 1"
                        value={createForm.dealTitle}
                        onChange={(e) => setCreateForm({ ...createForm, dealTitle: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Quotation Ref Code</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. QTN-2026-009"
                        value={createForm.quotationRef}
                        onChange={(e) => setCreateForm({ ...createForm, quotationRef: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Issue Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={createForm.issueDate}
                        onChange={(e) => setCreateForm({ ...createForm, issueDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Due Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={createForm.dueDate}
                        onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Payment Terms</label>
                      <select 
                        className="form-select"
                        value={createForm.paymentTerms}
                        onChange={(e) => setCreateForm({ ...createForm, paymentTerms: e.target.value })}
                      >
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 45">Net 45</option>
                        <option value="Net 60">Net 60</option>
                        <option value="Due on Receipt">Due on Receipt</option>
                      </select>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-secondary text-uppercase small mb-0">3. Line Items</h6>
                    <button 
                      type="button" 
                      onClick={handleAddItem}
                      className="btn btn-sm btn-outline-primary"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="table-responsive mb-3">
                    <table className="table table-bordered align-middle mb-0">
                      <thead className="table-light small">
                        <tr>
                          <th>Description</th>
                          <th style={{ width: '100px' }}>Qty</th>
                          <th style={{ width: '140px' }}>Unit Price ($)</th>
                          <th style={{ width: '140px' }}>Line Total ($)</th>
                          <th style={{ width: '50px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {createForm.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <input 
                                type="text" 
                                required
                                className="form-control form-control-sm" 
                                placeholder="Item or service name"
                                value={item.description}
                                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="1"
                                className="form-control form-control-sm text-center" 
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                className="form-control form-control-sm text-end" 
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                              />
                            </td>
                            <td className="text-end fw-bold">
                              ${(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString()}
                            </td>
                            <td className="text-center">
                              {createForm.items.length > 1 && (
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger p-1"
                                  onClick={() => handleRemoveItem(idx)}
                                >
                                  ×
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations Box */}
                  <div className="row justify-content-end mb-3">
                    <div className="col-md-5">
                      <div className="bg-light p-3 rounded border">
                        <div className="d-flex justify-content-between mb-2 small">
                          <span>Subtotal:</span>
                          <strong>${computedCreateSubtotal.toLocaleString()}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2 small">
                          <span>Tax Rate (%):</span>
                          <input 
                            type="number" 
                            style={{ width: '70px' }} 
                            className="form-control form-control-sm text-end"
                            value={createForm.taxRate}
                            onChange={(e) => setCreateForm({ ...createForm, taxRate: e.target.value })}
                          />
                        </div>
                        <div className="d-flex justify-content-between mb-2 small">
                          <span>Tax Amount:</span>
                          <strong>${computedCreateTax.toLocaleString()}</strong>
                        </div>
                        <div className="d-flex justify-content-between border-top pt-2">
                          <span className="fw-bold">Total Due:</span>
                          <span className="fw-bold fs-6" style={{ color: '#D6536D' }}>
                            ${computedCreateTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn text-white fw-semibold px-4"
                    style={{ backgroundColor: '#D6536D', borderColor: '#D6536D' }}
                  >
                    Generate & Issue Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </ProtectedRoute>
  );
}
