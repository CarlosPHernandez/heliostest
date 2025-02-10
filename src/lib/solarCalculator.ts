interface UtilityProvider {
  id: string;
  name: string;
  rates: {
    base: number;
    peak?: number;
    offPeak?: number;
  };
}

interface SolarConfig {
  utilityRate: number;
  panelWattage: number;
  averageSunHours: number;
  systemEfficiency: number;
  degradationRate: number;
  installationCostPerWatt: number;
}

// Default configuration for North Carolina
export const NC_CONFIG: Omit<SolarConfig, 'utilityRate'> = {
  panelWattage: 400, // 400W panels
  averageSunHours: 5.5, // Average sun hours per day in NC
  systemEfficiency: 0.85, // System efficiency including inverter losses
  degradationRate: 0.005, // 0.5% annual degradation
  installationCostPerWatt: 2.75 // $2.75 per watt installed
}

export function getUtilityRate(provider: UtilityProvider): number {
  // For simplicity, we'll use the base rate
  // In a real app, you'd want to consider peak/off-peak rates
  return provider.rates.base
}

export function calculateSolarProposal(monthlyBill: number, config: SolarConfig) {
  // Calculate approximate monthly kWh usage
  const avgUtilityRate = config.utilityRate
  const monthlyKWh = monthlyBill / avgUtilityRate

  // Calculate required system size
  const dailyKWh = monthlyKWh / 30
  const requiredKW = dailyKWh / (config.averageSunHours * config.systemEfficiency)
  
  // Round up to nearest 0.5 kW for practical system sizing
  const systemSize = Math.ceil(requiredKW * 2) / 2

  // Calculate number of panels needed
  const numberOfPanels = Math.ceil((systemSize * 1000) / config.panelWattage)

  // Calculate total system cost
  const totalPrice = systemSize * 1000 * config.installationCostPerWatt

  // Calculate annual production
  const annualProduction = systemSize * config.averageSunHours * 365 * config.systemEfficiency

  // Calculate 25-year production with degradation
  const yearlyProduction = Array.from({ length: 25 }, (_, year) => {
    return annualProduction * Math.pow(1 - config.degradationRate, year)
  })

  // Calculate estimated savings
  const annualSavings = annualProduction * config.utilityRate
  const lifetimeSavings = yearlyProduction.reduce((total, yearly) => {
    return total + (yearly * config.utilityRate)
  }, 0)

  return {
    systemSize,
    numberOfPanels,
    totalPrice,
    annualProduction,
    yearlyProduction,
    annualSavings,
    lifetimeSavings
  }
} 