/**
 * Dealer Service - Frontend-only localStorage operations
 * 
 * Manages dealer-specific operations:
 * - Get orders assigned to dealer
 * - Update order status
 * - Update ETA
 * - Manage dealer profile
 * - Calculate earnings
 */

import { getOrders, saveOrder, getDealers } from './adminService';
import { publish } from './notificationService';
import { addAuditLog, createChangesObject } from './auditLogService';

/**
 * Get current dealer from localStorage
 */
export const getCurrentDealer = () => {
  const userStr = localStorage.getItem('printease_currentUser');
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    if (user.role === 'dealer') {
      return user;
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * Get dealer ID from current user
 */
export const getDealerId = () => {
  const dealer = getCurrentDealer();
  return dealer?.dealerId || null;
};

/**
 * Get orders assigned to current dealer
 */
export const getDealerOrders = () => {
  const dealerId = getDealerId();
  if (!dealerId) return [];
  
  const orders = getOrders();
  // Filter and maintain sort order (latest → oldest)
  return orders.filter((order) => order.dealerId === dealerId || order.dealerId === parseInt(dealerId));
};

/**
 * Get orders by status for current dealer
 */
export const getDealerOrdersByStatus = (statusKey) => {
  const orders = getDealerOrders();
  if (statusKey === 'all') return orders;
  return orders.filter((order) => order.statusKey === statusKey);
};

/**
 * Accept an order (change status to processing)
 */
export const acceptOrder = (orderId) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  
  if (order) {
    order.status = 'Dealer Accepted';
    order.statusKey = 'dealer-accepted';
    order.acceptedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    
    // Update status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: 'Dealer Accepted',
      statusKey: 'dealer-accepted',
      label: 'Dealer Accepted',
      timestamp: new Date().toISOString(),
    });
    
    saveOrder(order);
    
    // Simulate customer notification
    notifyCustomer(order.userId, {
      type: 'order_accepted',
      message: `Your order ${order.id} has been accepted by the dealer.`,
      orderId: order.id,
    });
  }
  
  return order;
};

/**
 * Reject an order
 */
export const rejectOrder = (orderId, reason) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  
  if (order) {
    order.status = 'Rejected';
    order.statusKey = 'rejected';
    order.rejectedAt = new Date().toISOString();
    order.rejectionReason = reason;
    order.updatedAt = new Date().toISOString();
    saveOrder(order);
    
    // Simulate customer notification
    notifyCustomer(order.userId, {
      type: 'order_rejected',
      message: `Your order ${order.id} has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
      orderId: order.id,
    });
  }
  
  return order;
};

/**
 * Update order status
 */
export const updateOrderStatus = (orderId, status, statusKey) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  
  if (order) {
    const previousState = {
      status: order.status,
      statusKey: order.statusKey,
    };
    
    order.status = status;
    order.statusKey = statusKey;
    order.updatedAt = new Date().toISOString();
    
    // Update status-specific timestamps
    const timestamp = new Date().toISOString();
    if (statusKey === 'printing-started') {
      order.printingStartedAt = timestamp;
    } else if (statusKey === 'printing-completed') {
      order.printingCompletedAt = timestamp;
    } else if (statusKey === 'out-for-delivery') {
      order.outForDeliveryAt = timestamp;
    } else if (statusKey === 'ready-for-pickup' || statusKey === 'ready') {
      order.readyAt = timestamp;
      order.statusKey = 'ready-for-pickup'; // Normalize to new status key
    } else if (statusKey === 'delivered') {
      order.deliveredAt = timestamp;
      
      // Auto-update COD payment status when order is delivered
      if (order.paymentMethod === 'COD' && order.paymentStatus === 'Pending') {
        order.paymentStatus = 'Paid';
        order.paymentDate = timestamp;
      }
    }
    
    // Update status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    
    const statusLabels = {
      'printing-started': 'Printing Started',
      'printing-completed': 'Printing Completed',
      'out-for-delivery': 'Out for Delivery',
      'ready-for-pickup': 'Ready for Pickup',
      'delivered': 'Delivered',
    };
    
    order.statusHistory.push({
      status: status,
      statusKey: statusKey === 'ready' ? 'ready-for-pickup' : statusKey,
      label: statusLabels[statusKey] || status,
      timestamp: timestamp,
    });
    
    saveOrder(order);
    
    // Add audit log
    const dealer = getCurrentDealer();
    const changes = createChangesObject(previousState, {
      status,
      statusKey,
    });
    
    addAuditLog(
      orderId,
      dealer?.role || 'dealer',
      dealer?.id || 'system',
      changes,
      `Status updated to ${status} by dealer`
    );
    
    // Simulate customer notification
    const notificationMessages = {
      processing: `Your order ${order.id} is now in progress.`,
      ready: `Your order ${order.id} is ready for pickup/delivery!`,
      delivered: `Your order ${order.id} has been delivered.`,
    };
    
    if (notificationMessages[statusKey]) {
      notifyCustomer(order.userId, {
        type: 'order_status_update',
        message: notificationMessages[statusKey],
        orderId: order.id,
        status: status,
      });
    }
  }
  
  return order;
};

/**
 * Update ETA for an order
 */
export const updateOrderETA = (orderId, newETA) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  
  if (order) {
    const previousState = {
      eta: order.eta,
    };
    
    order.eta = newETA;
    order.etaUpdatedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    saveOrder(order);
    
    // Add audit log
    const dealer = getCurrentDealer();
    const changes = createChangesObject(previousState, {
      eta: newETA,
    });
    
    addAuditLog(
      orderId,
      dealer?.role || 'dealer',
      dealer?.id || 'system',
      changes,
      'ETA updated by dealer'
    );
    
    // Simulate customer notification
    notifyCustomer(order.userId, {
      type: 'eta_updated',
      message: `ETA updated for order ${order.id}: ${newETA}`,
      orderId: order.id,
      eta: newETA,
    });
  }
  
  return order;
};

/**
 * Get dealer profile
 */
export const getDealerProfile = () => {
  const dealerId = getDealerId();
  if (!dealerId) return null;
  
  const dealers = getDealers();
  return dealers.find((d) => d.id === dealerId || d.id === parseInt(dealerId));
};

/**
 * Update dealer profile
 */
export const updateDealerProfile = (updates) => {
  const dealerId = getDealerId();
  if (!dealerId) return null;
  
  const dealers = getDealers();
  const dealer = dealers.find((d) => d.id === dealerId || d.id === parseInt(dealerId));
  
  if (dealer) {
    Object.assign(dealer, updates);
    dealer.updatedAt = new Date().toISOString();
    
    // Save to localStorage
    const dealerIndex = dealers.findIndex((d) => d.id === dealer.id);
    dealers[dealerIndex] = dealer;
    localStorage.setItem('printease_dealers', JSON.stringify(dealers));
  }
  
  return dealer;
};

/**
 * Get earnings summary for dealer
 */
export const getEarningsSummary = (startDate, endDate) => {
  const orders = getDealerOrders();
  
  // Filter by date range if provided
  let filteredOrders = orders;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.date || order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }
  
  // Calculate earnings from completed/delivered orders
  const completedOrders = filteredOrders.filter(
    (o) => o.statusKey === 'delivered' || o.statusKey === 'ready'
  );
  
  const totalEarnings = completedOrders.reduce((sum, order) => {
    return sum + (order.cost || 0);
  }, 0);
  
  const pendingEarnings = filteredOrders
    .filter((o) => o.statusKey === 'processing' && o.paymentStatus === 'Paid')
    .reduce((sum, order) => sum + (order.cost || 0), 0);
  
  return {
    totalEarnings,
    pendingEarnings,
    totalOrders: filteredOrders.length,
    completedOrders: completedOrders.length,
    averageOrderValue: completedOrders.length > 0 
      ? totalEarnings / completedOrders.length 
      : 0,
  };
};

/**
 * Get pickup/delivery preferences
 */
export const getDeliveryPreferences = () => {
  const dealer = getDealerProfile();
  return dealer?.deliveryPreferences || {
    pickup: true,
    delivery: true,
    deliveryRadius: 5, // km
    deliveryFee: 50,
    freeDeliveryThreshold: 500,
  };
};

/**
 * Update delivery preferences
 */
export const updateDeliveryPreferences = (preferences) => {
  const dealer = getDealerProfile();
  if (!dealer) return null;
  
  dealer.deliveryPreferences = {
    ...getDeliveryPreferences(),
    ...preferences,
  };
  
  return updateDealerProfile(dealer);
};

/**
 * Simulate customer notification
 * In production, this would send push notification, email, SMS, etc.
 */
const notifyCustomer = (userId, notification) => {
  // Publish notification using notification service
  publish({
    ...notification,
    userId,
    title: notification.title || getNotificationTitle(notification.type),
  });
};

/**
 * Get notification title based on type
 */
const getNotificationTitle = (type) => {
  const titles = {
    order_accepted: 'Order Accepted',
    order_rejected: 'Order Rejected',
    order_status_update: 'Order Status Updated',
    order_ready: 'Order Ready',
    eta_updated: 'ETA Updated',
    payment_success: 'Payment Successful',
    payment_failed: 'Payment Failed',
    dealer_accepted: 'Dealer Application Accepted',
    dealer_rejected: 'Dealer Application Rejected',
    admin_announcement: 'Admin Announcement',
  };
  return titles[type] || 'Notification';
};

/**
 * Get dealer dashboard stats
 */
export const getDealerStats = () => {
  const orders = getDealerOrders();
  
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.statusKey === 'pending').length,
    processingOrders: orders.filter((o) => o.statusKey === 'processing').length,
    readyOrders: orders.filter((o) => o.statusKey === 'ready').length,
    completedOrders: orders.filter((o) => o.statusKey === 'delivered').length,
  };
};

