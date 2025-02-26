'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import type { Database } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type PendingProposal = Database['public']['Tables']['pending_proposals']['Row']
type SiteSurvey = Database['public']['Tables']['site_surveys']['Row']

interface SiteSurveyProps {
  proposal: PendingProposal
  onComplete?: () => void
}

interface FormOption {
  value: string
  label: string
}

const propertyTypes: FormOption[] = [
  { value: 'single_family', label: 'Single Family Home' },
  { value: 'multi_family', label: 'Multi-Family Home' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'condo', label: 'Condominium' },
  { value: 'commercial', label: 'Commercial Building' }
]

const ownershipTypes: FormOption[] = [
  { value: 'own', label: 'Own' },
  { value: 'rent', label: 'Rent' }
]

const roofAgeOptions: FormOption[] = [
  { value: '5', label: '0-5 years' },
  { value: '10', label: '6-10 years' },
  { value: '15', label: '11-15 years' },
  { value: '20', label: '16-20 years' },
  { value: '25', label: 'Over 20 years' }
]

const roofMaterials: FormOption[] = [
  { value: 'asphalt', label: 'Asphalt Shingles' },
  { value: 'metal', label: 'Metal' },
  { value: 'tile', label: 'Tile' },
  { value: 'slate', label: 'Slate' },
  { value: 'wood', label: 'Wood Shake' }
]

const roofConditions: FormOption[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'unknown', label: 'Unknown' }
]

const panelLocations: FormOption[] = [
  { value: 'exterior_wall', label: 'Exterior Wall' },
  { value: 'garage', label: 'Garage' },
  { value: 'basement', label: 'Basement' },
  { value: 'utility_room', label: 'Utility Room' }
]

const systemCapacities: FormOption[] = [
  { value: '100', label: '100 Amperes' },
  { value: '150', label: '150 Amperes' },
  { value: '200', label: '200 Amperes' },
  { value: '400', label: '400 Amperes' }
]

const steps = [
  {
    title: 'Property Type',
    description: 'Tell us about your property'
  },
  {
    title: 'Property Details',
    description: 'Additional property information'
  },
  {
    title: 'Roof Details',
    description: 'Information about your roof'
  },
  {
    title: 'Electrical System',
    description: 'Details about your electrical setup'
  },
  {
    title: 'Review',
    description: 'Review your survey before submitting'
  }
]

export default function SiteSurvey({ proposal, onComplete }: SiteSurveyProps) {
  const router = useRouter()
  const [survey, setSurvey] = useState<Partial<SiteSurvey>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadSurvey()
  }, [proposal.id])

  const loadSurvey = async () => {
    try {
      // First check if a survey already exists
      let { data: surveyData, error: surveyError } = await supabase
        .from('site_surveys')
        .select('*')
        .eq('proposal_id', proposal.id)
        .single()

      if (surveyError && surveyError.code !== 'PGRST116') {
        throw surveyError
      }

      if (!surveyData) {
        // Create a new survey
        const { data: newSurvey, error: createError } = await supabase
          .from('site_surveys')
          .insert({
            proposal_id: proposal.id,
            status: 'pending',
            roof_obstructions: []
          })
          .select()
          .single()

        if (createError) throw createError
        surveyData = newSurvey
      }

      setSurvey(surveyData || {})
      console.log('Loaded survey:', surveyData) // Debug log
    } catch (error) {
      console.error('Error loading survey:', error)
      toast.error('Failed to load survey')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      console.log('Starting survey submission...')
      console.log('Current survey data:', survey)

      // Validate required fields
      if (!survey.property_type || !survey.ownership_type ||
        !survey.roof_material || !survey.roof_condition ||
        !survey.electrical_panel_location || !survey.electrical_system_capacity ||
        survey.is_hoa === undefined) {
        toast.error('Please fill in all required fields')
        return
      }

      const surveyData = {
        proposal_id: proposal.id,
        property_type: survey.property_type,
        ownership_type: survey.ownership_type,
        is_hoa: survey.is_hoa,
        roof_age: survey.roof_age ? Number(survey.roof_age) : null,
        roof_material: survey.roof_material,
        roof_condition: survey.roof_condition,
        electrical_panel_location: survey.electrical_panel_location,
        electrical_system_capacity: Number(survey.electrical_system_capacity),
        attic_access: survey.attic_access,
        status: 'completed' as const,
        roof_obstructions: survey.roof_obstructions || [],
        is_editable: false,
        submitted_at: new Date().toISOString()
      }

      console.log('Processed survey data:', surveyData)

      // Save the survey
      const { error: surveyError } = await supabase
        .from('site_surveys')
        .upsert(surveyData)

      if (surveyError) {
        console.error('Survey update/insert error:', surveyError)
        throw surveyError
      }

      // Update the proposal stage and status
      const { error: proposalError } = await supabase
        .from('pending_proposals')
        .update({
          status: 'in_progress',
          stage: 'site_survey_completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposal.id)

      if (proposalError) {
        console.error('Proposal update error:', proposalError)
        throw proposalError
      }

      console.log('Survey and proposal updated successfully')
      toast.success('Survey submitted successfully')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Submission error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      toast.error(error.message || 'Failed to submit survey. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const renderSelectField = (
    id: string,
    label: string,
    options: FormOption[],
    field: keyof SiteSurvey
  ) => (
    <div>
      <Label htmlFor={id} className="text-white">{label}</Label>
      <select
        id={id}
        value={String(survey[field] || '')}
        onChange={(e) => setSurvey((prev) => ({ ...prev, [field]: e.target.value }))}
        className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
      >
        <option value="" className="text-white bg-gray-800">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-white bg-gray-800">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const getDisplayValue = (field: keyof SiteSurvey, options: FormOption[]) => {
    const value = survey[field]
    if (!value) return 'Not specified'
    const option = options.find(opt => opt.value === String(value))
    return option ? option.label : 'Not specified'
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="grid grid-cols-2 gap-4 md:flex md:justify-between">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`flex flex-col items-center text-center ${index === currentStep
              ? 'text-white'
              : index < currentStep
                ? 'text-green-500'
                : 'text-gray-500'
              }`}
          >
            <div className="text-sm font-medium">{step.title}</div>
            <div className="text-xs">{step.description}</div>
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {currentStep === 0 && (
            <div className="space-y-4">
              {renderSelectField(
                'property_type',
                'Property Type',
                propertyTypes,
                'property_type'
              )}
              {renderSelectField(
                'ownership_type',
                'Do you own or rent your home?',
                ownershipTypes,
                'ownership_type'
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="is_hoa" className="text-white">Is this property part of an HOA community?</Label>
                <select
                  id="is_hoa"
                  value={survey.is_hoa === undefined ? '' : String(survey.is_hoa)}
                  onChange={(e) =>
                    setSurvey((prev) => ({
                      ...prev,
                      is_hoa: e.target.value === 'true',
                    }))
                  }
                  className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                >
                  <option value="" className="text-white bg-gray-800">Select option</option>
                  <option value="true" className="text-white bg-gray-800">Yes</option>
                  <option value="false" className="text-white bg-gray-800">No</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              {renderSelectField(
                'roof_age',
                'Roof Age',
                roofAgeOptions,
                'roof_age'
              )}
              {renderSelectField(
                'roof_material',
                'Roof Material',
                roofMaterials,
                'roof_material'
              )}
              {renderSelectField(
                'roof_condition',
                'Roof Condition',
                roofConditions,
                'roof_condition'
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              {renderSelectField(
                'electrical_panel_location',
                'Electrical Panel Location',
                panelLocations,
                'electrical_panel_location'
              )}
              {renderSelectField(
                'electrical_system_capacity',
                'Electrical System Capacity',
                systemCapacities,
                'electrical_system_capacity'
              )}
              <div>
                <Label htmlFor="attic_access" className="text-white">Attic Access</Label>
                <select
                  id="attic_access"
                  value={survey.attic_access === undefined ? '' : String(survey.attic_access)}
                  onChange={(e) =>
                    setSurvey((prev) => ({
                      ...prev,
                      attic_access: e.target.value === 'true',
                    }))
                  }
                  className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                >
                  <option value="" className="text-white bg-gray-800">Select option</option>
                  <option value="true" className="text-white bg-gray-800">Yes</option>
                  <option value="false" className="text-white bg-gray-800">No</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 bg-gray-900 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                    Property Details
                  </h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-white">Property Type</dt>
                      <dd className="text-sm text-white">{getDisplayValue('property_type', propertyTypes)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-white">Ownership</dt>
                      <dd className="text-sm text-white">{getDisplayValue('ownership_type', ownershipTypes)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-white">HOA Community</dt>
                      <dd className="text-sm text-white">
                        {survey.is_hoa === undefined ? 'Not specified' : (survey.is_hoa ? 'Yes' : 'No')}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                    Roof Details
                  </h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-white">Roof Age</dt>
                      <dd className="text-sm text-white">{getDisplayValue('roof_age', roofAgeOptions)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-white">Roof Material</dt>
                      <dd className="text-sm text-white">{getDisplayValue('roof_material', roofMaterials)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-white">Roof Condition</dt>
                      <dd className="text-sm text-white">{getDisplayValue('roof_condition', roofConditions)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                    Electrical System
                  </h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-white">Panel Location</dt>
                      <dd className="text-sm text-white">{getDisplayValue('electrical_panel_location', panelLocations)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-white">System Capacity</dt>
                      <dd className="text-sm text-white">{getDisplayValue('electrical_system_capacity', systemCapacities)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-white">Attic Access</dt>
                      <dd className="text-sm text-white">
                        {survey.attic_access === undefined ? 'Not specified' : (survey.attic_access ? 'Yes' : 'No')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => prev - 1)}
          disabled={currentStep === 0}
          className="text-white border-white hover:bg-white/10"
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            if (currentStep === steps.length - 1) {
              handleSubmit()
            } else {
              setCurrentStep((prev) => prev + 1)
            }
          }}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {currentStep === steps.length - 1 ? (
            saving ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </span>
            ) : (
              'Submit Survey'
            )
          ) : (
            'Next'
          )}
        </Button>
      </div>
    </div>
  )
} 