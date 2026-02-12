import {
	AlertCircle,
	ChevronDown,
	ChevronRight,
	MoreHorizontal,
	Plus,
	Search,
	SlidersHorizontal,
	User,
	Zap,
} from "lucide-react";

export function SpaceTimelineView() {
	return (
		<div className="flex-1 flex flex-col bg-white overflow-hidden animate-[fadeInUp_0.35s_ease-out]">
			{/* Timeline Toolbar */}
			<div className="px-6 py-3 flex items-center justify-between border-b border-transparent">
				{/* Left: Search & Filters */}
				<div className="flex items-center gap-3">
					<div className="relative">
						<Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
						<input
							placeholder="Search timeline"
							className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-[4px] text-[13px] outline-none focus:border-[#0B6E4F] w-[180px] transition-colors placeholder:text-slate-400"
						/>
					</div>
					<div className="flex items-center -space-x-1.5 pl-2">
						<div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white z-10 shadow-sm">
							R
						</div>
						<div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center ring-2 ring-white border border-slate-100">
							<User className="w-3.5 h-3.5" />
						</div>
					</div>

					<div className="h-4 w-px bg-slate-200 mx-1" />

					<button
						type="button"
						className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-[4px] transition-colors"
					>
						Epic <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
					</button>
					<button
						type="button"
						className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-[4px] transition-colors"
					>
						Status category <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
					</button>
				</div>

				{/* Right: Settings */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-[4px] transition-colors border border-transparent hover:border-slate-200"
					>
						<SlidersHorizontal className="w-4 h-4" />
					</button>
					<button
						type="button"
						className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-[4px] transition-colors border border-transparent hover:border-slate-200"
					>
						<MoreHorizontal className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Timeline Content */}
			<div className="flex-1 flex overflow-hidden border-t border-slate-200 relative">
				{/* Fixed Left Column (Work) */}
				<div className="w-[300px] flex flex-col border-r border-slate-200 shrink-0 bg-white z-20">
					{/* Header */}
					<div className="h-10 bg-slate-50/50 border-b border-slate-200 px-4 flex items-center">
						<span className="text-[12px] font-bold text-slate-700">Work</span>
					</div>
					{/* Rows */}
					<div className="divide-y divide-slate-100">
						{/* Row 1 */}
						<div className="h-10 flex items-center px-4 gap-3 bg-white hover:bg-slate-50 group">
							{/* biome-ignore lint/a11y/useSemanticElements: custom checkbox style */}
							<button
								type="button"
								role="checkbox"
								aria-checked="false"
								className="w-3.5 h-3.5 flex items-center justify-center border border-slate-300 rounded-[2px] hover:border-slate-400 cursor-pointer transition-colors"
							/>
							<div className="flex items-center gap-2 min-w-0">
								<Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
								<span className="text-[13px] text-slate-700 font-medium truncate">KAN-5 m]</span>
							</div>
						</div>
						{/* Row 2 - Create Epic */}
						<button
							type="button"
							className="h-10 flex items-center px-4 gap-3 bg-white hover:bg-slate-50 group cursor-pointer transition-colors w-full"
						>
							<Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
							<span className="text-[13px] text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
								Create Epic
							</span>
						</button>
					</div>
				</div>

				{/* Scrollable Timeline Grid */}
				<div className="flex-1 overflow-auto bg-slate-50/30 relative">
					<div className="min-w-[1000px] h-full flex flex-col">
						{/* Header Row */}
						<div className="h-10 flex border-b border-slate-200 bg-slate-50/50 sticky top-0 z-10">
							{["January", "February", "March", "April", "May", "June"].map((month) => (
								<div
									key={month}
									className="flex-1 min-w-[200px] border-r border-slate-200 px-3 flex items-center text-[12px] font-bold text-slate-500 relative"
								>
									{month}
									{month === "February" && (
										<div className="absolute top-0 bottom-[-1000px] left-[40%] w-px bg-blue-500 z-0 opacity-50 pointer-events-none" />
									)}
								</div>
							))}
						</div>
						{/* Body Lines */}
						<div className="flex-1 relative">
							{/* Vertical Grid Lines */}
							<div className="absolute inset-0 flex pointer-events-none">
								{["January", "February", "March", "April", "May", "June"].map((_m, _i) => (
									<div
										key={_m}
										className="flex-1 min-w-[200px] border-r border-slate-200/60 h-full"
									/>
								))}
							</div>

							{/* Rows (Empty placeholders matching left column height) */}
							<div className="h-10 border-b border-slate-100/50" />
							<div className="h-10 border-b border-slate-100/50" />

							{/* Today Marker (Blue Line) - Rendered conceptually above, but explicitly here for full height */}
							<div className="absolute top-0 bottom-0 left-[280px] w-[2px] bg-blue-500 z-10 shadow-[0_0_8px_rgba(59,130,246,0.3)] pointer-events-none">
								<div className="w-2.5 h-2.5 bg-blue-500 rounded-full absolute -top-1 -left-[3.5px]" />
							</div>
						</div>
					</div>
				</div>

				{/* Floating Controls */}
				<div className="absolute bottom-6 right-6 flex items-center bg-white shadow-lg border border-slate-200 rounded-md overflow-hidden z-30">
					<button
						type="button"
						className="px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 border-r border-slate-100"
					>
						Today
					</button>
					<button
						type="button"
						className="px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 border-r border-slate-100"
					>
						Weeks
					</button>
					<button
						type="button"
						className="px-3 py-1.5 text-[12px] font-medium text-white bg-[#1e293b]"
					>
						Months
					</button>
					<button
						type="button"
						className="px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 border-r border-slate-100"
					>
						Quarters
					</button>
					<button
						type="button"
						className="px-2 py-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-r border-slate-100"
					>
						<AlertCircle className="w-3.5 h-3.5" />
					</button>
					<button
						type="button"
						className="px-2 py-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
					>
						<ChevronRight className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
		</div>
	);
}
