const Inventory = require('../models/Inventory');
const mongoose = require('mongoose');

exports.calculateRisk = async (companyId, lines, discountPct, maxAllowedDiscount, netTotal) => {
  let riskScore = 10; // Base risk
  const riskFactors = [];

  // 1. Discount Penalty
  if (discountPct > maxAllowedDiscount) {
    const excess = discountPct - maxAllowedDiscount;
    const penalty = Math.min(excess * 5, 50); // Cap at 50
    riskScore += penalty;
    riskFactors.push(`Discount of ${discountPct.toFixed(1)}% exceeds company limit of ${maxAllowedDiscount}% by ${excess.toFixed(1)}%`);
  }

  // 2. Fulfillment / Inventory Penalty
  let hasInventoryRisk = false;
  for (const line of lines) {
    if (!line.productId || !mongoose.Types.ObjectId.isValid(line.productId)) continue;
    // Sum all available stock for this product across all company warehouses
    const stockRecords = await Inventory.find({ companyId, productId: line.productId });
    const totalAvailable = stockRecords.reduce((sum, record) => sum + record.availableStock, 0);
    
    if (line.quantity > totalAvailable) {
      hasInventoryRisk = true;
      riskFactors.push(`Insufficient stock: Quoted ${line.quantity}x of ${line.name || 'product'} (Only ${totalAvailable} available)`);
    }
  }

  if (hasInventoryRisk) {
    riskScore += 30;
  }

  // 3. High Value / Long Term Deal Exposure
  if (netTotal > 1000000) { // e.g. > 10,00,000 INR
    riskScore += 10;
    riskFactors.push(`High value deal exposure (Value > ₹1,000,000)`);
  }

  // Cap risk score at 100
  riskScore = Math.min(Math.round(riskScore), 100);

  let riskLevel = 'Low';
  if (riskScore >= 70) riskLevel = 'High';
  else if (riskScore >= 40) riskLevel = 'Medium';

  return { riskScore, riskFactors, riskLevel };
};
