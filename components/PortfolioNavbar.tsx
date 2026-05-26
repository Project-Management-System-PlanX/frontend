"use client";

import Link from "next/link";

export default function PortfolioNavbar() {
	const scrollTo = (id: string) => {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<nav className="navbar">
			<div className="navbar-inner">
				<Link href="/" className="nav-logo">
					<div className="nav-logo-icon">T</div>
					TeamUp
				</Link>

				<ul className="nav-links">
					<li>
						<a onClick={() => scrollTo("features")}>Solutions</a>
					</li>

					<li>
						<a onClick={() => scrollTo("services")}>Services</a>
					</li>

					<li>
						<Link href="/pricing">Pricing</Link>
					</li>
				</ul>

				<Link href="/onboarding">
					<button className="nav-cta">Start Now →</button>
				</Link>
			</div>
		</nav>
	);
}
