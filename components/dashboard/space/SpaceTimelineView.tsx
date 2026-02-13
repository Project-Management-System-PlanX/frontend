"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

/* ═══════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════ */

interface TimelineTask {
	id: number;
	text: string;
	start: Date;
	end: Date;
	progress: number;
	color: string;
	type: "group" | "task" | "milestone";
	parentId?: number;
}

const TASKS: TimelineTask[] = [
	// ── Group 1: Q1 Product Launch ──
	{
		id: 1,
		text: "Q1 Product Launch",
		start: new Date(2026, 0, 6),
		end: new Date(2026, 2, 28),
		progress: 65,
		color: "#0B6E4F",
		type: "group",
	},
	{
		id: 2,
		text: "UI/UX Research & Design",
		start: new Date(2026, 0, 6),
		end: new Date(2026, 0, 31),
		progress: 100,
		color: "#10B981",
		type: "task",
		parentId: 1,
	},
	{
		id: 3,
		text: "Frontend Development",
		start: new Date(2026, 1, 1),
		end: new Date(2026, 1, 28),
		progress: 80,
		color: "#3B82F6",
		type: "task",
		parentId: 1,
	},
	{
		id: 4,
		text: "Backend API Integration",
		start: new Date(2026, 1, 10),
		end: new Date(2026, 2, 15),
		progress: 50,
		color: "#8B5CF6",
		type: "task",
		parentId: 1,
	},
	{
		id: 5,
		text: "QA & Testing",
		start: new Date(2026, 2, 1),
		end: new Date(2026, 2, 20),
		progress: 20,
		color: "#F59E0B",
		type: "task",
		parentId: 1,
	},
	{
		id: 6,
		text: "Launch Day",
		start: new Date(2026, 2, 28),
		end: new Date(2026, 2, 28),
		progress: 0,
		color: "#EF4444",
		type: "milestone",
		parentId: 1,
	},

	// ── Group 2: Sales Pipeline ──
	{
		id: 10,
		text: "Sales Pipeline Optimization",
		start: new Date(2026, 0, 13),
		end: new Date(2026, 3, 15),
		progress: 40,
		color: "#3B82F6",
		type: "group",
	},
	{
		id: 11,
		text: "CRM Data Migration",
		start: new Date(2026, 0, 13),
		end: new Date(2026, 1, 10),
		progress: 90,
		color: "#10B981",
		type: "task",
		parentId: 10,
	},
	{
		id: 12,
		text: "Lead Scoring Model",
		start: new Date(2026, 1, 1),
		end: new Date(2026, 2, 1),
		progress: 60,
		color: "#6366F1",
		type: "task",
		parentId: 10,
	},
	{
		id: 13,
		text: "Outreach Automation",
		start: new Date(2026, 2, 1),
		end: new Date(2026, 3, 1),
		progress: 10,
		color: "#F59E0B",
		type: "task",
		parentId: 10,
	},
	{
		id: 14,
		text: "Team Training & Rollout",
		start: new Date(2026, 3, 1),
		end: new Date(2026, 3, 15),
		progress: 0,
		color: "#94A3B8",
		type: "task",
		parentId: 10,
	},

	// ── Group 3: Marketing Campaign ──
	{
		id: 20,
		text: "Marketing Campaign",
		start: new Date(2026, 1, 15),
		end: new Date(2026, 3, 30),
		progress: 30,
		color: "#F59E0B",
		type: "group",
	},
	{
		id: 21,
		text: "Content Strategy",
		start: new Date(2026, 1, 15),
		end: new Date(2026, 2, 10),
		progress: 70,
		color: "#EC4899",
		type: "task",
		parentId: 20,
	},
	{
		id: 22,
		text: "Social Media Assets",
		start: new Date(2026, 2, 1),
		end: new Date(2026, 2, 25),
		progress: 40,
		color: "#8B5CF6",
		type: "task",
		parentId: 20,
	},
	{
		id: 23,
		text: "Email Campaign Launch",
		start: new Date(2026, 2, 20),
		end: new Date(2026, 3, 15),
		progress: 0,
		color: "#3B82F6",
		type: "task",
		parentId: 20,
	},
	{
		id: 24,
		text: "Campaign Review",
		start: new Date(2026, 3, 20),
		end: new Date(2026, 3, 30),
		progress: 0,
		color: "#94A3B8",
		type: "task",
		parentId: 20,
	},
];

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
   Component
   ═══════════════════════════════════════════════ */

const ROW_HEIGHT = 40;
const DAY_WIDTH = 7;
const TASK_LIST_WIDTH = 260;

export function SpaceTimelineView() {
	const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());

	const toggleGroup = (id: number) => {
		setCollapsedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	// Filter visible tasks
	const visibleTasks = useMemo(() => {
		return TASKS.filter((t) => {
			if (!t.parentId) return true;
			return !collapsedGroups.has(t.parentId);
		});
	}, [collapsedGroups]);

	// Timeline range
	const timelineStart = new Date(2026, 0, 1);
	const timelineEnd = new Date(2026, 11, 31);
	const totalDays = daysBetween(timelineStart, timelineEnd);
	const timelineWidth = totalDays * DAY_WIDTH;

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

		if (task.type === "milestone") {
			return { left: startOffset - 6, width: 12 };
		}
		return { left: startOffset, width: Math.max(duration, 8) };
	};

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
						{visibleTasks.map((task) => {
							const isGroup = task.type === "group";
							const isCollapsed = collapsedGroups.has(task.id);
							const isChild = !!task.parentId;

							return (
								<div
									key={task.id}
									className={`flex items-center gap-2 border-b border-slate-100 hover:bg-slate-50 transition-colors ${isGroup ? "bg-slate-50/50" : ""}`}
									style={{
										height: ROW_HEIGHT,
										paddingLeft: isChild ? 32 : 12,
										paddingRight: 12,
									}}
								>
									{isGroup ? (
										<button
											type="button"
											onClick={() => toggleGroup(task.id)}
											className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition-colors shrink-0"
										>
											{isCollapsed ? (
												<ChevronRight className="w-3.5 h-3.5 text-slate-500" />
											) : (
												<ChevronDown className="w-3.5 h-3.5 text-slate-500" />
											)}
										</button>
									) : (
										<div
											className="w-2 h-2 rounded-full shrink-0"
											style={{ backgroundColor: task.color }}
										/>
									)}
									<span
										className={`text-sm truncate ${isGroup ? "font-semibold text-slate-800" : "text-slate-600"}`}
									>
										{task.text}
									</span>
									{isGroup && (
										<span className="ml-auto text-[10px] font-bold text-slate-400">
											{task.progress}%
										</span>
									)}
								</div>
							);
						})}
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
						{visibleTasks.map((task, idx) => {
							const { left, width } = getBarStyle(task);
							const top =
								idx * ROW_HEIGHT +
								(ROW_HEIGHT - (task.type === "group" ? 8 : task.type === "milestone" ? 12 : 22)) /
									2;

							if (task.type === "milestone") {
								return (
									<div
										key={task.id}
										className="absolute z-10"
										style={{
											left,
											top: top + 2,
											width: 12,
											height: 12,
										}}
										title={task.text}
									>
										<div
											className="w-3 h-3 rotate-45 rounded-[2px]"
											style={{ backgroundColor: task.color }}
										/>
									</div>
								);
							}

							if (task.type === "group") {
								return (
									<div
										key={task.id}
										className="absolute z-10 rounded-sm"
										style={{
											left,
											top,
											width,
											height: 8,
											backgroundColor: task.color,
											opacity: 0.35,
										}}
										title={`${task.text} — ${task.progress}%`}
									>
										{/* Group bar with left/right ticks */}
										<div
											className="absolute left-0 top-0 w-[3px] rounded-l-sm"
											style={{ height: 14, backgroundColor: task.color }}
										/>
										<div
											className="absolute right-0 top-0 w-[3px] rounded-r-sm"
											style={{ height: 14, backgroundColor: task.color }}
										/>
									</div>
								);
							}

							// Regular task bar
							return (
								<div
									key={task.id}
									className="absolute z-10 rounded-md group cursor-pointer"
									style={{
										left,
										top,
										width,
										height: 22,
									}}
									title={`${task.text} — ${task.progress}%`}
								>
									{/* Background */}
									<div
										className="absolute inset-0 rounded-md opacity-20"
										style={{ backgroundColor: task.color }}
									/>
									{/* Progress fill */}
									<div
										className="absolute inset-y-0 left-0 rounded-md transition-all"
										style={{
											width: `${task.progress}%`,
											backgroundColor: task.color,
											opacity: 0.85,
										}}
									/>
									{/* Label */}
									<span className="absolute inset-0 flex items-center px-2 text-[10px] font-semibold text-white mix-blend-normal truncate drop-shadow-sm">
										{width > 60 ? task.text : ""}
									</span>
									{/* Hover tooltip */}
									<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-lg">
										{task.text} · {task.progress}%
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
