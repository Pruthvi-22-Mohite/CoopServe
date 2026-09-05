import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from './Modal';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import {
  Send,
  Sparkles,
  Phone,
  ShieldCheck,
  Clock,
  CheckCheck,
  MessageSquare
} from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

export const ChatModal = ({ isOpen, onClose, booking }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const isCustomer = user?.role === 'CUSTOMER';
  const otherPartyName = isCustomer ? booking?.providerName : booking?.customerName;
  const otherPartyPhone = isCustomer ? booking?.providerPhone : booking?.customerPhone;
  const otherPartyAvatar = isCustomer ? booking?.providerAvatar : undefined;

  const quickReplies = isCustomer
    ? [
        'I am at home, please come in.',
        'Where have you reached?',
        'Please call when you reach gate.',
        'Thank you!'
      ]
    : [
        'On my way! Reaching in 10 mins.',
        'Reached your building gate.',
        'Service work is underway.',
        'Completed the service!'
      ];

  const fetchMessages = async () => {
    if (!booking?.id) return;
    try {
      const res = await api.getChatMessages(booking.id);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !booking?.id) return;

    fetchMessages();

    // Socket.IO real-time connection
    try {
      const socket = io(SOCKET_SERVER_URL, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.emit('join_booking', booking.id);

      socket.on(`chat_message_${booking.id}`, (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });
    } catch (err) {
      console.warn('Socket connection fallback active');
    }

    // Interval fallback to guarantee delivery
    const interval = setInterval(fetchMessages, 3000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [isOpen, booking?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const content = textToSend || inputText;
    if (!content.trim() || !booking?.id) return;

    setIsSending(true);
    try {
      const res = await api.sendChatMessage(booking.id, content.trim());
      if (res.success) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
        setInputText('');
      }
    } catch (err) {
      showToast('Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Chat: ${booking.serviceTitle}`}
      description={`Booking ${booking.id} • ${booking.date} at ${booking.time}`}
    >
      <div className="space-y-3">
        {/* Other Party Header Card */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <Avatar src={otherPartyAvatar} name={otherPartyName || 'User'} size="md" isVerified={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-slate-900">{otherPartyName}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
              </div>
              <p className="text-[10px] text-slate-500">
                {isCustomer ? `${booking.providerSkill} • Trust: 94/100` : `Customer • ${booking.address}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="protected" size="sm">Coop Protected</Badge>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="h-64 overflow-y-auto p-3 rounded-2xl bg-slate-100/70 border border-slate-200/80 space-y-2.5 text-xs">
          {isLoading ? (
            <p className="text-center text-slate-400 py-10">Connecting to secure chat session...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-10 space-y-1">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-500">No messages yet</p>
              <p className="text-[11px] text-slate-400">Send a message or pick a quick response below.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === user?.id || (isCustomer && m.senderRole === 'CUSTOMER') || (!isCustomer && m.senderRole === 'SERVICE_PROVIDER');
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl shadow-xs leading-relaxed ${
                      isMine
                        ? 'bg-emerald-700 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    <p className="text-xs">{m.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {quickReplies.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 border border-slate-200 text-[10px] font-medium text-slate-700 shrink-0 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message Input Form */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isSending}
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSendMessage()}
            isLoading={isSending}
            disabled={!inputText.trim()}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
