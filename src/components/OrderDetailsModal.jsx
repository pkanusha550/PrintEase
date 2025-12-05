import { X, Clock, CheckCircle, Package, MapPin, FileText, Copy, Layers, Truck, CreditCard, Printer, CheckCircle2 } from 'lucide-react';
import Card from './Card';
import ETACountdown from './ETACountdown';

const BINDING_OPTIONS = [
  { id: 'spiral', name: 'Spiral Binding', description: 'Plastic coil binding', price: 50 },
  { id: 'wiro', name: 'Wiro Binding', description: 'Wire-O binding', price: 60 },
  { id: 'stapled', name: 'Stapled', description: 'Simple stapling', price: 20 },
  { id: 'perfect', name: 'Perfect Bound', description: 'Glued spine', price: 80 },
  { id: 'hardcover', name: 'Hardcover Binding', description: 'Premium hardcover', price: 200 },
  { id: 'saddle', name: 'Saddle Stitch', description: 'Booklet style', price: 30 },
];

const statusTimeline = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'dealer-accepted', label: 'Dealer Accepted', icon: CheckCircle },
  { key: 'printing-started', label: 'Printing Started', icon: Printer },
  { key: 'printing-completed', label: 'Printing Completed', icon: CheckCircle2 },
  { key: 'out-for-delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'ready-for-pickup', label: 'Ready for Pickup', icon: Package },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  const orderData = order.orderData || {};
  const statusKey = order.statusKey || 'pending';
  
  // Map old status keys to new ones for backward compatibility
  const statusMapping = {
    'pending': 'pending',
    'processing': 'dealer-accepted', // Old processing maps to dealer-accepted
    'ready': 'ready-for-pickup',
    'delivered': 'delivered',
    'completed': 'delivered',
  };
  
  const mappedStatusKey = statusMapping[statusKey] || statusKey;
  const currentStatusIndex = statusTimeline.findIndex(s => s.key === mappedStatusKey);
  
  // Calculate cost breakdown
  const baseCost = 420;
  const bindingCost = orderData.binding 
    ? (BINDING_OPTIONS.find(b => b.id === orderData.binding)?.price || 0) * (orderData.copies || 1)
    : 0;
  const urgentFee = orderData.urgent ? 80 : 0;
  const deliveryFee = orderData.deliveryMethod === 'Delivery' ? 50 : 0;
  const subtotal = baseCost + bindingCost + urgentFee + deliveryFee;
  const tax = Math.round((subtotal * 0.18) / 1.18);
  const total = order.cost || subtotal + tax;

  const getBindingName = (bindingId) => {
    if (!bindingId) return 'None';
    const binding = BINDING_OPTIONS.find(b => b.id === bindingId);
    return binding ? binding.name : bindingId;
  };

  const getStatusDate = (status) => {
    // Check if order has statusHistory
    if (order.statusHistory && Array.isArray(order.statusHistory)) {
      const statusEntry = order.statusHistory.find(s => s.statusKey === status);
      if (statusEntry && statusEntry.timestamp) {
        return new Date(statusEntry.timestamp);
      }
    }
    
    // Fallback: calculate based on order date
    const now = new Date();
    const orderDate = new Date(order.createdAt || order.date);
    
    switch (status) {
      case 'pending':
        return orderDate;
      case 'dealer-accepted':
        return order.acceptedAt ? new Date(order.acceptedAt) : new Date(orderDate.getTime() + 15 * 60000);
      case 'printing-started':
        return order.printingStartedAt ? new Date(order.printingStartedAt) : new Date(orderDate.getTime() + 30 * 60000);
      case 'printing-completed':
        return order.printingCompletedAt ? new Date(order.printingCompletedAt) : new Date(orderDate.getTime() + 2 * 3600000);
      case 'out-for-delivery':
        return order.outForDeliveryAt ? new Date(order.outForDeliveryAt) : new Date(orderDate.getTime() + 3 * 3600000);
      case 'ready-for-pickup':
        return order.readyAt ? new Date(order.readyAt) : new Date(orderDate.getTime() + 3 * 3600000);
      case 'delivered':
        return order.deliveredAt ? new Date(order.deliveredAt) : new Date(orderDate.getTime() + 4 * 3600000);
      default:
        return orderDate;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-600 mt-1">Order ID: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* File Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              File Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">File Name:</span>
                <span className="font-semibold text-gray-900">{order.file || order.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pages:</span>
                <span className="font-semibold text-gray-900">{order.pages || 'N/A'} pages</span>
              </div>
            </div>
          </div>

          {/* Print Settings */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <Copy size={20} className="text-primary" />
              Print Settings
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Paper Size:</span>
                <span className="font-semibold text-gray-900">{orderData.paperSize || 'A4'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paper Type:</span>
                <span className="font-semibold text-gray-900">{orderData.paperType || '80 GSM Matte'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Print Style:</span>
                <span className="font-semibold text-gray-900">
                  {orderData.printStyle || 'Color, double-sided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Single/Double Sided:</span>
                <span className="font-semibold text-gray-900">
                  {orderData.printStyle?.includes('single-sided') ? 'Single-sided' : 'Double-sided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Color/B&W:</span>
                <span className="font-semibold text-gray-900">
                  {orderData.printStyle?.includes('Color') ? 'Color' : 'Black & White'}
                </span>
              </div>
            </div>
          </div>

          {/* Number of Copies */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-3">Number of Copies</h3>
            <p className="text-sm text-gray-900 font-semibold">{orderData.copies || 1} copy/copies</p>
          </div>

          {/* Binding */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <Layers size={20} className="text-primary" />
              Binding
            </h3>
            <p className="text-sm text-gray-900 font-semibold">
              {getBindingName(orderData.binding)}
              {orderData.binding && (
                <span className="text-gray-600 ml-2">
                  (₹{BINDING_OPTIONS.find(b => b.id === orderData.binding)?.price || 0})
                </span>
              )}
            </p>
            {orderData.finishing && orderData.finishing !== 'None' && (
              <p className="text-sm text-gray-600 mt-2">
                Finishing: <span className="font-semibold">{orderData.finishing}</span>
              </p>
            )}
          </div>

          {/* Dealer Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              Dealer
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Dealer Name:</span>
                <span className="font-semibold text-gray-900">{order.dealer || 'N/A'}</span>
              </div>
              {order.dealerId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dealer ID:</span>
                  <span className="font-semibold text-gray-900">{order.dealerId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              Cost Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Cost:</span>
                <span className="font-semibold text-gray-900">₹{baseCost}</span>
              </div>
              {bindingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Binding ({getBindingName(orderData.binding)}):</span>
                  <span className="font-semibold text-gray-900">₹{bindingCost}</span>
                </div>
              )}
              {urgentFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgent Priority:</span>
                  <span className="font-semibold text-gray-900">₹{urgentFee}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-semibold text-gray-900">₹{deliveryFee}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (GST 18%):</span>
                <span className="font-semibold text-gray-900">₹{tax}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-primary">₹{total}</span>
              </div>
              {order.paymentStatus && (
                <div className="flex justify-between pt-2">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`font-semibold ${
                    order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ETA */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              Estimated Time of Arrival (ETA)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ETA:</span>
                <span className="font-semibold text-gray-900">{order.eta || 'Not set'}</span>
              </div>
              {order.eta && (
                <ETACountdown 
                  eta={order.eta} 
                  orderDate={order.createdAt || order.date}
                />
              )}
              {order.etaOverridden && (
                <p className="text-xs text-yellow-600">⚠️ ETA has been overridden by admin</p>
              )}
            </div>
          </div>

          {/* Delivery Type */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <Truck size={20} className="text-primary" />
              Delivery Type
            </h3>
            <p className="text-sm text-gray-900 font-semibold">
              {orderData.deliveryMethod || 'Pickup'}
            </p>
          </div>

          {/* Status Timeline */}
          <div className="pb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Order Tracking</h3>
            <div className="space-y-4">
              {statusTimeline.map((status, index) => {
                const StatusIcon = status.icon;
                // Show both out-for-delivery and ready-for-pickup based on delivery method
                if (status.key === 'out-for-delivery' && orderData.deliveryMethod !== 'Delivery') {
                  return null; // Skip out-for-delivery if pickup
                }
                if (status.key === 'ready-for-pickup' && orderData.deliveryMethod === 'Delivery') {
                  return null; // Skip ready-for-pickup if delivery
                }
                
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const statusDate = getStatusDate(status.key);

                return (
                  <div key={status.key} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      <StatusIcon size={20} />
                    </div>
                    <div className="flex-1 pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-semibold ${
                            isCompleted ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {status.label}
                          </p>
                          {isCompleted && (
                            <p className="text-xs text-gray-500 mt-1">
                              {statusDate.toLocaleString()}
                            </p>
                          )}
                        </div>
                        {isCurrent && (
                          <span className="px-2 py-1 bg-primary-light text-primary text-xs font-semibold rounded-office">
                            Current
                          </span>
                        )}
                        {isCompleted && !isCurrent && (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Date */}
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-semibold text-gray-900">
                {new Date(order.createdAt || order.date).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

