import { motion, useInView } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PACKAGES, COMPARE_ROWS } from '../../constants/packages'
import { useTilt } from '../../hooks/useTilt'
import { api } from '../../services/api'

function EditorialCard({ pkg, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { rotateX: rx, rotateY: ry, onMouseMove: handleMove, onMouseLeave: handleLeave } = useTilt(3)

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformStyle: 'preserve-3d',
        borderRadius: 28,
        overflow: 'hidden',
        background: 'white',
        border: pkg.featured ? `2px solid ${pkg.color}` : '1.5px solid rgba(226,220,214,0.8)',
        boxShadow: pkg.featured
          ? `0 20px 60px ${pkg.color}25, 0 4px 16px rgba(26,22,22,0.06)`
          : '0 4px 20px rgba(26,22,22,0.05)',
        position: 'relative',
      }}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ y: -8, boxShadow: `0 32px 80px ${pkg.color}30, 0 8px 32px rgba(26,22,22,0.08)` }}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${pkg.color}, ${pkg.colorDark})`, borderRadius: '28px 28px 0 0' }} />

      <div style={{ padding: '28px 28px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: pkg.color }}>
            {pkg.num} - {pkg.tag}
          </span>
          {pkg.featured && (
            <span
              style={{
                background: pkg.color,
                color: 'white',
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                padding: '5px 14px',
                borderRadius: 100,
              }}
            >
              Most Booked
            </span>
          )}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>{pkg.title}</div>
      </div>

      <div style={{ padding: '16px 28px 28px' }}>
        <div
          style={{
            display: 'flex',
            gap: 0,
            background: 'var(--color-bg)',
            borderRadius: 14,
            overflow: 'hidden',
            marginBottom: 20,
            border: '1px solid var(--color-border)',
          }}
        >
          {[
            { icon: 'People', val: pkg.range },
            { icon: 'Time', val: pkg.hours },
            { icon: 'Place', val: pkg.location },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: '10px 8px',
                textAlign: 'center',
                borderRight: i < 2 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div style={{ fontSize: 12, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#666', lineHeight: 1.3 }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 42,
              fontWeight: 900,
              lineHeight: 1,
              background: `linear-gradient(135deg, ${pkg.color}, ${pkg.colorDark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {pkg.price}
          </span>
          <span style={{ fontSize: 14, color: '#aaa', paddingBottom: 6, fontWeight: 400 }}>{pkg.unit}</span>
        </div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 1.6 }}>{pkg.desc}</p>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
          {pkg.features.map((f, i) => (
            <motion.li
              key={i}
              style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#555' }}
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.12 + i * 0.05 + 0.4 }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  background: `${pkg.color}18`,
                  color: pkg.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              {f}
            </motion.li>
          ))}
        </ul>

        {pkg.ctaType === 'details' ? (
          <Link to={`/package/${pkg.slug}`} style={{ display: 'block' }}>
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
                background: pkg.featured ? pkg.color : 'transparent',
                color: pkg.featured ? 'white' : pkg.color,
                border: pkg.featured ? 'none' : `2px solid ${pkg.color}`,
                cursor: 'pointer',
                boxShadow: pkg.featured ? `0 6px 24px ${pkg.color}40` : 'none',
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 10px 32px ${pkg.color}50` }}
              whileTap={{ scale: 0.97 }}
            >
              View details and book
            </motion.button>
          </Link>
        ) : (
          <a href="#inquire" style={{ display: 'block' }}>
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
                background: pkg.featured ? pkg.color : 'transparent',
                color: pkg.featured ? 'white' : pkg.color,
                border: pkg.featured ? 'none' : `2px solid ${pkg.color}`,
                cursor: 'pointer',
                boxShadow: pkg.featured ? `0 6px 24px ${pkg.color}40` : 'none',
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 10px 32px ${pkg.color}50` }}
              whileTap={{ scale: 0.97 }}
            >
              Register now
            </motion.button>
          </a>
        )}
      </div>
    </motion.div>
  )
}

function CompareRow() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="compare-wrap">
      <div className="compare-scroll">
        <div className="compare-grid-header" style={{ background: 'var(--color-text)', padding: '16px 24px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' }}>What's included</div>
          {PACKAGES.map((p) => (
            <div key={p.slug} style={{ fontSize: 14, fontWeight: 800, color: 'white', textAlign: 'center' }}>{p.title}</div>
          ))}
        </div>
        {COMPARE_ROWS.map((row, i) => (
          <div className="compare-grid-row" key={i} style={{ padding: '14px 24px', background: i % 2 === 0 ? 'white' : 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>{row.label}</div>
            {row.vals.map((v, j) => (
              <div key={j} style={{ fontSize: 13, textAlign: 'center', color: '#555', fontWeight: 500 }}>{v}</div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function Packages() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })
  const [campaigns, setCampaigns] = useState([])

  useEffect(() => {
    api.listPublicCampaigns().then((res) => setCampaigns(res.campaigns || [])).catch(() => setCampaigns([]))
  }, [])

  const livePackages = useMemo(() => {
    const palette = [
      { color: '#91BA79', colorDark: '#5A8B45', tag: 'Live campaign' },
      { color: '#E1802D', colorDark: '#C0631A', tag: 'Open now' },
      { color: '#36746F', colorDark: '#2A5955', tag: 'Seats active' },
    ]

    if (!campaigns.length) return PACKAGES.map((p) => ({ ...p, ctaType: 'details' }))

    return campaigns.map((c, i) => {
      const p = palette[i % palette.length]
      const hasStaticDetails = PACKAGES.some((sp) => sp.slug === c.slug)
      return {
        num: String(i + 1).padStart(2, '0'),
        tag: p.tag,
        title: c.name,
        desc: `${c.location}${c.city ? `, ${c.city}` : ''} | ${c.workshopDate} | ${c.startTime}`,
        price: `INR ${Number(c.price).toLocaleString('en-IN')}`,
        unit: '/ person',
        range: `${c.seatCapacity} seats`,
        hours: c.startTime,
        location: c.location,
        featured: i === 0,
        color: p.color,
        colorDark: p.colorDark,
        features: [
          `Date: ${c.workshopDate}`,
          `Time: ${c.startTime}`,
          `Capacity: ${c.seatCapacity}`,
          `Status: ${c.status}`,
          'UPI payment enabled',
        ],
        slug: c.slug,
        ctaType: hasStaticDetails ? 'details' : 'register',
      }
    })
  }, [campaigns])

  return (
    <section className="packages-section" id="packages" style={{ padding: '120px 24px', background: 'linear-gradient(180deg,#F5F0EB 0%,var(--color-bg) 100%)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <motion.div
          ref={headerRef}
          style={{ textAlign: 'center', marginBottom: 72 }}
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label" style={{ justifyContent: 'center' }}>Packages and Pricing</div>
          <h2 className="section-title">
            Pick the shape of your <em>experience.</em>
          </h2>
          <p className="section-subtitle" style={{ maxWidth: 520, margin: '0 auto' }}>
            All packages include yarn in your brand colours, instruction, framing, and the finished piece to take home.
          </p>
        </motion.div>

        <div className="packages-grid-custom">
          {livePackages.map((pkg, i) => (
            <EditorialCard key={i} pkg={pkg} index={i} />
          ))}
        </div>

        <CompareRow />
      </div>
    </section>
  )
}
