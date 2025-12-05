import { useEffect, useRef, useState } from 'react';
import { MapPin, Truck, Package, Printer, CheckCircle } from 'lucide-react';

/**
 * OrderTrackingMap Component - Live tracking map with simulated delivery agent movement
 */
export default function OrderTrackingMap({
  dealerLocation,
  customerLocation,
  orderStatus,
  onStatusUpdate,
  onETAUpdate,
  orderId,
}) {
  const [hasLeaflet, setHasLeaflet] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [leafletComponents, setLeafletComponents] = useState(null);
  const [deliveryAgentPosition, setDeliveryAgentPosition] = useState(null);
  const [currentETA, setCurrentETA] = useState(null);
  const [trackingStage, setTrackingStage] = useState('printing');
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const intervalRef = useRef(null);
  const progressRef = useRef(0); // 0 to 1, progress along the path

  // Load coordinates from localStorage
  useEffect(() => {
    if (orderId) {
      const savedTracking = localStorage.getItem(`printease_tracking_${orderId}`);
      if (savedTracking) {
        try {
          const tracking = JSON.parse(savedTracking);
          if (tracking.deliveryAgentPosition) {
            setDeliveryAgentPosition(tracking.deliveryAgentPosition);
            progressRef.current = tracking.progress || 0;
            setTrackingStage(tracking.stage || 'printing');
          }
        } catch (error) {
          console.error('Error loading tracking data:', error);
        }
      }
    }
  }, [orderId]);

  // Determine tracking stage based on order status
  useEffect(() => {
    const statusToStage = {
      'pending': 'printing',
      'dealer-accepted': 'printing',
      'printing-started': 'printing',
      'printing-completed': 'ready',
      'ready-for-pickup': 'ready',
      'out-for-delivery': 'out-for-delivery',
      'delivered': 'delivered',
    };
    
    const stage = statusToStage[orderStatus] || 'printing';
    setTrackingStage(stage);
  }, [orderStatus]);

  // Check for react-leaflet
  useEffect(() => {
    const checkAndLoadLeaflet = async () => {
      try {
        const moduleName = 'react' + '-leaflet';
        const leafletName = 'leaflet';
        
        const [reactLeaflet, leaflet] = await Promise.all([
          import(/* @vite-ignore */ moduleName),
          import(/* @vite-ignore */ leafletName)
        ]);
        
        setLeafletComponents({ reactLeaflet, leaflet });
        setHasLeaflet(true);
      } catch (error) {
        console.log('react-leaflet not available, using static map fallback');
        setHasLeaflet(false);
      }
    };
    
    checkAndLoadLeaflet();
  }, []);

  // Initialize delivery agent position
  useEffect(() => {
    if (!dealerLocation || !customerLocation) return;
    
    // Only initialize if not already set
    if (deliveryAgentPosition) return;

    // Initialize based on tracking stage
    if (trackingStage === 'printing' || trackingStage === 'ready') {
      setDeliveryAgentPosition(dealerLocation);
      progressRef.current = 0;
    } else if (trackingStage === 'delivered') {
      setDeliveryAgentPosition(customerLocation);
      progressRef.current = 1;
    } else {
      setDeliveryAgentPosition(dealerLocation);
      progressRef.current = 0.3;
    }
  }, [dealerLocation, customerLocation, trackingStage]);

  // Simulate delivery agent movement
  useEffect(() => {
    if (!dealerLocation || !customerLocation || trackingStage === 'delivered') {
      return;
    }

    // Only simulate movement if out for delivery
    if (trackingStage !== 'out-for-delivery' && trackingStage !== 'reached-customer') {
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start simulation
    intervalRef.current = setInterval(() => {
      progressRef.current = Math.min(1, progressRef.current + 0.01); // Move 1% every interval

      // Calculate new position along the path
      const lat = dealerLocation.lat + (customerLocation.lat - dealerLocation.lat) * progressRef.current;
      const lon = dealerLocation.lon + (customerLocation.lon - dealerLocation.lon) * progressRef.current;

      const newPosition = { lat, lon };
      setDeliveryAgentPosition(newPosition);

      // Update ETA based on progress
      const remainingProgress = 1 - progressRef.current;
      const totalDistance = calculateDistance(
        dealerLocation.lat,
        dealerLocation.lon,
        customerLocation.lat,
        customerLocation.lon
      );
      const remainingDistance = totalDistance * remainingProgress;
      const estimatedMinutes = Math.round((remainingDistance / 30) * 60); // Assuming 30 km/h average speed
      setCurrentETA(`${estimatedMinutes} mins`);
      
      if (onETAUpdate) {
        onETAUpdate(`${estimatedMinutes} mins`);
      }

      // Update stage when reaching customer
      if (progressRef.current >= 0.95 && trackingStage !== 'reached-customer') {
        setTrackingStage('reached-customer');
        if (onStatusUpdate) {
          onStatusUpdate('reached-customer');
        }
      }

      // Save to localStorage
      if (orderId) {
        localStorage.setItem(
          `printease_tracking_${orderId}`,
          JSON.stringify({
            deliveryAgentPosition: newPosition,
            progress: progressRef.current,
            stage: trackingStage,
            timestamp: new Date().toISOString(),
          })
        );
      }

      // Update marker position if map is available
      if (markerRef.current && mapRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      }
    }, 1000); // Update every second

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dealerLocation, customerLocation, trackingStage, orderId, onETAUpdate, onStatusUpdate]);

  // Calculate distance helper
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get stage icon
  const getStageIcon = () => {
    switch (trackingStage) {
      case 'printing':
        return Printer;
      case 'ready':
        return Package;
      case 'out-for-delivery':
        return Truck;
      case 'reached-customer':
        return CheckCircle;
      case 'delivered':
        return CheckCircle;
      default:
        return Truck;
    }
  };

  const StageIcon = getStageIcon();
  const center = deliveryAgentPosition || dealerLocation || { lat: 19.0760, lon: 72.8777 };

  // Render with react-leaflet if available
  if (hasLeaflet && leafletComponents && !mapError) {
    try {
      const { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } = leafletComponents.reactLeaflet;
      const { Icon } = leafletComponents.leaflet;

      // Fix for default marker icons
      if (Icon && Icon.Default) {
        delete Icon.Default.prototype._getIconUrl;
        Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      }

      // Custom delivery agent icon
      const createDeliveryIcon = (stage) => {
        const iconColor = 
          stage === 'printing' ? 'blue' :
          stage === 'ready' ? 'green' :
          stage === 'out-for-delivery' ? 'orange' :
          stage === 'reached-customer' ? 'purple' :
          'gray';

        return new Icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColor}.png`,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
      };

      // Component to update map view
      const MapUpdater = ({ position }) => {
        const map = useMap();
        useEffect(() => {
          if (position) {
            map.setView([position.lat, position.lon], 13, { animate: true });
          }
        }, [position, map]);
        return null;
      };

      return (
        <div className="w-full h-full rounded-card overflow-hidden border border-gray-200 relative">
          <MapContainer
            center={[center.lat, center.lon]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapUpdater position={deliveryAgentPosition || center} />

            {/* Polyline path between dealer and customer */}
            {dealerLocation && customerLocation && (
              <Polyline
                positions={[
                  [dealerLocation.lat, dealerLocation.lon],
                  [customerLocation.lat, customerLocation.lon],
                ]}
                color="#3b82f6"
                weight={3}
                opacity={0.5}
                dashArray="10, 5"
              />
            )}

            {/* Dealer location marker */}
            {dealerLocation && (
              <Marker position={[dealerLocation.lat, dealerLocation.lon]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900">Dealer Location</h3>
                    <p className="text-sm text-gray-600">Printing facility</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Customer location marker */}
            {customerLocation && (
              <Marker position={[customerLocation.lat, customerLocation.lon]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                    <p className="text-sm text-gray-600">Your location</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Delivery agent marker (moving) */}
            {deliveryAgentPosition && trackingStage !== 'delivered' && (
              <Marker
                key={`${deliveryAgentPosition.lat}-${deliveryAgentPosition.lon}-${Date.now()}`}
                position={[deliveryAgentPosition.lat, deliveryAgentPosition.lon]}
                icon={createDeliveryIcon(trackingStage)}
              >
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2">
                      <StageIcon size={16} className="text-primary" />
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {trackingStage.replace('-', ' ')}
                      </h3>
                    </div>
                    {currentETA && (
                      <p className="text-sm text-gray-600">ETA: {currentETA}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(progressRef.current * 100)}% complete
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Tracking info overlay */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <StageIcon size={20} className="text-primary" />
              <h3 className="font-semibold text-gray-900 capitalize">
                {trackingStage.replace('-', ' ')}
              </h3>
            </div>
            {currentETA && (
              <p className="text-sm text-gray-600 mb-1">ETA: {currentETA}</p>
            )}
            {deliveryAgentPosition && (
              <p className="text-xs text-gray-500">
                {Math.round(progressRef.current * 100)}% of journey complete
              </p>
            )}
          </div>
        </div>
      );
    } catch (error) {
      console.warn('Error rendering Leaflet map:', error);
      setMapError(true);
    }
  }

  // Fallback: Static map
  return (
    <div className="w-full h-full rounded-card overflow-hidden border border-gray-200 bg-secondary-light relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-4">
          <Truck size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">Live Tracking</p>
          <p className="text-xs text-gray-500">
            Install react-leaflet for interactive map tracking
          </p>
        </div>
      </div>
    </div>
  );
}

