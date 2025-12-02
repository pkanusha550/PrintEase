/**
 * Order Batch Service - Multi-order batching functionality
 * 
 * Handles grouping multiple orders together as a batch
 * Each order maintains its own ETA and tracking
 */

import { getOrders, saveOrder } from './adminService';

/**
 * Create a batch ID
 * @returns {string} Batch ID
 */
export const createBatchId = () => {
  return `BATCH-${Date.now()}`;
};

/**
 * Create a batch from multiple orders
 * @param {Array} orders - Array of order objects
 * @returns {Object} Batch object
 */
export const createBatch = (orders) => {
  const batchId = createBatchId();
  const batch = {
    id: batchId,
    orders: orders.map((order) => order.id),
    createdAt: new Date().toISOString(),
    status: 'pending',
    totalCost: orders.reduce((sum, order) => sum + (order.cost || 0), 0),
    totalOrders: orders.length,
  };

  // Link orders to batch
  orders.forEach((order) => {
    order.batchId = batchId;
    order.batchIndex = orders.indexOf(order);
    saveOrder(order);
  });

  // Save batch to localStorage
  const batches = getBatches();
  batches.push(batch);
  localStorage.setItem('printease_batches', JSON.stringify(batches));

  return batch;
};

/**
 * Get all batches
 * @returns {Array} Array of batch objects
 */
export const getBatches = () => {
  const batches = localStorage.getItem('printease_batches');
  return JSON.parse(batches || '[]');
};

/**
 * Get batch by ID
 * @param {string} batchId - Batch ID
 * @returns {Object|null} Batch object or null
 */
export const getBatch = (batchId) => {
  const batches = getBatches();
  return batches.find((b) => b.id === batchId) || null;
};

/**
 * Get orders in a batch
 * @param {string} batchId - Batch ID
 * @returns {Array} Array of order objects
 */
export const getBatchOrders = (batchId) => {
  const orders = getOrders();
  return orders.filter((o) => o.batchId === batchId).sort((a, b) => a.batchIndex - b.batchIndex);
};

/**
 * Get batches for a user
 * @param {string} userId - User ID
 * @returns {Array} Array of batch objects with orders
 */
export const getUserBatches = (userId) => {
  const batches = getBatches();
  const userBatches = batches.filter((batch) => {
    const orders = getBatchOrders(batch.id);
    return orders.some((order) => order.userId === userId);
  });

  return userBatches.map((batch) => ({
    ...batch,
    orders: getBatchOrders(batch.id),
  }));
};

/**
 * Update batch status
 * @param {string} batchId - Batch ID
 * @param {string} status - New status
 */
export const updateBatchStatus = (batchId, status) => {
  const batches = getBatches();
  const batch = batches.find((b) => b.id === batchId);
  if (batch) {
    batch.status = status;
    batch.updatedAt = new Date().toISOString();
    localStorage.setItem('printease_batches', JSON.stringify(batches));
  }
  return batch;
};

/**
 * Get batch summary statistics
 * @param {string} batchId - Batch ID
 * @returns {Object} Batch statistics
 */
export const getBatchStats = (batchId) => {
  const orders = getBatchOrders(batchId);
  
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.statusKey === 'pending').length,
    processingOrders: orders.filter((o) => o.statusKey === 'processing').length,
    readyOrders: orders.filter((o) => o.statusKey === 'ready').length,
    deliveredOrders: orders.filter((o) => o.statusKey === 'delivered').length,
    totalCost: orders.reduce((sum, o) => sum + (o.cost || 0), 0),
    averageETA: orders.length > 0
      ? orders
          .filter((o) => o.eta)
          .map((o) => {
            // Simple ETA parsing (in production, use proper date parsing)
            const etaText = o.eta.toLowerCase();
            if (etaText.includes('today')) return 'Today';
            if (etaText.includes('tomorrow')) return 'Tomorrow';
            return o.eta;
          })
          .join(', ')
      : 'Not set',
  };
};

