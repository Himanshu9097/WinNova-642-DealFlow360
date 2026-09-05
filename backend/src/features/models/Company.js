const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  industry: String,
  website: String,
  logo: String,
  currency: { type: String, default: 'USD' },
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
