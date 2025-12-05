# PrintEase - Acceptance Criteria & Testing Guide

## Overview
This document outlines the acceptance criteria and manual testing checklist for the PrintEase frontend application.

## Acceptance Criteria

### 1. Customer Order Flow ✅
- **AC1.1**: Customer can upload files (PDF, DOC, DOCX, PPT, PPTX)
- **AC1.2**: Customer can customize print settings (paper size, type, binding, etc.)
- **AC1.3**: Customer can select dealer from map/list view
- **AC1.4**: Customer can review order and select payment method
- **AC1.5**: Customer can complete mock payment (Stripe, PayPal, UPI)
- **AC1.6**: Order is saved with `paymentStatus: "Paid"` on successful payment
- **AC1.7**: Customer receives payment success notification
- **AC1.8**: File metadata and thumbnails are stored correctly

### 2. Admin Dashboard ✅
- **AC2.1**: Admin can view dashboard with KPIs (orders, revenue, pending, avg ETA)
- **AC2.2**: Admin can view all orders with filtering and search
- **AC2.3**: Admin can update order status
- **AC2.4**: Admin can reassign dealer (with notifications)
- **AC2.5**: Admin can override ETA (with notifications and audit log)
- **AC2.6**: Admin can override pricing (with notifications and audit log)
- **AC2.7**: Admin can view detailed audit log for each order
- **AC2.8**: Admin can manage dealers (approve/reject/edit)
- **AC2.9**: Admin can view reports with date-range charts
- **AC2.10**: Admin can view users list with last order info

### 3. Dealer Dashboard ✅
- **AC3.1**: Dealer can view incoming orders queue
- **AC3.2**: Dealer can accept/reject orders
- **AC3.3**: Dealer can update order status (In-Progress, Ready, Delivered)
- **AC3.4**: Dealer can update ETA per order
- **AC3.5**: Dealer can edit shop profile (services, pricing, hours)
- **AC3.6**: Dealer can view earnings summary
- **AC3.7**: Dealer can configure pickup/delivery preferences
- **AC3.8**: All updates trigger customer notifications

### 4. Real-time Notifications ✅
- **AC4.1**: Notifications work using BroadcastChannel or setInterval fallback
- **AC4.2**: Notification bell shows unread count
- **AC4.3**: Notifications appear for:
  - Order status updates
  - Payment success/failure
  - Dealer accepted/rejected
  - Admin announcements
  - ETA updates
  - Admin overrides
- **AC4.4**: Notifications persist across page refreshes
- **AC4.5**: Users can mark notifications as read/delete

### 5. Role-Based Access Control ✅
- **AC5.1**: Guest users cannot access protected routes
- **AC5.2**: Customer can only access `/order` and `/my-orders`
- **AC5.3**: Dealer can only access `/dealer`
- **AC5.4**: Admin can only access `/admin`
- **AC5.5**: Unauthorized access redirects to login
- **AC5.6**: Navbar shows role-appropriate links

### 6. File Storage ✅
- **AC6.1**: Small files (< 2MB) store thumbnail/base64 preview
- **AC6.2**: Large files (> 2MB) store only metadata
- **AC6.3**: File metadata persists in localStorage
- **AC6.4**: File previews display correctly
- **AC6.5**: Large files show re-upload warning

### 7. Order Chat ✅
- **AC7.1**: Chat interface available for each order
- **AC7.2**: Messages stored in `order.messages[]`
- **AC7.3**: Messages show timestamps and sender role
- **AC7.4**: Message delivery status simulated (sent → delivered → read)
- **AC7.5**: Customer and dealer can communicate
- **AC7.6**: Unread message count displayed
- **AC7.7**: Messages persist in localStorage

### 8. Audit Log ✅
- **AC8.1**: Each order has `auditLog[]` array
- **AC8.2**: Audit entries include:
  - timestamp
  - user role
  - changed fields
  - previous → new values
- **AC8.3**: Audit log visible only in admin order details
- **AC8.4**: All order changes are logged

### 9. Order Batching ✅
- **AC9.1**: Multiple orders can be grouped as batch
- **AC9.2**: Each order maintains own ETA and tracking
- **AC9.3**: Batch view shows grouped orders
- **AC9.4**: Individual order tracking within batch
- **AC9.5**: Batch statistics displayed

### 10. Map & Location ✅
- **AC10.1**: Dealers sorted by distance using Haversine formula
- **AC10.2**: Map view available (react-leaflet or fallback)
- **AC10.3**: User location detected (with fallback)
- **AC10.4**: Dealers have coordinates

## Manual Testing Checklist

### Setup
- [ ] Run `npm install` (if needed)
- [ ] Run `npm run dev`
- [ ] Open browser to `http://localhost:5173`

### Customer Flow
1. **Login as Customer**
   - [ ] Go to `/login`
   - [ ] Use: `john@example.com` / `password123`
   - [ ] Verify redirect to home page
   - [ ] Verify "New Order" and "My Orders" visible in navbar

2. **Place Order**
   - [ ] Go to `/order`
   - [ ] Upload a file (test both small < 2MB and large > 2MB)
   - [ ] Verify file preview for small files
   - [ ] Verify warning for large files
   - [ ] Customize print settings
   - [ ] Select dealer (test both map and list view)
   - [ ] Verify dealers sorted by distance
   - [ ] Review order
   - [ ] Select payment method (test all 3: Stripe, PayPal, UPI)
   - [ ] Complete payment
   - [ ] Verify success notification
   - [ ] Verify redirect to `/my-orders`
   - [ ] Verify order appears in My Orders

3. **View Orders**
   - [ ] Go to `/my-orders`
   - [ ] Verify order displayed
   - [ ] Test filters (all, pending, processing, ready, delivered)
   - [ ] Test batch view toggle
   - [ ] Click "Chat" button
   - [ ] Send message in chat
   - [ ] Verify message appears
   - [ ] Verify unread count updates

### Admin Flow
1. **Login as Admin**
   - [ ] Go to `/login`
   - [ ] Use: `admin@printease.in` / `admin123`
   - [ ] Verify redirect to `/admin`
   - [ ] Verify "Admin" link in navbar

2. **Dashboard**
   - [ ] Verify KPI cards show correct data
   - [ ] Verify stats (total orders, revenue, pending, avg ETA)
   - [ ] Verify dealer stats
   - [ ] Verify user count

3. **Orders Management**
   - [ ] Go to Orders tab
   - [ ] Verify all orders displayed
   - [ ] Test search functionality
   - [ ] Test status filter
   - [ ] Click "Manage" on an order
   - [ ] Update order status
   - [ ] Reassign dealer
   - [ ] Override ETA (enter new ETA, click Override)
   - [ ] Override pricing (enter new price and reason, click Override)
   - [ ] Verify notifications sent
   - [ ] Click "Audit Log" tab
   - [ ] Verify detailed audit log shows:
     - Timestamp
     - Role
     - Changed fields
     - Previous → new values
   - [ ] Click "Chat" tab
   - [ ] Send message as admin
   - [ ] Verify message appears

4. **Dealers Management**
   - [ ] Go to Dealers tab
   - [ ] Verify all dealers displayed
   - [ ] Approve pending dealer
   - [ ] Reject pending dealer
   - [ ] Edit dealer information
   - [ ] Toggle dealer services
   - [ ] Verify changes saved

5. **Reports**
   - [ ] Go to Reports tab
   - [ ] Select date range
   - [ ] Verify revenue chart displays
   - [ ] Verify orders chart displays
   - [ ] Verify totals calculated correctly

6. **Users**
   - [ ] Go to Users tab
   - [ ] Verify all users displayed
   - [ ] Verify last order shown for each user

### Dealer Flow
1. **Login as Dealer**
   - [ ] Go to `/login`
   - [ ] Use: `dealer@printease.in` / `dealer123`
   - [ ] Verify redirect to `/dealer`
   - [ ] Verify "Dealer" link in navbar

2. **Orders Queue**
   - [ ] Verify stats cards displayed
   - [ ] Verify incoming orders listed
   - [ ] Test status filters
   - [ ] Accept a pending order
   - [ ] Verify notification sent to customer
   - [ ] Update order status to "Ready"
   - [ ] Update ETA for an order
   - [ ] Click "Chat" button
   - [ ] Send message to customer
   - [ ] Verify message appears
   - [ ] Verify unread count

3. **Profile**
   - [ ] Go to Profile tab
   - [ ] Click "Edit Profile"
   - [ ] Update shop information
   - [ ] Update services
   - [ ] Update business hours
   - [ ] Save changes
   - [ ] Verify changes saved

4. **Earnings**
   - [ ] Go to Earnings tab
   - [ ] Verify earnings summary displayed
   - [ ] Verify totals calculated correctly

5. **Settings**
   - [ ] Go to Settings tab
   - [ ] Update delivery preferences
   - [ ] Toggle pickup/delivery
   - [ ] Update delivery radius, fee, threshold
   - [ ] Save preferences
   - [ ] Verify changes saved

### Notifications Testing
1. **Test Notification System**
   - [ ] Login as customer
   - [ ] Place an order
   - [ ] Verify payment notification appears
   - [ ] Login as dealer
   - [ ] Accept the order
   - [ ] Switch back to customer account (or open new tab)
   - [ ] Verify notification appears in bell
   - [ ] Click notification bell
   - [ ] Verify notification in dropdown
   - [ ] Mark as read
   - [ ] Delete notification
   - [ ] Test "Mark all as read"

2. **Test Admin Override Notifications**
   - [ ] Login as admin
   - [ ] Override ETA for an order
   - [ ] Login as customer (owner of order)
   - [ ] Verify notification received
   - [ ] Login as dealer (assigned to order)
   - [ ] Verify notification received

### RBAC Testing
1. **Test Route Protection**
   - [ ] Logout (or use incognito)
   - [ ] Try accessing `/order` → Should redirect to login
   - [ ] Try accessing `/admin` → Should redirect to login
   - [ ] Try accessing `/dealer` → Should redirect to login
   - [ ] Login as customer
   - [ ] Try accessing `/admin` → Should redirect to login
   - [ ] Try accessing `/dealer` → Should redirect to login
   - [ ] Login as admin
   - [ ] Try accessing `/order` → Should work (if allowed) or redirect
   - [ ] Try accessing `/dealer` → Should redirect to login

### File Storage Testing
1. **Test Small Files**
   - [ ] Upload image file < 2MB
   - [ ] Verify thumbnail preview appears
   - [ ] Verify file metadata saved
   - [ ] Check localStorage for file data

2. **Test Large Files**
   - [ ] Upload file > 2MB
   - [ ] Verify warning message appears
   - [ ] Verify only metadata saved
   - [ ] Verify no thumbnail stored

### Chat Testing
1. **Test Customer-Dealer Chat**
   - [ ] Login as customer
   - [ ] Go to My Orders
   - [ ] Click "Chat" on an order
   - [ ] Send message
   - [ ] Login as dealer (in another browser/tab)
   - [ ] Go to Dealer dashboard
   - [ ] Click "Chat" on same order
   - [ ] Verify customer message appears
   - [ ] Send reply
   - [ ] Switch back to customer
   - [ ] Verify dealer message appears
   - [ ] Verify unread count updates

2. **Test Message Status**
   - [ ] Send message
   - [ ] Verify shows "sent" status (single check)
   - [ ] Wait 1 second
   - [ ] Verify shows "delivered" status (double check)
   - [ ] Recipient reads message
   - [ ] Verify shows "read" status (blue double check)

### Audit Log Testing
1. **Test Audit Logging**
   - [ ] Login as admin
   - [ ] Make changes to an order:
     - Update status
     - Reassign dealer
     - Override ETA
     - Override pricing
   - [ ] View Audit Log tab
   - [ ] Verify all changes logged with:
     - Timestamp
     - Role (admin)
     - Changed fields
     - Previous values
     - Current values
   - [ ] Login as dealer
   - [ ] Update order status
   - [ ] Login as admin
   - [ ] View Audit Log
   - [ ] Verify dealer change logged with role "dealer"

### Batch Testing
1. **Test Order Batching**
   - [ ] Create multiple orders (programmatically or manually)
   - [ ] Group them into batch using `createBatch([order1, order2])`
   - [ ] Login as customer
   - [ ] Go to My Orders
   - [ ] Switch to "Batches" view
   - [ ] Verify batch displayed
   - [ ] Expand batch
   - [ ] Verify individual orders shown
   - [ ] Verify each order has own status/ETA

### Map & Location Testing
1. **Test Location Services**
   - [ ] Allow location access when prompted
   - [ ] Verify dealers sorted by distance
   - [ ] Click "Map View" in dealer selection
   - [ ] Verify map displays (or fallback static map)
   - [ ] Click dealer on map
   - [ ] Verify dealer selected
   - [ ] Test without location access
   - [ ] Verify fallback to default location works

## Simulating Notifications Manually

### Method 1: Using Browser Console
```javascript
// Import notification service
import { publish } from './services/notificationService';

// Publish a test notification
publish({
  type: 'test_notification',
  title: 'Test Notification',
  message: 'This is a test notification',
  userId: 'user_1', // Replace with actual user ID
});
```

### Method 2: Using Admin Actions
1. Login as admin
2. Go to Orders tab
3. Click "Manage" on any order
4. Perform actions that trigger notifications:
   - Update status
   - Reassign dealer
   - Override ETA
   - Override pricing
5. Check notification bell in navbar

### Method 3: Using Dealer Actions
1. Login as dealer
2. Accept/reject orders
3. Update order status
4. Update ETA
5. Check notifications

### Method 4: Using Payment Flow
1. Login as customer
2. Place order and complete payment
3. Payment success/failure notifications will trigger automatically

## Known Limitations

1. **Real-time Updates**: Uses BroadcastChannel with setInterval fallback. True real-time requires WebSocket backend.
2. **File Storage**: localStorage limited to ~5-10MB. Large files require re-upload. Production should use IndexedDB or backend storage.
3. **Map**: Requires react-leaflet installation for interactive map. Falls back to static map if unavailable.
4. **Notifications**: Simulated. Production requires push notification service.
5. **Authentication**: Mock authentication. Production requires secure backend with JWT tokens.

## Production Readiness Checklist

- [ ] Replace localStorage with IndexedDB for file storage
- [ ] Implement backend API for all services
- [ ] Add WebSocket for real-time notifications
- [ ] Implement proper authentication (JWT)
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add proper error handling
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add E2E tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Accessibility audit

## Files Modified

### Services
- `src/services/adminService.js` - Added override functions, audit log integration
- `src/services/dealerService.js` - Added audit log integration
- `src/services/chatService.js` - NEW: Order-based chat service
- `src/services/auditLogService.js` - NEW: Detailed audit logging
- `src/services/notificationService.js` - Real-time notifications
- `src/services/paymentService.js` - Payment processing with notifications
- `src/services/fileStorageService.js` - File storage with thumbnails
- `src/services/locationService.js` - Distance calculations
- `src/services/orderBatchService.js` - Order batching

### Components
- `src/components/ChatInterface.jsx` - NEW: Order chat component
- `src/components/NotificationBell.jsx` - Notification bell with dropdown
- `src/components/ProtectedRoute.jsx` - RBAC route protection
- `src/components/MapView.jsx` - Map component with fallback
- `src/components/Navbar.jsx` - Added notification bell, role-based links
- `src/components/Layout.jsx` - Updated footer

### Pages
- `src/pages/Order.jsx` - File storage, map view, batch support
- `src/pages/Admin.jsx` - Override UI, audit log display, chat
- `src/pages/Dealer.jsx` - Chat integration, unread counts
- `src/pages/MyOrders.jsx` - Batch view, chat integration
- `src/pages/Login.jsx` - AuthContext integration

### Contexts
- `src/contexts/AuthContext.jsx` - Global authentication

### Data
- `src/data/dealers.js` - Added coordinates
- `src/data/sampleUsers.json` - Mock user accounts

### Documentation
- `docs/AC_and_tests.md` - NEW: This file

## Key Code Excerpts

### Chat Service Usage
```javascript
import { sendMessage, getOrderMessages } from '../services/chatService';

// Send message
sendMessage(orderId, 'Hello!', userId, 'customer', 'John Doe');

// Get messages
const messages = getOrderMessages(orderId);
```

### Audit Log Usage
```javascript
import { addAuditLog, createChangesObject } from '../services/auditLogService';

// Log change
const changes = createChangesObject(previousState, currentState);
addAuditLog(orderId, 'admin', userId, changes, 'Reason for change');
```

### Notification Publishing
```javascript
import { publish } from '../services/notificationService';

publish({
  type: 'order_status_update',
  title: 'Order Updated',
  message: 'Your order has been updated',
  userId: 'user_1',
  orderId: 'PE-123',
});
```

## Instructions for Running Flows

### Admin Flow
1. Login: `admin@printease.in` / `admin123`
2. Navigate to `/admin`
3. Use Orders tab to manage orders
4. Click "Manage" on any order
5. Use override sections to change ETA/pricing
6. View Audit Log tab for detailed history
7. Use Chat tab to communicate

### Dealer Flow
1. Login: `dealer@printease.in` / `dealer123`
2. Navigate to `/dealer`
3. View incoming orders
4. Accept/reject orders
5. Update status and ETA
6. Click "Chat" to communicate with customers
7. Edit profile and settings

### Customer Flow
1. Login: `john@example.com` / `password123`
2. Navigate to `/order`
3. Upload file and customize
4. Select dealer (use map view)
5. Complete payment
6. Go to `/my-orders`
7. Click "Chat" to communicate with dealer
8. View order status and updates

## Method to Simulate Notifications Manually

### Using Browser Console
1. Open browser console (F12)
2. Navigate to application
3. Run:
```javascript
// Get notification service
const { publish } = await import('./src/services/notificationService.js');

// Publish notification
publish({
  type: 'test_notification',
  title: 'Manual Test',
  message: 'This is a manually triggered notification',
  userId: 'user_1', // Change to target user ID
});
```

### Using Application Actions
- Place order → Payment notification
- Admin overrides → Override notifications
- Dealer updates → Status notifications
- Chat messages → New message notifications

All notifications are stored in `localStorage` under `printease_notifications` and can be inspected in DevTools.

