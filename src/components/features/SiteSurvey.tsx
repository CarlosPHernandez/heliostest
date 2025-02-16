'use client'

import { useState, useEffect } from 'react'
import { Upload, Camera, Loader2, Check, Trash2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'

interface SiteSurveyProps {
  proposalId: string
  onComplete?: () => void
}

interface SiteSurvey {
  id: string
  property_type: string
  roof_age: number
  roof_material: string
  roof_obstructions: string[]
  attic_access: boolean
  electrical_panel_location: string
  electrical_system_capacity: number
  status: 'pending' | 'in_progress' | 'completed'
  notes: string
}

interface SurveyImage {
  id: string
  image_type: 'attic' | 'electrical_panel' | 'roof' | 'exterior'
  file_url: string
}

const propertyTypes = [
  'Single Family Home',
  'Multi Family Home',
  'Townhouse',
  'Condominium',
  'Other'
]

const roofMaterials = [
  'Asphalt Shingles',
  'Metal',
  'Tile',
  'Slate',
  'Wood Shake',
  'Other'
]

const roofObstructions = [
  'Chimney',
  'Skylights',
  'Vents',
  'Satellite Dish',
  'Other'
]

const steps = [
  {
    id: 'property_type',
    title: 'Property Type',
    description: 'What type of property do you have?'
  },
  {
    id: 'roof_details',
    title: 'Roof Information',
    description: 'Tell us about your roof'
  },
  {
    id: 'attic_access',
    title: 'Attic Access',
    description: 'Is there access to the attic?'
  },
  {
    id: 'electrical',
    title: 'Electrical System',
    description: 'Information about your electrical system'
  },
  {
    id: 'photos',
    title: 'Required Photos',
    description: 'Upload photos of key areas'
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review your survey before submitting'
  }
]

export default function SiteSurvey({ proposalId, onComplete }: SiteSurveyProps) {
  const [survey, setSurvey] = useState<Partial<SiteSurvey>>({})
  const [images, setImages] = useState<Record<string, SurveyImage | null>>({
    attic: null,
    electrical_panel: null,
    roof: null,
    exterior: null
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)

  useEffect(() => {
    loadSurvey()
  }, [proposalId])

  const loadSurvey = async () => {
    try {
      const { data: surveyData, error: surveyError } = await supabase
        .from('site_surveys')
        .select('*')
        .eq('proposal_id', proposalId)
        .single()

      if (surveyError) throw surveyError

      if (surveyData) {
        setSurvey(surveyData)

        // Load images
        const { data: imageData, error: imageError } = await supabase
          .from('site_survey_images')
          .select('*')
          .eq('site_survey_id', surveyData.id)

        if (imageError) throw imageError

        const imageMap = imageData?.reduce((acc, img) => {
          acc[img.image_type] = img
          return acc
        }, {} as Record<string, SurveyImage>)

        setImages(imageMap || {})
      }
    } catch (error) {
      console.error('Error loading survey:', error)
      toast.error('Failed to load survey data')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (type: string, file: File) => {
    try {
      setUploadingType(type)

      if (!survey.id) {
        // Create survey first if it doesn't exist
        const { data: newSurvey, error: surveyError } = await supabase
          .from('site_surveys')
          .insert({
            proposal_id: proposalId,
            status: 'in_progress'
          })
          .select()
          .single()

        if (surveyError) throw surveyError
        setSurvey(newSurvey)
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${proposalId}/${type}_${Date.now()}.${fileExt}`

      const { error: uploadError, data } = await supabase.storage
        .from('site-survey-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('site-survey-images')
        .getPublicUrl(fileName)

      const { data: imageRecord, error: imageError } = await supabase
        .from('site_survey_images')
        .insert({
          site_survey_id: survey.id,
          image_type: type,
          file_url: publicUrl
        })
        .select()
        .single()

      if (imageError) throw imageError

      setImages(prev => ({
        ...prev,
        [type]: imageRecord
      }))

      toast.success(`${type} image uploaded successfully`)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingType(null)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)

    try {
      const surveyData = {
        ...survey,
        proposal_id: proposalId,
        status: 'completed'
      }

      if (!survey.id) {
        // Create new survey
        const { data, error } = await supabase
          .from('site_surveys')
          .insert(surveyData)
          .select()
          .single()

        if (error) throw error
        setSurvey(data)
      } else {
        // Update existing survey
        const { error } = await supabase
          .from('site_surveys')
          .update(surveyData)
          .eq('id', survey.id)

        if (error) throw error
      }

      toast.success('Site survey saved successfully')
      onComplete?.()
    } catch (error) {
      console.error('Error saving survey:', error)
      toast.error('Failed to save survey')
    } finally {
      setSaving(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'property_type':
        return (
          <div className="space-y-6">
            <select
              value={survey.property_type || ''}
              onChange={(e) => setSurvey(prev => ({ ...prev, property_type: e.target.value }))}
              className="w-full bg-black border border-gray-800 rounded-lg px-4 py-4 text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Select property type</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )

      case 'roof_details':
        return (
          <div className="space-y-8">
            <div>
              <Label className="text-white text-lg mb-3">Roof Age (years)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={survey.roof_age || ''}
                onChange={(e) => setSurvey(prev => ({ ...prev, roof_age: parseInt(e.target.value) }))}
                className="bg-black border-gray-800 text-white text-lg py-4"
                required
              />
            </div>
            <div>
              <Label className="text-white text-lg mb-3">Roof Material</Label>
              <select
                value={survey.roof_material || ''}
                onChange={(e) => setSurvey(prev => ({ ...prev, roof_material: e.target.value }))}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-4 text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select roof material</option>
                {roofMaterials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-white text-lg mb-3">Roof Obstructions</Label>
              <div className="grid grid-cols-2 gap-4">
                {roofObstructions.map(obstruction => (
                  <label key={obstruction} className="flex items-center space-x-3 p-4 border border-gray-800 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={survey.roof_obstructions?.includes(obstruction) || false}
                      onChange={(e) => {
                        const current = survey.roof_obstructions || []
                        const updated = e.target.checked
                          ? [...current, obstruction]
                          : current.filter(o => o !== obstruction)
                        setSurvey(prev => ({ ...prev, roof_obstructions: updated }))
                      }}
                      className="h-5 w-5 rounded border-gray-800 text-blue-500 focus:ring-blue-500 bg-black"
                    />
                    <span className="text-white text-lg">{obstruction}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'attic_access':
        return (
          <div className="space-y-4">
            <select
              value={survey.attic_access === undefined ? '' : survey.attic_access.toString()}
              onChange={(e) => setSurvey(prev => ({ ...prev, attic_access: e.target.value === 'true' }))}
              className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        )

      case 'electrical':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2">Electrical Panel Location</Label>
              <Input
                value={survey.electrical_panel_location || ''}
                onChange={(e) => setSurvey(prev => ({ ...prev, electrical_panel_location: e.target.value }))}
                placeholder="e.g., Garage, Basement, Exterior Wall"
                className="bg-[#1A1A1A] border-gray-800 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-white mb-2">Electrical System Capacity (Amps)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={survey.electrical_system_capacity || ''}
                onChange={(e) => setSurvey(prev => ({ ...prev, electrical_system_capacity: parseInt(e.target.value) }))}
                className="bg-[#1A1A1A] border-gray-800 text-white"
                required
              />
            </div>
          </div>
        )

      case 'photos':
        const photoTypes = ['attic', 'electrical_panel', 'roof', 'exterior'] as const
        const currentPhotoType = photoTypes[photoTypes.findIndex(type => !images[type])] || photoTypes[0]
        const allPhotosUploaded = photoTypes.every(type => images[type])

        const getPhotoTitle = (type: string) => {
          switch (type) {
            case 'attic': return 'Attic Photo'
            case 'electrical_panel': return 'Electrical Panel Photo'
            case 'roof': return 'Roof Photo'
            case 'exterior': return 'Exterior Photo'
            default: return ''
          }
        }

        const getPhotoDescription = (type: string) => {
          switch (type) {
            case 'attic': return 'Take a clear photo of your attic space showing the overall area'
            case 'electrical_panel': return 'Take a photo of your electrical panel with the cover open if possible'
            case 'roof': return 'Take a photo of your roof showing its overall condition'
            case 'exterior': return 'Take a photo of your house from the street view'
            default: return ''
          }
        }

        return (
          <div className="space-y-8">
            {/* Progress Indicators */}
            <div className="flex space-x-2 mb-8">
              {photoTypes.map((type) => (
                <div
                  key={type}
                  className={`flex-1 h-1 rounded-full ${images[type] ? 'bg-green-500' :
                      type === currentPhotoType ? 'bg-blue-500' :
                        'bg-gray-800'
                    }`}
                />
              ))}
            </div>

            {/* Photo Upload Status */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {photoTypes.map((type) => (
                <div
                  key={type}
                  className={`text-center p-3 rounded-lg border ${images[type] ? 'border-green-500/20 bg-green-500/5' :
                      type === currentPhotoType ? 'border-blue-500/20 bg-blue-500/5' :
                        'border-gray-800 bg-gray-900/20'
                    }`}
                >
                  <div className="text-sm font-medium capitalize mb-1">
                    {type.replace('_', ' ')}
                  </div>
                  {images[type] ? (
                    <Check className="w-4 h-4 mx-auto text-green-500" />
                  ) : type === currentPhotoType ? (
                    <div className="w-4 h-4 mx-auto rounded-full bg-blue-500" />
                  ) : (
                    <div className="w-4 h-4 mx-auto rounded-full bg-gray-800" />
                  )}
                </div>
              ))}
            </div>

            {/* Current Photo Upload */}
            {!allPhotosUploaded && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {getPhotoTitle(currentPhotoType)}
                  </h3>
                  <p className="text-gray-400">
                    {getPhotoDescription(currentPhotoType)}
                  </p>
                </div>

                <div className="mt-8">
                  {images[currentPhotoType] ? (
                    <div className="relative aspect-video">
                      <img
                        src={images[currentPhotoType]?.file_url}
                        alt={`${currentPhotoType} photo`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setImages(prev => ({ ...prev, [currentPhotoType]: null }))}
                        className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="relative block aspect-video cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(currentPhotoType, file)
                          }
                        }}
                        disabled={!!uploadingType}
                      />
                      <div className="w-full h-full border-2 border-dashed border-gray-800 rounded-lg flex flex-col items-center justify-center group-hover:border-blue-500/50 transition-colors">
                        {uploadingType === currentPhotoType ? (
                          <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <p className="text-gray-400">Uploading photo...</p>
                          </div>
                        ) : (
                          <>
                            <div className="bg-blue-500/10 rounded-full p-4 mb-4 group-hover:bg-blue-500/20 transition-colors">
                              <Camera className="h-8 w-8 text-blue-500" />
                            </div>
                            <p className="text-lg text-white mb-2">Upload {getPhotoTitle(currentPhotoType)}</p>
                            <p className="text-sm text-gray-400">Click to browse or drag and drop</p>
                          </>
                        )}
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* All Photos Complete Message */}
            {allPhotosUploaded && (
              <div className="text-center py-8">
                <div className="bg-green-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  All Photos Uploaded
                </h3>
                <p className="text-gray-400">
                  You've successfully uploaded all required photos
                </p>
              </div>
            )}

            {/* Photo Preview Grid */}
            {Object.values(images).some(img => img) && (
              <div className="mt-8 border-t border-gray-800 pt-8">
                <h4 className="text-lg font-medium text-white mb-4">Uploaded Photos</h4>
                <div className="grid grid-cols-2 gap-4">
                  {photoTypes.map((type) => (
                    images[type] && (
                      <div key={type} className="relative aspect-video">
                        <img
                          src={images[type]?.file_url}
                          alt={`${type} photo`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setImages(prev => ({ ...prev, [type]: null }))}
                          className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <div className="border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Property Information</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Type:</dt>
                  <dd className="text-white">{survey.property_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Roof Age:</dt>
                  <dd className="text-white">{survey.roof_age} years</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Roof Material:</dt>
                  <dd className="text-white">{survey.roof_material}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Attic Access:</dt>
                  <dd className="text-white">{survey.attic_access ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </div>

            <div className="border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Electrical Information</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Panel Location:</dt>
                  <dd className="text-white">{survey.electrical_panel_location}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">System Capacity:</dt>
                  <dd className="text-white">{survey.electrical_system_capacity} Amps</dd>
                </div>
              </dl>
            </div>

            <div className="border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Uploaded Photos</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(images).map(([type, image]) => (
                  <div key={type} className="text-center p-4 border border-gray-800 rounded-lg">
                    <div className="text-gray-300 mb-2 capitalize">{type.replace('_', ' ')}</div>
                    {image ? (
                      <div className="text-green-400 flex items-center justify-center">
                        <Check className="w-4 h-4 mr-1" />
                        Uploaded
                      </div>
                    ) : (
                      <div className="text-red-400 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Missing
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto pt-8 px-6">
        <div className="flex justify-between mb-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 h-1 mx-1 ${index === currentStep ? 'bg-blue-500' :
                index < currentStep ? 'bg-blue-500/50' :
                  'bg-gray-800'
                }`}
            />
          ))}
        </div>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">{steps[currentStep].title}</h2>
          <p className="text-lg text-gray-400">{steps[currentStep].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto px-6 mb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Submit Survey
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center font-medium transition-colors"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Form Fields Styling Updates */}
      <style jsx global>{`
        select, input[type="text"], input[type="number"] {
          width: 100%;
          background-color: #000;
          border: 1px solid #333;
          padding: 1rem;
          border-radius: 0.5rem;
          color: white;
          font-size: 1.125rem;
          transition: all 0.2s;
        }

        select:focus, input:focus {
          border-color: #2563eb;
          outline: none;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        select option {
          background-color: #000;
          color: white;
          padding: 0.5rem;
        }

        .label {
          color: #fff;
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          display: block;
        }

        input[type="checkbox"] {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 0.25rem;
          border: 1px solid #333;
          background-color: #000;
        }

        input[type="checkbox"]:checked {
          background-color: #2563eb;
          border-color: #2563eb;
        }
      `}</style>
    </div>
  )
} 