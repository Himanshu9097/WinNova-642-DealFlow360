import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://127.0.0.1:5006/api/chat';

export default function LiveChatWindow({ 
  conversationId = 'default',
  senderName = 'You',
  senderRole = 'user', // 'customer' or 'seller'
  recipientName = 'Sales Representative',
  accentColor = '#D6536D'
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Chat fetch error:', e);
    }
  }, [conversationId]);

  // Initial fetch and polling every 2.5 seconds for real-time synchronization
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: senderRole,
          senderName: senderName,
          text: textToSend
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="d-flex flex-column h-100 bg-white rounded-3 shadow-sm overflow-hidden" style={{ minHeight: '500px', border: '1px solid #e0e0e0' }}>
      {/* Chat Header */}
      <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: '42px', height: '42px', backgroundColor: accentColor, fontSize: '1.1rem' }}
            >
              {recipientName.charAt(0).toUpperCase()}
            </div>
            <span 
              className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" 
              style={{ width: '12px', height: '12px' }}
            ></span>
          </div>
          <div>
            <h6 className="mb-0 fw-bold">{recipientName}</h6>
            <small className="text-muted"><i className="fa fa-circle text-success me-1" style={{ fontSize: '8px' }}></i> Active now</small>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-grow-1 p-3 overflow-auto bg-light" style={{ maxHeight: '420px', minHeight: '350px' }}>
        {messages.length === 0 ? (
          <div className="text-center text-muted my-5 py-3">
            <i className="fa fa-comments fs-2 mb-2 text-secondary opacity-50"></i>
            <p className="mb-0">No messages yet. Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderName === senderName || msg.sender === senderRole;
            const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';

            return (
              <div key={msg._id || msg.id} className={`d-flex flex-column mb-3 ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="small text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>{msg.senderName}</span>
                  <span className="small text-muted" style={{ fontSize: '0.7rem' }}>{timeStr}</span>
                </div>
                <div 
                  className={`p-3 rounded-3 shadow-sm ${isMe ? 'text-white' : 'bg-white text-dark border'}`}
                  style={{ 
                    maxWidth: '85%', 
                    backgroundColor: isMe ? accentColor : '#ffffff',
                    borderTopRightRadius: isMe ? '2px' : '1rem',
                    borderTopLeftRadius: isMe ? '1rem' : '2px',
                    fontSize: '0.92rem',
                    lineHeight: '1.4'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white border-top">
        <div className="input-group">
          <input
            type="text"
            className="form-control border-end-0"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            style={{ borderRadius: '20px 0 0 20px', paddingLeft: '16px' }}
          />
          <button 
            type="submit" 
            className="btn text-white px-4"
            disabled={sending || !inputText.trim()}
            style={{ backgroundColor: accentColor, borderRadius: '0 20px 20px 0' }}
          >
            <i className={`fa ${sending ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
          </button>
        </div>
      </form>
    </div>
  );
}
