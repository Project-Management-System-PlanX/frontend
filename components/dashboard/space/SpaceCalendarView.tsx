"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

/* ═══════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════ */

interface CalendarEvent {
	id: string;
	title: string;
	date: Date;
	time?: string;
	color: string;
	tag?: string;
}

const EVENTS: CalendarEvent[] = [
	{
		id: "1",
		title: "Sprint Planning",
		date: new Date(2026, 1, 9),
		time: "10:00 AM",
		color: "#0B6E4F",
		tag: "Meeting",
	},
	{
		id: "2",
		title: "Design Review",
		date: new Date(2026, 1, 11),
		time: "2:00 PM",
		color: "#3B82F6",
		tag: "Review",
	},
	{
		id: "3",
		title: "API Deadline",
		date: new Date(2026, 1, 13),
		color: "#EF4444",
		tag: "Deadline",
	},
	{
		id: "4",
		title: "Team Standup",
		date: new Date(2026, 1, 12),
		time: "9:30 AM",
		color: "#8B5CF6",
		tag: "Daily",
	},
	{
		id: "5",
		title: "Client Demo",
		date: new Date(2026, 1, 18),
		time: "3:00 PM",
		color: "#F59E0B",
		tag: "Meeting",
	},
	{
		id: "6",
		title: "Code Freeze",
		date: new Date(2026, 1, 20),
		color: "#EF4444",
		tag: "Milestone",
	},
	{
		id: "7",
		title: "1-on-1 with Sarah",
		date: new Date(2026, 1, 16),
		time: "11:00 AM",
		color: "#EC4899",
		tag: "Meeting",
	},
	{
		id: "8",
		title: "Launch Prep",
		date: new Date(2026, 1, 25),
		time: "10:00 AM",
		color: "#0B6E4F",
		tag: "Task",
	},
	{ id: "9", title: "QA Sign-off", date: new Date(2026, 1, 23), color: "#F59E0B", tag: "Review" },
	{
		id: "10",
		title: "Marketing Sync",
		date: new Date(2026, 1, 26),
		time: "1:00 PM",
		color: "#6366F1",
		tag: "Meeting",
	},
	{
		id: "11",
		title: "Performance Review",
		date: new Date(2026, 1, 27),
		time: "4:00 PM",
		color: "#8B5CF6",
		tag: "HR",
	},
	{
		id: "12",
		title: "Retro Meeting",
		date: new Date(2026, 1, 28),
		time: "3:00 PM",
		color: "#0B6E4F",
		tag: "Meeting",
	},
	{ id: "13", title: "Bug Bash", date: new Date(2026, 1, 19), color: "#EF4444", tag: "Task" },
	{
		id: "14",
		title: "Roadmap Planning",
		date: new Date(2026, 1, 10),
		time: "11:00 AM",
		color: "#3B82F6",
		tag: "Planning",
	},
];

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */

const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isSameDate(a: Date, b: Date) {
	return (
		a.getDate() === b.getDate() &&
		a.getMonth() === b.getMonth() &&
		a.getFullYear() === b.getFullYear()
	);
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
	const firstDay = new Date(year, month, 1);
	let startDow = firstDay.getDay() - 1; // Mon=0
	if (startDow < 0) startDow = 6;

	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const prevMonthDays = new Date(year, month, 0).getDate();

	const cells: (Date | null)[] = [];

	// Previous month fill
	for (let i = startDow - 1; i >= 0; i--) {
		cells.push(new Date(year, month - 1, prevMonthDays - i));
	}

	// Current month
	for (let d = 1; d <= daysInMonth; d++) {
		cells.push(new Date(year, month, d));
	}

	// Next month fill
	const remaining = 42 - cells.length; // 6 rows × 7 cols
	for (let d = 1; d <= remaining; d++) {
		cells.push(new Date(year, month + 1, d));
	}

	return cells;
}

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

export function SpaceCalendarView() {
	const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
	const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
	const goToday = () => setCurrentDate(new Date());

	const days = getCalendarDays(year, month);
	const today = new Date();
	const weeks = [];
	for (let i = 0; i < days.length; i += 7) {
		weeks.push(days.slice(i, i + 7));
	}

	const getEventsForDate = (date: Date | null) => {
		if (!date) return [];
		return EVENTS.filter((e) => isSameDate(e.date, date));
	};

	return (
		<div
			className="flex-1 flex flex-col bg-white overflow-hidden animate-[fadeInUp_0.3s_ease-out]"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* ──── Toolbar ──── */}
			<div className="px-6 py-3 flex items-center justify-between border-t border-b border-slate-200 shrink-0 bg-white">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={goToday}
						className="px-3.5 py-1.5 bg-[#0B6E4F] text-white text-[13px] font-semibold rounded-lg hover:bg-[#095C42] transition-colors shadow-sm"
					>
						Today
					</button>
					<div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
						<button
							type="button"
							onClick={prevMonth}
							className="p-1.5 px-2 hover:bg-slate-100 transition-colors border-r border-slate-200"
						>
							<ChevronLeft className="w-4 h-4 text-slate-500" />
						</button>
						<span className="px-4 py-1.5 text-sm font-bold text-slate-800 min-w-[160px] text-center">
							{MONTH_NAMES[month]} {year}
						</span>
						<button
							type="button"
							onClick={nextMonth}
							className="p-1.5 px-2 hover:bg-slate-100 transition-colors border-l border-slate-200"
						>
							<ChevronRight className="w-4 h-4 text-slate-500" />
						</button>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{["Month", "Week", "Day"].map((view, i) => (
						<button
							key={view}
							type="button"
							className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-colors ${
								i === 0
									? "bg-slate-900 text-white"
									: "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
							}`}
						>
							{view}
						</button>
					))}
				</div>
			</div>

			{/* ──── Calendar Grid ──── */}
			<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
				{/* Day Headers */}
				<div className="grid grid-cols-7 border-b border-slate-200 shrink-0">
					{DAY_LABELS.map((day) => (
						<div
							key={day}
							className="py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60"
						>
							{day}
						</div>
					))}
				</div>

				{/* Weeks Grid */}
				<div className="flex-1 grid grid-rows-6 min-h-0 overflow-hidden">
					{weeks.map((week) => {
						const weekKey = week.map((d) => d?.toISOString() || "null").join(",");
						return (
							<div key={weekKey} className="grid grid-cols-7 border-b border-slate-100 min-h-0">
								{week.map((date) => {
									if (!date) return <div key="null" className="bg-slate-50/30" />;

									const isCurrentMonth = date.getMonth() === month;
									const isToday = isSameDate(date, today);
									const events = getEventsForDate(date);
									const isWeekend = date.getDay() === 0 || date.getDay() === 6;

									return (
										<div
											key={date.toISOString()}
											className={`border-r border-slate-100 last:border-r-0 p-1.5 flex flex-col min-h-0 overflow-hidden group transition-colors ${
												isWeekend ? "bg-slate-50/40" : ""
											} ${!isCurrentMonth ? "opacity-40" : ""} ${
												isToday ? "bg-emerald-50/40" : ""
											} hover:bg-slate-50`}
										>
											{/* Date number + Add button */}
											<div className="flex items-center justify-between mb-1 shrink-0">
												<span
													className={`w-6 h-6 flex items-center justify-center text-[12px] font-semibold rounded-full ${
														isToday
															? "bg-[#0B6E4F] text-white shadow-sm"
															: isCurrentMonth
																? "text-slate-700"
																: "text-slate-300"
													}`}
												>
													{date.getDate()}
												</span>
												<button
													type="button"
													className="w-5 h-5 flex items-center justify-center rounded-md text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-200 hover:text-slate-500 transition-all"
												>
													<Plus className="w-3 h-3" />
												</button>
											</div>

											{/* Events */}
											<div className="flex-1 overflow-hidden space-y-0.5">
												{events.slice(0, 3).map((event) => (
													<div
														key={event.id}
														className="flex items-center gap-1 px-1.5 py-[3px] rounded-md cursor-pointer hover:brightness-95 transition-all truncate"
														style={{ backgroundColor: `${event.color}15` }}
													>
														<div
															className="w-1.5 h-1.5 rounded-full shrink-0"
															style={{ backgroundColor: event.color }}
														/>
														<span
															className="text-[10px] font-medium truncate leading-tight"
															style={{ color: event.color }}
														>
															{event.time && (
																<span className="opacity-70 mr-0.5">
																	{event.time.replace(":00", "")}{" "}
																</span>
															)}
															{event.title}
														</span>
													</div>
												))}
												{events.length > 3 && (
													<span className="text-[9px] font-semibold text-slate-400 pl-1.5">
														+{events.length - 3} more
													</span>
												)}
											</div>
										</div>
									);
								})}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
