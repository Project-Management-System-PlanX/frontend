"use client";

import { BellRing, LayoutDashboard, SquareCheckBig } from "lucide-react";

export default function ServicesSection() {
	return (
		<>
			<style>{`
        .srv-root {
          background: #f5f7f3;
          padding: 100px 24px;
          font-family: 'DM Sans', sans-serif;
        }

        .srv-header {
          max-width: 760px;
          margin: 0 auto 70px;
          text-align: center;
        }

        .srv-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 14px;
          border-radius: 999px;
          background: #e6ece7;
          color: #2f5648;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .srv-title {
          font-size: clamp(34px, 5vw, 60px);
          line-height: 1.1;
          font-weight: 700;
          color: #16231d;
          margin-bottom: 18px;
          letter-spacing: -0.03em;
        }

        .srv-subtitle {
          font-size: 16px;
          line-height: 1.7;
          color: #64736b;
        }

        .srv-layout {
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* TOP CARD */

        .srv-top-card {
          display: grid;
          grid-template-columns: 1.1fr 1.3fr;
          background: #edf2ed;
          border-radius: 28px;
          overflow: hidden;
          min-height: 360px;
        }

        .srv-top-left {
          padding: 52px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .srv-chart-card {
          background: white;
          padding: 36px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* BOTTOM */

        .srv-bottom-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .srv-small-card {
          background: #edf2ed;
          border-radius: 28px;
          overflow: hidden;
          padding: 40px;
          min-height: 320px;
        }

        /* COMMON */

        .srv-icon {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #184836;
          margin-bottom: 24px;
        }

        .srv-card-title {
          font-size: 42px;
          line-height: 1.1;
          font-weight: 700;
          color: #17231d;
          margin-bottom: 18px;
          letter-spacing: -0.03em;
        }

        .srv-card-desc {
          font-size: 15px;
          line-height: 1.8;
          color: #64736b;
          max-width: 420px;
        }

        .srv-btn {
          margin-top: 30px;
          width: fit-content;
          border: none;
          background: #184836;
          color: white;
          height: 46px;
          padding: 0 24px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .srv-btn:hover {
          transform: translateY(-2px);
        }

        /* CHART */

        .srv-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 42px;
        }

        .srv-company {
          font-size: 15px;
          font-weight: 700;
          color: #17231d;
        }

        .srv-users {
          display: flex;
        }

        .srv-user {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #d8ded9;
          margin-left: -8px;
          border: 2px solid white;
        }

        .srv-chart {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          height: 260px;
        }

        .srv-bar {
          width: 42px;
          border-radius: 14px 14px 0 0;
          background: #d7ddd8;
        }

        .srv-bar.active {
          background: #14523f;
        }

        /* SMALL CARDS */

        .srv-small-title {
          font-size: 34px;
          line-height: 1.2;
          color: #17231d;
          margin-bottom: 14px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .srv-small-desc {
          color: #64736b;
          line-height: 1.8;
          margin-bottom: 28px;
          font-size: 15px;
        }

        /* SETTINGS */

        .srv-settings,
        .srv-activity {
          background: white;
          border-radius: 18px;
          padding: 22px;
        }

        .srv-setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid #edf1ed;
        }

        .srv-setting-row:last-child {
          border-bottom: none;
        }

        .srv-setting-row span {
          color: #33443c;
          font-size: 14px;
        }

        .srv-toggle {
          width: 42px;
          height: 24px;
          border-radius: 999px;
          background: #d5ddd6;
          position: relative;
        }

        .srv-toggle::before {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
        }

        .srv-toggle.active {
          background: #14523f;
        }

        .srv-toggle.active::before {
          left: 21px;
        }

        /* ACTIVITY */

        .srv-message {
          padding: 14px 0;
          border-bottom: 1px solid #edf1ed;
        }

        .srv-message:last-child {
          border-bottom: none;
        }

        .srv-message strong {
          display: block;
          color: #17231d;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .srv-message p {
          color: #66746c;
          font-size: 14px;
          line-height: 1.6;
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {
          .srv-top-card {
            grid-template-columns: 1fr;
          }

          .srv-bottom-grid {
            grid-template-columns: 1fr;
          }

          .srv-card-title {
            font-size: 34px;
          }

          .srv-small-title {
            font-size: 28px;
          }

          .srv-top-left {
            padding: 40px;
          }

          .srv-small-card {
            padding: 32px;
          }
        }

        @media (max-width: 640px) {
          .srv-root {
            padding: 80px 18px;
          }

          .srv-chart {
            gap: 10px;
          }

          .srv-bar {
            width: 28px;
          }
        }
      `}</style>

			<section className="srv-root" id="services">
				{/* HEADER */}
				<div className="srv-header">
					<div className="srv-badge">Services</div>

					<h2 className="srv-title">Latest advanced technologies to ensure everything you need</h2>

					<p className="srv-subtitle">
						Maximize your team’s productivity and security with our affordable, user-friendly
						contract management system.
					</p>
				</div>

				{/* LAYOUT */}
				<div className="srv-layout">
					{/* TOP LARGE CARD */}
					<div className="srv-top-card">
						<div className="srv-top-left">
							<div className="srv-icon">
								<LayoutDashboard size={28} />
							</div>

							<h3 className="srv-card-title">Dynamic dashboard</h3>

							<p className="srv-card-desc">
								Clause helps legal teams work faster, smarter and more efficiently, delivering
								visibility and data-driven insights to mitigate risk and ensure compliance.
							</p>

							<button className="srv-btn">Explore all</button>
						</div>

						{/* RIGHT CHART */}
						<div className="srv-chart-card">
							<div className="srv-chart-header">
								<div className="srv-company">Acme Inc.</div>

								<div className="srv-users">
									<div className="srv-user" />
									<div className="srv-user" />
									<div className="srv-user" />
								</div>
							</div>

							<div className="srv-chart">
								<div className="srv-bar" style={{ height: "120px" }} />
								<div className="srv-bar" style={{ height: "190px" }} />
								<div className="srv-bar" style={{ height: "140px" }} />
								<div className="srv-bar active" style={{ height: "250px" }} />
								<div className="srv-bar" style={{ height: "150px" }} />
								<div className="srv-bar" style={{ height: "210px" }} />
								<div className="srv-bar" style={{ height: "140px" }} />
								<div className="srv-bar" style={{ height: "180px" }} />
							</div>
						</div>
					</div>

					{/* BOTTOM TWO CARDS */}
					<div className="srv-bottom-grid">
						{/* LEFT */}
						<div className="srv-small-card">
							<div className="srv-icon">
								<BellRing size={24} />
							</div>

							<h3 className="srv-small-title">Smart notifications</h3>

							<p className="srv-small-desc">
								Easily accessible from the notification center, calendar or email with relevant
								activities.
							</p>

							<div className="srv-settings">
								<div className="srv-setting-row">
									<span>Email notification</span>
									<div className="srv-toggle active" />
								</div>

								<div className="srv-setting-row">
									<span>Social emails</span>
									<div className="srv-toggle" />
								</div>

								<div className="srv-setting-row">
									<span>Announcement & Update</span>
									<div className="srv-toggle active" />
								</div>

								<div className="srv-setting-row">
									<span>Reminders</span>
									<div className="srv-toggle" />
								</div>
							</div>
						</div>

						{/* RIGHT */}
						<div className="srv-small-card">
							<div className="srv-icon">
								<SquareCheckBig size={24} />
							</div>

							<h3 className="srv-small-title">Task management</h3>

							<p className="srv-small-desc">
								Discuss contract queries, manage tasks, secure approvals, track progress in the
								workspace.
							</p>

							<div className="srv-activity">
								<div className="srv-message">
									<strong>Bill Sanders</strong>

									<p>Hello @Ragip Diller, Could you sign the contract before the March 12th?</p>
								</div>

								<div className="srv-message">
									<strong>Jane Cooper</strong>

									<p>Uploaded new contract</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
