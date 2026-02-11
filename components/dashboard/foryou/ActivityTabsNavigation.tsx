import { activityTabs } from "./data";

interface ActivityTabsNavigationProps {
	activeActivityTab: string;
	setActiveActivityTab: (tab: string) => void;
}

export function ActivityTabsNavigation({
	activeActivityTab,
	setActiveActivityTab,
}: ActivityTabsNavigationProps) {
	return (
		<div className="flex items-center gap-0 border-b border-slate-200 animate-[fadeInUp_0.4s_ease-out_0.25s_both]">
			{activityTabs.map((tab) => (
				<button
					key={tab.label}
					type="button"
					onClick={() => setActiveActivityTab(tab.label)}
					className={`relative flex items-center gap-1.5 px-4 py-3 text-[12px] font-medium transition-colors whitespace-nowrap ${
						activeActivityTab === tab.label
							? "text-[#0B6E4F]"
							: "text-slate-500 hover:text-slate-700"
					}`}
				>
					{tab.label}
					{tab.badge !== undefined && (
						<span className="bg-slate-200 text-slate-600 text-[10px] font-semibold rounded px-1.5 py-0.5 leading-none">
							{tab.badge}
						</span>
					)}
					{/* Active underline indicator */}
					{activeActivityTab === tab.label && (
						<span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#0B6E4F] rounded-full" />
					)}
				</button>
			))}
		</div>
	);
}
