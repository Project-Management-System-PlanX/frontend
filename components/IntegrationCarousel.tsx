'use client'

import { useEffect, useRef } from 'react'

// Real app logos with brand colors
const row1 = [
  { name: 'Notion', icon: 'https://cdn.simpleicons.org/notion', color: '#000000' },
  { name: 'HubSpot', icon: 'https://cdn.simpleicons.org/hubspot', color: '#FF7A59' },
  { name: 'PayPal', icon: 'https://cdn.simpleicons.org/paypal', color: '#003087' },
  { name: 'Google Maps', icon: 'https://cdn.simpleicons.org/googlemaps', color: '#4285F4' },
  { name: 'Google Ads', icon: 'https://cdn.simpleicons.org/googleads', color: '#EA4335' },
  { name: 'Stripe', icon: 'https://cdn.simpleicons.org/stripe', color: '#635BFF' },
  { name: 'Webflow', icon: 'https://cdn.simpleicons.org/webflow', color: '#4353FF' },
  { name: 'Airtable', icon: 'https://cdn.simpleicons.org/airtable', color: '#18BFFF' },
  { name: 'Zoom', icon: 'https://cdn.simpleicons.org/zoom', color: '#2D8CFF' },
  { name: 'Figma', icon: 'https://cdn.simpleicons.org/figma', color: '#F24E1E' },
]

const row2 = [
  { name: 'Dropbox', icon: 'https://cdn.simpleicons.org/dropbox', color: '#0061FF' },
  { name: 'DaVinci', icon: 'https://cdn.simpleicons.org/davinciresolve', color: '#FFB800' },
  { name: 'Asana', icon: 'https://cdn.simpleicons.org/asana', color: '#273347' },
  { name: 'Jira', icon: 'https://cdn.simpleicons.org/jira', color: '#0052CC' },
  { name: 'Zendesk', icon: 'https://cdn.simpleicons.org/zendesk', color: '#03363D' },
  { name: 'Linear', icon: 'https://cdn.simpleicons.org/linear', color: '#5E6AD2' },
  { name: 'GitHub', icon: 'https://cdn.simpleicons.org/github', color: '#181717' },
  { name: 'Confluence', icon: 'https://cdn.simpleicons.org/confluence', color: '#172B4D' },
  { name: 'Trello', icon: 'https://cdn.simpleicons.org/trello', color: '#04579B' },
  { name: 'ClickUp', icon: 'https://cdn.simpleicons.org/clickup', color: '#7B68EE' },
  { name: 'GitLab', icon: 'https://cdn.simpleicons.org/gitlab', color: '#FCA326' },
  { name: 'Intercom', icon: 'https://cdn.simpleicons.org/intercom', color: '#2F9CFF' },
]

function IconCard({ name, icon, color }: { name: string; icon: string; color: string }) {
  return (
    <div className="integration-icon-card" title={name} style={{ '--icon-color': color } as React.CSSProperties}>
      <svg className="integration-card-bg" viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="36" r="35" fill={color} opacity="0.08" stroke={color} strokeWidth="1.5"/>
      </svg>
      <img src={`${icon}?color=${color.replace('#', '')}`} alt={name} width={44} height={44} style={{ objectFit: 'contain', position: 'relative', zIndex: 2, filter: `drop-shadow(0 2px 6px rgba(0,0,0,0.15))` }} />
    </div>
  )
}

function InfiniteRow({ items, reverse = false }: { items: typeof row1; reverse?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let pos = reverse ? -(trackRef.current?.scrollWidth ?? 0) / 2 : 0
    const speed = reverse ? 0.6 : 0.5
    let rafId: number

    const animate = () => {
      if (!trackRef.current) return
      const half = trackRef.current.scrollWidth / 2
      if (reverse) {
        pos += speed
        if (pos >= 0) pos = -half
      } else {
        pos -= speed
        if (Math.abs(pos) >= half) pos = 0
      }
      trackRef.current.style.transform = `translateX(${pos}px)`
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [reverse])

  const doubled = [...items, ...items]

  return (
    <div className="integration-row-wrap">
      <div ref={trackRef} className="integration-row-track">
        {doubled.map((app, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: duplicated for infinite scroll
          <IconCard key={i} name={app.name} icon={app.icon} color={app.color} />
        ))}
      </div>
    </div>
  )
}

export const IntegrationCarousel = () => {
  return (
    <section className="integrations-v2">
      {/* Grid overlay */}
      <div className="integrations-v2-grid" />

      <div className="integrations-v2-header">
        <span className="integrations-v2-badge">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: 6 }}>
            <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="currentColor" />
          </svg>
          INTEGRATIONS
        </span>
        <h2 className="integrations-v2-title">Don't replace. Integrate.</h2>
        <p className="integrations-v2-subtitle">
          We understand the hassle of replacing the long used tools in your process.
          <br />
          That's why we integrate tools you use in your day-to-day work.
        </p>
        <a href="#" className="integrations-v2-link">All Integrations →</a>
      </div>

      {/* Two infinite-scroll rows */}
      <div className="integrations-v2-rows">
        {/* Fade edges */}
        <div className="integrations-v2-fade-left" />
        <div className="integrations-v2-fade-right" />

        <InfiniteRow items={row1} />
        <InfiniteRow items={row2} reverse />
      </div>
    </section>
  )
}

export default IntegrationCarousel
