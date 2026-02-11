import { CheckSquare, LayoutGrid } from "lucide-react";
import { viewedGroups } from "./data";

export function ViewedTab() {
	return (
		<div className="pb-6 animate-[fadeInUp_0.35s_ease-out]">
			{viewedGroups.map((group) => (
				<div key={group.label}>
					{/* Group Label */}
					<div className="pt-4 pb-2">
						<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
							{group.label}
						</span>
					</div>

					{/* Group Items */}
					<div className="divide-y divide-slate-100">
						{group.items.map((item) => (
							<div
								key={item.id}
								className="group flex items-center py-2.5 hover:bg-slate-50/60 transition-colors -mx-2 px-2 rounded-md cursor-pointer"
							>
								<div className="flex items-center gap-3 flex-1 min-w-0">
									{/* Icon based on type */}
									{item.type === "board" && (
										<div className="w-[20px] h-[20px] rounded flex items-center justify-center shrink-0 text-slate-400">
											<LayoutGrid className="w-4 h-4" />
										</div>
									)}
									{item.type === "space" && (
										<div
											className="w-[20px] h-[20px] rounded flex items-center justify-center shrink-0 text-[10px]"
											style={{ backgroundColor: item.iconBg }}
										>
											{item.icon}
										</div>
									)}
									{item.type === "task" && (
										<div
											className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 ${
												item.checked ? "bg-[#0B6E4F]" : "border-2 border-slate-300"
											}`}
										>
											{item.checked && <CheckSquare className="w-3.5 h-3.5 text-white" />}
										</div>
									)}

									{/* Title + Subtitle */}
									<div className="min-w-0">
										<p className="text-[13px] font-medium text-slate-800 truncate leading-tight">
											{item.title}
										</p>
										<p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
											{item.subtitle}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
