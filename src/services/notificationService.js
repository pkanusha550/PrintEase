/**
 * Notification Service - Pseudo-real-time notifications
 * 
 * Uses BroadcastChannel API for cross-tab communication
 * Falls back to setInterval polling if BroadcastChannel is not available
 */

class NotificationService {
  constructor() {
    this.subscribers = new Set();
    this.notifications = JSON.parse(localStorage.getItem('printease_notifications') || '[]');
    this.channel = null;
    this.pollInterval = null;
    
    // Initialize BroadcastChannel or fallback to polling
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('printease_notifications');
      this.channel.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    } else {
      // Fallback: Poll localStorage every 2 seconds
      this.startPolling();
    }
    
    // Listen for storage events (cross-tab updates)
    window.addEventListener('storage', (e) => {
      if (e.key === 'printease_notifications') {
        this.loadNotifications();
        this.notifySubscribers();
      }
    });
  }

  startPolling() {
    if (this.pollInterval) return;
    
    this.pollInterval = setInterval(() => {
      const stored = JSON.parse(localStorage.getItem('printease_notifications') || '[]');
      if (stored.length !== this.notifications.length) {
        this.loadNotifications();
        this.notifySubscribers();
      }
    }, 2000);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  loadNotifications() {
    this.notifications = JSON.parse(localStorage.getItem('printease_notifications') || '[]');
  }

  handleMessage(data) {
    if (data.type === 'notification') {
      this.loadNotifications();
      this.notifySubscribers();
    }
  }

  /**
   * Subscribe to notification updates
   * @param {Function} callback - Function to call when notifications change
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Immediately call with current notifications
    callback(this.notifications);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Unsubscribe from notification updates
   * @param {Function} callback - Callback to remove
   */
  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers
   */
  notifySubscribers() {
    this.subscribers.forEach((callback) => {
      try {
        callback(this.notifications);
      } catch (error) {
        console.error('Error in notification subscriber:', error);
      }
    });
  }

  /**
   * Publish a new notification event
   * @param {Object} event - Event data
   */
  publish(event) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...event,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Add to notifications array
    this.notifications.push(notification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(-100);
    }

    // Save to localStorage
    localStorage.setItem('printease_notifications', JSON.stringify(this.notifications));

    // Broadcast to other tabs/windows
    if (this.channel) {
      this.channel.postMessage({
        type: 'notification',
        notification,
      });
    }

    // Notify subscribers
    this.notifySubscribers();
  }

  /**
   * Get all notifications
   * @param {string} userId - Optional: filter by user ID
   * @returns {Array} Array of notifications
   */
  getNotifications(userId = null) {
    if (userId) {
      return this.notifications.filter((n) => n.userId === userId);
    }
    return [...this.notifications];
  }

  /**
   * Get unread notifications count
   * @param {string} userId - Optional: filter by user ID
   * @returns {number} Count of unread notifications
   */
  getUnreadCount(userId = null) {
    const notifications = userId
      ? this.notifications.filter((n) => n.userId === userId)
      : this.notifications;
    return notifications.filter((n) => !n.read).length;
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem('printease_notifications', JSON.stringify(this.notifications));
      
      if (this.channel) {
        this.channel.postMessage({
          type: 'notification_read',
          notificationId,
        });
      }
      
      this.notifySubscribers();
    }
  }

  /**
   * Mark all notifications as read
   * @param {string} userId - Optional: filter by user ID
   */
  markAllAsRead(userId = null) {
    const notifications = userId
      ? this.notifications.filter((n) => n.userId === userId)
      : this.notifications;
    
    notifications.forEach((n) => {
      n.read = true;
    });

    localStorage.setItem('printease_notifications', JSON.stringify(this.notifications));
    
    if (this.channel) {
      this.channel.postMessage({
        type: 'notifications_all_read',
        userId,
      });
    }
    
    this.notifySubscribers();
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   */
  delete(notificationId) {
    this.notifications = this.notifications.filter((n) => n.id !== notificationId);
    localStorage.setItem('printease_notifications', JSON.stringify(this.notifications));
    
    if (this.channel) {
      this.channel.postMessage({
        type: 'notification_deleted',
        notificationId,
      });
    }
    
    this.notifySubscribers();
  }

  /**
   * Clear all notifications
   * @param {string} userId - Optional: filter by user ID
   */
  clear(userId = null) {
    if (userId) {
      this.notifications = this.notifications.filter((n) => n.userId !== userId);
    } else {
      this.notifications = [];
    }
    
    localStorage.setItem('printease_notifications', JSON.stringify(this.notifications));
    
    if (this.channel) {
      this.channel.postMessage({
        type: 'notifications_cleared',
        userId,
      });
    }
    
    this.notifySubscribers();
  }

  /**
   * Cleanup - call when service is no longer needed
   */
  destroy() {
    this.stopPolling();
    if (this.channel) {
      this.channel.close();
    }
    this.subscribers.clear();
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export convenience functions
export const subscribe = (callback) => notificationService.subscribe(callback);
export const unsubscribe = (callback) => notificationService.unsubscribe(callback);
export const publish = (event) => notificationService.publish(event);
export const getNotifications = (userId) => notificationService.getNotifications(userId);
export const getUnreadCount = (userId) => notificationService.getUnreadCount(userId);
export const markAsRead = (notificationId) => notificationService.markAsRead(notificationId);
export const markAllAsRead = (userId) => notificationService.markAllAsRead(userId);
export const deleteNotification = (notificationId) => notificationService.delete(notificationId);
export const clearNotifications = (userId) => notificationService.clear(userId);

export default notificationService;

