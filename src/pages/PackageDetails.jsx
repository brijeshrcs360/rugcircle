import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { PACKAGES, PACKAGE_DETAILS } from '../constants/packages'
import { api } from '../services/api'

const staticLookup = Object.fromEntries(
  PACKAGES.map((p) => [
    p.slug,
    {
      num: p.num,
      title: p.title,
      price: p.price,
      priceUnit: p.unit,
      ...PACKAGE_DETAILS[p.slug],
    },
  ]),
)

export default function PackageDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    api.getPublicCampaignBySlug(slug)
      .then((res) => setCampaign(res.campaign || null))
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false))
  }, [slug])

  const staticPkg = staticLookup[slug]

  const pkg = useMemo(() => {
    if (!campaign) return staticPkg || null

    return {
      badge: campaign.badgeText || (campaign.status === 'active' ? 'Now Open' : undefined),
      subtitle: campaign.shortSubtitle || `${campaign.location}${campaign.city ? `, ${campaign.city}` : ''}`,
      title: campaign.name,
      price: `INR ${Number(campaign.price).toLocaleString('en-IN')}`,
      priceUnit: campaign.priceUnitLabel || '/ person',
      totalExample: campaign.totalExample || `Date ${campaign.workshopDate} · Time ${campaign.startTime}`,
      detailFeatures: (Array.isArray(campaign.detailFeatures) && campaign.detailFeatures.length > 0) ? campaign.detailFeatures : [
        { title: 'Campaign Date', desc: campaign.workshopDate },
        { title: 'Start Time', desc: campaign.startTime },
        { title: 'Location', desc: `${campaign.location}${campaign.city ? `, ${campaign.city}` : ''}` },
        { title: 'Seat Capacity', desc: `${campaign.seatCapacity} seats` },
        { title: 'Status', desc: campaign.status },
        { title: 'Payment', desc: 'UPI payment enabled' },
      ],
      details: campaign.overview || campaign.notes ||
        'This campaign is configured from admin panel. You can update schedule, capacity, and pricing in admin and this page will update automatically.',
    }
  }, [campaign, staticPkg])

  if (loading) {
    return (
      <div className="details-page">
        <div className="details-inner" style={{ textAlign: 'center' }}>
          <h1>Loading package...</h1>
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="details-page">
        <div className="details-inner" style={{ textAlign: 'center' }}>
          <h1>Package not found</h1>
          <Link to="/" className="btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="details-page">
      <div className="details-inner">
        <motion.div className="details-hero" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {pkg.badge && <span className="package-badge-lg">{pkg.badge}</span>}
          <div className="section-label">{pkg.subtitle}</div>
          <h1>{pkg.title}</h1>
          <div className="price-big">
            {pkg.price}<span>{pkg.priceUnit}</span>
          </div>
          <p style={{ color: '#888', fontSize: 14, marginTop: 8 }}>{pkg.totalExample}</p>
        </motion.div>

        <motion.div className="details-content" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <h3>What's included</h3>
          <div className="details-features">
            {pkg.detailFeatures.map((f, i) => (
              <div className="detail-feature" key={i}>
                <span className="icon">✓</span>
                <div className="text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h3>How it works</h3>
          <p>{pkg.details}</p>

          <div className="details-cta">
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate(`/register/${slug}?step=1`)}>
              Register and Pay
            </button>
            <Link to="/#inquire" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Request custom quote
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
