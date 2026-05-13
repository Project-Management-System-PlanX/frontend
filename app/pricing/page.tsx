"use client";
import { useState } from "react";
import Footer from "@/components/Footer";
import PortfolioNavbar from "@/components/PortfolioNavbar";

const plans = [
	{
		name: "Free",
		monthly: 0,
		annual: 0,
		desc: "Free for up to 10 collaborators per Workspace",
		cta: "Get started",
		featured: false,
		features: [
			"Unlimited cards",
			"Up to 10 boards per Workspace",
			"Quickly capture to-dos from email, Slack, and Teams",
			"Inbox",
			"Unlimited Power-Ups per board",
			"Unlimited storage (10MB/file)",
			"250 Workspace command runs per month",
			"Custom backgrounds & stickers",
		],
	},
	{
		name: "Standard",
		monthly: 6,
		annual: 5,
		desc: "Per user/month if billed annually ($6 billed monthly)",
		cta: "Sign up now",
		featured: false,
		features: [
			"Unlimited boards",
			"Quickly capture to-dos from email, Slack, and Teams — powered by AI",
			"Planner",
			"Advanced checklists",
			"Card mirroring",
			"Custom Fields",
			"List colors",
			"Collapsible lists",
			"Unlimited storage (250MB/file)",
			"1,000 Workspace command runs",
		],
	},
	{
		name: "Premium",
		monthly: 12.5,
		annual: 10,
		desc: "Per user/month if billed annually ($12.50 billed monthly)",
		cta: "Try for free",
		featured: true,
		features: [
			"AI",
			"Views: Calendar, Timeline, Table, Dashboard, and Map",
			"Workspace views: Table and Calendar",
			"Unlimited Workspace command runs",
			"Admin and security features",
			"Workspace-level templates",
			"Collections",
			"Observers",
			"Simple data export",
		],
	},
	{
		name: "Enterprise",
		monthly: 210 / 12,
		annual: 17.5,
		desc: "Per user/month – billed annually ($210.00 annual price per user)",
		cta: "Contact sales",
		featured: false,
		features: [
			"Unlimited Workspaces",
			"Organization-wide permissions",
			"Organization-visible boards",
			"Public board management",
			"Multi-board guests",
			"Attachment permissions",
			"Power-Up administration",
			"Free SSO and user provisioning with Atlassian Guard",
		],
	},
];

const comparisonRows = [
	{
		feature: "Real-time conversation analysis",
		free: true,
		standard: true,
		premium: true,
		enterprise: true,
	},
	{
		feature: "Up to 10,000 messages/month",
		free: true,
		standard: true,
		premium: true,
		enterprise: true,
	},
	{
		feature: "Basic sentiment detection",
		free: true,
		standard: true,
		premium: true,
		enterprise: true,
	},
	{ feature: "Email support", free: true, standard: true, premium: true, enterprise: true },
	{
		feature: "Advanced emotional intelligence",
		free: false,
		standard: true,
		premium: true,
		enterprise: true,
	},
	{
		feature: "Up to 100,000 messages/month",
		free: false,
		standard: true,
		premium: true,
		enterprise: true,
	},
	{
		feature: "Multi-language support (50+ languages)",
		free: false,
		standard: true,
		premium: true,
		enterprise: true,
	},
	{ feature: "Priority support", free: false, standard: true, premium: true, enterprise: true },
	{
		feature: "Custom AI model training",
		free: false,
		standard: false,
		premium: false,
		enterprise: true,
	},
	{ feature: "Unlimited messages", free: false, standard: false, premium: false, enterprise: true },
];

export default function PricingPage() {
	const [annual, setAnnual] = useState(false);

	return (
		<>
			<PortfolioNavbar />

			<section className="pricing-hero">
				<div className="container">
					<span className="section-badge">✦ Pricing</span>
					<h1>TeamUp your way.</h1>
					<p>
						Trusted by millions, TeamUp powers teams all around the world. Explore which option is
						right for you.
					</p>
					<div className="pricing-toggle">
						<span className="toggle-label">Monthly</span>
						<button
							className={`toggle-switch${annual ? " annual" : ""}`}
							onClick={() => setAnnual(!annual)}
							type="button"
							aria-label="Toggle between monthly and annual billing"
						/>
						<span className="toggle-label">Annual</span>
						<span className="save-badge">Save 20%</span>
					</div>
				</div>
			</section>

			<section className="pricing-plans">
				<div className="container">
					<div className="plans-grid">
						{plans.map((plan) => {
							const price = annual ? plan.annual : plan.monthly;
							return (
								<div className={`plan-card${plan.featured ? " featured" : ""}`} key={plan.name}>
									<p className="plan-name">{plan.name}</p>
									<div className="plan-price">
										<span className="dollar">$</span>
										<span className="amount">
											{price === 0 ? "0" : price % 1 === 0 ? price : price.toFixed(2)}
										</span>
										<span className="period">USD</span>
									</div>
									<p className="plan-desc">{plan.desc}</p>
									<button className="plan-btn">{plan.cta}</button>
									<p className="plan-features-title">Included in {plan.name.toLowerCase()}:</p>
									<ul className="plan-features-list">
										{plan.features.map((f) => (
											<li key={f}>
												<span className="plan-check">✓</span>
												{f}
											</li>
										))}
									</ul>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Comparison Table */}
			<section className="comparison-section">
				<div className="container">
					<h2>Compare plans in detail</h2>
					<table className="comparison-table">
						<thead>
							<tr>
								<th>Features</th>
								<th>Free</th>
								<th>Standard</th>
								<th>Premium</th>
								<th>Enterprise</th>
							</tr>
						</thead>
						<tbody>
							{comparisonRows.map((row) => (
								<tr key={row.feature}>
									<td>{row.feature}</td>
									<td>
										{row.free ? (
											<span className="check-yes">✓</span>
										) : (
											<span className="check-no">—</span>
										)}
									</td>
									<td>
										{row.standard ? (
											<span className="check-yes">✓</span>
										) : (
											<span className="check-no">—</span>
										)}
									</td>
									<td>
										{row.premium ? (
											<span className="check-yes">✓</span>
										) : (
											<span className="check-no">—</span>
										)}
									</td>
									<td>
										{row.enterprise ? (
											<span className="check-yes">✓</span>
										) : (
											<span className="check-no">—</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<Footer />
		</>
	);
}
