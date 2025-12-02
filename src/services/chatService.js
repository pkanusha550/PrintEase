/**
 * Chat Service - Order-based messaging
 * 
 * Handles in-app chat between customers and dealers for each order
 * Messages stored in order.messages[] array in localStorage
 * 
 * TODO: Replace with backend API:
 * - POST /api/orders/:orderId/messages - Send message
 * - GET /api/orders/:orderId/messages - Get messages
 * - WebSocket connection for real-time updates
 */

import { getOrders, saveOrder } from './adminService';
import { publish } from './notificationService';

/**
 * Get messages for an order
 * @param {string} orderId - Order ID
 * @returns {Array} Array of messages
 */
export const getOrderMessages = (orderId) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  return order?.messages || [];
};

/**
 * Send a message in order chat
 * @param {string} orderId - Order ID
 * @param {string} message - Message text
 * @param {string} senderId - Sender user ID
 * @param {string} senderRole - Sender role (customer, dealer, admin)
 * @param {string} senderName - Sender name
 * @returns {Object} Created message object
 */
export const sendMessage = (orderId, message, senderId, senderRole, senderName) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }

  // Initialize messages array if not exists
  if (!order.messages) {
    order.messages = [];
  }

  const messageObj = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text: message,
    senderId,
    senderRole,
    senderName,
    timestamp: new Date().toISOString(),
    status: 'sent', // sent, delivered, read
    readAt: null,
  };

  order.messages.push(messageObj);
  order.updatedAt = new Date().toISOString();
  saveOrder(order);

  // Notify recipient
  const recipientId = senderRole === 'customer' 
    ? `dealer_${order.dealerId}` 
    : order.userId;
  
  if (recipientId) {
    publish({
      type: 'new_message',
      title: 'New Message',
      message: `New message in order ${orderId}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
      userId: recipientId,
      orderId,
      senderName,
    });
  }

  return messageObj;
};

/**
 * Mark messages as read
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID marking as read
 */
export const markMessagesAsRead = (orderId, userId) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  
  if (!order || !order.messages) return;

  const now = new Date().toISOString();
  order.messages.forEach((msg) => {
    if (msg.senderId !== userId && msg.status !== 'read') {
      msg.status = 'read';
      msg.readAt = now;
    }
  });

  saveOrder(order);
};

/**
 * Get unread message count for an order
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID
 * @returns {number} Unread count
 */
export const getUnreadCount = (orderId, userId) => {
  const messages = getOrderMessages(orderId);
  return messages.filter(
    (msg) => msg.senderId !== userId && msg.status !== 'read'
  ).length;
};

/**
 * Simulate message delivery status update
 * @param {string} orderId - Order ID
 * @param {string} messageId - Message ID
 * @param {string} status - New status (delivered, read)
 */
export const updateMessageStatus = (orderId, messageId, status) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  
  if (!order || !order.messages) return;

  const message = order.messages.find((m) => m.id === messageId);
  if (message) {
    message.status = status;
    if (status === 'read') {
      message.readAt = new Date().toISOString();
    }
    saveOrder(order);
  }
};

/**
 * Simulate delivery status updates (for demo purposes)
 * Messages automatically move from 'sent' to 'delivered' after 1 second
 */
export const simulateDelivery = (orderId, messageId) => {
  setTimeout(() => {
    updateMessageStatus(orderId, messageId, 'delivered');
  }, 1000);
};

