import { Star } from "lucide-react";

export function StarredTab() {
	return (
		<div className="pb-6 animate-[fadeInUp_0.35s_ease-out]">
			<div className="divide-y divide-slate-100">
				{/* Starred Item */}
				<div className="group flex items-center py-2.5 hover:bg-slate-50/60 transition-colors -mx-2 px-2 rounded-md cursor-pointer">
					<div className="flex items-center gap-3 flex-1 min-w-0">
						{/* Star icon */}
						<Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
						{/* Space icon */}
						<div
							className="w-[20px] h-[20px] rounded flex items-center justify-center shrink-0 text-[10px]"
							style={{ backgroundColor: "#00ACC1" }}
						>
							<span className="text-white font-bold">S</span>
						</div>
						{/* Title + Subtitle */}
						<div className="min-w-0">
							<p className="text-[13px] font-medium text-slate-800 truncate leading-tight">
								(Example) Sales Outreach Strategy (SAM1)
							</p>
							<p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
								Team-managed software
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
