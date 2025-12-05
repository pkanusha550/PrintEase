import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Package, Printer, Truck, CheckCircle, MapPin } from 'lucide-react';
import { getOrders } from '../services/adminService';
import { dealers } from '../data/dealers';
import { getCurrentLocation } from '../services/locationService';
import Card from '../components/Card';
import OrderTrackingMap from '../components/OrderTrackingMap';
import ETACountdown from '../components/ETACountdown';

const trackingStages = {
  'printing': { label: 'Printing', icon: Printer, color: 'text-blue-600 bg-blue-100' },
  'ready': { label: 'Ready', icon: Package, color: 'text-green-600 bg-green-100' },
  'out-for-delivery': { label: 'Out for Delivery', icon: Truck, color: 'text-orange-600 bg-orange-100' },
  'reached-customer': { label: 'Reached Customer', icon: MapPin, color: 'text-purple-600 bg-purple-100' },
  'delivered': { label: 'Delivered', icon: CheckCircle, color: 'text-gray-600 bg-gray-100' },
};

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [dealerLocation, setDealerLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [currentETA, setCurrentETA] = useState(null);
  const [trackingStage, setTrackingStage] = useState('printing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load order
    const orders = getOrders();
    const foundOrder = orders.find((o) => o.id === orderId);
    
    if (!foundOrder) {
      navigate('/my-orders');
      return;
    }

    setOrder(foundOrder);
    
    // Get dealer location from order or dealers data
    if (foundOrder.dealerCoordinates) {
      setDealerLocation(foundOrder.dealerCoordinates);
    } else {
      const dealer = dealers.find((d) => d.id === foundOrder.dealerId);
      if (dealer && dealer.coordinates) {
        setDealerLocation(dealer.coordinates);
      } else {
        // Default dealer location
        setDealerLocation({ lat: 19.0820, lon: 72.8810 });
      }
    }

    // Get customer location from order or current location
    if (foundOrder.customerCoordinates) {
      setCustomerLocation(foundOrder.customerCoordinates);
      setLoading(false);
    } else {
      getCurrentLocation()
        .then((location) => {
          setCustomerLocation(location);
        })
        .catch(() => {
          // Default customer location (Mumbai)
          setCustomerLocation({ lat: 19.0760, lon: 72.8777 });
        })
        .finally(() => {
          setLoading(false);
        });
    }

    // Set initial tracking stage based on order status
    const statusToStage = {
      'pending': 'printing',
      'dealer-accepted': 'printing',
      'printing-started': 'printing',
      'printing-completed': 'ready',
      'ready-for-pickup': 'ready',
      'out-for-delivery': 'out-for-delivery',
      'delivered': 'delivered',
    };
    
    setTrackingStage(statusToStage[foundOrder.statusKey] || 'printing');
    setCurrentETA(foundOrder.eta || 'Not set');
  }, [orderId, navigate]);

  const handleStatusUpdate = (newStage) => {
    setTrackingStage(newStage);
  };

  const handleETAUpdate = (newETA) => {
    setCurrentETA(newETA);
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order tracking...</p>
        </div>
      </div>
    );
  }

  const stageConfig = trackingStages[trackingStage] || trackingStages.printing;
  const StageIcon = stageConfig.icon;

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/my-orders"
            className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to My Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
              <p className="text-gray-600">Order ID: {order.id}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${stageConfig.color}`}>
              <StageIcon size={20} />
              <span className="font-semibold">{stageConfig.label}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden">
              <div className="h-[600px]">
                {dealerLocation && customerLocation ? (
                  <OrderTrackingMap
                    dealerLocation={dealerLocation}
                    customerLocation={customerLocation}
                    orderStatus={order.statusKey}
                    onStatusUpdate={handleStatusUpdate}
                    onETAUpdate={handleETAUpdate}
                    orderId={order.id}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Tracking Info Sidebar */}
          <div className="space-y-6">
            {/* Order Info */}
            <Card>
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Order Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">File:</span>
                  <span className="font-semibold text-gray-900">{order.file || order.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dealer:</span>
                  <span className="font-semibold text-gray-900">{order.dealer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-semibold text-gray-900">{order.pages || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold text-primary">{order.price || `₹${order.cost || 0}`}</span>
                </div>
              </div>
            </Card>

            {/* ETA Card */}
            <Card>
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                Estimated Arrival
              </h3>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-primary">
                  {currentETA || order.eta || 'Not set'}
                </div>
                {order.eta && (
                  <ETACountdown 
                    eta={order.eta} 
                    orderDate={order.createdAt || order.date}
                  />
                )}
              </div>
            </Card>

            {/* Tracking Stages */}
            <Card>
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Tracking Stages</h3>
              <div className="space-y-3">
                {Object.entries(trackingStages).map(([key, stage]) => {
                  const StageIcon = stage.icon;
                  const isActive = key === trackingStage;
                  const isCompleted = Object.keys(trackingStages).indexOf(key) < Object.keys(trackingStages).indexOf(trackingStage);

                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary-light border-2 border-primary'
                          : isCompleted
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isActive
                            ? 'bg-primary text-white'
                            : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        <StageIcon size={18} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {stage.label}
                        </p>
                        {isActive && (
                          <p className="text-xs text-gray-600 mt-1">In progress...</p>
                        )}
                      </div>
                      {isCompleted && (
                        <CheckCircle size={20} className="text-green-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Delivery Info */}
            {order.orderData?.deliveryMethod && (
              <Card>
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Delivery Method</h3>
                <p className="text-sm text-gray-700">
                  {order.orderData.deliveryMethod === 'Delivery' ? (
                    <span className="flex items-center gap-2">
                      <Truck size={18} className="text-primary" />
                      Home Delivery
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Package size={18} className="text-primary" />
                      Store Pickup
                    </span>
                  )}
                </p>
              </Card>
            )}

            {/* COD Payment Status */}
            {order.paymentMethod === 'COD' && (
              <Card>
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Payment Status</h3>
                {order.statusKey !== 'delivered' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="text-2xl">🟡</span>
                      <div>
                        <p className="font-semibold text-yellow-800">Awaiting payment at time of delivery</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          {order.orderData?.deliveryMethod === 'Delivery' 
                            ? 'You will pay when order arrives.'
                            : 'Pay while collecting your copies.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-2xl">🟢</span>
                    <div>
                      <p className="font-semibold text-green-800">Payment received successfully</p>
                      {order.paymentDate && (
                        <p className="text-xs text-green-700 mt-1">
                          Paid on {new Date(order.paymentDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

