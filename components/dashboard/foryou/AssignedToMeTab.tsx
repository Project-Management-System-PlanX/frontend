export function AssignedToMeTab() {
	return (
		<div className="flex flex-col items-center justify-center py-16 animate-[fadeInUp_0.5s_ease-out]">
			{/* Illustration */}
			<div className="relative mb-8 animate-[gentleFloat_3s_ease-in-out_infinite]">
				{/* Green check badge */}
				<div
					className="absolute -top-4 left-1/2 z-10"
					style={{
						animation: "bounceIn 0.6s ease-out 0.3s both, checkPulse 2s ease-in-out 1.2s infinite",
					}}
				>
					<div className="w-12 h-12 rounded-full bg-[#0B6E4F] flex items-center justify-center shadow-lg">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<title>Checkmark</title>
							<path
								d="M5 13l4 4L19 7"
								stroke="white"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					{/* Stem below circle */}
					<div className="w-3 h-4 bg-[#0B6E4F] mx-auto rounded-b-sm" />
				</div>

				{/* Laptop / Monitor SVG */}
				<svg
					width="240"
					height="150"
					viewBox="0 0 240 150"
					fill="none"
					className="drop-shadow-lg"
					role="img"
					aria-label="No assigned items illustration"
				>
					<title>No assigned items illustration</title>
					{/* Monitor body */}
					<rect
						x="30"
						y="20"
						width="180"
						height="110"
						rx="8"
						fill="#f1f5f9"
						stroke="#e2e8f0"
						strokeWidth="1.5"
					/>
					{/* Screen */}
					<rect x="38" y="28" width="164" height="86" rx="4" fill="white" />
					{/* Top bar dots */}
					<circle cx="48" cy="36" r="2.5" fill="#94a3b8" />
					<circle cx="56" cy="36" r="2.5" fill="#0B6E4F" />
					<circle cx="64" cy="36" r="2.5" fill="#0B6E4F" />
					{/* Content blocks - left sidebar */}
					<rect x="44" y="44" width="50" height="6" rx="2" fill="#e2e8f0" />
					<rect x="44" y="54" width="40" height="5" rx="2" fill="#f1f5f9" />
					<rect x="44" y="63" width="45" height="5" rx="2" fill="#f1f5f9" />
					{/* Content blocks - main area (shimmer) */}
					<rect x="102" y="44" width="90" height="28" rx="4" fill="#dbeafe">
						<animate
							attributeName="opacity"
							values="0.6;1;0.6"
							dur="2.5s"
							repeatCount="indefinite"
						/>
					</rect>
					<rect x="110" y="50" width="50" height="4" rx="1.5" fill="#93c5fd">
						<animate
							attributeName="opacity"
							values="0.5;1;0.5"
							dur="2s"
							begin="0.3s"
							repeatCount="indefinite"
						/>
					</rect>
					<rect x="110" y="58" width="35" height="4" rx="1.5" fill="#bfdbfe">
						<animate
							attributeName="opacity"
							values="0.5;1;0.5"
							dur="2s"
							begin="0.6s"
							repeatCount="indefinite"
						/>
					</rect>
					{/* Bottom card (shimmer) */}
					<rect x="102" y="78" width="60" height="20" rx="4" fill="#d1fae5">
						<animate
							attributeName="opacity"
							values="0.6;1;0.6"
							dur="2.5s"
							begin="0.4s"
							repeatCount="indefinite"
						/>
					</rect>
					<rect x="110" y="84" width="36" height="4" rx="1.5" fill="#6ee7b7">
						<animate
							attributeName="opacity"
							values="0.5;1;0.5"
							dur="2s"
							begin="0.7s"
							repeatCount="indefinite"
						/>
					</rect>
					<rect x="110" y="92" width="24" height="3" rx="1" fill="#a7f3d0">
						<animate
							attributeName="opacity"
							values="0.5;1;0.5"
							dur="2s"
							begin="1s"
							repeatCount="indefinite"
						/>
					</rect>
					{/* Stand */}
					<rect x="95" y="130" width="50" height="4" rx="2" fill="#cbd5e1" />
					<rect x="112" y="122" width="16" height="10" rx="2" fill="#e2e8f0" />
				</svg>
			</div>

			{/* Text */}
			<h3 className="text-[15px] font-semibold text-slate-800 mb-2 animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
				Find all your open work items in one place
			</h3>
			<p className="text-[13px] text-slate-400 animate-[fadeInUp_0.5s_ease-out_0.35s_both]">
				You have no open work items assigned to you
			</p>
		</div>
	);
}
