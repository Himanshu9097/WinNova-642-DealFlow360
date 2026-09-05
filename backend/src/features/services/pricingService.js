exports.calculateTotals = (lines) => {
  let gross = 0;
  let discount = 0;
  let costTotal = 0;
  lines.forEach(line => {
    let subtotal = line.quantity * line.unitPrice;
    let lineDiscount = subtotal * (line.discountPct / 100);
    line.lineTotal = subtotal - lineDiscount;
    line.margin = line.lineTotal - (line.cost * line.quantity || 0);
    
    gross += subtotal;
    discount += lineDiscount;
    costTotal += (line.cost * line.quantity || 0);
  });
  const net = gross - discount;
  const margin = net - costTotal;
  return { gross, discount, net, margin };
};