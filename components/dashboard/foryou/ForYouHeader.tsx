import { Plus, Search } from "lucide-react";

interface ForYouHeaderProps {
	onCreateClick?: () => void;
}

export function ForYouHeader({ onCreateClick }: ForYouHeaderProps) {
	return (
		<div className="h-14 px-6 flex items-center justify-center gap-4 border-b border-slate-200 shrink-0 bg-white">
			{/* Search */}
			<div className="flex items-center gap-2.5 bg-slate-100 rounded-lg px-4 py-2 w-full max-w-[520px]">
				<Search className="w-4 h-4 text-slate-400 shrink-0" />
				<input
					type="text"
					placeholder="Search"
					className="bg-transparent outline-none text-[13px] text-slate-700 placeholder-slate-400 w-full"
				/>
			</div>

			{/* + Create */}
			<button
				type="button"
				onClick={onCreateClick}
				className="flex items-center gap-2 bg-[#0B6E4F] hover:bg-[#095a40] text-white text-[13px] font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm shrink-0"
			>
				<Plus className="w-4 h-4" />
				Create
			</button>
		</div>
	);
}
