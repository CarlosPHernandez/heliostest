interface FinancingOption {
  loanTerm: number // in years
  monthlyPayment: number
  monthlyPaymentAfterCredit: number
  monthlyPaymentWithDownPayment: number
  monthlyPaymentWithDownPaymentAndCredit: number
  projectedUtilityPayments: number[]
}

const INTEREST_RATE = 0.0625 // 6.25% APR
const LOAN_TERMS = [10, 15, 20, 25] // Available loan terms in years
const UTILITY_RATE_INCREASE = 0.03 // 3% annual increase

export function calculateMonthlyPayment(principal: number, years: number, annualRate: number): number {
  // Validate inputs
  if (!principal || !years || !annualRate || principal <= 0 || years <= 0 || annualRate <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 12
  const numberOfPayments = years * 12
  
  try {
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    
    // Check if the result is valid
    return isFinite(monthlyPayment) ? Math.round(monthlyPayment * 100) / 100 : 0
  } catch (error) {
    console.error('Error calculating monthly payment:', error)
    return 0
  }
}

export function calculateProjectedUtilityPayments(monthlyBill: number, years: number): number[] {
  if (!monthlyBill || monthlyBill <= 0 || !years || years <= 0) {
    return Array(years).fill(0)
  }

  const payments: number[] = []
  for (let year = 0; year < years; year++) {
    const projectedBill = monthlyBill * Math.pow(1 + UTILITY_RATE_INCREASE, year)
    payments.push(Math.round(projectedBill * 100) / 100)
  }
  return payments
}

export function calculateFinancingOptions(
  systemCost: number, 
  federalTaxCredit: number,
  downPayment: number = 0,
  monthlyBill: number
): Record<number, FinancingOption> {
  // Validate inputs
  systemCost = Math.max(0, Number(systemCost) || 0)
  federalTaxCredit = Math.max(0, Number(federalTaxCredit) || 0)
  downPayment = Math.max(0, Number(downPayment) || 0)
  monthlyBill = Math.max(0, Number(monthlyBill) || 0)

  // Ensure down payment doesn't exceed system cost
  downPayment = Math.min(downPayment, systemCost)

  const options: Record<number, FinancingOption> = {}
  
  LOAN_TERMS.forEach(years => {
    // Calculate payments without down payment
    const monthlyPayment = calculateMonthlyPayment(systemCost, years, INTEREST_RATE)
    const monthlyPaymentAfterCredit = calculateMonthlyPayment(
      Math.max(0, systemCost - federalTaxCredit), 
      years, 
      INTEREST_RATE
    )
    
    // Calculate payments with down payment
    const principalWithDownPayment = Math.max(0, systemCost - downPayment)
    const monthlyPaymentWithDownPayment = calculateMonthlyPayment(
      principalWithDownPayment, 
      years, 
      INTEREST_RATE
    )
    const monthlyPaymentWithDownPaymentAndCredit = calculateMonthlyPayment(
      Math.max(0, principalWithDownPayment - federalTaxCredit),
      years,
      INTEREST_RATE
    )
    
    // Calculate projected utility payments
    const projectedUtilityPayments = calculateProjectedUtilityPayments(monthlyBill, years)
    
    options[years] = {
      loanTerm: years,
      monthlyPayment,
      monthlyPaymentAfterCredit,
      monthlyPaymentWithDownPayment,
      monthlyPaymentWithDownPaymentAndCredit,
      projectedUtilityPayments
    }
  })
  
  return options
}

export const AVAILABLE_TERMS = LOAN_TERMS 