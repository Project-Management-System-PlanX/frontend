import { Star } from "lucide-react";

export function StarredTab() {
	return (
		<div className="pb-6 animate-[fadeInUp_0.35s_ease-out]">
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
					<Star className="w-5 h-5 text-slate-400" />
				</div>
				<p className="text-sm text-slate-500 font-medium">No starred items</p>
				<p className="text-xs text-slate-400 mt-1">Star spaces and tasks to find them quickly</p>
			</div>
		</div>
	);
}
