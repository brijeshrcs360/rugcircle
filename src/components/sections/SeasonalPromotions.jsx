import { motion, useInView } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'

function SeasonalCard({ campaign, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const palette = [
    { color: '#91BA79', colorDark: '#5A8B45', tag: 'Live campaign' },
    { color: '#E1802D', colorDark: '#C0631A', tag: 'Open now' },
    { color: '#36746F', colorDark: '#2A5955', tag: 'Seats active' },
  ]
  const p = palette[index % palette.length]
  const seasonalTag = String(campaign?.seasonalLabel || campaign?.seasonal_label || 'Seasonal Promotion')
    .replace(/-/g, ' ')
    .trim()
  const campaignName = String(campaign?.name || campaign?.slug || 'Campaign')
    .replace(/-/g, ' ')
    .trim()

  return (
    <motion.div
      ref={ref}
      style={{
        borderRadius: 28,
        overflow: 'hidden',
        background: 'white',
        border: index === 0 ? `2px solid ${p.color}` : '1.5px solid rgba(226,220,214,0.8)',
        boxShadow: index === 0 ? `0 20px 60px ${p.color}25, 0 4px 16px rgba(26,22,22,0.06)` : '0 4px 20px rgba(26,22,22,0.05)',
        position: 'relative',
      }}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, boxShadow: `0 32px 80px ${p.color}30, 0 8px 32px rgba(26,22,22,0.08)` }}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${p.color}, ${p.colorDark})`, borderRadius: '28px 28px 0 0' }} />

      <div style={{ padding: '28px 28px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: p.color }}>
            {String(index + 1).padStart(2, '0')} - {p.tag}
          </span>
          <span />
        </div>
        <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 999, background: '#FEE9D6', color: '#A04F00', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
          {seasonalTag}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#1E1E1E', marginBottom: 8 }}>{campaignName}</div>
      </div>

      <div style={{ padding: '16px 28px 28px' }}>
        <div style={{ display: 'flex', gap: 0, background: 'var(--color-bg)', borderRadius: 14, overflow: 'hidden', marginBottom: 20, border: '1px solid var(--color-border)' }}>
          {[
            { icon: 'People', val: `${campaign.seatCapacity} seats` },
            { icon: 'Time', val: campaign.startTime },
            { icon: 'Place', val: campaign.location },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '10px 8px', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
              <div style={{ fontSize: 12, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#666', lineHeight: 1.3 }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, background: `linear-gradient(135deg, ${p.color}, ${p.colorDark})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            INR {Number(campaign.price || 0).toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: 14, color: '#aaa', paddingBottom: 6, fontWeight: 400 }}>/ person</span>
        </div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 1.6 }}>
          {campaign.location}{campaign.city ? `, ${campaign.city}` : ''} | {campaign.workshopDate} | {campaign.startTime}
        </p>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
          {[`Date: ${campaign.workshopDate}`, `Time: ${campaign.startTime}`, `Capacity: ${campaign.seatCapacity}`, `Status: ${campaign.status}`, 'UPI payment enabled'].map((f, i) => (
            <motion.li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#555' }} initial={{ opacity: 0, x: -8 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: index * 0.12 + i * 0.05 + 0.4 }}>
              <span style={{ width: 22, height: 22, borderRadius: 7, background: `${p.color}18`, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>✓</span>
              {f}
            </motion.li>
          ))}
        </ul>

        <Link to={`/package/${campaign.slug}`} style={{ display: 'block' }}>
          <motion.button
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: index === 0 ? p.color : 'transparent',
              color: index === 0 ? 'white' : p.color,
              border: index === 0 ? 'none' : `2px solid ${p.color}`,
              cursor: 'pointer',
              boxShadow: index === 0 ? `0 6px 24px ${p.color}40` : 'none',
            }}
            whileHover={{ scale: 1.02, boxShadow: `0 10px 32px ${p.color}50` }}
            whileTap={{ scale: 0.97 }}
          >
            View details and book
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}

export default function SeasonalPromotions() {
  const [campaigns, setCampaigns] = useState([])

  useEffect(() => {
    api.listPublicCampaigns().then((res) => setCampaigns(res.campaigns || [])).catch(() => setCampaigns([]))
  }, [])

  const isSeasonal = (c) => {
    const raw = String(c?.campaignType || c?.campaign_type || c?.type || '').trim().toLowerCase()
    return raw === 'seasonal_promotion' || raw === 'seasonal promotion'
  }

  const seasonalCampaigns = useMemo(
    () => campaigns.filter(isSeasonal),
    [campaigns],
  )

  if (!seasonalCampaigns.length) return null

  return (
    <section id="seasonal-promotions" style={{ padding: '120px 24px', background: 'linear-gradient(180deg,#F5F0EB 0%,var(--color-bg) 100%)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Seasonal Promotions</div>
          <h2 className="section-title">
            Pick the shape of your <em>experience.</em>
          </h2>
          <p className="section-subtitle" style={{ maxWidth: 520, margin: '0 auto' }}>
            Seasonal promotions like Valentine&apos;s Day and Women&apos;s Day. Campaigns with Seasonal Promotion type show here.
          </p>
        </div>

        <div className="packages-grid-custom">
          {seasonalCampaigns.map((campaign, i) => (
            <SeasonalCard key={campaign.id} campaign={campaign} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
