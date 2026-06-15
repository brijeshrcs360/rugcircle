import { useEffect } from 'react'

const SITE_NAME = 'Rug Circle'
const DEFAULT_TITLE = 'Rug Circle — Corporate Team Experiences'
const DEFAULT_DESCRIPTION = 'Hands-on rug tufting experiences for corporate teams. Your team leaves with a rug, not just a group photo. Book workshops across India.'
const DEFAULT_KEYWORDS = 'rug tufting, corporate team building, team experience, workshop, handmade rug, Ahmedabad, corporate event, rug workshop India'
const SITE_URL = 'https://rugcircle.com'

/**
 * @param {object} options
 * @param {string} [options.title] - Page title
 * @param {string} [options.description] - Meta description (max ~160 chars)
 * @param {string} [options.keywords] - Comma-separated keywords
 * @param {string} [options.canonical] - Canonical path e.g. '/package/my-workshop'
 * @param {string} [options.robots] - Robots directive, default 'index, follow'
 * @param {string} [options.ogType] - Open Graph type, default 'website'
 * @param {string} [options.ogImage] - Open Graph image URL
 */
export default function useSEO({
  title,
  description,
  keywords,
  canonical,
  robots = 'index, follow',
  ogType = 'website',
  ogImage,
} = {}) {
  useEffect(() => {
    const prev = document.title

    // Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE
    document.title = fullTitle

    // Helper to set/create meta tag
    const setMeta = (attr, attrValue, content) => {
      let el = document.querySelector(`meta[${attr}="${attrValue}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, attrValue)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
      return el
    }

    // Description
    const descContent = description || DEFAULT_DESCRIPTION
    setMeta('name', 'description', descContent)

    // Keywords
    const kwContent = keywords || DEFAULT_KEYWORDS
    setMeta('name', 'keywords', kwContent)

    // Robots
    setMeta('name', 'robots', robots)

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      const href = canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`
      if (!canonicalEl) {
        canonicalEl = document.createElement('link')
        canonicalEl.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalEl)
      }
      canonicalEl.setAttribute('href', href)
    }

    // Open Graph
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', descContent)
    setMeta('property', 'og:type', ogType)
    setMeta('property', 'og:site_name', SITE_NAME)
    if (canonical) {
      setMeta('property', 'og:url', canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`)
    }
    if (ogImage) {
      setMeta('property', 'og:image', ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`)
    }

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', descContent)
    if (ogImage) {
      setMeta('name', 'twitter:image', ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`)
    }

    return () => {
      document.title = prev
    }
  }, [title, description, keywords, canonical, robots, ogType, ogImage])
}
