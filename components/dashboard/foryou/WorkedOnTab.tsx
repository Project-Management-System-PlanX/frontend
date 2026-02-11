import { CheckSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { activityItems } from "./data";

export function WorkedOnTab() {
	return (
		<div className="animate-[fadeInUp_0.35s_ease-out]">
			<div className="pt-4 pb-2">
				<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
					In the last week
				</span>
			</div>
			<div className="divide-y divide-slate-100 pb-6">
				{activityItems.map((item) => (
					<div
						key={item.id}
						className="group flex items-center py-2.5 hover:bg-slate-50/60 transition-colors -mx-2 px-2 rounded-md cursor-pointer"
					>
						<div className="flex items-center gap-3 flex-1 min-w-0">
							{item.icon === "check" ? (
								<div
									className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 ${
										item.checked ? "bg-[#0B6E4F]" : "border-2 border-slate-300"
									}`}
								>
									{item.checked && <CheckSquare className="w-3.5 h-3.5 text-white" />}
								</div>
							) : (
								<div className="w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 border-2 border-slate-300">
									<svg
										width="10"
										height="10"
										viewBox="0 0 10 10"
										fill="none"
										className="text-slate-400"
									>
										<title>Subtask icon</title>
										<path
											d="M2 2v4h4"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</div>
							)}
							<div className="min-w-0">
								<p className="text-[13px] font-medium text-slate-800 truncate leading-tight">
									{item.title}
								</p>
								<p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
									{item.taskId} · {item.team}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 shrink-0 ml-4">
							<span className="text-[11px] text-slate-400 font-medium">{item.status}</span>
							<Avatar className="w-6 h-6">
								<AvatarFallback
									className="text-[10px] font-semibold text-white"
									style={{ backgroundColor: item.avatarColor }}
								>
									{item.avatarInitial}
								</AvatarFallback>
							</Avatar>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
