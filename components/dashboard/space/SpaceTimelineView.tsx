"use client";

import { useMemo } from "react";
import { useSpace } from "@/hooks/api/use-spaces";
import { useTasks } from "@/hooks/api/use-tasks";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Task } from "@/lib/types/models";

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function daysBetween(a: Date, b: Date) {
	return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function generateWeeks(start: Date, end: Date) {
	const weeks: { label: string; start: Date; days: number }[] = [];
	const cur = new Date(start);
	// align to Monday
	cur.setDate(cur.getDate() - ((cur.getDay() + 6) % 7));

	while (cur <= end) {
		const weekEnd = new Date(cur);
		weekEnd.setDate(weekEnd.getDate() + 6);
		weeks.push({
			label: `${MONTHS[cur.getMonth()]} ${cur.getDate()}`,
			start: new Date(cur),
			days: 7,
		});
		cur.setDate(cur.getDate() + 7);
	}
	return weeks;
}

function generateMonths(start: Date, end: Date) {
	const months: { label: string; start: Date; days: number }[] = [];
	const cur = new Date(start.getFullYear(), start.getMonth(), 1);

	while (cur <= end) {
		const nextMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
		const daysInMonth = daysBetween(cur, nextMonth);
		months.push({
			label: `${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`,
			start: new Date(cur),
			days: daysInMonth,
		});
		cur.setMonth(cur.getMonth() + 1);
	}
	return months;
}

/* ═══════════════════════════════════════════════
   Internal timeline task shape
   ═══════════════════════════════════════════════ */

interface TimelineTask {
	id: string;
	text: string;
	start: Date;
	end: Date;
	color: string;
	type: "task";
	taskNumber?: number;
}

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

const ROW_HEIGHT = 52;
const DAY_WIDTH = 16;
const TASK_LIST_WIDTH = 260;

const STATUS_COLORS: Record<string, string> = {
	done: "#10B981",
	progress: "#3B82F6",
	review: "#F59E0B",
};

function getTaskColor(task: Task): string {
	if (task.status?.isDone) return STATUS_COLORS.done;
	const s = (task.status?.name || "").toLowerCase();
	if (s.includes("progress")) return STATUS_COLORS.progress;
	if (s.includes("review")) return STATUS_COLORS.review;
	return task.status?.color || "#94A3B8";
}

export function SpaceTimelineView({ spaceId }: { spaceId: string }) {
	const { token, user } = useSupabaseAuth();
	const { data: space } = useSpace(spaceId, token || undefined);
	const { data: tasks, isLoading } = useTasks(spaceId, { assignee: user?.id }, token || undefined);

	// Map real tasks → timeline tasks (only those with at least a start or due date)
	const timelineTasks: TimelineTask[] = useMemo(() => {
		if (!tasks) return [];
		const now = new Date();
		return tasks
			.filter((t) => t.startDate || t.dueDate)
			.map((t) => {
				const start = t.startDate ? new Date(t.startDate) : t.dueDate ? new Date(t.dueDate) : now;
				const end = t.dueDate ? new Date(t.dueDate) : start;
				return {
					id: t.id,
					text: t.title,
					start: start <= end ? start : end,
					end: end >= start ? end : start,
					color: getTaskColor(t),
					type: "task" as const,
					taskNumber: t.taskNumber,
				};
			});
	}, [tasks]);

	// Timeline range: derive from tasks or default to current quarter
	const { timelineStart, timelineEnd } = useMemo(() => {
		if (timelineTasks.length === 0) {
			const now = new Date();
			return {
				timelineStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
				timelineEnd: new Date(now.getFullYear(), now.getMonth() + 4, 0),
			};
		}
		const starts = timelineTasks.map((t) => t.start.getTime());
		const ends = timelineTasks.map((t) => t.end.getTime());
		const min = new Date(Math.min(...starts));
		const max = new Date(Math.max(...ends));
		// Add 2-week padding on each side
		min.setDate(min.getDate() - 14);
		max.setDate(max.getDate() + 14);
		return { timelineStart: min, timelineEnd: max };
	}, [timelineTasks]);

	const totalDays = daysBetween(timelineStart, timelineEnd);
	const timelineWidth = Math.max(totalDays * DAY_WIDTH, 800);

	const months = generateMonths(timelineStart, timelineEnd);
	const weeks = generateWeeks(timelineStart, timelineEnd);

	// Today marker
	const today = new Date();
	const todayOffset =
		today >= timelineStart && today <= timelineEnd
			? daysBetween(timelineStart, today) * DAY_WIDTH
			: -1;

	const getBarStyle = (task: TimelineTask) => {
		const startOffset = Math.max(0, daysBetween(timelineStart, task.start)) * DAY_WIDTH;
		const duration = Math.max(1, daysBetween(task.start, task.end)) * DAY_WIDTH;
		return { left: startOffset, width: Math.max(duration, 24) };
	};

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center text-sm text-slate-400">
				Loading timeline...
			</div>
		);
	}

	if (timelineTasks.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center text-sm text-slate-400">
				No tasks with dates to display on the timeline.
			</div>
		);
	}

	return (
		<div
			className="flex-1 flex flex-col bg-white overflow-hidden animate-[fadeInUp_0.3s_ease-out]"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			<div className="flex flex-1 overflow-hidden border-t border-slate-200">
				{/* ──── Task List (Left Panel) ──── */}
				<div
					className="shrink-0 border-r border-slate-200 bg-white flex flex-col"
					style={{ width: TASK_LIST_WIDTH }}
				>
					{/* Header */}
					<div
						className="flex items-center px-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0"
						style={{ height: 60 }}
					>
						Task Name
					</div>

					{/* Task Rows */}
					<div className="flex-1 overflow-auto">
						{timelineTasks.map((task) => (
							<div
								key={task.id}
								className="flex items-center gap-2 border-b border-slate-100 hover:bg-slate-50 transition-colors px-3"
								style={{ height: ROW_HEIGHT }}
							>
								<div
									className="w-2 h-2 rounded-full shrink-0"
									style={{ backgroundColor: task.color }}
								/>
								<span className="text-sm text-slate-600 truncate">
									{space?.prefix}-{task.taskNumber} {task.text}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* ──── Timeline Chart (Right Panel) ──── */}
				<div className="flex-1 overflow-auto flex flex-col min-w-0">
					{/* Scale Headers */}
					<div className="shrink-0 border-b border-slate-200" style={{ width: timelineWidth }}>
						{/* Month row */}
						<div className="flex border-b border-slate-100" style={{ height: 30 }}>
							{months.map((m) => (
								<div
									key={m.label}
									className="shrink-0 flex items-center justify-center text-[11px] font-semibold text-slate-600 bg-slate-50 border-r border-slate-100"
									style={{ width: m.days * DAY_WIDTH }}
								>
									{m.label}
								</div>
							))}
						</div>
						{/* Week row */}
						<div className="flex" style={{ height: 30 }}>
							{weeks.map((w) => (
								<div
									key={`w-${w.label}-${w.start.getTime()}`}
									className="shrink-0 flex items-center justify-center text-[9px] font-medium text-slate-400 border-r border-slate-50"
									style={{ width: w.days * DAY_WIDTH }}
								>
									{w.label}
								</div>
							))}
						</div>
					</div>

					{/* Bars area */}
					<div className="relative flex-1 overflow-auto" style={{ width: timelineWidth }}>
						{/* Vertical grid lines (weekly) */}
						{weeks.map((w) => {
							const offset = daysBetween(timelineStart, w.start) * DAY_WIDTH;
							return (
								<div
									key={`grid-${w.start.getTime()}`}
									className="absolute top-0 bottom-0 border-l border-slate-100"
									style={{ left: offset }}
								/>
							);
						})}

						{/* Today marker */}
						{todayOffset >= 0 && (
							<div
								className="absolute top-0 bottom-0 w-[2px] bg-red-400 z-20"
								style={{ left: todayOffset }}
							>
								<div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-400" />
							</div>
						)}

						{/* Task Bars */}
						{timelineTasks.map((task, idx) => {
							const { left, width } = getBarStyle(task);
							const top = idx * ROW_HEIGHT + (ROW_HEIGHT - 28) / 2;

							return (
								<div
									key={task.id}
									className="absolute z-10 rounded-md group cursor-pointer"
									style={{ left, top, width, height: 28 }}
									title={`${space?.prefix}-${task.taskNumber} ${task.text}`}
								>
									{/* Bar fill */}
									<div
										className="absolute inset-0 rounded-md"
										style={{ backgroundColor: task.color }}
									/>
									{/* Label (inside bar when wide enough, outside when narrow) */}
									{width >= 80 ? (
										<span className="absolute inset-0 flex items-center px-2.5 text-[11px] font-semibold text-white truncate drop-shadow-sm">
											{space?.prefix}-{task.taskNumber} {task.text}
										</span>
									) : (
										<span className="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-600 whitespace-nowrap">
											{space?.prefix}-{task.taskNumber} {task.text}
										</span>
									)}
									{/* Hover tooltip */}
									<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-lg">
										{space?.prefix}-{task.taskNumber} {task.text}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
