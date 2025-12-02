/**
 * Admin Service - Frontend-only localStorage operations
 * 
 * Manages admin data operations using localStorage:
 * - printease_orders: All orders
 * - printease_users: All users/customers
 * - printease_dealers: All dealers with approval status
 */

import { publish } from './notificationService';
import { addAuditLog, createChangesObject } from './auditLogService';

/**
 * Add change log entry to order
 * @param {Object} order - Order object
 * @param {string} action - Action performed
 * @param {Object} previousState - Previous state before change
 * @param {string} role - Role of user making change (default: 'admin')
 */
const addChangeLog = (order, action, previousState, role = 'admin') => {
  if (!order.changeLog) {
    order.changeLog = [];
  }
  
  order.changeLog.push({
    timestamp: new Date().toISOString(),
    role,
    action,
    previousState,
  });
};

// Initialize default data if not exists
const initializeData = () => {
  if (!localStorage.getItem('printease_orders')) {
    localStorage.setItem('printease_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('printease_users')) {
    // Initialize with some sample users
    const defaultUsers = [
      {
        id: 'user_1',
        email: 'john@example.com',
        name: 'John Doe',
        phone: '+91 98765 43210',
        role: 'customer',
        createdAt: new Date('2024-01-15').toISOString(),
        lastOrderId: null,
      },
      {
        id: 'user_2',
        email: 'jane@example.com',
        name: 'Jane Smith',
        phone: '+91 98765 43211',
        role: 'customer',
        createdAt: new Date('2024-02-20').toISOString(),
        lastOrderId: null,
      },
    ];
    localStorage.setItem('printease_users', JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem('printease_dealers')) {
    // Initialize with dealers from data/dealers.js
    const defaultDealers = [
      {
        id: 1,
        name: 'PixelPrint Hub',
        rating: 4.9,
        distance: '1.2 km',
        eta: '45 mins',
        priceRange: '₹0.80 - ₹5 / page',
        badges: ['Same-day', 'Bulk ready'],
        status: 'approved',
        services: {
          color: true,
          blackWhite: true,
          binding: true,
          lamination: true,
          bulk: true,
        },
        contact: {
          phone: '+91 98765 43220',
          email: 'pixelprint@example.com',
        },
        createdAt: new Date('2024-01-10').toISOString(),
      },
      {
        id: 2,
        name: 'Express Xerox',
        rating: 4.7,
        distance: '2.4 km',
        eta: '60 mins',
        priceRange: '₹1 - ₹6 / page',
        badges: ['Color expert'],
        status: 'approved',
        services: {
          color: true,
          blackWhite: true,
          binding: false,
          lamination: true,
          bulk: false,
        },
        contact: {
          phone: '+91 98765 43221',
          email: 'express@example.com',
        },
        createdAt: new Date('2024-01-12').toISOString(),
      },
      {
        id: 3,
        name: 'Print Studio 9',
        rating: 4.8,
        distance: '3.0 km',
        eta: '75 mins',
        priceRange: '₹0.70 - ₹4 / page',
        badges: ['Corporate', 'Lamination'],
        status: 'approved',
        services: {
          color: true,
          blackWhite: true,
          binding: true,
          lamination: true,
          bulk: true,
        },
        contact: {
          phone: '+91 98765 43222',
          email: 'studio9@example.com',
        },
        createdAt: new Date('2024-01-14').toISOString(),
      },
      {
        id: 4,
        name: 'DocuCraft India',
        rating: 4.6,
        distance: '4.2 km',
        eta: '90 mins',
        priceRange: '₹1.2 - ₹6.5 / page',
        badges: ['Hard binding'],
        status: 'approved',
        services: {
          color: true,
          blackWhite: true,
          binding: true,
          lamination: false,
          bulk: false,
        },
        contact: {
          phone: '+91 98765 43223',
          email: 'docucraft@example.com',
        },
        createdAt: new Date('2024-01-16').toISOString(),
      },
      {
        id: 5,
        name: 'New Print Shop',
        rating: 0,
        distance: '5.0 km',
        eta: '120 mins',
        priceRange: '₹0.90 - ₹5.5 / page',
        badges: [],
        status: 'pending',
        services: {
          color: true,
          blackWhite: true,
          binding: false,
          lamination: false,
          bulk: false,
        },
        contact: {
          phone: '+91 98765 43224',
          email: 'newprint@example.com',
        },
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('printease_dealers', JSON.stringify(defaultDealers));
  }
};

// Initialize on import
initializeData();

// Orders Operations
export const getOrders = () => {
  const orders = localStorage.getItem('printease_orders');
  return JSON.parse(orders || '[]');
};

export const saveOrder = (order) => {
  const orders = getOrders();
  const existingIndex = orders.findIndex((o) => o.id === order.id);
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.push(order);
  }
  localStorage.setItem('printease_orders', JSON.stringify(orders));
  return order;
};

export const updateOrderStatus = (orderId, status, statusKey, role = 'admin') => {
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
    addChangeLog(order, 'status_updated', previousState, role);
    saveOrder(order);
    
    // Add detailed audit log
    const currentUserStr = localStorage.getItem('printease_currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
    const changes = createChangesObject(previousState, {
      status,
      statusKey,
    });
    
    addAuditLog(
      orderId,
      currentUser?.role || role,
      currentUser?.id || 'system',
      changes,
      `Status updated to ${status}`
    );
  }
  return order;
};

export const reassignDealer = (orderId, dealerId, dealerName) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    const previousState = {
      dealer: order.dealer,
      dealerId: order.dealerId,
    };
    
    order.dealer = dealerName;
    order.dealerId = dealerId;
    order.updatedAt = new Date().toISOString();
    addChangeLog(order, 'dealer_reassigned', previousState, 'admin');
    saveOrder(order);
    
    // Notify customer and dealer
    publish({
      type: 'order_dealer_reassigned',
      title: 'Dealer Reassigned',
      message: `Your order ${order.id} has been reassigned to ${dealerName}.`,
      userId: order.userId,
      orderId: order.id,
    });
    
    publish({
      type: 'order_assigned',
      title: 'New Order Assigned',
      message: `Order ${order.id} has been assigned to you.`,
      userId: `dealer_${dealerId}`,
      orderId: order.id,
    });
  }
  return order;
};

/**
 * Admin override: Reassign dealer (with changeLog)
 * @param {string} orderId - Order ID
 * @param {number} dealerId - New dealer ID
 * @param {string} dealerName - New dealer name
 * @returns {Object} Updated order
 */
export const adminReassignDealer = (orderId, dealerId, dealerName) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  
  if (!order) return null;

  const previousState = {
    dealer: order.dealer,
    dealerId: order.dealerId,
  };

  const result = reassignDealer(orderId, dealerId, dealerName);
  
  // Add detailed audit log
  const changes = createChangesObject(previousState, {
    dealer: dealerName,
    dealerId: dealerId,
  });
  
  // Get current user for audit log
  const currentUserStr = localStorage.getItem('printease_currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  
  addAuditLog(
    orderId,
    currentUser?.role || 'admin',
    currentUser?.id || 'system',
    changes,
    'Admin override: Dealer reassigned'
  );

  return result;
};

/**
 * Admin override: Override ETA
 * @param {string} orderId - Order ID
 * @param {string} newETA - New ETA
 * @returns {Object} Updated order
 */
export const adminOverrideETA = (orderId, newETA) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    const previousState = {
      eta: order.eta,
      etaOverridden: order.etaOverridden,
    };
    
    order.eta = newETA;
    order.etaOverridden = true;
    order.etaOverriddenAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    addChangeLog(order, 'eta_overridden', previousState, 'admin');
    saveOrder(order);
    
    // Add detailed audit log
    const currentUserStr = localStorage.getItem('printease_currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
    const changes = createChangesObject(previousState, {
      eta: newETA,
      etaOverridden: true,
    });
    
    addAuditLog(
      orderId,
      currentUser?.role || 'admin',
      currentUser?.id || 'system',
      changes,
      'Admin override: ETA changed'
    );
    
    // Notify customer and dealer
    publish({
      type: 'order_eta_overridden',
      title: 'ETA Updated by Admin',
      message: `ETA for order ${order.id} has been updated to ${newETA}.`,
      userId: order.userId,
      orderId: order.id,
      eta: newETA,
    });
    
    if (order.dealerId) {
      publish({
        type: 'order_eta_overridden',
        title: 'ETA Updated by Admin',
        message: `ETA for order ${order.id} has been updated to ${newETA}.`,
        userId: `dealer_${order.dealerId}`,
        orderId: order.id,
        eta: newETA,
      });
    }
  }
  return order;
};

/**
 * Admin override: Override pricing
 * @param {string} orderId - Order ID
 * @param {number} newCost - New cost
 * @param {string} reason - Reason for override
 * @returns {Object} Updated order
 */
export const adminOverridePricing = (orderId, newCost, reason = '') => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    const previousState = {
      cost: order.cost,
      price: order.price,
      pricingOverridden: order.pricingOverridden,
    };
    
    order.cost = newCost;
    order.price = `₹${newCost}`;
    order.pricingOverridden = true;
    order.pricingOverriddenAt = new Date().toISOString();
    order.pricingOverrideReason = reason;
    order.updatedAt = new Date().toISOString();
    addChangeLog(order, 'pricing_overridden', previousState, 'admin');
    saveOrder(order);
    
    // Add detailed audit log
    const currentUserStr = localStorage.getItem('printease_currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
    const changes = createChangesObject(previousState, {
      cost: newCost,
      price: `₹${newCost}`,
      pricingOverridden: true,
      pricingOverrideReason: reason,
    });
    
    addAuditLog(
      orderId,
      currentUser?.role || 'admin',
      currentUser?.id || 'system',
      changes,
      reason || 'Admin override: Pricing changed'
    );
    
    // Notify customer and dealer
    publish({
      type: 'order_pricing_overridden',
      title: 'Pricing Updated by Admin',
      message: `Pricing for order ${order.id} has been updated to ₹${newCost}. ${reason ? `Reason: ${reason}` : ''}`,
      userId: order.userId,
      orderId: order.id,
      newCost,
    });
    
    if (order.dealerId) {
      publish({
        type: 'order_pricing_overridden',
        title: 'Pricing Updated by Admin',
        message: `Pricing for order ${order.id} has been updated to ₹${newCost}.`,
        userId: `dealer_${order.dealerId}`,
        orderId: order.id,
        newCost,
      });
    }
  }
  return order;
};

export const cancelOrder = (orderId) => {
  return updateOrderStatus(orderId, 'Cancelled', 'cancelled');
};

// Users Operations
export const getUsers = () => {
  const users = localStorage.getItem('printease_users');
  return JSON.parse(users || '[]');
};

export const saveUser = (user) => {
  const users = getUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('printease_users', JSON.stringify(users));
  return user;
};

export const getUserById = (userId) => {
  const users = getUsers();
  return users.find((u) => u.id === userId);
};

// Dealers Operations
export const getDealers = () => {
  const dealers = localStorage.getItem('printease_dealers');
  return JSON.parse(dealers || '[]');
};

export const saveDealer = (dealer) => {
  const dealers = getDealers();
  const existingIndex = dealers.findIndex((d) => d.id === dealer.id);
  if (existingIndex >= 0) {
    dealers[existingIndex] = dealer;
  } else {
    dealers.push(dealer);
  }
  localStorage.setItem('printease_dealers', JSON.stringify(dealers));
  return dealer;
};

export const approveDealer = (dealerId) => {
  const dealers = getDealers();
  const dealer = dealers.find((d) => d.id === dealerId);
  if (dealer) {
    dealer.status = 'approved';
    dealer.approvedAt = new Date().toISOString();
    saveDealer(dealer);
    
    // Publish notification to dealer
    publish({
      type: 'dealer_accepted',
      title: 'Dealer Application Approved',
      message: `Congratulations! Your dealer application for ${dealer.name} has been approved.`,
      userId: `dealer_${dealerId}`, // Assuming dealer user ID format
    });
  }
  return dealer;
};

export const rejectDealer = (dealerId) => {
  const dealers = getDealers();
  const dealer = dealers.find((d) => d.id === dealerId);
  if (dealer) {
    dealer.status = 'rejected';
    dealer.rejectedAt = new Date().toISOString();
    saveDealer(dealer);
    
    // Publish notification to dealer
    publish({
      type: 'dealer_rejected',
      title: 'Dealer Application Rejected',
      message: `Your dealer application for ${dealer.name} has been rejected. Please contact support for more information.`,
      userId: `dealer_${dealerId}`, // Assuming dealer user ID format
    });
  }
  return dealer;
};

export const updateDealerServices = (dealerId, services) => {
  const dealers = getDealers();
  const dealer = dealers.find((d) => d.id === dealerId);
  if (dealer) {
    dealer.services = { ...dealer.services, ...services };
    saveDealer(dealer);
  }
  return dealer;
};

export const updateDealerInfo = (dealerId, updates) => {
  const dealers = getDealers();
  const dealer = dealers.find((d) => d.id === dealerId);
  if (dealer) {
    Object.assign(dealer, updates);
    dealer.updatedAt = new Date().toISOString();
    saveDealer(dealer);
  }
  return dealer;
};

// Dashboard Statistics
export const getDashboardStats = () => {
  const orders = getOrders();
  const dealers = getDealers();
  const users = getUsers();

  const totalOrders = orders.length;
  const revenue = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.cost || 0), 0);
  const pendingOrders = orders.filter((o) => o.statusKey === 'pending').length;
  
  // Calculate average ETA (in minutes)
  const ordersWithEta = orders.filter((o) => o.eta);
  const avgEta = ordersWithEta.length > 0
    ? ordersWithEta.reduce((sum, o) => {
        // Parse ETA like "Today, 7:30 PM" or "45 mins"
        const etaText = o.eta.toLowerCase();
        if (etaText.includes('mins')) {
          return sum + parseInt(etaText.match(/\d+/)?.[0] || 60);
        }
        return sum + 60; // Default to 60 mins
      }, 0) / ordersWithEta.length
    : 0;

  return {
    totalOrders,
    revenue,
    pendingOrders,
    avgEta: Math.round(avgEta),
    totalDealers: dealers.length,
    approvedDealers: dealers.filter((d) => d.status === 'approved').length,
    pendingDealers: dealers.filter((d) => d.status === 'pending').length,
    totalUsers: users.length,
  };
};

// Reports - Get orders by date range
export const getOrdersByDateRange = (startDate, endDate) => {
  const orders = getOrders();
  return orders.filter((order) => {
    const orderDate = new Date(order.date || order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });
};

// Get revenue by date range
export const getRevenueByDateRange = (startDate, endDate) => {
  const orders = getOrdersByDateRange(startDate, endDate);
  return orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.cost || 0), 0);
};

