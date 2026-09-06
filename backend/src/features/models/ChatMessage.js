const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  sender: { type: String, required: true }, // 'customer' or 'seller'
  senderName: { type: String, required: true },
  text: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', schema);
