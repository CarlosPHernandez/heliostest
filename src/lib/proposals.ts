export interface ProposalData {
  package_type: string
  system_size: number
  panel_count: number
  monthly_production: number
  address: string
  monthly_bill: number
  payment_type: string
  financing: any
  status: string
}

export function saveProposal(proposalData: ProposalData): boolean {
  try {
    // Store in localStorage
    localStorage.setItem('currentProposal', JSON.stringify(proposalData))
    return true
  } catch (err) {
    console.error('Error saving proposal:', err)
    return false
  }
}

export function getProposal(): ProposalData | null {
  try {
    const proposalStr = localStorage.getItem('currentProposal')
    if (!proposalStr) return null
    return JSON.parse(proposalStr)
  } catch (err) {
    console.error('Error getting proposal:', err)
    return null
  }
}

export function clearProposal(): void {
  localStorage.removeItem('currentProposal')
} 