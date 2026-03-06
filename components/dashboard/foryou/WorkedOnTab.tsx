import { Clock } from "lucide-react";

export function WorkedOnTab() {
	return (
		<div className="animate-[fadeInUp_0.35s_ease-out]">
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
					<Clock className="w-5 h-5 text-slate-400" />
				</div>
				<p className="text-sm text-slate-500 font-medium">No recent activity</p>
				<p className="text-xs text-slate-400 mt-1">Tasks you work on will appear here</p>
			</div>
		</div>
	);
}
