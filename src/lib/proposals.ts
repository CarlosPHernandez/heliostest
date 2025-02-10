import { supabase } from './supabase'

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

export async function savePendingProposal(userId: string): Promise<boolean> {
  try {
    // Check for pending proposal in localStorage
    const pendingProposalStr = localStorage.getItem('pendingProposal')
    if (!pendingProposalStr) return false

    // Parse the pending proposal
    const pendingProposal: ProposalData = JSON.parse(pendingProposalStr)

    // Save the proposal to the pending_proposals table
    const { error } = await supabase
      .from('pending_proposals')
      .insert([{
        user_id: userId,
        ...pendingProposal
      }])

    if (error) {
      console.error('Error saving pending proposal:', error)
      return false
    }

    // Clear the pending proposal from localStorage
    localStorage.removeItem('pendingProposal')
    return true
  } catch (err) {
    console.error('Error in savePendingProposal:', err)
    return false
  }
}

export async function saveNewProposal(userId: string, proposalData: ProposalData): Promise<boolean> {
  try {
    // Check if the user's email is verified
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email_confirmed_at) {
      // Save to pending_proposals if not verified
      const { error } = await supabase
        .from('pending_proposals')
        .insert([{
          user_id: userId,
          ...proposalData
        }])

      if (error) {
        console.error('Error saving to pending proposals:', error)
        // Store in localStorage for later
        localStorage.setItem('pendingProposal', JSON.stringify(proposalData))
        return false
      }

      return true
    }

    // Save to main proposals table if verified
    const { error } = await supabase
      .from('proposals')
      .insert([{
        user_id: userId,
        ...proposalData
      }])

    if (error) {
      console.error('Error saving new proposal:', error)
      // Store in localStorage for later
      localStorage.setItem('pendingProposal', JSON.stringify(proposalData))
      return false
    }

    return true
  } catch (err) {
    console.error('Error in saveNewProposal:', err)
    // Store in localStorage for later
    localStorage.setItem('pendingProposal', JSON.stringify(proposalData))
    return false
  }
}

export async function movePendingProposalToMain(userId: string): Promise<boolean> {
  try {
    // Retrieve the pending proposal
    const { data: pendingProposals, error: fetchError } = await supabase
      .from('pending_proposals')
      .select('*')
      .eq('user_id', userId)

    if (fetchError || !pendingProposals || pendingProposals.length === 0) {
      console.error('Error fetching pending proposals:', fetchError)
      return false
    }

    const pendingProposal = pendingProposals[0]

    // Move to main proposals table
    const { error: insertError } = await supabase
      .from('proposals')
      .insert([{
        user_id: userId,
        ...pendingProposal
      }])

    if (insertError) {
      console.error('Error moving proposal to main table:', insertError)
      return false
    }

    // Delete from pending_proposals
    const { error: deleteError } = await supabase
      .from('pending_proposals')
      .delete()
      .eq('id', pendingProposal.id)

    if (deleteError) {
      console.error('Error deleting from pending proposals:', deleteError)
      return false
    }

    return true
  } catch (err) {
    console.error('Error in movePendingProposalToMain:', err)
    return false
  }
} 