import { useState } from 'react';
import { Clock, CheckCircle, XCircle, Package, MapPin, Eye } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

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
  pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Pending' },
  processing: { icon: Package, color: 'text-blue-600 bg-blue-100', label: 'Processing' },
  completed: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Cancelled' },
};

export default function MyOrders() {
  const [filter, setFilter] = useState('all');

  const filteredOrders =
    filter === 'all'
      ? sampleOrders
      : sampleOrders.filter((order) => order.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your print orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'processing', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                filter === status
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No orders found</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              return (
                <Card key={order.id} hover className="flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{order.id}</h3>
                      <p className="text-sm text-gray-600 truncate">{order.file}</p>
                    </div>
                    <span
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[order.status].color}`}
                    >
                      <StatusIcon size={14} />
                      {statusConfig[order.status].label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{order.dealer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package size={16} />
                      <span>{order.pages} pages</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Ordered: {new Date(order.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="text-xl font-bold text-primary">{order.cost}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" className="flex-1">
                        <Eye size={16} className="mr-2" />
                        View Details
                      </Button>
                      {order.status === 'pending' && (
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
        )}
      </div>
    </div>
  );
}

