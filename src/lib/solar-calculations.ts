interface SolarSystemConfig {
  utilityRate: number // $/kWh
  peakSunHours: number // hours/day
  derateFactor: number // system efficiency (0-1)
  panelRating: number // watts per panel
  pricePerWatt: number // $ per watt
  critterGuardPrice: number // $ per system
  solarEdgeTrimPrice: number // $ per system
}

interface SystemProposal {
  standard: {
    systemSize: number // kW
    numberOfPanels: number
    totalPrice: number
    yearlyProduction: number
    monthlyProduction: number
  }
  premium: {
    systemSize: number // kW
    numberOfPanels: number
    totalPrice: number
    yearlyProduction: number
    monthlyProduction: number
  }
}

export const NC_CONFIG: SolarSystemConfig = {
  utilityRate: 0.12, // Average utility rate in NC
  peakSunHours: 5.0, // Average peak sun hours in NC
  derateFactor: 0.85, // System efficiency including losses
  panelRating: 400, // 400W panels
  pricePerWatt: 2.75, // Base price per watt installed
  critterGuardPrice: 1200, // Price for critter guard
  solarEdgeTrimPrice: 800, // Price for solar edge trim
}

export function calculateSolarProposal(monthlyBill: number, config: SolarSystemConfig): SystemProposal {
  // Calculate monthly and daily energy consumption
  const monthlyEnergyConsumption = monthlyBill / config.utilityRate // kWh per month
  const dailyEnergyConsumption = monthlyEnergyConsumption / 30.44 // kWh per day (average month length)

  // Calculate required system size for 100% offset
  const requiredSystemSize = (dailyEnergyConsumption / (config.peakSunHours * config.derateFactor)) // kW

  // Calculate standard package (100% offset)
  const standardNumberOfPanels = Math.ceil((requiredSystemSize * 1000) / config.panelRating)
  const standardSystemSize = (standardNumberOfPanels * config.panelRating) / 1000
  const standardPrice = standardSystemSize * 1000 * config.pricePerWatt

  // Calculate premium package (110% offset + premium features)
  const premiumNumberOfPanels = Math.ceil((requiredSystemSize * 1.1 * 1000) / config.panelRating)
  const premiumSystemSize = (premiumNumberOfPanels * config.panelRating) / 1000
  const premiumPrice = (premiumSystemSize * 1000 * config.pricePerWatt) + 
                      config.critterGuardPrice + 
                      config.solarEdgeTrimPrice

  // Calculate yearly and monthly production
  const standardYearlyProduction = standardSystemSize * config.peakSunHours * 365 * config.derateFactor
  const premiumYearlyProduction = premiumSystemSize * config.peakSunHours * 365 * config.derateFactor

  return {
    standard: {
      systemSize: standardSystemSize,
      numberOfPanels: standardNumberOfPanels,
      totalPrice: standardPrice,
      yearlyProduction: standardYearlyProduction,
      monthlyProduction: standardYearlyProduction / 12
    },
    premium: {
      systemSize: premiumSystemSize,
      numberOfPanels: premiumNumberOfPanels,
      totalPrice: premiumPrice,
      yearlyProduction: premiumYearlyProduction,
      monthlyProduction: premiumYearlyProduction / 12
    }
  }
} 