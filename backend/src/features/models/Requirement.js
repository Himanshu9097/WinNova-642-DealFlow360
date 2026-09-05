const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  specKey: String, label: String, requiredValue: String,
  mandatory: Boolean, status: String, offeredValue: String
}, { timestamps: true });
module.exports = mongoose.model('Requirement', schema);