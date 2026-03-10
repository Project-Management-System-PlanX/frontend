"use client";

import {
	AlertCircle,
	Calendar as CalendarIcon,
	ChevronDown,
	Filter,
	GripVertical,
	List,
	Loader2,
	MessageSquare,
	MoreHorizontal,
	Paperclip,
	Plus,
} from "lucide-react";
import { useMemo, useState } from "react";

import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTasksAssignedToMe } from "@/hooks/api/use-tasks";
import { useMemberLookup } from "@/hooks/use-member-lookup";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════
   Priority config — Apple-style muted tones
   ═══════════════════════════════════════════════════════ */
const PRIORITY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
	CRITICAL: {
		label: "Critical",
		icon: <AlertCircle className="w-3.5 h-3.5" />,
		color: "text-[#ff3b30]",
	},
	HIGH: {
		label: "High",
		icon: (
			<svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
				<rect x="2" y="9" width="3" height="5" rx="0.5" />
				<rect x="6.5" y="5" width="3" height="9" rx="0.5" />
				<rect x="11" y="1" width="3" height="13" rx="0.5" />
			</svg>
		),
		color: "text-[#ff9500]",
	},
	MEDIUM: {
		label: "Medium",
		icon: (
			<svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
				<rect x="2" y="9" width="3" height="5" rx="0.5" />
				<rect x="6.5" y="5" width="3" height="9" rx="0.5" />
				<rect x="11" y="5" width="3" height="9" rx="0.5" opacity="0.3" />
			</svg>
		),
		color: "text-[#007aff]",
	},
	LOW: {
		label: "Low",
		icon: (
			<svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
				<rect x="2" y="9" width="3" height="5" rx="0.5" />
				<rect x="6.5" y="9" width="3" height="5" rx="0.5" opacity="0.3" />
				<rect x="11" y="9" width="3" height="5" rx="0.5" opacity="0.3" />
			</svg>
		),
		color: "text-[#8e8e93]",
	},
	NONE: { label: "", icon: null, color: "" },
};

/* ═══════════════════════════════════════════════════════
   Status dot/badge colours derived from status name
   ═══════════════════════════════════════════════════════ */
function statusDotColor(name: string, isDone?: boolean): string {
	if (isDone) return "bg-[#34c759]";
	const lower = name.toLowerCase();
	if (lower.includes("progress") || lower.includes("active")) return "bg-[#007aff]";
	if (lower.includes("test") || lower.includes("review")) return "bg-[#ff9500]";
	if (lower.includes("done") || lower.includes("complete")) return "bg-[#34c759]";
	if (lower.includes("backlog") || lower.includes("todo")) return "bg-[#8e8e93]";
	return "bg-[#aeaeb2]";
}

/* ═══════════════════════════════════════════════════════
   View type tabs matching the reference images
   ═══════════════════════════════════════════════════════ */
type ViewType = "list" | "board";

const VIEW_TABS: { key: ViewType; label: string; icon: React.ReactNode }[] = [
	{
		key: "list",
		label: "List View",
		icon: <List className="w-4 h-4" />,
	},
	{
		key: "board",
		label: "Board",
		icon: (
			<svg
				viewBox="0 0 16 16"
				className="w-4 h-4"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				aria-hidden="true"
			>
				<rect x="1" y="2" width="4" height="12" rx="1" />
				<rect x="6" y="2" width="4" height="8" rx="1" />
				<rect x="11" y="2" width="4" height="10" rx="1" />
			</svg>
		),
	},
];

/* ═══════════════════════════════════════════════════════
   TasksArea — main component
   ═══════════════════════════════════════════════════════ */
export function TasksArea() {
	const [activeView, setActiveView] = useState<ViewType>("list");
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [createOpen, setCreateOpen] = useState(false);
	const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

	const { token } = useSupabaseAuth();
	const { data: serverTasks, isLoading } = useTasksAssignedToMe(token || undefined);
	const { getMember } = useMemberLookup();

	const tasks: Task[] = serverTasks || [];

	/* Group tasks by status name so we get collapsible sections */
	const groupedByStatus = useMemo(() => {
		const groups = new Map<
			string,
			{ statusName: string; statusColor: string; isDone: boolean; tasks: Task[] }
		>();

		for (const task of tasks) {
			const statusName = task.status?.name || "No Status";
			const statusColor = task.status?.color || "#8e8e93";
			const isDone = task.status?.isDone ?? task.resolution === "DONE";

			if (!groups.has(statusName)) {
				groups.set(statusName, { statusName, statusColor, isDone, tasks: [] });
			}
			groups.get(statusName)?.tasks.push(task);
		}

		/* Sort: non-done first then done. Within each, keep backend order. */
		return [...groups.values()].sort((a, b) => {
			if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
			return 0;
		});
	}, [tasks]);

	const boardColumns = groupedByStatus;

	const toggleGroup = (name: string) => {
		setCollapsedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(name)) next.delete(name);
			else next.add(name);
			return next;
		});
	};

	const formatDate = (dateStr: string | undefined) => {
		if (!dateStr) return "—";
		const d = new Date(dateStr);
		return d.toLocaleDateString("en-GB", {
			weekday: "short",
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	const getTaskKey = (task: Task) => {
		const prefix = task.space?.prefix || "TSK";
		return `${prefix}-${task.taskNumber}`;
	};

	return (
		<div
			className="flex-1 flex flex-col bg-white min-w-0 h-full overflow-hidden"
			style={{ fontFamily: "var(--font-figtree), Figtree, -apple-system, sans-serif" }}
		>
			{/* ──── Header ──── */}
			<div className="shrink-0 border-b border-[#e5e5ea]">
				{/* Title Row */}
				<div className="px-6 pt-5 pb-1 flex items-center justify-between">
					<h1 className="text-[22px] font-bold text-[#1c1c1e] tracking-[-0.01em]">My Tasks</h1>
					<button
						type="button"
						onClick={() => setCreateOpen(true)}
						className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-full bg-[#007aff] text-white text-[13px] font-semibold shadow-sm hover:bg-[#0062cc] active:scale-[0.97] transition-all"
					>
						<Plus className="w-4 h-4" strokeWidth={2.5} />
						Add Task
					</button>
				</div>

				{/* View Tabs + Filters */}
				<div className="px-6 flex items-center justify-between">
					<div className="flex items-center">
						{VIEW_TABS.map((tab) => (
							<button
								key={tab.key}
								type="button"
								onClick={() => setActiveView(tab.key)}
								className={cn(
									"flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium border-b-2 transition-colors",
									activeView === tab.key
										? "text-[#1c1c1e] border-[#1c1c1e]"
										: "text-[#8e8e93] border-transparent hover:text-[#636366]",
								)}
							>
								{tab.icon}
								{tab.label}
							</button>
						))}
					</div>

					<button
						type="button"
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#8e8e93] hover:bg-[#f2f2f7] hover:text-[#636366] transition-colors"
					>
						<Filter className="w-3.5 h-3.5" />
						Filters
					</button>
				</div>
			</div>

			{/* ──── Content ──── */}
			<ScrollArea className="flex-1 h-0">
				{isLoading ? (
					<div className="flex items-center justify-center h-64">
						<Loader2 className="w-5 h-5 animate-spin text-[#8e8e93]" />
						<span className="ml-2 text-[13px] text-[#8e8e93]">Loading tasks…</span>
					</div>
				) : tasks.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-64 text-center gap-2">
						<div className="w-12 h-12 rounded-full bg-[#f2f2f7] flex items-center justify-center">
							<List className="w-6 h-6 text-[#aeaeb2]" />
						</div>
						<p className="text-[15px] font-medium text-[#3a3a3c]">No tasks assigned to you</p>
						<p className="text-[13px] text-[#8e8e93] max-w-xs">
							Tasks assigned to you across all spaces will appear here.
						</p>
					</div>
				) : activeView === "list" ? (
					/* ═══════════════════════════════
					   LIST VIEW — status-grouped table
					   ═══════════════════════════════ */
					<div className="px-6 py-4">
						{groupedByStatus.map((group) => {
							const isCollapsed = collapsedGroups.has(group.statusName);
							return (
								<div key={group.statusName} className="mb-6">
									{/* Section Header */}
									<button
										type="button"
										onClick={() => toggleGroup(group.statusName)}
										className="flex items-center gap-2 mb-3 group cursor-pointer w-full text-left"
									>
										<ChevronDown
											className={cn(
												"w-4 h-4 text-[#aeaeb2] transition-transform duration-200",
												isCollapsed && "-rotate-90",
											)}
											strokeWidth={2}
										/>
										<span
											className={cn(
												"w-2 h-2 rounded-full shrink-0",
												statusDotColor(group.statusName, group.isDone),
											)}
										/>
										<span className="text-[15px] font-semibold text-[#1c1c1e]">
											{group.statusName}
										</span>
										<span className="text-[13px] text-[#aeaeb2] tabular-nums ml-1">
											{group.tasks.length}
										</span>
									</button>

									{!isCollapsed && (
										<div className="rounded-xl border border-[#e5e5ea] overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
											{/* Table Header */}
											<div className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_120px_140px] gap-0 px-4 py-2.5 bg-[#fafafa] border-b border-[#e5e5ea]">
												<div className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-[0.04em] flex items-center gap-1">
													Task
													<ChevronDown className="w-3 h-3 opacity-40" />
												</div>
												<div className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-[0.04em] flex items-center gap-1">
													Description
													<ChevronDown className="w-3 h-3 opacity-40" />
												</div>
												<div className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-[0.04em] flex items-center gap-1">
													Assignee
													<ChevronDown className="w-3 h-3 opacity-40" />
												</div>
												<div className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-[0.04em] flex items-center gap-1 justify-end">
													Due Date
													<ChevronDown className="w-3 h-3 opacity-40" />
												</div>
											</div>

											{/* Rows */}
											{group.tasks.map((task, idx) => {
												const assignee = getMember(task.assigneeId);
												const isDone = task.resolution === "DONE" || group.isDone;
												return (
													<button
														key={task.id}
														type="button"
														onClick={() => setSelectedTask(task)}
														className={cn(
															"grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_120px_140px] gap-0 px-4 py-3 w-full text-left transition-colors hover:bg-[#f5f5f7] active:bg-[#ebebf0] cursor-pointer",
															idx < group.tasks.length - 1 && "border-b border-[#f0f0f2]",
														)}
													>
														{/* Task Cell */}
														<div className="flex items-center gap-2.5 min-w-0 pr-3">
															<span
																className={cn(
																	"w-[7px] h-[7px] rounded-full shrink-0",
																	statusDotColor(group.statusName, isDone),
																)}
															/>
															<span
																className={cn(
																	"text-[14px] truncate",
																	isDone
																		? "text-[#aeaeb2] line-through"
																		: "text-[#1c1c1e] font-medium",
																)}
															>
																{task.title}
															</span>
														</div>

														{/* Description Cell */}
														<div className="flex items-center min-w-0 pr-3">
															<span className="text-[13px] text-[#8e8e93] truncate">
																{task.description
																	? task.description.replace(/<[^>]*>/g, "").slice(0, 80)
																	: "—"}
															</span>
														</div>

														{/* Assignee Cell */}
														<div className="flex items-center gap-1.5">
															<Avatar className="w-[22px] h-[22px]">
																<AvatarImage src={assignee.imageUrl} />
																<AvatarFallback className="text-[8px] bg-gradient-to-br from-[#c7d2fe] to-[#a5b4fc] text-[#4338ca] font-semibold">
																	{assignee.initials}
																</AvatarFallback>
															</Avatar>
														</div>

														{/* Due Date Cell */}
														<div className="flex items-center justify-end">
															<span
																className={cn(
																	"text-[13px] tabular-nums",
																	task.dueDate ? "text-[#636366]" : "text-[#d1d1d6]",
																)}
															>
																{formatDate(task.dueDate)}
															</span>
														</div>
													</button>
												);
											})}
										</div>
									)}
								</div>
							);
						})}
					</div>
				) : (
					/* ═══════════════════════════════
					   BOARD VIEW — kanban columns
					   ═══════════════════════════════ */
					<div className="flex gap-4 p-6 h-full min-w-0 overflow-x-auto">
						{boardColumns.length === 0 ? (
							<div className="flex-1 flex items-center justify-center text-[13px] text-[#8e8e93]">
								No status groups found
							</div>
						) : (
							boardColumns.map((col) => (
								<div
									key={col.statusName}
									className="w-[280px] min-w-[280px] flex flex-col rounded-xl bg-[#f9f9fb] border border-[#e5e5ea]/60 shrink-0"
								>
									{/* Column Header */}
									<div className="flex items-center justify-between px-3.5 py-3 border-b border-[#e5e5ea]/60">
										<div className="flex items-center gap-2">
											<span
												className={cn(
													"w-2.5 h-2.5 rounded-full shrink-0",
													statusDotColor(col.statusName, col.isDone),
												)}
											/>
											<span className="text-[13px] font-semibold text-[#1c1c1e]">
												{col.statusName}
											</span>
											<span className="text-[12px] text-[#aeaeb2] bg-[#ebebf0] rounded-full px-1.5 min-w-[20px] text-center tabular-nums font-medium">
												{col.tasks.length}
											</span>
										</div>
										<div className="flex items-center gap-0.5">
											<button
												type="button"
												className="w-6 h-6 flex items-center justify-center text-[#aeaeb2] hover:text-[#636366] rounded-md hover:bg-[#e5e5ea]/60 transition-colors"
											>
												<GripVertical className="w-3.5 h-3.5" />
											</button>
											<button
												type="button"
												onClick={() => setCreateOpen(true)}
												className="w-6 h-6 flex items-center justify-center text-[#aeaeb2] hover:text-[#636366] rounded-md hover:bg-[#e5e5ea]/60 transition-colors"
											>
												<Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
											</button>
										</div>
									</div>

									{/* Column Cards */}
									<ScrollArea className="flex-1 max-h-[calc(100vh-220px)]">
										<div className="p-2 space-y-2">
											{col.tasks.map((task) => {
												const assignee = getMember(task.assigneeId);
												const isDone = task.resolution === "DONE" || col.isDone;
												const priConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NONE;
												const commentCount =
													(task as Task & { _count?: { comments?: number } })._count?.comments ??
													task.comments?.length ??
													0;
												const attachmentCount = task.attachments?.length ?? 0;

												return (
													<button
														key={task.id}
														type="button"
														onClick={() => setSelectedTask(task)}
														className="w-full text-left bg-white rounded-xl border border-[#e5e5ea]/80 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:border-[#d1d1d6] active:scale-[0.99] transition-all cursor-pointer group"
													>
														{/* Task Key + Status Dot + More */}
														<div className="flex items-center justify-between mb-1.5">
															<div className="flex items-center gap-1.5">
																<span className="text-[11px] text-[#aeaeb2] font-medium">
																	{getTaskKey(task)}
																</span>
																<span
																	className={cn(
																		"w-[7px] h-[7px] rounded-full",
																		statusDotColor(col.statusName, isDone),
																	)}
																/>
															</div>
															<MoreHorizontal className="w-4 h-4 text-[#d1d1d6] opacity-0 group-hover:opacity-100 transition-opacity" />
														</div>

														{/* Title */}
														<p
															className={cn(
																"text-[14px] leading-snug mb-1",
																isDone
																	? "text-[#aeaeb2] line-through"
																	: "text-[#1c1c1e] font-semibold",
															)}
														>
															{task.title}
														</p>

														{/* Description Snippet */}
														{task.description && (
															<p className="text-[12px] text-[#8e8e93] leading-relaxed line-clamp-2 mb-2.5">
																{task.description.replace(/<[^>]*>/g, "").slice(0, 100)}
															</p>
														)}

														{/* Labels */}
														{task.labels && task.labels.length > 0 && (
															<div className="flex flex-wrap gap-1 mb-2.5">
																{task.labels.map((label) => (
																	<span
																		key={label.id}
																		className="text-[10px] font-medium px-1.5 py-0.5 rounded-md border"
																		style={{
																			backgroundColor: `${label.color}12`,
																			borderColor: `${label.color}30`,
																			color: label.color,
																		}}
																	>
																		{label.name}
																	</span>
																))}
															</div>
														)}

														{/* Bottom Row */}
														<div className="flex items-center justify-between mt-1">
															<div className="flex items-center gap-2.5 text-[#aeaeb2]">
																{task.dueDate && (
																	<div className="flex items-center gap-1 text-[11px]">
																		<CalendarIcon className="w-3 h-3" />
																		<span>
																			{new Date(task.dueDate).toLocaleDateString("en-GB", {
																				month: "short",
																				day: "2-digit",
																				year: "numeric",
																			})}
																		</span>
																	</div>
																)}
																{priConfig.label && (
																	<div
																		className={cn(
																			"flex items-center gap-0.5 text-[11px] font-medium",
																			priConfig.color,
																		)}
																	>
																		{priConfig.icon}
																		<span>{priConfig.label}</span>
																	</div>
																)}
															</div>

															<div className="flex items-center gap-2">
																{/* Comment & Attachment counts */}
																<div className="flex items-center gap-2 text-[#c7c7cc] text-[11px]">
																	{commentCount > 0 && (
																		<span className="flex items-center gap-0.5">
																			<MessageSquare className="w-3 h-3" />
																			{commentCount}
																		</span>
																	)}
																	{attachmentCount > 0 && (
																		<span className="flex items-center gap-0.5">
																			<Paperclip className="w-3 h-3" />
																			{attachmentCount}
																		</span>
																	)}
																</div>

																{/* Assignee Avatar */}
																{task.assigneeId && (
																	<Avatar className="w-[22px] h-[22px] ring-2 ring-white">
																		<AvatarImage src={assignee.imageUrl} />
																		<AvatarFallback className="text-[8px] bg-gradient-to-br from-[#c7d2fe] to-[#a5b4fc] text-[#4338ca] font-semibold">
																			{assignee.initials}
																		</AvatarFallback>
																	</Avatar>
																)}
															</div>
														</div>
													</button>
												);
											})}
										</div>
									</ScrollArea>
								</div>
							))
						)}
					</div>
				)}
			</ScrollArea>

			{/* ──── Task Detail Modal ──── */}
			<TaskDetailModal
				task={selectedTask}
				isOpen={!!selectedTask}
				onClose={() => setSelectedTask(null)}
			/>

			{/* ──── Create Task Modal ──── */}
			<CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}
