'use client'

import { useState } from 'react'
import { Camera, ChevronLeft, ChevronRight, Home, Sun, Zap, Upload, AlertCircle } from 'lucide-react'

interface SurveyQuestion {
  id: string
  question: string
  type: 'text' | 'number' | 'select' | 'image' | 'radio'
  options?: string[]
  required: boolean
  helpText?: string
}

const questions: SurveyQuestion[] = [
  {
    id: 'roof_age',
    question: 'How old is your roof?',
    type: 'select',
    options: ['0-5 years', '5-10 years', '10-15 years', '15+ years', 'I don\'t know'],
    required: true,
    helpText: 'This helps us determine if any roof work is needed before installation'
  },
  {
    id: 'roof_material',
    question: 'What type of roofing material do you have?',
    type: 'select',
    options: ['Asphalt Shingles', 'Metal', 'Tile', 'Slate', 'Other'],
    required: true
  },
  {
    id: 'roof_image',
    question: 'Please upload a photo of your roof',
    type: 'image',
    required: true,
    helpText: 'A clear photo of your roof helps us identify potential installation areas'
  },
  {
    id: 'electrical_panel',
    question: 'Please upload a photo of your electrical panel',
    type: 'image',
    required: true,
    helpText: 'This helps us assess your electrical system compatibility'
  },
  {
    id: 'shading',
    question: 'Are there any large trees or buildings that shade your roof?',
    type: 'radio',
    options: ['Yes', 'No', 'Not sure'],
    required: true
  }
]

const SiteSurvey = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [images, setImages] = useState<Record<string, File>>({})
  const [showError, setShowError] = useState(false)

  const handleAnswer = (questionId: string, value: string | number) => {
    setShowError(false)
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleImageUpload = (questionId: string, file: File) => {
    setShowError(false)
    setImages(prev => ({ ...prev, [questionId]: file }))
  }

  const isCurrentQuestionValid = () => {
    const question = questions[currentStep]
    if (question.type === 'image') {
      return !!images[question.id]
    }
    return !!answers[question.id]
  }

  const handleNext = () => {
    if (!isCurrentQuestionValid()) {
      setShowError(true)
      return
    }

    setShowError(false)
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setShowError(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!isCurrentQuestionValid()) {
      setShowError(true)
      return
    }

    // TODO: Implement form submission
    console.log('Answers:', answers)
    console.log('Images:', images)
  }

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const progress = ((currentStep + 1) / questions.length) * 100

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'select':
        return (
          <div className="space-y-2">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={answers[currentQuestion.id] as string || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            >
              <option value="">Select an option</option>
              {currentQuestion.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {showError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Please select an option
              </p>
            )}
          </div>
        )

      case 'image':
        return (
          <div className="space-y-2">
            <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleImageUpload(currentQuestion.id, file)
                  }
                }}
              />
              <div className="text-center">
                {images[currentQuestion.id] ? (
                  <div className="space-y-2">
                    <Camera className="w-8 h-8 mx-auto text-green-500" />
                    <p className="text-green-600">Image uploaded</p>
                    <p className="text-sm text-gray-500">{images[currentQuestion.id].name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-gray-600">Click or drag to upload an image</p>
                  </div>
                )}
              </div>
            </label>
            {showError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Please upload an image
              </p>
            )}
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-3">
            <div>
              {currentQuestion.options?.map((option) => (
                <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer mb-2">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {showError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Please select an option
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Step {currentStep + 1} of {questions.length}
          </p>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentQuestion.question}
            </h2>
            
            {currentQuestion.helpText && (
              <p className="text-sm text-gray-600">
                {currentQuestion.helpText}
              </p>
            )}

            <div className="mt-4">
              {renderQuestion()}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </button>

          <button
            onClick={isLastStep ? handleSubmit : handleNext}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLastStep ? (
              'Submit Survey'
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SiteSurvey 