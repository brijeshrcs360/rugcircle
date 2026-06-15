import Hero         from '../components/sections/Hero'
import UseCases     from '../components/sections/UseCases'
import SeasonalPromotions from '../components/sections/SeasonalPromotions'
import WhySection   from '../components/sections/WhySection'
import GalleryStrip from '../components/sections/GalleryStrip'
import Packages     from '../components/sections/Packages'
import StatsBand    from '../components/sections/StatsBand'
import HowItWorks   from '../components/sections/HowItWorks'
import Testimonial  from '../components/sections/Testimonial'
import FAQ          from '../components/sections/FAQ'
import ContactForm  from '../components/sections/ContactForm'
import useSEO from '../hooks/useSEO'

export default function Home() {
  useSEO({
    title: 'Corporate Rug Tufting Workshops in India',
    description: 'Book premium rug tufting workshops for corporate teams. Hands-on experiences, custom rugs, and memorable team building across India.',
    keywords: 'corporate rug tufting, team building workshop, rug workshop India, corporate experiences, handmade rug workshop',
    canonical: '/',
  })

  return (
    <>
      <div className="marquee-bar">
        <div className="marquee-track">
          {Array(10).fill(null).map((_, i) => (
            <span key={i} className="marquee-item">
              <span className="marquee-dot" />
              <span>Now booking corporate dates · Apr — Jul 2026</span>
              <span className="marquee-dot" />
              <span>Studio in Memnagar, Ahmedabad</span>
              <span className="marquee-dot" />
              <span>Onsite pop-ups across Gujarat</span>
            </span>
          ))}
        </div>
      </div>
      <Hero />
      <UseCases />
      <SeasonalPromotions />
      <WhySection />
      <GalleryStrip />
      <Packages />
      <StatsBand />
      <HowItWorks />
      <Testimonial />
      <FAQ />
      <ContactForm />
    </>
  )
}
