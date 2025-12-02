import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Package,
  DollarSign,
  Clock,
  Users,
  ShoppingCart,
  Building2,
  BarChart3,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  MessageCircle,
  History,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import {
  getDashboardStats,
  getOrders,
  getDealers,
  getUsers,
  updateOrderStatus,
  reassignDealer,
  cancelOrder,
  approveDealer,
  rejectDealer,
  updateDealerInfo,
  updateDealerServices,
  getOrdersByDateRange,
  getRevenueByDateRange,
  adminReassignDealer,
  adminOverrideETA,
  adminOverridePricing,
} from '../services/adminService';
import { getAuditLog } from '../services/auditLogService';
import ChatInterface from '../components/ChatInterface';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Admin() {
  const context = useOutletContext();
  const toast = context?.toast || { success: () => {}, error: () => {} };
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [isEditingDealer, setIsEditingDealer] = useState(false);
  const [reportStartDate, setReportStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [reportEndDate, setReportEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [overrideETA, setOverrideETA] = useState('');
  const [overridePricing, setOverridePricing] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, orderFilter, orderSearch]);

  useEffect(() => {
    // Reset chat/audit log tabs when order changes
    if (selectedOrder) {
      setShowChat(false);
      setShowAuditLog(false);
    }
  }, [selectedOrder?.id]);

  const loadData = () => {
    setStats(getDashboardStats());
    setOrders(getOrders());
    setDealers(getDealers());
    setUsers(getUsers());
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (orderFilter !== 'all') {
      filtered = filtered.filter((o) => o.statusKey === orderFilter);
    }

    if (orderSearch) {
      const searchLower = orderSearch.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id?.toLowerCase().includes(searchLower) ||
          o.title?.toLowerCase().includes(searchLower) ||
          o.dealer?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleUpdateOrderStatus = (orderId, status, statusKey) => {
    updateOrderStatus(orderId, status, statusKey);
    loadData();
    toast.success(`Order status updated to ${status}`);
    setSelectedOrder(null);
  };

  const handleReassignDealer = (orderId, dealerId, dealerName) => {
    adminReassignDealer(orderId, dealerId, dealerName);
    loadData();
    toast.success('Dealer reassigned successfully. Customer and dealer notified.');
    setSelectedOrder(null);
  };

  const handleOverrideETA = (orderId) => {
    if (!overrideETA.trim()) {
      toast.error('Please enter a valid ETA');
      return;
    }
    adminOverrideETA(orderId, overrideETA);
    loadData();
    toast.success('ETA overridden successfully. Customer and dealer notified.');
    setOverrideETA('');
    setShowOverrideModal(false);
    setSelectedOrder(null);
  };

  const handleOverridePricing = (orderId) => {
    const newCost = parseFloat(overridePricing);
    if (!newCost || newCost <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    adminOverridePricing(orderId, newCost, overrideReason);
    loadData();
    toast.success('Pricing overridden successfully. Customer and dealer notified.');
    setOverridePricing('');
    setOverrideReason('');
    setShowOverrideModal(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrder(orderId);
      loadData();
      toast.success('Order cancelled');
      setSelectedOrder(null);
    }
  };

  const handleApproveDealer = (dealerId) => {
    approveDealer(dealerId);
    loadData();
    toast.success('Dealer approved');
  };

  const handleRejectDealer = (dealerId) => {
    if (window.confirm('Are you sure you want to reject this dealer?')) {
      rejectDealer(dealerId);
      loadData();
      toast.success('Dealer rejected');
    }
  };

  const handleToggleService = (dealerId, service) => {
    const dealer = dealers.find((d) => d.id === dealerId);
    if (dealer) {
      updateDealerServices(dealerId, {
        [service]: !dealer.services[service],
      });
      loadData();
      toast.success('Service updated');
    }
  };

  const handleSaveDealer = (dealerId, updates) => {
    updateDealerInfo(dealerId, updates);
    loadData();
    toast.success('Dealer information updated');
    setIsEditingDealer(false);
    setSelectedDealer(null);
  };

  // Get user's last order
  const getUserLastOrder = (userId) => {
    const userOrders = orders.filter((o) => o.userId === userId);
    if (userOrders.length === 0) return null;
    return userOrders.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };

  // Generate chart data for reports
  const generateChartData = () => {
    const startDate = new Date(reportStartDate);
    const endDate = new Date(reportEndDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const data = [];

    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayOrders = getOrdersByDateRange(date, date);
      const revenue = dayOrders
        .filter((o) => o.paymentStatus === 'Paid')
        .reduce((sum, o) => sum + (o.cost || 0), 0);

      data.push({
        date: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue,
      });
    }

    return data;
  };

  const chartData = generateChartData();
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...chartData.map((d) => d.orders), 1);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'dealers', label: 'Dealers', icon: Building2 },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: User },
  ];

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage orders, dealers, and users</p>
        </div>

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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-primary-light p-3 rounded-office">
                    <Package className="text-primary" size={24} />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-office">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-office">
                    <Clock className="text-yellow-600" size={24} />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg ETA</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.avgEta} min</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Clock className="text-blue-600" size={24} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <h3 className="font-semibold mb-4">Dealers</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold">{stats.totalDealers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved</span>
                    <span className="font-semibold text-green-600">{stats.approvedDealers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">{stats.pendingDealers}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4">Users</h3>
                <div className="flex items-center gap-2">
                  <Users size={24} className="text-primary" />
                  <span className="text-2xl font-bold">{stats.totalUsers}</span>
                  <span className="text-gray-600">customers</span>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('orders')}
                    className="w-full"
                  >
                    View All Orders
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveTab('dealers')}
                    className="w-full"
                  >
                    Manage Dealers
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    label="Search Orders"
                    placeholder="Search by ID, title, or dealer..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
                <div className="md:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-office focus:ring-2 focus:ring-primary focus:border-transparent bg-secondary-light"
                  >
                    <option value="all">All Status</option>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                            <span className="font-semibold">Dealer:</span> {order.dealer}
                          </div>
                          <div>
                            <span className="font-semibold">Cost:</span> {order.price || `₹${order.cost || 0}`}
                          </div>
                          <div>
                            <span className="font-semibold">Payment:</span>{' '}
                            <span
                              className={
                                order.paymentStatus === 'Paid'
                                  ? 'text-green-600 font-semibold'
                                  : 'text-red-600'
                              }
                            >
                              {order.paymentStatus || 'Pending'}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold">Date:</span>{' '}
                            {new Date(order.date || order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Dealers Tab */}
        {activeTab === 'dealers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dealers.map((dealer) => (
                <Card key={dealer.id} hover>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{dealer.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold">⭐ {dealer.rating || 'N/A'}</span>
                          <span className="text-sm text-gray-600">• {dealer.distance}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-office text-xs font-semibold ${
                          dealer.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : dealer.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {dealer.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>ETA: {dealer.eta}</p>
                      <p>Price: {dealer.priceRange}</p>
                      {dealer.contact && (
                        <p>Contact: {dealer.contact.phone}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(dealer.services || {}).map(([service, enabled]) => (
                          <button
                            key={service}
                            onClick={() => handleToggleService(dealer.id, service)}
                            className={`px-2 py-1 rounded text-xs ${
                              enabled
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      {dealer.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveDealer(dealer.id)}
                            className="flex-1"
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectDealer(dealer.id)}
                            className="flex-1"
                          >
                            <XCircle size={16} className="mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedDealer(dealer);
                          setIsEditingDealer(true);
                        }}
                        className="flex-1"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <Card>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <Input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Revenue Trend</h3>
                <div className="h-64 flex items-end gap-2">
                  {chartData.map((data, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                        style={{
                          height: `${(data.revenue / maxRevenue) * 100}%`,
                          minHeight: data.revenue > 0 ? '4px' : '0',
                        }}
                        title={`${data.date}: ₹${data.revenue}`}
                      />
                      <span className="text-xs text-gray-600 transform -rotate-45 origin-top-left">
                        {new Date(data.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                  Total Revenue: ₹{chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
                </div>
              </div>

              {/* Orders Chart */}
              <div>
                <h3 className="font-semibold mb-4">Orders Trend</h3>
                <div className="h-64 flex items-end gap-2">
                  {chartData.map((data, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all hover:opacity-80"
                        style={{
                          height: `${(data.orders / maxOrders) * 100}%`,
                          minHeight: data.orders > 0 ? '4px' : '0',
                        }}
                        title={`${data.date}: ${data.orders} orders`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                  Total Orders: {chartData.reduce((sum, d) => sum + d.orders, 0)}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {users.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <User size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              </Card>
            ) : (
              users.map((user) => {
                const lastOrder = getUserLastOrder(user.id);
                return (
                  <Card key={user.id} hover>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{user.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-semibold">Email:</span> {user.email}
                          </div>
                          {user.phone && (
                            <div>
                              <span className="font-semibold">Phone:</span> {user.phone}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold">Member since:</span>{' '}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {lastOrder && (
                          <div className="mt-3 p-3 bg-secondary-light rounded-card">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Last Order</p>
                            <div className="text-sm text-gray-600">
                              <span>{lastOrder.id}</span> • {lastOrder.title || lastOrder.file} •{' '}
                              {lastOrder.price || `₹${lastOrder.cost || 0}`} •{' '}
                              {new Date(lastOrder.date || lastOrder.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Order Management Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Manage Order: {selectedOrder.id}</h2>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setShowChat(false);
                    setShowAuditLog(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        variant={
                          selectedOrder.statusKey === opt.value ? 'primary' : 'secondary'
                        }
                        size="sm"
                        onClick={() =>
                          handleUpdateOrderStatus(selectedOrder.id, opt.label, opt.value)
                        }
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reassign Dealer (Admin Override)
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-office focus:ring-2 focus:ring-primary focus:border-transparent bg-secondary-light"
                    onChange={(e) => {
                      const dealer = dealers.find((d) => d.id === parseInt(e.target.value));
                      if (dealer) {
                        handleReassignDealer(selectedOrder.id, dealer.id, dealer.name);
                      }
                    }}
                  >
                    <option value="">Select a dealer</option>
                    {dealers
                      .filter((d) => d.status === 'approved')
                      .map((dealer) => (
                        <option key={dealer.id} value={dealer.id}>
                          {dealer.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4 text-primary">Admin Overrides</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Override ETA
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Today, 5:00 PM"
                          value={overrideETA}
                          onChange={(e) => setOverrideETA(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOverrideETA(selectedOrder.id)}
                          disabled={!overrideETA.trim()}
                        >
                          Override
                        </Button>
                      </div>
                      {selectedOrder.etaOverridden && (
                        <p className="text-xs text-yellow-600 mt-1">
                          ⚠️ ETA was overridden on {new Date(selectedOrder.etaOverriddenAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Override Pricing
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="New price (₹)"
                            value={overridePricing}
                            onChange={(e) => setOverridePricing(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOverridePricing(selectedOrder.id)}
                            disabled={!overridePricing || parseFloat(overridePricing) <= 0}
                          >
                            Override
                          </Button>
                        </div>
                        <Input
                          placeholder="Reason for override (optional)"
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                        />
                        {selectedOrder.pricingOverridden && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⚠️ Pricing was overridden on {new Date(selectedOrder.pricingOverriddenAt).toLocaleString()}
                            {selectedOrder.pricingOverrideReason && (
                              <span> - {selectedOrder.pricingOverrideReason}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs for Chat and Audit Log */}
                <div className="border-t pt-4">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => {
                        setShowChat(true);
                        setShowAuditLog(false);
                      }}
                      className={`px-4 py-2 rounded-office text-sm font-medium transition-colors ${
                        showChat
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <MessageCircle size={16} className="inline mr-2" />
                      Chat
                    </button>
                    <button
                      onClick={() => {
                        setShowAuditLog(true);
                        setShowChat(false);
                      }}
                      className={`px-4 py-2 rounded-office text-sm font-medium transition-colors ${
                        showAuditLog
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <History size={16} className="inline mr-2" />
                      Audit Log
                    </button>
                  </div>

                  {/* Chat Interface */}
                  {showChat && (
                    <div className="border border-gray-200 rounded-card overflow-hidden">
                      <ChatInterface orderId={selectedOrder.id} />
                    </div>
                  )}

                  {/* Audit Log */}
                  {showAuditLog && (
                    <div className="border border-gray-200 rounded-card p-4">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <History size={18} />
                        Detailed Audit History
                      </h3>
                      {(() => {
                        try {
                          const auditLog = getAuditLog(selectedOrder.id);
                          if (!auditLog || auditLog.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <History size={32} className="mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No audit log entries yet</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {auditLog
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                .map((entry) => (
                                  <div key={entry.id} className="p-4 bg-secondary-light rounded-card border-l-4 border-primary">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-primary text-white text-xs font-semibold rounded">
                                          {entry.role}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(entry.timestamp).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm font-semibold text-gray-900">
                                        Changed Fields: {entry.changedFields.join(', ')}
                                      </p>
                                      {entry.changes.map((change, idx) => (
                                        <div key={idx} className="text-sm bg-white p-2 rounded border">
                                          <div className="font-medium text-gray-700 mb-1">
                                            {change.field}:
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                              <span className="text-red-600 font-medium">Previous:</span>
                                              <div className="mt-1 p-2 bg-red-50 rounded text-gray-700 break-words">
                                                {typeof change.previous === 'object'
                                                  ? JSON.stringify(change.previous, null, 2)
                                                  : String(change.previous || 'N/A')}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="text-green-600 font-medium">Current:</span>
                                              <div className="mt-1 p-2 bg-green-50 rounded text-gray-700 break-words">
                                                {typeof change.current === 'object'
                                                  ? JSON.stringify(change.current, null, 2)
                                                  : String(change.current || 'N/A')}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      {entry.reason && (
                                        <p className="text-xs text-gray-600 italic">
                                          Reason: {entry.reason}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          );
                        } catch (error) {
                          console.error('Error loading audit log:', error);
                          return (
                            <div className="text-center py-4 text-red-500 text-sm">
                              Error loading audit log
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}

                  {/* Change Log (High-level) */}
                  {selectedOrder.changeLog && selectedOrder.changeLog.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold mb-4">Change Log (High-level)</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedOrder.changeLog
                          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                          .map((log, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-gray-900">{log.action}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Role:</span> {log.role}
                              </div>
                              {log.previousState && (
                                <div className="text-xs text-gray-600 mt-1">
                                  <span className="font-medium">Previous:</span>{' '}
                                  {JSON.stringify(log.previousState)}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Button
                    variant="danger"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="w-full"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Cancel Order
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Dealer Edit Modal */}
        {selectedDealer && isEditingDealer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Dealer: {selectedDealer.name}</h2>
                <button
                  onClick={() => {
                    setIsEditingDealer(false);
                    setSelectedDealer(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <DealerEditForm
                dealer={selectedDealer}
                onSave={(updates) => {
                  handleSaveDealer(selectedDealer.id, updates);
                }}
                onCancel={() => {
                  setIsEditingDealer(false);
                  setSelectedDealer(null);
                }}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function DealerEditForm({ dealer, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: dealer.name || '',
    rating: dealer.rating || 0,
    distance: dealer.distance || '',
    eta: dealer.eta || '',
    priceRange: dealer.priceRange || '',
    contact: {
      phone: dealer.contact?.phone || '',
      email: dealer.contact?.email || '',
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Dealer Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <div className="grid grid-cols-2 gap-4">
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
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ETA"
          value={formData.eta}
          onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
        />
        <Input
          label="Price Range"
          value={formData.priceRange}
          onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
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
      <div className="flex gap-2 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          Save Changes
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}

