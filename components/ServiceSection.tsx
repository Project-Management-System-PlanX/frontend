export default function ServicesSection() {
  const services = [
    { icon: '🤖', title: 'AI Workflow Automation', desc: 'Use natural language to build any workflow. TeamUp AI understands your team and automates repetitive tasks, approvals, and routing instantly.' },
    { icon: '🔒', title: 'Enterprise Security', desc: 'Bank-grade encryption, SSO, audit logs, and role-based access controls. Your data stays yours — always compliant, always protected.' },
    { icon: '📬', title: 'Smart Notifications', desc: 'Context-aware alerts delivered to Slack, email, or in-app. No noise — only the signals that actually matter for your workflow.' },
    { icon: '📊', title: 'Analytics & Reporting', desc: 'Auto-generated insights, custom dashboards, and one-click exports. Turn raw activity data into executive-ready reports effortlessly.' },
    { icon: '🌐', title: 'Multi-language Support', desc: 'Work seamlessly across 50+ languages. TeamUp auto-detects and adapts the interface and AI responses for your global team.' },
    { icon: '🔗', title: 'Integrations Hub', desc: 'Connect 100+ tools including Slack, Notion, HubSpot, and more. Replace nothing — enhance everything you already use.' },
  ]

  return (
    <section className="services-section" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">✦ Services</span>
          <h2>Everything your team needs<br />in one powerful platform</h2>
          <p>From automation to analytics, TeamUp delivers enterprise-grade capabilities that scale with you.</p>
        </div>

        <div className="services-grid">
          {services.map((s) => (
            <div className="service-card" key={s.title}>
              <div className="service-card-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}