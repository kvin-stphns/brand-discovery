'use client'
import ContentPage from '@/components/templates/ContentPage'

export default function AboutPage() {
  return (
    <ContentPage title="ABOUT">
      <div className="space-y-12 max-w-3xl pb-16 md:pb-0">
        <section>
          <h3 className="text-lg font-medium tracking-[0.15em] mb-4">Our Mission</h3>
          <p className="text-gray-600 tracking-[0.05em] leading-relaxed">
            Discovery Studios is dedicated to bridging the gap between emerging fashion brands and their audience. We believe in the power of discovery and the importance of giving visibility to innovative designers.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-medium tracking-[0.15em] mb-4">Our Platform</h3>
          <p className="text-gray-600 tracking-[0.05em] leading-relaxed">
            We provide a curated space where fashion enthusiasts can explore and connect with unique brands. Our platform showcases carefully selected designers, emphasizing quality, creativity, and innovation in fashion.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-medium tracking-[0.15em] mb-4">Our Community</h3>
          <p className="text-gray-600 tracking-[0.05em] leading-relaxed">
            Join a growing community of fashion forward individuals, designers, and brands. Together, we're creating a space that celebrates creativity and supports the future of fashion.
          </p>
        </section>
      </div>
    </ContentPage>
  )
} 