import { Users } from "lucide-react";
import { recommendedSpaces, spaceTabs } from "./data";

interface RecommendedSpacesProps {
	activeSpaceTab: string;
	setActiveSpaceTab: (tab: string) => void;
}

export function RecommendedSpaces({ activeSpaceTab, setActiveSpaceTab }: RecommendedSpacesProps) {
	return (
		<section className="mb-5 animate-[fadeInUp_0.4s_ease-out_0.1s_both]">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-[14px] font-semibold text-slate-900">Recommended spaces</h2>

				<div className="flex items-center gap-3">
					{spaceTabs.map((tab) => (
						<button
							key={tab}
							type="button"
							onClick={() => setActiveSpaceTab(tab)}
							className={`text-[12px] font-medium px-3 py-1 rounded-full transition-all ${
								activeSpaceTab === tab
									? "bg-[#0B6E4F] text-white"
									: "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
							}`}
						>
							{tab}
						</button>
					))}
					<button
						type="button"
						className="text-[12px] font-medium text-[#0B6E4F] hover:text-[#095a40] transition-colors"
					>
						View all spaces
					</button>
				</div>
			</div>

			{/* Space Cards */}
			<div className="flex gap-3 animate-[fadeInUp_0.4s_ease-out_0.2s_both]">
				{recommendedSpaces.map((space) => (
					<button
						key={space.id}
						type="button"
						className="group flex flex-col items-start p-4 rounded-lg border border-slate-200 hover:border-[#0B6E4F]/30 hover:shadow-md transition-all min-w-[190px] max-w-[210px] text-left bg-white"
					>
						{/* Icon */}
						<div
							className="w-9 h-9 rounded-md flex items-center justify-center text-white text-sm mb-3 shadow-sm"
							style={{ backgroundColor: space.iconBg }}
						>
							{space.icon}
						</div>

						{/* Name & Type */}
						<p className="text-[13px] font-medium text-slate-800 leading-tight truncate w-full">
							{space.name}
						</p>
						<p className="text-[11px] text-slate-400 mt-0.5">{space.type}</p>

						{/* Tagline */}
						<div className="flex items-center gap-1.5 mt-3">
							<Users className="w-3 h-3 text-slate-400" />
							<span className="text-[10px] text-slate-400">{space.tagline}</span>
						</div>
					</button>
				))}
			</div>
		</section>
	);
}
