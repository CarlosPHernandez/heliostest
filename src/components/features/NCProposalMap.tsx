import { useEffect, useState } from 'react';
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

      const mapLocations = proposals?.map((proposal: any) => ({
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


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      {/* Map functionality disabled - will be replaced with Mapbox */}
      <div className="flex justify-center items-center h-[400px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Interactive Map Coming Soon</p>
          <p className="text-sm text-gray-500">Map will be rebuilt with Mapbox</p>
          <p className="text-xs text-gray-400 mt-2">
            {locations.length} proposal locations loaded
          </p>
        </div>
      </div>
    </div>
  );
};

export default NCProposalMap; 