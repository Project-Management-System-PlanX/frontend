"use client";

import {
	AppWindow,
	ArrowDownToLine,
	BarChart3,
	Calendar,
	ChevronDown,
	Clock,
	FileText,
	Filter,
	Kanban,
	LayoutList,
	LineChart,
	MoreHorizontal,
	PieChart,
	Plus,
	Search,
	Share2,
	User,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpace } from "@/hooks/api/use-spaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useTasksRealtime } from "@/hooks/use-tasks-realtime";
import { CreateTaskModal } from "../modals/CreateTaskModal";
import { ForYouHeader } from "./foryou/ForYouHeader";
import { SpaceBoardView } from "./space/SpaceBoardView";
import { SpaceCalendarView } from "./space/SpaceCalendarView";
import { SpaceChartView } from "./space/SpaceChartView";
import { SpaceColumnView } from "./space/SpaceColumnView";
import { SpaceFormsView } from "./space/SpaceFormsView";
import { SpaceListView } from "./space/SpaceListView";
import { SpaceTimelineView } from "./space/SpaceTimelineView";

export function Space({ spaceId }: { spaceId: string }) {
	const [viewMode, _setViewMode] = useState<"list" | "column">("list");
	const [activeTab, setActiveTab] = useState("Board");
	const [showCreateTask, setShowCreateTask] = useState(false);

	const { token } = useSupabaseAuth();
	const { data: space, isLoading } = useSpace(spaceId, token || undefined);
	useTasksRealtime(spaceId);

	return (
		<div
			className="flex-1 flex flex-col bg-white min-w-0 h-full"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* ──────── Top Header Bar ──────── */}
			<ForYouHeader onCreateClick={() => setShowCreateTask(true)} />

			{/* ──────── Header ──────── */}
			<div className="px-6 pt-5 pb-3">
				<div className="flex items-center justify-between">
					{/* Title Section */}
					<div className="flex items-center gap-3">
						{isLoading ? (
							<Skeleton className="w-8 h-8 rounded" />
						) : (
							<div
								className="w-8 h-8 rounded flex items-center justify-center text-white shadow-sm shrink-0"
								style={{ backgroundColor: space?.color || "#0B6E4F" }}
							>
								<span className="text-sm font-bold">
									{space?.icon || space?.prefix?.charAt(0) || "P"}
								</span>
							</div>
						)}
						<div>
							<div className="flex items-center gap-2">
								{isLoading ? (
									<Skeleton className="h-6 w-48" />
								) : (
									<h1 className="text-[18px] font-semibold text-slate-900 leading-tight">
										{space?.name || "Space"}
									</h1>
								)}
								<button type="button" className="text-slate-400 hover:text-slate-600">
									<User className="w-4 h-4" />
								</button>
								<button type="button" className="text-slate-400 hover:text-slate-600">
									<MoreHorizontal className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>

					{/* Header Actions */}
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
						>
							<Share2 className="w-4 h-4" />
						</button>
						<button
							type="button"
							className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
						>
							<Zap className="w-4 h-4" />
						</button>
						<button
							type="button"
							className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
						>
							<ArrowDownToLine className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Navigation Tabs */}
				<div className="flex items-center gap-6 mt-6 border-b border-slate-200">
					{["Summary", "List", "Board", "Calendar", "Timeline", "Chart", "Pages", "Forms"].map(
						(tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								type="button"
								className={`pb-2.5 text-[13px] font-medium transition-colors relative ${
									activeTab === tab ? "text-[#0B6E4F]" : "text-slate-500 hover:text-slate-800"
								}`}
							>
								<div className="flex items-center gap-1.5">
									{tab === "Summary" && <PieChart className="w-3.5 h-3.5" />}
									{tab === "List" && <LayoutList className="w-3.5 h-3.5" />}
									{tab === "Board" && <Kanban className="w-3.5 h-3.5" />}
									{tab === "Calendar" && <Calendar className="w-3.5 h-3.5" />}
									{tab === "Timeline" && <Clock className="w-3.5 h-3.5" />}
									{tab === "Chart" && <BarChart3 className="w-3.5 h-3.5" />}
									{tab === "Pages" && <FileText className="w-3.5 h-3.5" />}
									{tab === "Forms" && <AppWindow className="w-3.5 h-3.5" />}
									{tab}
								</div>
								{activeTab === tab && (
									<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0B6E4F] rounded-t-full" />
								)}
							</button>
						),
					)}
					<button type="button" className="pb-2.5 text-slate-400 hover:text-slate-600">
						<Plus className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* ──────── Toolbar & Filters ──────── */}
			{/* ──────── Toolbar ──────── */}
			{activeTab !== "Calendar" &&
				activeTab !== "Timeline" &&
				activeTab !== "Forms" &&
				activeTab !== "Chart" && (
					<div className="px-6 py-3 flex items-center justify-between border-b border-transparent animate-[fadeInUp_0.35s_ease-out]">
						{/* Left: Search & Filters */}
						<div className="flex items-center gap-3">
							<div className="relative">
								<Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
								<input
									placeholder="Search board"
									className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-[4px] text-[13px] outline-none focus:border-[#0B6E4F] w-[240px] transition-colors placeholder:text-slate-400"
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
							<button
								type="button"
								className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-[4px] transition-colors ml-2"
							>
								<Filter className="w-3.5 h-3.5 text-slate-500" /> Filter
							</button>
						</div>

						{/* Right: Actions */}
						<div className="flex items-center gap-2">
							<button
								type="button"
								className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-[4px] transition-colors border border-transparent hover:border-slate-200"
							>
								Group <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
							</button>
							<div className="h-4 w-px bg-slate-200 mx-1" />
							<button
								type="button"
								className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-[4px] transition-colors border border-transparent hover:border-slate-200"
							>
								<LineChart className="w-4 h-4" />
							</button>
							<button
								type="button"
								className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-[4px] transition-colors border border-transparent hover:border-slate-200"
							>
								<Share2 className="w-4 h-4" />
							</button>
							<button
								type="button"
								className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-[4px] transition-colors border border-transparent hover:border-slate-200"
							>
								<MoreHorizontal className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}

			{/* View Content */}
			{activeTab === "Board" ? (
				<SpaceBoardView spaceId={spaceId} />
			) : activeTab === "Calendar" ? (
				<SpaceCalendarView spaceId={spaceId} />
			) : activeTab === "Timeline" ? (
				<SpaceTimelineView spaceId={spaceId} />
			) : activeTab === "Forms" ? (
				<SpaceFormsView />
			) : activeTab === "Chart" ? (
				<SpaceChartView />
			) : viewMode === "list" || activeTab === "List" ? (
				<SpaceListView spaceId={spaceId} />
			) : (
				<SpaceColumnView />
			)}

			<CreateTaskModal
				open={showCreateTask}
				onOpenChange={setShowCreateTask}
				defaultSpaceId={spaceId}
			/>
		</div>
	);
}
