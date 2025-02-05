export interface UtilityProvider {
  name: string
  serviceArea: string
  residentialRate: number | { min: number; max: number }
  notes: string
}

export const NC_UTILITY_PROVIDERS: UtilityProvider[] = [
  {
    name: "Duke Energy Progress",
    serviceArea: "Most of North Carolina",
    residentialRate: {
      min: 0.115,
      max: 0.130
    },
    notes: "Rates vary based on tariff and usage. Verify with local tariff data."
  },
  {
    name: "Dominion Energy",
    serviceArea: "Parts of Eastern North Carolina",
    residentialRate: 0.130,
    notes: "Confirm with the latest local rate schedules."
  },
  {
    name: "PEMC (Piedmont EMC)",
    serviceArea: "Central and Western North Carolina",
    residentialRate: 0.105,
    notes: "Cooperative utility; rates may be lower for members."
  },
  {
    name: "Brunswick EMC",
    serviceArea: "Southeastern coastal regions of NC",
    residentialRate: 0.120,
    notes: "Specific to EMC members; check current filings for updates."
  },
  {
    name: "Highpoint Electric",
    serviceArea: "High Point region and surrounding areas",
    residentialRate: 0.120,
    notes: "Verify current rates from the local municipal utility."
  },
  {
    name: "Energy United",
    serviceArea: "Select cooperative service areas in NC",
    residentialRate: 0.110,
    notes: "Check with Energy United's latest filings for the most accurate rate."
  }
]

export function getUtilityRate(provider: UtilityProvider): number {
  if (typeof provider.residentialRate === 'number') {
    return provider.residentialRate
  }
  // For providers with min/max rates, use the average
  return (provider.residentialRate.min + provider.residentialRate.max) / 2
} 