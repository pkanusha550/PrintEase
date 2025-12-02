import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getOrderMessages,
  sendMessage,
  markMessagesAsRead,
  simulateDelivery,
} from '../services/chatService';
import Button from './Button';
import Input from './Input';

/**
 * ChatInterface Component - Order-based chat
 * 
 * Displays chat messages for a specific order
 * Supports customer ↔ dealer communication
 * 
 * Fails gracefully if chat service unavailable
 */
export default function ChatInterface({ orderId, className = '' }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;

    try {
      // Load messages
      const orderMessages = getOrderMessages(orderId);
      setMessages(orderMessages);

      // Mark messages as read when component mounts
      if (user?.id) {
        markMessagesAsRead(orderId, user.id);
      }

      // Simulate delivery status updates
      orderMessages.forEach((msg) => {
        if (msg.status === 'sent' && msg.senderId !== user?.id) {
          simulateDelivery(orderId, msg.id);
        }
      });
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [orderId, user]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !orderId) return;

    setIsSending(true);
    try {
      const message = sendMessage(
        orderId,
        newMessage.trim(),
        user.id,
        user.role,
        user.name || user.email
      );

      setMessages((prev) => [...prev, message]);
      setNewMessage('');

      // Simulate delivery
      simulateDelivery(orderId, message.id);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (diff < 86400000) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-500" />;
      default:
        return null;
    }
  };

  if (!orderId) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Select an order to view chat</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p className="text-sm">Please login to use chat</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 bg-primary text-white">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-white" />
          <h3 className="font-semibold text-white">Order Chat</h3>
          <span className="text-xs text-white/80 ml-auto">Order: {orderId}</span>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
        style={{ maxHeight: '400px' }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user.id;
            const isAdmin = message.senderRole === 'admin';
            const isDealer = message.senderRole === 'dealer';
            const isCustomer = message.senderRole === 'customer';

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-card px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-primary text-white'
                      : isAdmin
                      ? 'bg-primary-light text-primary'
                      : isDealer
                      ? 'bg-primary-light text-primary'
                      : 'bg-secondary-light text-secondary-dark border border-gray-200'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="text-xs font-semibold mb-1 opacity-80">
                      {message.senderName}
                      {isAdmin && ' (Admin)'}
                      {isDealer && ' (Dealer)'}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                    {isOwnMessage && getStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            size="md"
          >
            <Send size={18} />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

