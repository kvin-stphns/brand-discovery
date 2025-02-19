'use client'
import ContentPage from '@/components/templates/ContentPage'

export default function PrivacyPage() {
  return (
    <ContentPage 
      title="PRIVACY POLICY"
      subtitle="Last updated: March 2024"
    >
      <div className="space-y-12 max-w-3xl py-8 pb-24">
        <section>
          <h3 className="text-lg font-medium tracking-[0.15em] mb-4">Information We Collect</h3>
          <p className="text-gray-600 tracking-[0.05em] leading-relaxed">
            We collect information you provide directly to us when you create an account, make a purchase, or contact us. This may include your name, email address, shipping address, and payment information.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-medium tracking-[0.15em] mb-4">How We Use Your Information</h3>
          <p className="text-gray-600 tracking-[0.05em] leading-relaxed">
            We use the information we collect to provide, maintain, and improve our services, process your transactions, and communicate with you about products, services, and promotions.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-medium tracking-[0.15em] mb-4">Information Sharing</h3>
          <p className="text-gray-600 tracking-[0.05em] leading-relaxed">
            We do not sell or rent your personal information to third parties. We may share your information with service providers who assist us in operating our platform and processing transactions.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-medium tracking-[0.15em] mb-4">Data Security</h3>
          <p className="text-gray-600 tracking-[0.05em] leading-relaxed">
            We implement appropriate security measures to protect your personal information from unauthorized access, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-medium tracking-[0.15em] mb-4">Your Rights</h3>
          <p className="text-gray-600 tracking-[0.05em] leading-relaxed">
            You have the right to access, correct, or delete your personal information. You may also opt out of receiving marketing communications from us at any time.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-medium tracking-[0.15em] mb-4">Contact Us</h3>
          <p className="text-gray-600 tracking-[0.05em] leading-relaxed">
            If you have any questions about our Privacy Policy, please contact us through our contact page.
          </p>
        </section>
      </div>
    </ContentPage>
  )
} 