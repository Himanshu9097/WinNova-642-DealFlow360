exports.evaluateApproval = (requestedDiscount, allowedDiscount = 10, margin = 0, isTechnicalCompliant = true) => {
  if (!isTechnicalCompliant) return { required: true, reason: 'Technical Non-Compliance' };
  if (requestedDiscount > allowedDiscount) return { required: true, reason: `Discount ${requestedDiscount}% exceeds allowed ${allowedDiscount}%` };
  if (margin < 0) return { required: true, reason: 'Negative Margin' };
  return { required: false, reason: 'Auto-Approved' };
};