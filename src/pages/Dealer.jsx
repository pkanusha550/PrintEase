import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Settings,
  TrendingUp,
  MapPin,
  Truck,
  Store,
  Bell,
  Calendar,
  User,
  MessageCircle,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import {
  getDealerOrders,
  getDealerOrdersByStatus,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  updateOrderETA,
  getDealerProfile,
  updateDealerProfile,
  getEarningsSummary,
  getDeliveryPreferences,
  updateDeliveryPreferences,
  getDealerStats,
  getCurrentDealer,
} from '../services/dealerService';
import { getUnreadCount } from '../services/chatService';
import ChatInterface from '../components/ChatInterface';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'processing', label: 'In Progress', color: 'blue' },
  { value: 'ready', label: 'Ready', color: 'green' },
  { value: 'delivered', label: 'Delivered', color: 'gray' },
];

export default function Dealer() {
  const context = useOutletContext();
  const toast = context?.toast || { success: () => {}, error: () => {} };
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('pending');
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingETA, setIsUpdatingETA] = useState(false);
  const [newETA, setNewETA] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [earnings, setEarnings] = useState(null);
  const [deliveryPrefs, setDeliveryPrefs] = useState(null);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [selectedOrderForChat, setSelectedOrderForChat] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Update unread counts
    if (orders.length > 0) {
      const counts = {};
      orders.forEach((order) => {
        try {
          const dealer = getCurrentDealer();
          if (dealer?.id) {
            counts[order.id] = getUnreadCount(order.id, dealer.id);
          }
        } catch (error) {
          console.error('Error getting unread count:', error);
          counts[order.id] = 0;
        }
      });
      setUnreadCounts(counts);
    }
  }, [orders]);

  useEffect(() => {
    filterOrders();
  }, [orders, orderFilter]);

  const loadData = () => {
    setOrders(getDealerOrders());
    setStats(getDealerStats());
    setProfile(getDealerProfile());
    setDeliveryPrefs(getDeliveryPreferences());
    
    // Calculate earnings for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    setEarnings(getEarningsSummary(startDate.toISOString(), endDate.toISOString()));
  };

  const filterOrders = () => {
    if (orderFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(getDealerOrdersByStatus(orderFilter));
    }
  };

  const handleAcceptOrder = (orderId) => {
    acceptOrder(orderId);
    loadData();
    toast.success('Order accepted! Customer has been notified.');
  };

  const handleRejectOrder = (orderId) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectOrder(orderId, rejectReason);
    loadData();
    toast.success('Order rejected. Customer has been notified.');
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedOrder(null);
  };

  const handleUpdateStatus = (orderId, status, statusKey) => {
    updateOrderStatus(orderId, status, statusKey);
    loadData();
    toast.success(`Order status updated to ${status}. Customer has been notified.`);
  };

  const handleUpdateETA = (orderId) => {
    if (!newETA.trim()) {
      toast.error('Please enter a valid ETA');
      return;
    }
    updateOrderETA(orderId, newETA);
    loadData();
    toast.success('ETA updated! Customer has been notified.');
    setIsUpdatingETA(false);
    setNewETA('');
    setSelectedOrder(null);
  };

  const handleSaveProfile = (updates) => {
    updateDealerProfile(updates);
    loadData();
    toast.success('Profile updated successfully!');
    setIsEditingProfile(false);
  };

  const handleSaveDeliveryPrefs = (preferences) => {
    updateDeliveryPreferences(preferences);
    loadData();
    toast.success('Delivery preferences updated!');
    setIsEditingDelivery(false);
  };

  const tabs = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!profile) {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600">Loading dealer profile...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dealer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile.name}</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.processingOrders}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Ready</p>
                <p className="text-2xl font-bold text-green-600">{stats.readyOrders}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.completedOrders}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter */}
            <Card>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'processing', 'ready', 'delivered'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`px-4 py-2 rounded-office text-sm font-medium transition-colors ${
                      orderFilter === status
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : ORDER_STATUSES.find((s) => s.value === status)?.label || status}
                  </button>
                ))}
              </div>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No orders found</p>
                  </div>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} hover>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{order.id}</h3>
                            <p className="text-sm text-gray-600">{order.title || order.file}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-office text-xs font-semibold ${
                              order.statusKey === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.statusKey === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : order.statusKey === 'ready'
                                ? 'bg-green-100 text-green-800'
                                : order.statusKey === 'delivered'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-semibold">Cost:</span> {order.price || `₹${order.cost || 0}`}
                          </div>
                          <div>
                            <span className="font-semibold">ETA:</span> {order.eta || 'Not set'}
                          </div>
                          <div>
                            <span className="font-semibold">Pages:</span> {order.pages || 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold">Date:</span>{' '}
                            {new Date(order.date || order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {order.orderData && (
                          <div className="mt-2 text-xs text-gray-500">
                            {order.orderData.paperSize} • {order.orderData.printStyle} •{' '}
                            {order.orderData.binding ? `Binding: ${order.orderData.binding}` : 'No binding'}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {order.statusKey === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAcceptOrder(order.id)}
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Accept
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowRejectModal(true);
                              }}
                            >
                              <XCircle size={16} className="mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {order.statusKey === 'processing' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'Ready', 'ready')}
                            >
                              Mark Ready
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsUpdatingETA(true);
                                setNewETA(order.eta || '');
                              }}
                            >
                              <Clock size={16} className="mr-1" />
                              Update ETA
                            </Button>
                          </>
                        )}
                        {order.statusKey === 'ready' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, 'Delivered', 'delivered')}
                          >
                            Mark Delivered
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedOrderForChat(order.id)}
                        >
                          <MessageCircle size={16} className="mr-1" />
                          Chat
                          {unreadCounts[order.id] > 0 && (
                            <span className="ml-1 bg-red-500 text-white text-xs rounded-office px-1.5">
                              {unreadCounts[order.id]}
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Edit size={16} className="mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {isEditingProfile ? (
              <ProfileEditForm
                profile={profile}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditingProfile(false)}
              />
            ) : (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Shop Profile</h2>
                  <Button variant="secondary" onClick={() => setIsEditingProfile(true)}>
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Basic Information</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Name:</span>
                        <p className="text-gray-600">{profile.name}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Rating:</span>
                        <p className="text-gray-600">⭐ {profile.rating || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Distance:</span>
                        <p className="text-gray-600">{profile.distance}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Price Range:</span>
                        <p className="text-gray-600">{profile.priceRange}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Contact</h3>
                    <div className="space-y-3 text-sm">
                      {profile.contact && (
                        <>
                          <div>
                            <span className="font-semibold text-gray-700">Phone:</span>
                            <p className="text-gray-600">{profile.contact.phone}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Email:</span>
                            <p className="text-gray-600">{profile.contact.email}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(profile.services || {}).map(([service, enabled]) => (
                        <span
                          key={service}
                          className={`px-3 py-1 rounded-office text-xs font-semibold ${
                            enabled
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  {profile.hours && (
                    <div>
                      <h3 className="font-semibold mb-4">Business Hours</h3>
                      <div className="space-y-2 text-sm">
                        {Object.entries(profile.hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="font-semibold text-gray-700 capitalize">{day}:</span>
                            <span className="text-gray-600">{hours || 'Closed'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && earnings && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                    <p className="text-3xl font-bold text-gray-900">₹{earnings.totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-office">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Earnings</p>
                    <p className="text-3xl font-bold text-gray-900">₹{earnings.pendingEarnings.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">In progress orders</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-office">
                    <Clock className="text-yellow-600" size={24} />
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                    <p className="text-3xl font-bold text-gray-900">₹{Math.round(earnings.averageOrderValue).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Per completed order</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-office">
                    <TrendingUp className="text-blue-600" size={24} />
                  </div>
                </div>
              </Card>
            </div>
            <Card>
              <h3 className="font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{earnings.totalOrders}</p>
                </div>
                <div>
                  <p className="text-gray-600">Completed</p>
                  <p className="text-xl font-bold text-green-600">{earnings.completedOrders}</p>
                </div>
                <div>
                  <p className="text-gray-600">Completion Rate</p>
                  <p className="text-xl font-bold text-gray-900">
                    {earnings.totalOrders > 0
                      ? Math.round((earnings.completedOrders / earnings.totalOrders) * 100)
                      : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-primary">₹{earnings.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Delivery Preferences</h2>
                  <p className="text-sm text-gray-600">Configure pickup and delivery options</p>
                </div>
                {!isEditingDelivery && (
                  <Button variant="secondary" onClick={() => setIsEditingDelivery(true)}>
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditingDelivery ? (
                <DeliveryPreferencesForm
                  preferences={deliveryPrefs}
                  onSave={handleSaveDeliveryPrefs}
                  onCancel={() => setIsEditingDelivery(false)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Options</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Pickup Available</span>
                        <span
                          className={`px-3 py-1 rounded-office text-xs font-semibold ${
                            deliveryPrefs?.pickup
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {deliveryPrefs?.pickup ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Delivery Available</span>
                        <span
                          className={`px-3 py-1 rounded-office text-xs font-semibold ${
                            deliveryPrefs?.delivery
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {deliveryPrefs?.delivery ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {deliveryPrefs?.delivery && (
                    <div>
                      <h3 className="font-semibold mb-4">Delivery Settings</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Delivery Radius:</span>
                          <p className="text-gray-600">{deliveryPrefs.deliveryRadius} km</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Delivery Fee:</span>
                          <p className="text-gray-600">₹{deliveryPrefs.deliveryFee}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Free Delivery Threshold:</span>
                          <p className="text-gray-600">₹{deliveryPrefs.freeDeliveryThreshold}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Reject Order Modal */}
        {showRejectModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Reject Order</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to reject order <strong>{selectedOrder.id}</strong>?
              </p>
              <Input
                label="Reason for Rejection"
                placeholder="Enter reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
              <div className="flex gap-2 mt-6">
                <Button
                  variant="danger"
                  onClick={() => handleRejectOrder(selectedOrder.id)}
                  className="flex-1"
                >
                  Reject Order
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedOrder(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Update ETA Modal */}
        {isUpdatingETA && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Update ETA</h2>
              <p className="text-gray-600 mb-4">Order: {selectedOrder.id}</p>
              <Input
                label="New ETA"
                placeholder="e.g., Today, 7:30 PM or 2 hours"
                value={newETA}
                onChange={(e) => setNewETA(e.target.value)}
                required
              />
              <div className="flex gap-2 mt-6">
                <Button
                  variant="primary"
                  onClick={() => handleUpdateETA(selectedOrder.id)}
                  className="flex-1"
                >
                  Update ETA
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsUpdatingETA(false);
                    setNewETA('');
                    setSelectedOrder(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && !showRejectModal && !isUpdatingETA && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order Details: {selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">File:</span>
                      <p className="font-semibold">{selectedOrder.title || selectedOrder.file}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-semibold">{selectedOrder.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost:</span>
                      <p className="font-semibold">{selectedOrder.price || `₹${selectedOrder.cost || 0}`}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">ETA:</span>
                      <p className="font-semibold">{selectedOrder.eta || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                {selectedOrder.orderData && (
                  <div>
                    <h3 className="font-semibold mb-2">Print Specifications</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Paper Size:</span>
                        <p className="font-semibold">{selectedOrder.orderData.paperSize}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Paper Type:</span>
                        <p className="font-semibold">{selectedOrder.orderData.paperType}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Print Style:</span>
                        <p className="font-semibold">{selectedOrder.orderData.printStyle}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Copies:</span>
                        <p className="font-semibold">{selectedOrder.orderData.copies}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileEditForm({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    rating: profile.rating || 0,
    distance: profile.distance || '',
    eta: profile.eta || '',
    priceRange: profile.priceRange || '',
    contact: {
      phone: profile.contact?.phone || '',
      email: profile.contact?.email || '',
    },
    services: { ...profile.services },
    hours: profile.hours || {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed',
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleService = (service) => {
    setFormData({
      ...formData,
      services: {
        ...formData.services,
        [service]: !formData.services[service],
      },
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Shop Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
            />
            <Input
              label="Distance"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
            />
            <Input
              label="Default ETA"
              value={formData.eta}
              onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
            />
            <Input
              label="Price Range"
              value={formData.priceRange}
              onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.contact.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, phone: e.target.value },
                })
              }
            />
            <Input
              label="Email"
              type="email"
              value={formData.contact.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, email: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Services</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(formData.services).map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                className={`px-4 py-2 rounded-office text-sm font-semibold transition-colors ${
                  formData.services[service]
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Business Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.hours).map(([day, hours]) => (
              <Input
                key={day}
                label={day.charAt(0).toUpperCase() + day.slice(1)}
                value={hours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hours: { ...formData.hours, [day]: e.target.value },
                  })
                }
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" variant="primary" className="flex-1">
            Save Changes
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function DeliveryPreferencesForm({ preferences, onSave, onCancel }) {
  const [formData, setFormData] = useState({ ...preferences });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.pickup}
            onChange={(e) => setFormData({ ...formData, pickup: e.target.checked })}
            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <span className="text-gray-700">Enable Pickup</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.delivery}
            onChange={(e) => setFormData({ ...formData, delivery: e.target.checked })}
            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <span className="text-gray-700">Enable Delivery</span>
        </label>
      </div>

      {formData.delivery && (
        <div className="space-y-4 pt-4 border-t">
          <Input
            label="Delivery Radius (km)"
            type="number"
            min="0"
            value={formData.deliveryRadius}
            onChange={(e) => setFormData({ ...formData, deliveryRadius: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Delivery Fee (₹)"
            type="number"
            min="0"
            value={formData.deliveryFee}
            onChange={(e) => setFormData({ ...formData, deliveryFee: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Free Delivery Threshold (₹)"
            type="number"
            min="0"
            value={formData.freeDeliveryThreshold}
            onChange={(e) =>
              setFormData({ ...formData, freeDeliveryThreshold: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          Save Preferences
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}

