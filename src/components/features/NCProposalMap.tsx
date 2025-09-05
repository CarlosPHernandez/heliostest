import { useEffect, useState } from 'react';
// import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { Loader2, Sun, Battery, Zap, Calendar } from 'lucide-react';

interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  status: string;
  stage: string;
  address: string;
  system_size: number;
  total_price: number;
}

const INITIAL_ZOOM = 7;
const MARKER_ZOOM = 15;

// Updated NC-specific solar production and emissions factors
const ANNUAL_KWH_PER_KW = 1460; // NREL data for NC average
const LBS_CO2_PER_KWH = 0.934; // EPA 2021 eGRID data for SERC Virginia/Carolina
const TREE_CO2_PER_YEAR = 44; // EPA: ~44 lbs CO2 per urban tree per year
const MILES_DRIVEN_PER_LB_CO2 = 2.28; // EPA: 404g CO2/mile = 0.89 lbs/mile
const HOME_ENERGY_LBS_CO2_PER_YEAR = 16500; // EPA: Average home produces 16,500 lbs CO2/year

const NCProposalMap = () => {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      setMapLoaded(true);
    }
  }, []);

  // NC center coordinates
  const center = {
    lat: 35.7596,
    lng: -79.0193
  };

  const mapStyles = {
    height: '400px',
    width: '100%'
  };

  const darkMapStyles = [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#242424" }]
    },
    {
      "elementType": "labels",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels",
      "stylers": [{ "visibility": "on" }]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#b0b0b0" }]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#242424", "weight": 2 }]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#3d3d3d" }]
    },
    {
      "featureType": "administrative.province",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#3d3d3d" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{ "color": "#3d3d3d" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#2a2a2a" }]
    },
    {
      "featureType": "road",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "poi",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "transit",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#1a1a1a" }]
    }
  ];

  const loadProposalLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: proposals, error } = await supabase
        .from('proposals')
        .select('id, status, stage, latitude, longitude, address, system_size, total_price')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      console.log('Raw proposals data:', proposals);

      const mapLocations = proposals?.map(proposal => ({
        id: proposal.id,
        lat: proposal.latitude,
        lng: proposal.longitude,
        status: proposal.status || '',
        stage: proposal.stage || '',
        address: proposal.address || '',
        system_size: proposal.system_size || 0,
        total_price: proposal.total_price || 0
      })) || [];

      console.log('Processed locations:', mapLocations);
      setLocations(mapLocations);
    } catch (error) {
      console.error('Error loading proposal locations:', error);
      setError('Failed to load map locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposalLocations();
  }, []);

  const handleMarkerClick = (location: MapLocation) => {
    setSelectedLocation(location);
    if (mapRef) {
      mapRef.panTo({ lat: location.lat, lng: location.lng });
      mapRef.setZoom(MARKER_ZOOM);
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedLocation(null);
    if (mapRef) {
      mapRef.setZoom(INITIAL_ZOOM);
      mapRef.panTo(center);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMarkerIcon = (status: string, stage: string) => {
    if (status === 'completed') return '/markers/green-marker.svg';
    if (stage === 'installation') return '/markers/blue-marker.svg';
    if (stage === 'permitting') return '/markers/yellow-marker.svg';
    return '/markers/red-marker.svg';
  };

  const getMarkerLabel = (status: string, stage: string) => {
    if (status === 'completed') return 'Completed';
    if (stage === 'installation') return 'In Installation';
    if (stage === 'permitting') return 'In Permitting';
    return 'Other Stage';
  };

  const calculateEnvironmentalImpact = (systemSize: number) => {
    const annualCO2Avoided = systemSize * ANNUAL_KWH_PER_KW * LBS_CO2_PER_KWH;
    return {
      co2Avoided: annualCO2Avoided,
      treesEquivalent: Math.round(annualCO2Avoided / TREE_CO2_PER_YEAR),
      milesDriven: Math.round(annualCO2Avoided * MILES_DRIVEN_PER_LB_CO2),
      homesEquivalent: (annualCO2Avoided / HOME_ENERGY_LBS_CO2_PER_YEAR).toFixed(1)
    };
  };

  const formatCO2 = (lbsCO2: number): string => {
    if (lbsCO2 >= 2000) {
      return `${(lbsCO2 / 2000).toFixed(1)} tons`;
    }
    return `${Math.round(lbsCO2)} lbs`;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string, stage: string) => {
    if (status === 'completed') return 'green';
    if (stage === 'installation') return 'blue';
    if (stage === 'permitting') return 'yellow';
    return 'red';
  };

  if (!mapLoaded) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={loadProposalLocations}
            className="mt-2 text-sm text-blue-500 hover:text-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Temporarily disabled Google Maps - needs migration to Mapbox */}
      <div className="flex justify-center items-center h-[400px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Map temporarily disabled</p>
          <p className="text-sm text-gray-500">Google Maps → Mapbox migration in progress</p>
        </div>
      </div>
      
      {/* Commented out Google Maps code for future migration
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={INITIAL_ZOOM}
        center={center}
        options={{
          styles: darkMapStyles,
          mapTypeControl: true,
          mapTypeId: 'hybrid',
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: window.google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: ['roadmap', 'hybrid']
          },
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true
        }}
        onLoad={(map) => setMapRef(map)}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            icon={{
              url: getMarkerIcon(location.status, location.stage),
              scaledSize: new window.google.maps.Size(50, 50),
              anchor: new window.google.maps.Point(25, 25)
            }}
            title={getMarkerLabel(location.status, location.stage)}
            onClick={() => handleMarkerClick(location)}
          />
        ))}

        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="w-[calc(100vw-32px)] max-w-[380px] bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-lg overflow-hidden">
              {/* Header Section with Gradient Banner */}
              <div className="relative -mx-0 bg-gradient-to-r from-blue-600 to-blue-400 p-3 sm:p-4">
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <Sun className="w-6 h-6 sm:w-8 sm:h-8 text-white/20" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white pr-8">
                  Solar Installation
                </h3>
                <p className="text-blue-100 mt-1 flex items-center gap-2 text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{selectedLocation.address}</span>
                </p>
              </div>

              <div className="p-3 sm:p-4">
                {/* Project Stats Cards */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                      <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">System Size</p>
                    </div>
                    <p className="text-base sm:text-2xl font-bold text-gray-900">{selectedLocation.system_size} kW</p>
                  </div>
                  <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                      <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Investment</p>
                    </div>
                    <p className="text-base sm:text-2xl font-bold text-gray-900">{formatCurrency(selectedLocation.total_price)}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3 sm:mb-4">
                  <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium
                    ${selectedLocation.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedLocation.stage === 'installation' ? 'bg-blue-100 text-blue-800' :
                        selectedLocation.stage === 'permitting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                    }`}>
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2
                      ${selectedLocation.status === 'completed' ? 'bg-green-500' :
                        selectedLocation.stage === 'installation' ? 'bg-blue-500' :
                          selectedLocation.stage === 'permitting' ? 'bg-yellow-500' :
                            'bg-red-500'
                      }`} />
                    {selectedLocation.status === 'completed' ? 'Completed' :
                      `${selectedLocation.stage.charAt(0).toUpperCase() + selectedLocation.stage.slice(1)} Stage`}
                  </div>
                </div>

                {/* Environmental Impact Section */}
                {(() => {
                  const impact = calculateEnvironmentalImpact(selectedLocation.system_size);
                  return (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 sm:p-4 border border-green-100">
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <h4 className="text-xs sm:text-sm font-semibold text-green-800">
                          Environmental Impact
                        </h4>
                        <span className="text-[10px] sm:text-xs text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                          Annual Savings
                        </span>
                      </div>

                      {/* CO2 Stats - Featured */}
                      <div className="bg-white/60 rounded-lg p-2 sm:p-3 mb-2 sm:mb-4 backdrop-blur-sm">
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-green-600 mb-0.5 sm:mb-1">CO₂ Emissions Avoided</p>
                          <p className="text-xl sm:text-3xl font-bold text-green-800">{formatCO2(impact.co2Avoided)}</p>
                        </div>
                      </div>

                      {/* Impact Cards Grid */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="bg-white/60 rounded-lg p-2 sm:p-3 text-center backdrop-blur-sm">
                          <span className="text-lg sm:text-2xl mb-0.5 sm:mb-1 block">🌳</span>
                          <p className="text-[10px] sm:text-xs text-green-600 mb-0.5 sm:mb-1">Trees Planted</p>
                          <p className="text-xs sm:text-sm font-bold text-green-800">{formatNumber(impact.treesEquivalent)}</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2 sm:p-3 text-center backdrop-blur-sm">
                          <span className="text-lg sm:text-2xl mb-0.5 sm:mb-1 block">🚗</span>
                          <p className="text-[10px] sm:text-xs text-green-600 mb-0.5 sm:mb-1">Miles Saved</p>
                          <p className="text-xs sm:text-sm font-bold text-green-800">{formatNumber(impact.milesDriven)}</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2 sm:p-3 text-center backdrop-blur-sm">
                          <span className="text-lg sm:text-2xl mb-0.5 sm:mb-1 block">🏠</span>
                          <p className="text-[10px] sm:text-xs text-green-600 mb-0.5 sm:mb-1">Homes Powered</p>
                          <p className="text-xs sm:text-sm font-bold text-green-800">{impact.homesEquivalent}</p>
                        </div>
                      </div>

                      <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-green-100">
                        <div className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-green-600">
                          <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Based on EPA and NREL data for North Carolina</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {locations.length === 0 && (
        <div className="text-center mt-4 p-4 bg-gray-800 rounded-lg text-gray-200">
          <p className="text-gray-200">No locations found on the map.</p>
          <p className="text-sm text-gray-400 mt-1">
            Try geocoding your proposals first.
          </p>
        </div>
      )}
      */}
      
      {/* Temporarily show locations count for debugging */}
      {locations.length === 0 && (
        <div className="text-center mt-4 p-4 bg-gray-100 rounded-lg text-gray-600">
          <p className="text-gray-600">No proposal locations loaded.</p>
          <p className="text-sm text-gray-500 mt-1">
            Map functionality will be restored after Mapbox migration.
          </p>
        </div>
      )}
    </div>
  );
};

export default NCProposalMap; 