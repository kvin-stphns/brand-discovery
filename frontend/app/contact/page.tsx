'use client'
import { useState } from 'react'
import ContentPage from '@/components/templates/ContentPage'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <ContentPage 
      title="CONTACT"
      subtitle={
        <>
          Have a question or want to get in touch?
          <br />
          Fill out the form below and we'll get back to you as soon as possible.
        </>
      }
    >
      <div className="max-w-6xl mx-auto py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="name" className="block text-sm tracking-[0.15em] text-gray-600 mb-2">
              NAME
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-black/10 focus:border-black transition-colors outline-none tracking-[0.05em]"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm tracking-[0.15em] text-gray-600 mb-2">
              EMAIL
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-black/10 focus:border-black transition-colors outline-none tracking-[0.05em]"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm tracking-[0.15em] text-gray-600 mb-2">
              SUBJECT
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-3 border border-black/10 focus:border-black transition-colors outline-none tracking-[0.05em]"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm tracking-[0.15em] text-gray-600 mb-2">
              MESSAGE
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className="w-full p-3 border border-black/10 focus:border-black transition-colors outline-none tracking-[0.05em] resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 border border-black hover:bg-black/80 hover:backdrop-blur-sm hover:text-[#4FFFF4] hover:border-[#4FFFF4] text-sm tracking-[0.25em] bg-black/100 text-white transition-all duration-300"
          >
            SEND MESSAGE
          </button>
        </form>
      </div>
    </ContentPage>
  )
} 