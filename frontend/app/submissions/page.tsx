'use client'
import { useState } from 'react'
import ContentPage from '@/components/templates/ContentPage'
import { ChevronRight, AlertCircle, CreditCard, Clock } from 'lucide-react'

interface FormStep {
  title: string
  fields: FormField[]
}

interface FormField {
  name: string
  label: string
  type: 'text' | 'url' | 'email' | 'textarea' | 'select'
  options?: string[]
  required?: boolean
  placeholder?: string
  helperText?: string
}

export default function SubmissionsPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submissionType, setSubmissionType] = useState('paid')
  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    designerName: '',
    type: '',
    website: '',
    instagram: '',
    category: '',
    email: '',
    notes: ''
  })

  const getStepFields = () => {
    const baseSteps: FormStep[] = [
      {
        title: "Entity Type",
        fields: [
          {
            name: 'type',
            label: 'ENTITY TYPE',
            type: 'select',
            options: submissionType === 'paid' 
              ? ['Brand', 'Designer', 'Brand & Designer']
              : ['Brand', 'Designer'],
            required: true,
            helperText: 'Select whether you\'re submitting a brand, designer, or both'
          }
        ]
      }
    ]

    // Step 2 fields change based on entity type
    const step2: FormStep = {
      title: "Basic Information",
      fields: formData.type === 'Brand & Designer' ? [
        {
          name: 'brandName',
          label: 'BRAND NAME',
          type: 'text',
          required: true,
          helperText: 'Official brand name'
        },
        {
          name: 'brandWebsite',
          label: 'BRAND WEBSITE URL',
          type: 'url',
          required: true,
          helperText: 'Main website with collection and product information'
        },
        {
          name: 'brandInstagram',
          label: 'BRAND INSTAGRAM URL',
          type: 'url',
          required: true,
          helperText: 'Official brand Instagram profile'
        },
        {
          name: 'designerName',
          label: 'DESIGNER NAME',
          type: 'text',
          required: true,
          helperText: 'Designer\'s full name'
        },
        {
          name: 'designerWebsite',
          label: 'DESIGNER WEBSITE URL',
          type: 'url',
          required: false,
          helperText: 'Designer\'s personal or portfolio website (optional)'
        },
        {
          name: 'designerInstagram',
          label: 'DESIGNER INSTAGRAM URL',
          type: 'url',
          required: false,
          helperText: 'Designer\'s personal Instagram profile (optional)'
        },
        {
          name: 'designerEmail',
          label: 'DESIGNER EMAIL',
          type: 'email',
          required: false,
          helperText: 'Designer\'s contact email (optional)'
        }
      ] : [
        {
          name: 'name',
          label: formData.type === 'Brand' ? 'BRAND NAME' : 'DESIGNER NAME',
          type: 'text',
          required: true,
          helperText: formData.type === 'Brand' ? 'Official brand name' : 'Designer\'s full name'
        }
      ]
    }

    const categoryField = {
      name: 'category',
      label: 'PRIMARY CATEGORY',
      type: 'select',
      options: ['High Fashion', 'Streetwear', 'High Fashion Streetwear Hybrid', 'Avant-Garde', 'Other'],
      required: true,
      helperText: 'Main category that best describes the brand/designer'
    }

    const otherCategoryField = {
      name: 'otherCategory',
      label: 'SPECIFY CATEGORY',
      type: 'text',
      required: formData.category === 'Other',
      helperText: 'Please specify the category that best describes your brand/designer',
      placeholder: 'e.g., Sustainable Luxury, Contemporary Minimalist, etc.'
    }

    return [...baseSteps, step2, {
      title: "Additional Details",
      fields: [
        {
          name: 'website',
          label: 'WEBSITE URL',
          type: 'url',
          required: true,
          helperText: 'Main website with collection and product information'
        },
        {
          name: 'instagram',
          label: 'INSTAGRAM URL',
          type: 'url',
          required: true,
          helperText: 'Official Instagram profile'
        },
        categoryField,
        ...(formData.category === 'Other' ? [otherCategoryField] : []),
        {
          name: 'email',
          label: 'YOUR EMAIL',
          type: 'email',
          required: true,
          helperText: 'We\'ll notify you when your submission is reviewed'
        },
        {
          name: 'notes',
          label: 'ADDITIONAL NOTES',
          type: 'textarea',
          placeholder: 'Any additional information that might help our curation team...',
          helperText: 'Optional context about the brand/designer'
        }
      ]
    }]
  }

  const steps = getStepFields()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // TODO: Submit to API for review and potential scraping
      console.log('Submission for review:', formData)
    }
  }

  return (
    <ContentPage 
      title="SUBMIT FOR REVIEW"
      subtitle={
        <>
          Submit a brand or designer for our platform. We focus on emerging high fashion and streetwear.
          <br />
          All submissions are reviewed by our curation team before being added to our database.
        </>
      }
    >
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-8 p-4 bg-gray-50 border border-black/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
            <p className="text-sm text-gray-600 tracking-[0.05em] leading-relaxed">
              Submissions must have an established online presence with accessible collection and product information.
              Our platform automatically aggregates data from verified sources to maintain quality and accuracy.
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${index <= currentStep ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              )}
            </div>
          ))}
        </div>

        {currentStep === 0 && (
          <div className="mb-12 grid grid-cols-2 gap-4">
            <div 
              onClick={() => setSubmissionType('free')}
              className={`p-4 border cursor-pointer transition-all duration-300 rounded
                ${submissionType === 'free' ? 'bg-black text-white' : 'border-black/10 hover:border-black/30'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <h4 className="text-sm font-medium tracking-[0.15em]">FREE SUBMISSION</h4>
              </div>
              <p className={`text-xs tracking-[0.05em] ${submissionType === 'free' ? 'text-gray-400' : 'text-gray-600'}`}>
                Standard review process
                <br />
                Added to review queue
                <br />
                Basic visibility
              </p>
            </div>
            <div 
              onClick={() => setSubmissionType('paid')}
              className={`p-4 border cursor-pointer transition-all duration-300 rounded
                ${submissionType === 'paid' ? 'bg-black text-white' : 'border-black/10 hover:border-black/30'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4" />
                <h4 className="text-sm font-medium tracking-[0.15em]">PAID SUBMISSION</h4>
              </div>
              <p className={`text-xs tracking-[0.05em] ${submissionType === 'paid' ? 'text-gray-400' : 'text-gray-600'}`}>
                Priority review
                <br />
                Instant scraping
                <br />
                Featured placement
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <h3 className="text-lg font-medium tracking-[0.15em] mb-8">
            {steps[currentStep].title}
          </h3>

          {steps[currentStep].fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label 
                htmlFor={field.name} 
                className="block text-sm tracking-[0.15em] text-gray-600"
              >
                {field.label}
              </label>
              
              {field.type === 'radio' ? (
                <div className="flex gap-4">
                  {field.options?.map(option => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={field.name}
                        value={option}
                        checked={formData[field.name as keyof typeof formData] === option}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="text-sm tracking-[0.15em] capitalize">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData] as string}
                  onChange={handleChange}
                  rows={4}
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-black/10 focus:border-black transition-colors outline-none tracking-[0.05em] resize-none"
                  required={field.required}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData] as string}
                  onChange={handleChange}
                  className="w-full p-3 border border-black/10 focus:border-black transition-colors outline-none tracking-[0.05em]"
                  required={field.required}
                >
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {field.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData] as string}
                  onChange={handleChange}
                  className="w-full p-3 border border-black/10 focus:border-black transition-colors outline-none tracking-[0.05em]"
                  required={field.required}
                  placeholder={field.placeholder}
                />
              )}
              
              {field.helperText && (
                <p className="text-xs text-gray-500 tracking-[0.05em]">
                  {field.helperText}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full p-3 border border-black hover:bg-black/80 hover:backdrop-blur-sm hover:text-[#4FFFF4] hover:border-[#4FFFF4] text-sm tracking-[0.25em] bg-black/100 text-white transition-all duration-300"
          >
            {currentStep === steps.length - 1 ? 'SUBMIT FOR REVIEW' : 'NEXT'}
          </button>
        </form>
      </div>
    </ContentPage>
  )
} 