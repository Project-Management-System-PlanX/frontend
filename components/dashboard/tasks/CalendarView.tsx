"use client";

import {
	addDays,
	addMonths,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	setMonth,
	setYear,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import {
	Calendar as CalendarIcon,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Plus,
} from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";

export function CalendarView({
	tasks,
	onTaskClick,
}: {
	tasks: Record<string, Task>;
	onTaskClick: (task: Task) => void;
}) {
	const [currentDate, setCurrentDate] = useState(new Date());

	const monthStart = startOfMonth(currentDate);
	const monthEnd = endOfMonth(monthStart);
	const startDate = startOfWeek(monthStart);
	const endDate = endOfWeek(monthEnd);

	const days = [];
	let day = startDate;

	while (day <= endDate) {
		days.push(day);
		day = addDays(day, 1);
	}

	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	return (
		<div className="flex-1 overflow-auto custom-scrollbar p-5 flex flex-col h-full">
			<div className="flex-1 bg-[#141414] rounded-[24px] border border-white/5 shadow-2xl overflow-hidden flex flex-col min-w-[1800px]">
				{/* Calendar Header */}
				<div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/20 shrink-0">
					<div className="flex items-center gap-4">
						{/* Month Selector */}
						<Popover>
							<PopoverTrigger asChild>
								<div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 cursor-pointer transition-colors group">
									<span className="text-[16px] font-bold text-white group-hover:text-blue-400 transition-colors">
										{format(currentDate, "MMMM")}
									</span>
									<ChevronDown className="w-3.5 h-3.5 text-white/40" />
								</div>
							</PopoverTrigger>
							<PopoverContent className="w-40 p-2 bg-[#1E1E1E] border-white/10 text-white shadow-2xl rounded-xl">
								<div className="grid grid-cols-1 gap-0.5">
									{Array.from({ length: 12 }, (_, i) => (
										<button
											key={i}
											onClick={() => setCurrentDate(setMonth(currentDate, i))}
											className={cn(
												"px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors text-left",
												currentDate.getMonth() === i
													? "bg-blue-600 text-white"
													: "hover:bg-white/5 text-white/60",
											)}
										>
											{format(new Date(2024, i, 1), "MMMM")}
										</button>
									))}
								</div>
							</PopoverContent>
						</Popover>

						{/* Year Selector */}
						<Popover>
							<PopoverTrigger asChild>
								<div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 cursor-pointer transition-colors group">
									<span className="text-[16px] font-bold text-white/60 group-hover:text-white transition-colors">
										{format(currentDate, "yyyy")}
									</span>
									<ChevronDown className="w-3.5 h-3.5 text-white/20" />
								</div>
							</PopoverTrigger>
							<PopoverContent className="w-32 p-2 bg-[#1E1E1E] border-white/10 text-white shadow-2xl rounded-xl">
								<div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
									{Array.from({ length: 21 }, (_, i) => {
										const year = new Date().getFullYear() - 10 + i;
										return (
											<button
												key={year}
												onClick={() => setCurrentDate(setYear(currentDate, year))}
												className={cn(
													"px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors text-left",
													currentDate.getFullYear() === year
														? "bg-blue-600 text-white"
														: "hover:bg-white/5 text-white/60",
												)}
											>
												{year}
											</button>
										);
									})}
								</div>
							</PopoverContent>
						</Popover>

						<div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5">
							<button
								onClick={() => setCurrentDate(addMonths(currentDate, -1))}
								className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
							>
								<ChevronLeft className="w-4 h-4 text-white/60" />
							</button>
							<button
								onClick={() => setCurrentDate(new Date())}
								className="px-3 py-1 hover:bg-white/10 rounded-md text-[13px] font-bold text-white/80 transition-colors"
							>
								Today
							</button>
							<button
								onClick={() => setCurrentDate(addMonths(currentDate, 1))}
								className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
							>
								<ChevronRight className="w-4 h-4 text-white/60" />
							</button>
						</div>

						<div className="w-[1px] h-6 bg-white/10 mx-1" />
					</div>

					<button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[13px] font-bold text-white/80 transition-colors">
						<CalendarIcon className="w-4 h-4" />
						Sync to personal calendar
					</button>
				</div>

				{/* Day Labels */}
				<div className="grid grid-cols-7 border-b border-white/5 bg-black/10 shrink-0">
					{weekDays.map((day) => (
						<div
							key={day}
							className="py-3 text-center text-[12px] font-black text-white/30 uppercase tracking-[0.2em]"
						>
							{day}
						</div>
					))}
				</div>

				{/* Calendar Grid Container with Scroll */}
				<div className="flex-1 overflow-auto custom-scrollbar relative">
					<div className="grid grid-cols-7 auto-rows-[350px] w-full border-l border-t border-white/10">
						{days.map((day, idx) => {
							const isCurrentMonth = isSameMonth(day, monthStart);
							const isToday = isSameDay(day, new Date());

							return (
								<div
									key={idx}
									className={cn(
										"border-r border-b border-white/10 p-4 transition-colors relative group hover:bg-white/[0.02] flex flex-col",
										!isCurrentMonth && "bg-black/20",
										isToday && "bg-blue-600/[0.08]",
									)}
								>
									<div className="flex justify-between items-start mb-3">
										<span
											className={cn(
												"text-[14px] font-black tracking-tight",
												isToday
													? "text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md"
													: isCurrentMonth
														? "text-white/60"
														: "text-white/10",
											)}
										>
											{format(day, "d")}
										</span>
									</div>

									<div className="flex-1 overflow-y-auto custom-scrollbar-thin pr-1 space-y-1.5">
										{Object.values(tasks)
											.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day))
											.map((task) => (
												<div
													key={task.id}
													onClick={() => onTaskClick(task)}
													className="p-2.5 bg-[#1A1A1A] rounded-lg border border-white/5 text-white cursor-pointer hover:bg-[#252525] hover:border-white/10 transition-all flex flex-col gap-2 shadow-xl group/task shrink-0"
												>
													<div className="flex items-start justify-between gap-2">
														{/* Labels */}
														<div className="flex flex-wrap gap-1 mt-1">
															{task.labels && task.labels.length > 0 ? (
																task.labels.map((l) => (
																	<div
																		key={l.id}
																		className="h-1.5 w-6 rounded-full"
																		style={{ backgroundColor: l.color }}
																	/>
																))
															) : (
																<div className="h-1.5 w-6 rounded-full bg-blue-500/50" />
															)}
														</div>

														{/* Assignee */}
														<div className="w-6 h-6 rounded-full border border-white/10 bg-orange-500 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm">
															{task.assignees?.[0]?.user?.firstName?.[0] || "R"}
														</div>
													</div>

													<span className="text-[14px] font-bold tracking-tight leading-tight line-clamp-2">
														{task.title}
													</span>
												</div>
											))}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Footer with Add Button */}
				<div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
					<button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-[14px] transition-all border border-white/5 shadow-lg active:scale-95">
						<Plus className="w-5 h-5" />
						Add card
					</button>
				</div>
			</div>
		</div>
	);
}
