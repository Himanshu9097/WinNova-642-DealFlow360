const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true }, // COMPANY_ADMIN, SALES_MANAGER, SALES_REP, FINANCE, OPERATIONS, CUSTOMER
  department: String,
  avatar: String,
  status: { type: String, default: 'ACTIVE' },
  invitationTokenHash: String,
  invitationExpiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);