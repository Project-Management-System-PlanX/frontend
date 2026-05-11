export default function StatsAndCTA() {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-item">
            <h3>2021</h3>
            <p>TeamUp Founded</p>
          </div>
          <div className="stat-item">
            <h3>50K+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-item">
            <h3>1K+</h3>
            <p>Company Partners</p>
          </div>
        </div>

        <div className="cta-bar">
          <h2>
            Discover the full scale of{' '}
            <span>TeamUp</span> capabilities
          </h2>
          <div className="cta-bar-actions">
            <a href="#demo" className="btn-outline-white">Get a Demo</a>
            <a href="/onboarding" className="btn-white">Start for Free</a>
          </div>
        </div>
      </div>
    </section>
  )
}