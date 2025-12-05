import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

/**
 * MapView Component - Interactive map with fallback
 * 
 * Uses react-leaflet if available, otherwise shows static map
 * Note: react-leaflet is optional - if not installed, shows static map fallback
 */
export default function MapView({ 
  dealers = [], 
  userLocation = null, 
  onDealerClick = null,
  selectedDealerId = null 
}) {
  const [hasLeaflet, setHasLeaflet] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [leafletComponents, setLeafletComponents] = useState(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    // Check if react-leaflet is available at runtime
    // Using a function to prevent Vite from analyzing the import
    const checkAndLoadLeaflet = async () => {
      try {
        // Create a dynamic import string that Vite won't analyze
        const moduleName = 'react' + '-leaflet';
        const leafletName = 'leaflet';
        
        // @ts-ignore - Dynamic imports that may not exist
        const [reactLeaflet, leaflet] = await Promise.all([
          import(/* @vite-ignore */ moduleName),
          import(/* @vite-ignore */ leafletName)
        ]);
        
        setLeafletComponents({ reactLeaflet, leaflet });
        setHasLeaflet(true);
      } catch (error) {
        // Module doesn't exist, use fallback
        console.log('react-leaflet not available, using static map fallback');
        setHasLeaflet(false);
      }
    };
    
    checkAndLoadLeaflet();
  }, []);

  // Default location (Mumbai, India)
  const defaultLocation = { lat: 19.0760, lon: 72.8777 };
  const center = userLocation || defaultLocation;

  // Render with react-leaflet if available and loaded
  if (hasLeaflet && leafletComponents && !mapError) {
    try {
      const { MapContainer, TileLayer, Marker, Popup } = leafletComponents.reactLeaflet;
      const { Icon } = leafletComponents.leaflet;
      
      // Fix for default marker icons in react-leaflet
      if (Icon && Icon.Default) {
        delete Icon.Default.prototype._getIconUrl;
        Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      }

      return (
        <div className="w-full h-full rounded-card overflow-hidden border border-gray-200">
          <MapContainer
            center={[center.lat, center.lon]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User location marker */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lon]}>
                <Popup>Your Location</Popup>
              </Marker>
            )}
            
            {/* Dealer markers */}
            {dealers.map((dealer) => {
              if (!dealer.coordinates) return null;
              
              return (
                <Marker
                  key={dealer.id}
                  position={[dealer.coordinates.lat, dealer.coordinates.lon]}
                  eventHandlers={{
                    click: () => {
                      if (onDealerClick) {
                        onDealerClick(dealer.id);
                      }
                    },
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900">{dealer.name}</h3>
                      <p className="text-sm text-gray-600">{dealer.distance}</p>
                      {dealer.rating && (
                        <p className="text-sm text-gray-600">⭐ {dealer.rating}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      );
    } catch (error) {
      console.warn('Error rendering Leaflet map:', error);
      setMapError(true);
      // Fall through to static map
    }
  }

  // Fallback: Static map using OpenStreetMap static image API
  return (
    <div className="w-full h-full rounded-card overflow-hidden border border-gray-200 bg-secondary-light relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-4">
          <MapPin size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-4">Map View</p>
          
          {/* Static map image */}
          <img
            src={`https://staticmap.openstreetmap.de/staticmap.php?center=${center.lat},${center.lon}&zoom=13&size=600x400&markers=${center.lat},${center.lon},red`}
            alt="Map"
            className="w-full h-auto rounded-card"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          
          {/* Dealer list overlay */}
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
            {dealers.map((dealer) => (
              <button
                key={dealer.id}
                onClick={() => onDealerClick && onDealerClick(dealer.id)}
                className={`w-full text-left px-3 py-2 rounded-office text-sm transition-colors ${
                  selectedDealerId === dealer.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dealer.name}</span>
                  <span className="text-xs">{dealer.distance}</span>
                </div>
              </button>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Install react-leaflet for interactive map
          </p>
        </div>
      </div>
    </div>
  );
}
