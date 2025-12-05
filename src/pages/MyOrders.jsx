import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Package, MapPin, Eye, ChevronDown, ChevronUp, Layers, MessageCircle, Navigation } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { getOrders } from '../services/adminService';
import { getUserBatches, getBatchOrders, getBatchStats } from '../services/orderBatchService';
import { getUnreadCount } from '../services/chatService';
import ChatInterface from '../components/ChatInterface';
import OrderDetailsModal from '../components/OrderDetailsModal';
import ETACountdown from '../components/ETACountdown';

const sampleOrders = [
  {
    id: 'ORD-001',
    file: 'Project_Report.pdf',
    status: 'completed',
    dealer: 'PixelPrint Hub',
    date: '2025-11-25',
    cost: '₹450',
    pages: 48,
    delivery: 'Door delivery',
  },
  {
    id: 'ORD-002',
    file: 'Presentation_Deck.pptx',
    status: 'processing',
    dealer: 'Express Xerox',
    date: '2025-11-27',
    cost: '₹680',
    pages: 32,
    delivery: 'Store pickup',
  },
  {
    id: 'ORD-003',
    file: 'Document_Bundle.pdf',
    status: 'pending',
    dealer: 'Print Studio 9',
    date: '2025-11-27',
    cost: '₹520',
    pages: 64,
    delivery: 'Door delivery',
  },
];

const statusConfig = {
  pending: { icon: Clock, color: 'text-primary bg-primary-light', label: 'Order Placed' },
  'dealer-accepted': { icon: CheckCircle, color: 'text-blue-600 bg-blue-100', label: 'Dealer Accepted' },
  'printing-started': { icon: Package, color: 'text-purple-600 bg-purple-100', label: 'Printing Started' },
  'printing-completed': { icon: CheckCircle, color: 'text-indigo-600 bg-indigo-100', label: 'Printing Completed' },
  'out-for-delivery': { icon: Package, color: 'text-orange-600 bg-orange-100', label: 'Out for Delivery' },
  'ready-for-pickup': { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Ready for Pickup' },
  delivered: { icon: CheckCircle, color: 'text-gray-600 bg-gray-100', label: 'Delivered' },
  completed: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Cancelled' },
  // Backward compatibility
  processing: { icon: Package, color: 'text-primary bg-primary-light', label: 'Processing' },
  ready: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Ready' },
};

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'batches'
  const [expandedBatches, setExpandedBatches] = useState(new Set());
  const [orders, setOrders] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedOrderForChat, setSelectedOrderForChat] = useState(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (user?.id) {
      // Get user orders and sort by latest → oldest (newest first)
      const userOrders = getOrders()
        .filter((o) => o.userId === user.id)
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateB.getTime() - dateA.getTime(); // Latest first
        });
      setOrders(userOrders);
      
      const userBatches = getUserBatches(user.id);
      setBatches(userBatches);

      // Get unread message counts
      const counts = {};
      userOrders.forEach((order) => {
        try {
          counts[order.id] = getUnreadCount(order.id, user.id);
        } catch (error) {
          console.error('Error getting unread count:', error);
          counts[order.id] = 0;
        }
      });
      setUnreadCounts(counts);
    }
  }, [user]);

  const toggleBatch = (batchId) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(batchId)) {
      newExpanded.delete(batchId);
    } else {
      newExpanded.add(batchId);
    }
    setExpandedBatches(newExpanded);
  };

  const filteredOrders =
    filter === 'all'
      ? orders
      : orders.filter((order) => order.statusKey === filter);

  const filteredBatches = batches.filter((batch) => {
    if (filter === 'all') return true;
    const batchOrders = getBatchOrders(batch.id);
    return batchOrders.some((order) => order.statusKey === filter);
  });

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your print orders</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'processing', 'ready', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-office font-medium transition-all duration-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  filter === status
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('individual')}
              className={`px-4 py-2 rounded-office font-medium transition-all ${
                viewMode === 'individual'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setViewMode('batches')}
              className={`px-4 py-2 rounded-office font-medium transition-all flex items-center gap-2 ${
                viewMode === 'batches'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Layers size={18} />
              Batches
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        {viewMode === 'individual' ? (
          filteredOrders.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No orders found</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => {
                const statusKey = order.statusKey || 'pending';
                const StatusIcon = statusConfig[statusKey]?.icon || Clock;
                const statusColor = statusConfig[statusKey]?.color || 'text-yellow-600 bg-yellow-100';
                const statusLabel = statusConfig[statusKey]?.label || order.status || 'Pending';
                
                return (
                  <Card key={order.id} hover className="flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{order.id}</h3>
                        <p className="text-sm text-gray-600 truncate">{order.title || order.file}</p>
                        {order.batchId && (
                          <p className="text-xs text-primary mt-1">Batch: {order.batchId}</p>
                        )}
                      </div>
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-office text-xs font-semibold ${statusColor}`}
                      >
                        <StatusIcon size={14} />
                        {statusLabel}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} />
                        <span>{order.dealer}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package size={16} />
                        <span>{order.pages || 'N/A'} pages</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} />
                        <span>ETA: {order.eta || 'Not set'}</span>
                      </div>
                      {order.eta && (
                        <ETACountdown 
                          eta={order.eta} 
                          orderDate={order.createdAt || order.date}
                        />
                      )}
                      <div className="text-sm text-gray-600">
                        Ordered: {new Date(order.date || order.createdAt).toLocaleDateString()}
                      </div>
                      {/* COD Payment Status */}
                      {order.paymentMethod === 'COD' && (
                        <div className="mt-2">
                          {order.statusKey !== 'delivered' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-office text-xs font-semibold bg-yellow-100 text-yellow-800">
                              Payment Pending — Cash On Delivery
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-office text-xs font-semibold bg-green-100 text-green-800">
                              Paid via Cash On Delivery
                            </span>
                          )}
                        </div>
                      )}
                      {order.etaOverridden && (
                        <p className="text-xs text-yellow-600">⚠️ ETA overridden by admin</p>
                      )}
                      {order.pricingOverridden && (
                        <p className="text-xs text-yellow-600">⚠️ Pricing overridden by admin</p>
                      )}
                    </div>

                    <div className="border-t pt-4 mt-auto">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-600">Total</span>
                        <span className="text-xl font-bold text-primary">{order.price || `₹${order.cost || 0}`}</span>
                      </div>
                      <div className="flex gap-2">
                        {(order.statusKey === 'out-for-delivery' || 
                          order.statusKey === 'printing-completed' || 
                          order.statusKey === 'ready-for-pickup' ||
                          order.statusKey === 'ready') && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => navigate(`/track-order/${order.id}`)}
                            className="flex-1"
                          >
                            <Navigation size={16} className="mr-2" />
                            Track
                          </Button>
                        )}
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedOrderForChat(order.id)}
                        >
                          <MessageCircle size={16} className="mr-2" />
                          Chat
                          {unreadCounts[order.id] > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-office px-2 py-0.5">
                              {unreadCounts[order.id]}
                            </span>
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedOrderForDetails(order)}
                        >
                          <Eye size={16} className="mr-2" />
                          Details
                        </Button>
                        {statusKey === 'pending' && (
                          <Button variant="ghost" size="sm">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          /* Batches View */
          filteredBatches.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Layers size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No batches found</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBatches.map((batch) => {
                const batchOrders = getBatchOrders(batch.id);
                const stats = getBatchStats(batch.id);
                const isExpanded = expandedBatches.has(batch.id);
                
                return (
                  <Card key={batch.id} hover>
                    <div
                      className="cursor-pointer"
                      onClick={() => toggleBatch(batch.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Layers size={24} className="text-primary" />
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{batch.id}</h3>
                            <p className="text-sm text-gray-600">
                              {batch.totalOrders} orders • ₹{stats.totalCost.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Status</p>
                            <span className={`px-3 py-1 rounded-office text-xs font-semibold ${
                              batch.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              batch.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {batch.status}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Pending</p>
                          <p className="font-semibold text-yellow-600">{stats.pendingOrders}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Processing</p>
                          <p className="font-semibold text-blue-600">{stats.processingOrders}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ready</p>
                          <p className="font-semibold text-green-600">{stats.readyOrders}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Delivered</p>
                          <p className="font-semibold text-gray-600">{stats.deliveredOrders}</p>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <h4 className="font-semibold mb-3">Orders in Batch</h4>
                        {batchOrders.map((order) => {
                          const statusKey = order.statusKey || 'pending';
                          const StatusIcon = statusConfig[statusKey]?.icon || Clock;
                          const statusColor = statusConfig[statusKey]?.color || 'text-yellow-600 bg-yellow-100';
                          const statusLabel = statusConfig[statusKey]?.label || order.status || 'Pending';
                          
                          return (
                            <div
                              key={order.id}
                              className="p-4 bg-secondary-light rounded-card flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h5 className="font-semibold text-gray-900">{order.id}</h5>
                                  <span className={`flex items-center gap-1 px-2 py-1 rounded-office text-xs font-semibold ${statusColor}`}>
                                    <StatusIcon size={12} />
                                    {statusLabel}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{order.title || order.file}</p>
                                <div className="flex gap-4 text-xs text-gray-500">
                                  <span>Dealer: {order.dealer}</span>
                                  <span>ETA: {order.eta || 'Not set'}</span>
                                  <span>Cost: {order.price || `₹${order.cost || 0}`}</span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedOrderForChat(order.id)}
                              >
                                <MessageCircle size={16} />
                                {unreadCounts[order.id] > 0 && (
                                  <span className="ml-1 bg-red-500 text-white text-xs rounded-office px-1.5">
                                    {unreadCounts[order.id]}
                                  </span>
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )
        )}

        {/* Chat Modal */}
        {selectedOrderForChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Order Chat: {selectedOrderForChat}</h2>
                <button
                  onClick={() => setSelectedOrderForChat(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <ChatInterface orderId={selectedOrderForChat} />
              </div>
            </Card>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrderForDetails && (
          <OrderDetailsModal
            order={selectedOrderForDetails}
            onClose={() => setSelectedOrderForDetails(null)}
          />
        )}
      </div>
    </div>
  );
}

