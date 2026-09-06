const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');

// Get all messages for a conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Fetch chat messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a new message
router.post('/:conversationId', async (req, res) => {
  try {
    const { sender, senderName, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const message = await ChatMessage.create({
      conversationId: req.params.conversationId,
      sender: sender || 'user',
      senderName: senderName || 'Anonymous',
      text: text.trim()
    });

    res.json(message);
  } catch (err) {
    console.error('Post chat message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
