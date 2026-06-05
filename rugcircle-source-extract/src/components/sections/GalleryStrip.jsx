import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

const images = [
  { src: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=500&q=80&auto=format&fit=crop', caption: 'Craft in progress' },
  { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80&auto=format&fit=crop', caption: 'Team at work' },
  { src: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&q=80&auto=format&fit=crop', caption: 'Creative design' },
  { src: 'https://images.unsplash.com/photo-1558618047-3c8c76ca8462?w=500&q=80&auto=format&fit=crop', caption: 'Studio workspace' },
  { src: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=500&q=80&auto=format&fit=crop', caption: 'Colourful threads' },
  { src: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&q=80&auto=format&fit=crop', caption: 'Yarn and colour' },
  { src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=500&q=80&auto=format&fit=crop', caption: 'Modern office' },
  { src: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=500&q=80&auto=format&fit=crop', caption: 'Creative session' },
]

export default function GalleryStrip() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const x2 = useTransform(scrollYProgress, [0, 1], [-80, 60])

  return (
    <section ref={ref} className="gallery-section">
      <div style={{ textAlign: 'center', marginBottom: 56, padding: '0 24px' }}>
        <div className="section-label" style={{ justifyContent: 'center' }}>The craft</div>
        <h2 className="section-title" style={{ maxWidth: 500, margin: '0 auto' }}>
          Where corporate meets <em>creativity.</em>
        </h2>
        <p className="section-subtitle" style={{ maxWidth: 440, margin: '16px auto 0' }}>
          Every session is equal parts professional workshop and creative playground.
        </p>
      </div>

      <motion.div className="gallery-row gallery-row-top" style={{ x: x1 }}>
        {[...images, ...images.slice(0, 4)].map((img, i) => (
          <motion.div
            key={i}
            className="gallery-card-lg"
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(26,22,22,0.10)',
              border: '2.5px solid rgba(255,255,255,0.9)',
              position: 'relative',
            }}
            whileHover={{ scale: 1.04, zIndex: 10, boxShadow: '0 20px 60px rgba(26,22,22,0.18)' }}
            transition={{ duration: 0.35 }}
          >
            <img
              src={img.src}
              alt={img.caption}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
              onError={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #F5F0EB, #E8DDD0)'
                e.target.src = `https://picsum.photos/seed/${i + 10}/310/230`
              }}
            />
            <div
              className="img-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 50%, rgba(26,22,22,0.55) 100%)',
                opacity: 0,
                transition: 'opacity 0.3s',
              }}
            />
            <motion.div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(26,22,22,0.65))',
                padding: '24px 16px 14px',
                opacity: 0,
              }}
              whileHover={{ opacity: 1 }}
            >
              <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{img.caption}</span>
            </motion.div>
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(8px)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              Rug Circle
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="gallery-row gallery-row-bottom" style={{ x: x2 }}>
        {[...images.slice(4), ...images].map((img, i) => (
          <motion.div
            key={i}
            className="gallery-card-sm"
            style={{
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 6px 24px rgba(26,22,22,0.08)',
              border: '2px solid rgba(255,255,255,0.85)',
            }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={img.src}
              alt={img.caption}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
              onError={(e) => {
                e.target.src = `https://picsum.photos/seed/${i + 30}/260/185`
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 120,
          background: 'linear-gradient(90deg, var(--color-bg), transparent)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 120,
          background: 'linear-gradient(270deg, var(--color-bg), transparent)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />
    </section>
  )
}
