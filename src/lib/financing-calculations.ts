interface FinancingOption {
  loanTerm: number // in years
  monthlyPayment: number
  totalCost: number
  monthlyPaymentAfterCredit: number
  totalInterest: number
}

const INTEREST_RATE = 0.0625 // 6.25% APR
const LOAN_TERMS = [10, 15, 20, 25] // Available loan terms in years

export function calculateMonthlyPayment(principal: number, years: number, annualRate: number): number {
  const monthlyRate = annualRate / 12
  const numberOfPayments = years * 12
  
  // Monthly Payment = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  // Where:
  // P = Principal
  // r = Monthly interest rate
  // n = Total number of payments
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    
  return monthlyPayment
}

export function calculateFinancingOptions(systemCost: number, federalTaxCredit: number): Record<number, FinancingOption> {
  const options: Record<number, FinancingOption> = {}
  
  LOAN_TERMS.forEach(years => {
    const monthlyPayment = calculateMonthlyPayment(systemCost, years, INTEREST_RATE)
    const totalCost = monthlyPayment * years * 12
    const totalInterest = totalCost - systemCost
    
    // Calculate monthly payment after applying tax credit to principal
    const reducedPrincipal = systemCost - federalTaxCredit
    const monthlyPaymentAfterCredit = calculateMonthlyPayment(reducedPrincipal, years, INTEREST_RATE)
    
    options[years] = {
      loanTerm: years,
      monthlyPayment: monthlyPayment,
      totalCost: totalCost,
      monthlyPaymentAfterCredit: monthlyPaymentAfterCredit,
      totalInterest: totalInterest
    }
  })
  
  return options
}

export const AVAILABLE_TERMS = LOAN_TERMS 