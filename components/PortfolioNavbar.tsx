'use client'
import { useRouter } from 'next/navigation'

export default function PortfolioNavbar() {
  const router = useRouter()

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="nav-logo">
          <div className="nav-logo-icon">T</div>
          TeamUp
        </a>

        <ul className="nav-links">
          <li>
            <a onClick={() => scrollTo('features')}>Solutions</a>
          </li>
          <li>
            <a onClick={() => scrollTo('services')}>Services</a>
          </li>
          <li>
            <a onClick={() => router.push('/pricing')}>Pricing</a>
          </li>
        </ul>

        <a href="/onboarding" className="nav-links">
          <button className="nav-cta" onClick={() => router.push('/onboarding')}>
            Start Now →
          </button>
        </a>
      </div>
    </nav>
  )
}