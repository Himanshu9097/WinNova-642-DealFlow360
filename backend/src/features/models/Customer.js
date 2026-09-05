const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  
  name: String, industry: String, email: String
}, { timestamps: true });
module.exports = mongoose.model('Customer', schema);