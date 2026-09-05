const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: String, email: String, role: String
}, { timestamps: true });
module.exports = mongoose.model('User', schema);