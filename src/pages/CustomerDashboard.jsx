import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Plus, Navigation, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getOrders } from '../services/adminService';
import Card from '../components/Card';
import Button from '../components/Button';
import ETACountdown from '../components/ETACountdown';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.id) {
      const allOrders = getOrders();
      const userOrders = allOrders.filter((o) => o.userId === user.id);
      setOrders(userOrders);
    }
  }, [user]);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.statusKey === 'pending' || order.statusKey === 'dealer-accepted';
    if (filter === 'processing') return order.statusKey === 'printing-started' || order.statusKey === 'printing-completed';
    if (filter === 'completed') return order.statusKey === 'delivered';
    return true;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.statusKey === 'pending' || o.statusKey === 'dealer-accepted').length,
    processing: orders.filter((o) => o.statusKey === 'printing-started' || o.statusKey === 'printing-completed').length,
    completed: orders.filter((o) => o.statusKey === 'delivered').length,
  };

  const getStatusColor = (statusKey) => {
    const statusMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'dealer-accepted': 'bg-blue-100 text-blue-800',
      'printing-started': 'bg-purple-100 text-purple-800',
      'printing-completed': 'bg-green-100 text-green-800',
      'ready-for-pickup': 'bg-green-100 text-green-800',
      'out-for-delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-gray-100 text-gray-800',
    };
    return statusMap[statusKey] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'Customer'}!</p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/order')}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              New Order
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="text-blue-600" size={32} />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-600" size={32} />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Processing</p>
                <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
              </div>
              <Package className="text-purple-600" size={32} />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </Card>
        </div>

        {/* Orders Section */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
            <div className="flex gap-2">
              {['all', 'pending', 'processing', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No orders found</p>
              <Button variant="primary" onClick={() => navigate('/order')}>
                Place Your First Order
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{order.file || order.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.statusKey)}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Dealer:</span> {order.dealer}
                        </div>
                        <div>
                          <span className="font-medium">Pages:</span> {order.pages || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> {order.price || `₹${order.cost || 0}`}
                        </div>
                        <div>
                          <span className="font-medium">ETA:</span>{' '}
                          {order.eta ? (
                            <ETACountdown eta={order.eta} orderDate={order.createdAt || order.date} />
                          ) : (
                            'Not set'
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(order.statusKey === 'out-for-delivery' ||
                          order.statusKey === 'printing-completed' ||
                          order.statusKey === 'ready-for-pickup') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/track-order/${order.id}`)}
                          >
                            <Navigation size={16} className="mr-2" />
                            Track
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/my-orders`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

