"use client";

// Each avatar uses a different region of the 2x2 sprite sheet
// The sprite is 1024x1024, each face is in a ~512x512 quadrant
const avatars = [
	{
		label: "Team member 1",
		arrowDir: "right" as const,
		style: { top: "22%", left: "7%" },
		src: "https://i.pravatar.cc/150?img=32",
		animDelay: "0s",
	},
	{
		label: "Team member 2",
		arrowDir: "left" as const,
		style: { top: "22%", right: "7%" },
		src: "https://i.pravatar.cc/150?img=47",
		animDelay: "0.75s",
	},
	{
		label: "Team member 3",
		arrowDir: "right" as const,
		style: { top: "62%", left: "6%" },
		src: "https://i.pravatar.cc/150?img=12",
		animDelay: "1.5s",
	},
	{
		label: "Team member 4",
		arrowDir: "left" as const,
		style: { top: "62%", right: "6%" },
		src: "https://i.pravatar.cc/150?img=43",
		animDelay: "2.25s",
	},
];

const logos = ["HubSpot", "Dropbox", "Square", "Intercom", "Grammarly"];

export default function BankingScaleHero() {
	return (
		<>
			<section className="hero" id="hero">
				<div className="hero-bg-grid" />

				{/* Floating avatars — 4 corners */}
				<div className="hero-avatars">
					{avatars.map((a, i) => (
						<div
							key={i}
							className="floating-avatar-wrap"
							style={{
								position: "absolute",
								...a.style,
								animationDelay: a.animDelay,
								flexDirection: a.arrowDir === "right" ? "row" : "row-reverse",
							}}
						>
							{/* Arrow badge */}
							<div className="avatar-arrow">
								{a.arrowDir === "right" ? (
									<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
										<path
											d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5"
											stroke="#1a3d2b"
											strokeWidth="1.8"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								) : (
									<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
										<path
											d="M11 7H3M3 7L6.5 3.5M3 7L6.5 10.5"
											stroke="#1a3d2b"
											strokeWidth="1.8"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								)}
							</div>
							{/* Circular avatar photo */}
							<div className="floating-avatar">
								<img
									src={a.src}
									alt={a.label}
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
									}}
								/>
							</div>
						</div>
					))}
				</div>

				<div className="hero-content container">
					<div className="hero-badge">Create for fast</div>
					<h1>
						One tool to manage contracts
						<br />
						and your team
					</h1>
					<p>
						TeamUp helps teams work faster, smarter and more efficiently, delivering the visibility
						and data-driven insights to mitigate risk and ensure compliance.
					</p>
					<div className="hero-actions">
						<a href="/onboarding" className="btn-primary">
							Start for Free
						</a>
						<a href="#demo" className="btn-secondary">
							Get a Demo
						</a>
					</div>
				</div>
			</section>

			<section className="logos-section">
				<div className="container">
					<p className="logos-label">More than 100+ companies partner</p>
					<div className="logos-row">
						{logos.map((l) => (
							<span className="logo-item" key={l}>
								{l}
							</span>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
