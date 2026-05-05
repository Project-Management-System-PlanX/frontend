"use client";

import { Calendar as CalendarIcon, ListFilter, MoreHorizontal } from "lucide-react";
import { UI } from "./types";

export function PlannerPanel() {
	return (
		<div className="h-full flex flex-col" style={{ backgroundColor: UI.planner.bg }}>
			<div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
				<div className="flex items-center gap-3">
					<CalendarIcon className="w-5.5 h-5.5 text-white/90" />
					<span className="text-[18px] font-bold text-white">Planner</span>
				</div>
				<div className="flex items-center gap-3">
					<ListFilter className="w-5.5 h-5.5 text-white/60 hover:text-white cursor-pointer transition-colors" />
					<MoreHorizontal className="w-5.5 h-5.5 text-white/60 hover:text-white cursor-pointer transition-colors" />
				</div>
			</div>
			<div className="flex-1 overflow-auto custom-scrollbar p-4">
				<div className="flex flex-col space-y-4 min-w-fit">
					<div className="w-full mt-auto space-y-6 pt-8 text-left">
						{[9, 10, 11, 12, 1, 2, 3, 4, 5].map((h) => (
							<div key={h} className="flex gap-4 items-center group">
								<span
									className="text-[11px] w-10 font-black uppercase tracking-widest transition-colors group-hover:text-white"
									style={{ color: UI.planner.muted }}
								>
									{h}
									{h >= 9 && h < 12 ? "am" : "pm"}
								</span>
								<div className="h-[1px] flex-1 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
