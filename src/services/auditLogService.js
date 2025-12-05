/**
 * Audit Log Service - Detailed field-level change tracking
 * 
 * Tracks all changes to orders with:
 * - Timestamp
 * - User role
 * - Changed fields
 * - Previous → new values
 * 
 * Separate from changeLog which tracks high-level actions
 * 
 * TODO: Replace with backend API:
 * - POST /api/orders/:orderId/audit - Log change
 * - GET /api/orders/:orderId/audit - Get audit log
 * - Implement proper audit trail with user authentication
 */

import { getOrders, saveOrder } from './adminService';

/**
 * Add audit log entry to order
 * @param {string} orderId - Order ID
 * @param {string} role - User role making change
 * @param {string} userId - User ID making change
 * @param {Object} changes - Object with field names as keys and {previous, current} as values
 * @param {string} reason - Optional reason for change
 */
export const addAuditLog = (orderId, role, userId, changes, reason = '') => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  
  if (!order) return;

  // Initialize auditLog if not exists
  if (!order.auditLog) {
    order.auditLog = [];
  }

  const auditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    role,
    userId,
    changedFields: Object.keys(changes),
    changes: Object.entries(changes).map(([field, values]) => ({
      field,
      previous: values.previous,
      current: values.current,
    })),
    reason,
  };

  order.auditLog.push(auditEntry);
  order.updatedAt = new Date().toISOString();
  saveOrder(order);

  return auditEntry;
};

/**
 * Get audit log for an order
 * @param {string} orderId - Order ID
 * @returns {Array} Array of audit log entries
 */
export const getAuditLog = (orderId) => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  return order?.auditLog || [];
};

/**
 * Get audit log filtered by field
 * @param {string} orderId - Order ID
 * @param {string} field - Field name to filter by
 * @returns {Array} Filtered audit log entries
 */
export const getAuditLogByField = (orderId, field) => {
  const auditLog = getAuditLog(orderId);
  return auditLog.filter((entry) => entry.changedFields.includes(field));
};

/**
 * Get audit log filtered by role
 * @param {string} orderId - Order ID
 * @param {string} role - Role to filter by
 * @returns {Array} Filtered audit log entries
 */
export const getAuditLogByRole = (orderId, role) => {
  const auditLog = getAuditLog(orderId);
  return auditLog.filter((entry) => entry.role === role);
};

/**
 * Helper to create changes object for audit log
 * @param {Object} previousState - Previous state
 * @param {Object} currentState - Current state
 * @param {Array} fieldsToTrack - Fields to track (if empty, tracks all differences)
 * @returns {Object} Changes object
 */
export const createChangesObject = (previousState, currentState, fieldsToTrack = []) => {
  const changes = {};
  const fields = fieldsToTrack.length > 0 ? fieldsToTrack : Object.keys(currentState);

  fields.forEach((field) => {
    if (previousState[field] !== currentState[field]) {
      changes[field] = {
        previous: previousState[field],
        current: currentState[field],
      };
    }
  });

  return changes;
};

