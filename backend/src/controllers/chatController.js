import { inMemoryStore } from '../store/inMemoryStore.js';

export const getBookingMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const messages = inMemoryStore.getMessages(bookingId);
    return res.status(200).json({
      success: true,
      bookingId,
      messages,
      total: messages.length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const sendBookingMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
    }

    const sender = req.user || {
      id: 'usr_customer_demo',
      name: 'Customer',
      role: 'CUSTOMER'
    };

    const newMsg = inMemoryStore.addMessage({
      bookingId,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      text: text.trim()
    });

    // Emit Socket.IO event for real-time chat delivery
    if (req.io) {
      req.io.emit(`chat_message_${bookingId}`, newMsg);
      req.io.emit('new_global_chat_message', newMsg);
    }

    return res.status(201).json({
      success: true,
      message: newMsg
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
