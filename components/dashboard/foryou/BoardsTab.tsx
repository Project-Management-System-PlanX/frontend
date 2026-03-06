import { Search, Star } from "lucide-react";

export function BoardsTab() {
	return (
		<div className="pb-6 animate-[fadeInUp_0.35s_ease-out]">
			{/* Search boards */}
			<div className="pt-4 pb-3">
				<div className="flex items-center gap-2 bg-slate-100 rounded-md px-3 py-1.5 w-[180px]">
					<Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
					<input
						type="text"
						placeholder="Search boards"
						className="bg-transparent outline-none text-[12px] text-slate-700 placeholder-slate-400 w-full"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="border-b border-slate-200">
				{/* Table Header */}
				<div className="flex items-center py-2 border-b border-slate-200">
					<div className="w-8 flex items-center justify-center shrink-0">
						<Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
					</div>
					<div className="flex-1 flex items-center gap-1">
						<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
							Name
						</span>
						<svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-slate-400">
							<title>Sort ascending</title>
							<path
								d="M5 2v6M5 2L3 4M5 2l2 2"
								stroke="currentColor"
								strokeWidth="1.2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					<div className="w-[45%] shrink-0">
						<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
							Location
						</span>
					</div>
				</div>

				{/* Row 1: KAN board */}
				<div className="flex items-center py-2.5 hover:bg-slate-50/60 transition-colors cursor-pointer">
					<div className="w-8 flex items-center justify-center shrink-0">
						<Star className="w-3.5 h-3.5 text-slate-300" />
					</div>
					<div className="flex-1 min-w-0">
						<span className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">
							KAN board
						</span>
					</div>
					<div className="w-[45%] shrink-0 flex items-center gap-2">
						<div
							className="w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 text-[9px]"
							style={{ backgroundColor: "#FF9800" }}
						>
							<span className="text-white font-bold">K</span>
						</div>
						<span className="text-[12px] text-slate-600">My Sales Team (KAN)</span>
					</div>
				</div>

				{/* Row 2: SAM1 board */}
				<div className="flex items-center py-2.5 hover:bg-slate-50/60 transition-colors cursor-pointer border-t border-slate-100">
					<div className="w-8 flex items-center justify-center shrink-0">
						<Star className="w-3.5 h-3.5 text-slate-300" />
					</div>
					<div className="flex-1 min-w-0">
						<span className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">
							SAM1 board
						</span>
					</div>
					<div className="w-[45%] shrink-0 flex items-center gap-2">
						<div
							className="w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 text-[9px]"
							style={{ backgroundColor: "#00ACC1" }}
						>
							<span className="text-white font-bold">S</span>
						</div>
						<span className="text-[12px] text-slate-600">
							(Example) Sales Outreach Strategy (SAM1)
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
