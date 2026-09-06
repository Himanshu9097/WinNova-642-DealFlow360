const Subscription = require('../features/models/Subscription');
const Invoice = require('../features/models/Invoice');
const Customer = require('../features/models/Customer');
const { sendEmail } = require('./mailService');

const sendRecurringInvoiceEmail = async (to, customerName, invoiceNumber, billingType, amount, dueDate) => {
  if (!to) return;
  const subject = `New ${billingType} Subscription Renewal Invoice (${invoiceNumber})`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #D6536D;">Subscription Renewal Invoice Issued</h2>
      <p>Hi ${customerName || 'Valued Customer'},</p>
      <p>Your recurring <strong>${billingType}</strong> subscription for <strong>${invoiceNumber}</strong> has been renewed.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p style="margin: 5px 0;"><strong>Amount Due:</strong> ₹${Number(amount || 0).toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dueDate}</p>
      </div>
      <p>Please log in to your customer billing workspace to review and settle payment.</p>
      <br/>
      <p>Best regards,<br/>The DealFlow360 Finance Team</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

const processRecurringSubscriptions = async () => {
  try {
    const now = new Date();
    const dueSubscriptions = await Subscription.find({
      status: 'Active',
      nextBillingDate: { $lte: now }
    }).populate('customerId');

    if (dueSubscriptions.length === 0) {
      console.log(`[RecurringBillingEngine] Check completed at ${now.toLocaleTimeString()}: No subscriptions due.`);
      return { processed: 0, invoicesCreated: [] };
    }

    console.log(`[RecurringBillingEngine] Found ${dueSubscriptions.length} due subscriptions to process.`);
    const invoicesCreated = [];

    for (const sub of dueSubscriptions) {
      const issueDateStr = now.toISOString().split('T')[0];
      const dueDateObj = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const dueDateStr = dueDateObj.toISOString().split('T')[0];

      const invNumber = `INV-SUB-${Math.floor(100000 + Math.random() * 900000)}`;

      const newInvoice = await Invoice.create({
        companyId: sub.companyId,
        customerId: sub.customerId._id || sub.customerId,
        dealId: sub.dealId,
        quotationRef: sub.quotationId ? `SUB-${sub.quotationId}` : 'RECURRING-SUB',
        invoiceNumber: invNumber,
        issueDate: issueDateStr,
        dueDate: dueDateStr,
        status: 'Pending',
        currency: 'INR',
        items: sub.items && sub.items.length > 0 ? sub.items : [
          { description: `${sub.productName} (${sub.billingType} Subscription)`, quantity: 1, unitPrice: sub.amount, total: sub.amount }
        ],
        subtotal: sub.amount,
        taxRate: 18,
        taxAmount: Math.round((sub.amount * 18) / 100),
        total: Math.round(sub.amount * 1.18),
        paidAmount: 0,
        balanceDue: Math.round(sub.amount * 1.18),
        paymentHistory: [],
        notes: `Automated ${sub.billingType} recurring subscription invoice.`
      });

      // Calculate next billing date
      const isAnnual = sub.billingType.toLowerCase().includes('annual') || sub.billingType.toLowerCase().includes('year');
      const nextDate = new Date(sub.nextBillingDate || now);
      if (isAnnual) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      sub.nextBillingDate = nextDate;
      sub.lastInvoicedDate = now;
      sub.totalInvoicesIssued = (sub.totalInvoicesIssued || 1) + 1;
      await sub.save();

      // Send email if customer has email
      const cust = sub.customerId;
      if (cust && cust.email) {
        await sendRecurringInvoiceEmail(
          cust.email,
          cust.name,
          invNumber,
          sub.billingType,
          newInvoice.total,
          dueDateStr
        ).catch(e => console.error('Failed to send recurring invoice email:', e));
      }

      invoicesCreated.push(newInvoice);
    }

    console.log(`[RecurringBillingEngine] Successfully created ${invoicesCreated.length} recurring invoices.`);
    return { processed: dueSubscriptions.length, invoicesCreated };
  } catch (error) {
    console.error('[RecurringBillingEngine] Error processing recurring billing:', error);
    throw error;
  }
};

const startScheduler = () => {
  // Run on start
  setTimeout(() => {
    processRecurringSubscriptions().catch(console.error);
  }, 5000);

  // Check every 6 hours
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    processRecurringSubscriptions().catch(console.error);
  }, SIX_HOURS);
};

module.exports = {
  processRecurringSubscriptions,
  startScheduler
};
