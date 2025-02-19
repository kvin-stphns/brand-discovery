'use client'
import ContentPage from '@/components/templates/ContentPage'

export default function FAQPage() {
  const faqs = [
    {
      question: "What is Discovery Studios?",
      answer: "Discovery Studios is a platform dedicated to showcasing and discovering emerging fashion brands and designers."
    },
    {
      question: "How can I submit my brand?",
      answer: "You can submit your brand through our submissions page. We review all submissions carefully to maintain quality standards."
    },
    {
      question: "How do you select featured brands?",
      answer: "Our curation team carefully selects featured brands based on design quality, innovation, and market potential."
    },
    {
      question: "Can I save brands for later?",
      answer: "Yes, you can save brands to your profile by creating an account and using the save feature on brand pages."
    },
    {
      question: "How often is new content added?",
      answer: "We update our platform daily with new brands, designers, and collections to ensure fresh content for our users."
    },
    {
      question: "Is Discovery Studios available worldwide?",
      answer: "Yes, Discovery Studios is a global platform accessible to users and brands from all around the world."
    }
  ]

  return (
    <ContentPage title="FAQ">
      <div className="space-y-8">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-black/10 pb-8">
            <h3 className="text-lg font-medium tracking-[0.15em] mb-4">
              {faq.question}
            </h3>
            <p className="text-gray-600 tracking-[0.05em] leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </ContentPage>
  )
} 