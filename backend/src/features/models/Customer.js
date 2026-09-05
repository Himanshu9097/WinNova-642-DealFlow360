const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: String, industry: String, email: String
}, { timestamps: true });
module.exports = mongoose.model('Customer', schema);