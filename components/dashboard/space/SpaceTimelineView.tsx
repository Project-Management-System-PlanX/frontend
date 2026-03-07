"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSpace } from "@/hooks/api/use-spaces";
import { useTasks } from "@/hooks/api/use-tasks";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Task } from "@/lib/types/models";

/* ──────────────────────────────────────────────
   Layout constants
────────────────────────────────────────────── */
const DAY_W = 24; // px per calendar day — wider so individual days are easier to read
const ROW_H = 52; // px per task row
const HEADER_H = 64; // px for the two-row header
const SIDEBAR_W = 280; // px for the task name panel

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ──────────────────────────────────────────────
   Date helpers
────────────────────────────────────────────── */
function daysBetween(a: Date, b: Date) {
	return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
function startOfDay(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function monthSegments(start: Date, end: Date) {
	const segs: { label: string; days: number }[] = [];
	const cur = new Date(start.getFullYear(), start.getMonth(), 1);
	while (cur <= end) {
		const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
		segs.push({
			label: `${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`,
			days: daysBetween(cur, next),
		});
		cur.setMonth(cur.getMonth() + 1);
	}
	return segs;
}
function weekStarts(start: Date, end: Date) {
	const out: Date[] = [];
	const cur = new Date(start);
	cur.setDate(cur.getDate() - ((cur.getDay() + 6) % 7)); // Monday
	while (cur <= end) {
		out.push(new Date(cur));
		cur.setDate(cur.getDate() + 7);
	}
	return out;
}

/* ──────────────────────────────────────────────
   Status colour
────────────────────────────────────────────── */
function statusColor(task: Task): { bar: string; dot: string } {
	if (task.status?.isDone) return { bar: "#10B981", dot: "#059669" };
	const s = (task.status?.name ?? "").toLowerCase();
	if (s.includes("progress")) return { bar: "#3B82F6", dot: "#2563EB" };
	if (s.includes("review")) return { bar: "#F59E0B", dot: "#D97706" };
	const c = task.status?.color ?? "#94A3B8";
	return { bar: c, dot: c };
}

/* ──────────────────────────────────────────────
   Component
────────────────────────────────────────────── */
export function SpaceTimelineView({ spaceId }: { spaceId: string }) {
	const { token, user } = useSupabaseAuth();
	const { data: space } = useSpace(spaceId, token || undefined);
	const { data: tasks, isLoading } = useTasks(spaceId, { assignee: user?.id }, token || undefined);

	/* rows */
	const rows = useMemo(() => {
		if (!tasks) return [];
		return tasks
			.filter((t) => t.startDate || t.dueDate)
			.map((t) => {
				const s = startOfDay(new Date(t.startDate ?? t.dueDate ?? new Date()));
				const e = startOfDay(new Date(t.dueDate ?? t.startDate ?? new Date()));
				const colors = statusColor(t);
				return {
					id: t.id,
					title: t.title,
					taskNumber: t.taskNumber,
					start: s <= e ? s : e,
					end: e >= s ? e : s,
					...colors,
					statusName: t.status?.name ?? "",
					isDone: !!t.status?.isDone,
				};
			})
			.sort(
				(a, b) =>
					a.start.getTime() - b.start.getTime() || (a.taskNumber ?? 0) - (b.taskNumber ?? 0),
			);
	}, [tasks]);

	/* range */
	const { tStart, tEnd } = useMemo(() => {
		const now = startOfDay(new Date());
		if (rows.length === 0) {
			return {
				tStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
				tEnd: new Date(now.getFullYear(), now.getMonth() + 3, 0),
			};
		}
		const minMs = Math.min(...rows.map((r) => r.start.getTime()), now.getTime());
		const maxMs = Math.max(...rows.map((r) => r.end.getTime()), now.getTime());
		const lo = new Date(minMs);
		const hi = new Date(maxMs);
		return {
			tStart: new Date(lo.getFullYear(), lo.getMonth() - 2, 1),
			tEnd: new Date(hi.getFullYear(), hi.getMonth() + 4, 0),
		};
	}, [rows]);

	const totalDays = daysBetween(tStart, tEnd);
	const gridW = Math.max(totalDays * DAY_W, 800);
	const months = monthSegments(tStart, tEnd);
	const weeks = weekStarts(tStart, tEnd);

	const today = startOfDay(new Date());
	const todayX = today >= tStart && today <= tEnd ? daysBetween(tStart, today) * DAY_W : -1;

	/* scroll to today */
	const scrollRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (scrollRef.current && todayX >= 0) {
			const vw = scrollRef.current.clientWidth - SIDEBAR_W;
			scrollRef.current.scrollLeft = Math.max(0, todayX - vw / 2);
		}
	}, [todayX]);

	/* bar geometry */
	function bar(row: (typeof rows)[0]) {
		const left = Math.max(0, daysBetween(tStart, row.start)) * DAY_W;
		const width = Math.max(DAY_W, daysBetween(row.start, row.end) * DAY_W + DAY_W);
		return { left, width };
	}

	/* loading */
	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="flex flex-col items-center gap-3 text-slate-400">
					<div className="w-8 h-8 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
					<span className="text-sm">Loading timeline…</span>
				</div>
			</div>
		);
	}

	/* empty */
	if (rows.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="flex flex-col items-center gap-3 text-center text-slate-400 max-w-xs">
					<div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
						<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
							<rect x="3" y="8" width="22" height="17" rx="2" stroke="#CBD5E1" strokeWidth="1.5" />
							<path
								d="M9 4v4M19 4v4M3 13h22"
								stroke="#CBD5E1"
								strokeWidth="1.5"
								strokeLinecap="round"
							/>
						</svg>
					</div>
					<p className="text-sm font-semibold text-slate-600">No scheduled tasks</p>
					<p className="text-xs leading-relaxed">
						Add a start or due date to any task and it will appear here on the timeline.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className="flex-1 flex flex-col bg-white overflow-hidden"
			style={{ fontFamily: "var(--font-figtree, Figtree), sans-serif" }}
		>
			<div ref={scrollRef} className="flex-1 overflow-auto">
				{/* ── total width wrapper ── */}
				<div className="relative flex flex-col" style={{ minWidth: SIDEBAR_W + gridW }}>
					{/* ══════ STICKY HEADER ══════ */}
					<div
						className="sticky top-0 z-30 flex border-b border-slate-200"
						style={{ height: HEADER_H, boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06)" }}
					>
						{/* top-left corner */}
						<div
							className="sticky left-0 z-40 shrink-0 flex items-center px-5 bg-slate-50 border-r border-slate-200"
							style={{ width: SIDEBAR_W }}
						>
							<span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
								Task
							</span>
						</div>

						{/* month + week header */}
						<div className="flex flex-col bg-white relative" style={{ width: gridW }}>
							{/* month row */}
							<div className="flex border-b border-slate-100" style={{ height: 32 }}>
								{months.map((m) => (
									<div
										key={m.label}
										className="shrink-0 flex items-center justify-center bg-slate-50 border-r border-slate-100 select-none"
										style={{ width: m.days * DAY_W }}
									>
										<span className="text-[11px] font-bold text-slate-500">{m.label}</span>
									</div>
								))}
							</div>
							{/* week row — Today pill is rendered here, inside the header, so it never overlaps task bars */}
							<div className="relative overflow-visible" style={{ height: 32 }}>
								{weeks.map((w) => {
									const leftOffset = daysBetween(tStart, w) * DAY_W;
									return (
										<div
											key={w.getTime()}
											className="absolute top-0 bottom-0 flex items-center justify-center border-l border-slate-100 select-none"
											style={{ left: leftOffset, width: 7 * DAY_W }}
										>
											<span className="text-[10px] font-medium text-slate-400">
												{MONTHS[w.getMonth()]} {w.getDate()}
											</span>
										</div>
									);
								})}
								{/* Today pill anchored inside the week-row header — shows actual date */}
								{todayX >= 0 && (
									<div
										className="absolute inset-y-0 flex items-center justify-center pointer-events-none z-20"
										style={{ left: todayX + DAY_W / 2 - 1 }}
									>
										<div className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
											Today ·{" "}
											{today.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* ══════ BODY ══════ */}
					<div className="relative flex flex-col pb-10">
						{/* ── background grid (absolute, behind rows) ── */}
						<div className="absolute inset-0 pointer-events-none" style={{ left: SIDEBAR_W }}>
							{/* alternate row stripes */}
							{rows.map((row, i) => (
								<div
									key={`stripe-${row.id}`}
									className={i % 2 === 1 ? "absolute w-full bg-slate-50/60" : ""}
									style={{ top: i * ROW_H, height: ROW_H, right: 0, left: 0 }}
								/>
							))}

							{/* week columns */}
							{weeks.map((w) => (
								<div
									key={`wl-${w.getTime()}`}
									className="absolute top-0 bottom-0 border-l border-slate-100"
									style={{ left: daysBetween(tStart, w) * DAY_W }}
								/>
							))}

							{/* today column soft highlight */}
							{todayX >= 0 && (
								<div
									className="absolute top-0 bottom-0 bg-red-50/40"
									style={{ left: todayX, width: DAY_W }}
								/>
							)}

							{/* today line — clean 2px, no pill here (pill is in the header) */}
							{todayX >= 0 && (
								<div
									className="absolute top-0 bottom-0 z-10"
									style={{ left: todayX + DAY_W / 2, width: 2, background: "rgba(239,68,68,0.75)" }}
								/>
							)}
						</div>

						{/* ── task rows ── */}
						{rows.map((row) => {
							const { left, width } = bar(row);
							const showLabelInside = width >= 80;

							return (
								<div
									key={row.id}
									className="relative flex items-center group"
									style={{ height: ROW_H }}
								>
									{/* sidebar */}
									<div
										className="sticky left-0 z-20 shrink-0 flex items-center gap-2.5 px-4 bg-white border-r border-b border-slate-100 group-hover:bg-blue-50/30 transition-colors"
										style={{ width: SIDEBAR_W, height: ROW_H }}
									>
										{/* status dot */}
										<span
											className="w-2 h-2 rounded-full shrink-0 ring-2 ring-white"
											style={{ backgroundColor: row.dot }}
										/>
										<span className="text-[11px] font-semibold text-slate-400 shrink-0 tabular-nums">
											{space?.prefix}-{row.taskNumber}
										</span>
										<div className="flex flex-col min-w-0">
											<span className="text-[13px] text-slate-700 font-medium truncate leading-tight">
												{row.title}
											</span>
											<span className="text-[10px] text-slate-400 tabular-nums">
												{row.start.toLocaleDateString(undefined, {
													month: "short",
													day: "numeric",
												})}
												{" → "}
												{row.end.toLocaleDateString(undefined, {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</span>
										</div>
										{row.isDone && (
											<span className="ml-auto shrink-0 text-[9px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
												Done
											</span>
										)}
									</div>

									{/* grid area */}
									<div
										className="relative shrink-0 border-b border-slate-100"
										style={{ width: gridW, height: ROW_H }}
									>
										{/* ─ Gantt bar ─ */}
										<div
											className="absolute top-1/2 -translate-y-1/2 rounded-full select-none cursor-pointer"
											style={{
												left,
												width,
												height: 28,
												background: `linear-gradient(135deg, ${row.bar}ee, ${row.dot}cc)`,
												boxShadow: `0 2px 8px 0 ${row.bar}55`,
											}}
										>
											{/* gloss overlay */}
											<div
												className="absolute inset-0 rounded-full"
												style={{
													background:
														"linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.0) 100%)",
												}}
											/>

											{/* label inside */}
											{showLabelInside && (
												<span className="absolute inset-0 flex items-center px-3 text-[11px] font-semibold text-white truncate">
													{row.title}
												</span>
											)}

											{/* label outside (short bars) */}
											{!showLabelInside && (
												<span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-600 whitespace-nowrap">
													{row.title}
												</span>
											)}
										</div>

										{/* tooltip on hover */}
										<div
											className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
											style={{ left: left + width / 2, transform: "translateX(-50%)" }}
										>
											<div className="bg-slate-900 text-white text-[11px] font-medium px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
												<span className="text-slate-400 mr-1">
													{space?.prefix}-{row.taskNumber}
												</span>
												{row.title}
												<div className="flex items-center gap-1 mt-1 text-slate-400 text-[10px]">
													<span>
														{row.start.toLocaleDateString(undefined, {
															month: "short",
															day: "numeric",
														})}
													</span>
													<span>→</span>
													<span>
														{row.end.toLocaleDateString(undefined, {
															month: "short",
															day: "numeric",
															year: "numeric",
														})}
													</span>
												</div>
											</div>
											<div className="flex justify-center">
												<div className="border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
											</div>
										</div>
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
