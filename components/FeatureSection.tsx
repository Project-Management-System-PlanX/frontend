"use client";
import { useState } from "react";

const tabs = ["Plan", "Track", "Collaborate"];

const tabContent: Record<
	string,
	{
		title: string;
		subtitle: string[];
		image: string;
	}
> = {
	Plan: {
		title: "Bring teams together",
		subtitle: [
			"✓ Automate workflows: Use Rovo AI and everyday language to build any workflow.",
			"✓ Streamline requests: Get all the details you need and share progress with forms.",
			"✓ Keep everyone aligned: Provide real-time status updates and use Rovo to identify risks.",
		],
		image: "/plan-pms.png",
	},
	Track: {
		title: "Track Progress",
		subtitle: [
			"✓ Real-time Monitoring: Monitor every milestone and deliverable in real-time.",
			"✓ Spot Bottlenecks: Identify issues before they slow your team down.",
			"✓ Automated Alerts: Keep projects on schedule with intelligent notifications.",
		],
		image: "/track-pms.png",
	},
	Collaborate: {
		title: "Collaborate Seamlessly",
		subtitle: [
			"✓ Threaded Comments: Keep context in one place with direct task comments.",
			"✓ Shared Workspaces: Invite clients without exposing your full account.",
			"✓ AI-Powered Insights: Get intelligent suggestions to improve workflows.",
		],
		image: "/collaborate-pms.png",
	},
};

export default function FeaturesSection() {
	const [active, setActive] = useState("Plan");
	const content = tabContent[active];

	return (
		<section className="features-section" id="features">
			<div className="container">
				<div className="section-header">
					<h2>Discover AI features that power your teams</h2>
				</div>

				{/* Tabs */}
				<div className="features-tabs">
					{tabs.map((t) => (
						<button
							key={t}
							className={`features-tab${active === t ? " active" : ""}`}
							onClick={() => setActive(t)}
						>
							{t}
						</button>
					))}
				</div>

				{/* Feature Showcase Layout */}
				<div className="features-showcase" key={active}>
					{/* Left side - Content */}
					<div className="features-content">
						<h3 className="features-content-title">{content.title}</h3>

						{/* Checklist items */}
						<div className="features-checklist">
							{content.subtitle.map((item, i) => (
								<div
									className="checklist-item animate-up"
									key={i}
									style={{ animationDelay: `${i * 0.1}s` }}
								>
									<p>{item}</p>
								</div>
							))}
						</div>
					</div>

					{/* Right side - Image */}
					<div className="features-image-container">
						<div className="features-image-wrapper">
							<img src={content.image} alt={content.title} className="features-image animate-up" />
							<div className="features-image-accent" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
