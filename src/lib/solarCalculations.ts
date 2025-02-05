interface SolarSystemConfig {
  utilityRate: number
  peakSunHours: number
  derateFactor: number
  panelRating: number
  pricePerWatt: number
  critterGuardPrice: number
  solarEdgeTrimPrice: number
}

interface SystemProposal {
  monthlyEnergy: number
  dailyEnergy: number
  systemSizeKW: number
  numberOfPanels: number
  actualCapacityW: number
  totalPrice: number
  yearlyProduction: number
  monthlyProduction: number
  standardPackage: {
    numberOfPanels: number
    systemSizeKW: number
    totalPrice: number
    yearlyProduction: number
    monthlyProduction: number
  }
  premiumPackage: {
    numberOfPanels: number
    systemSizeKW: number
    totalPrice: number
    yearlyProduction: number
    monthlyProduction: number
    critterGuard: boolean
    solarEdgeTrim: boolean
  }
}

const NC_CONFIG: SolarSystemConfig = {
  utilityRate: 0.15,
  peakSunHours: 4.5,
  derateFactor: 0.8,
  panelRating: 405,
  pricePerWatt: 2.65,
  critterGuardPrice: 300,
  solarEdgeTrimPrice: 800
}

export function calculateSolarProposal(monthlyBill: number, config = NC_CONFIG): SystemProposal {
  // Monthly energy consumption in kWh
  const monthlyEnergy = monthlyBill / config.utilityRate

  // Daily energy consumption in kWh
  const dailyEnergy = monthlyEnergy / 30

  // Required system size in kW
  const systemSizeKW = dailyEnergy / (config.peakSunHours * config.derateFactor)

  // Theoretical installed capacity in watts
  const installedCapacityW = systemSizeKW * 1000

  // Number of panels (rounded up)
  const numberOfPanels = Math.ceil(installedCapacityW / config.panelRating)

  // Actual installed capacity in watts
  const actualCapacityW = numberOfPanels * config.panelRating

  // Calculate yearly production
  const yearlyProduction = actualCapacityW * config.peakSunHours * config.derateFactor * 365 / 1000 // in kWh
  const monthlyProduction = yearlyProduction / 12

  // Calculate premium package (110% offset)
  const premiumPanels = Math.ceil(numberOfPanels * 1.1)
  const premiumCapacityW = premiumPanels * config.panelRating
  const premiumYearlyProduction = premiumCapacityW * config.peakSunHours * config.derateFactor * 365 / 1000
  const premiumMonthlyProduction = premiumYearlyProduction / 12

  // Calculate prices
  const standardPrice = actualCapacityW * config.pricePerWatt
  const premiumPrice = (premiumCapacityW * config.pricePerWatt) + 
                      config.critterGuardPrice + 
                      config.solarEdgeTrimPrice

  return {
    monthlyEnergy,
    dailyEnergy,
    systemSizeKW,
    numberOfPanels,
    actualCapacityW,
    totalPrice: standardPrice,
    yearlyProduction,
    monthlyProduction,
    standardPackage: {
      numberOfPanels,
      systemSizeKW: actualCapacityW / 1000,
      totalPrice: standardPrice,
      yearlyProduction,
      monthlyProduction
    },
    premiumPackage: {
      numberOfPanels: premiumPanels,
      systemSizeKW: premiumCapacityW / 1000,
      totalPrice: premiumPrice,
      yearlyProduction: premiumYearlyProduction,
      monthlyProduction: premiumMonthlyProduction,
      critterGuard: true,
      solarEdgeTrim: true
    }
  }
} 