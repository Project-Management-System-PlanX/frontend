"use client";

import { addDays, format, isSameDay } from "date-fns";
import { ChevronDown, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import type { Column } from "./types";

export function TimelineView({
	columns,
	columnOrder,
	tasks,
	onTaskClick,
}: {
	columns: Record<string, Column>;
	columnOrder: string[];
	tasks: Record<string, Task>;
	onTaskClick: (task: Task) => void;
}) {
	const [currentDate, setCurrentDate] = useState(new Date());

	// Display 30 days starting from 7 days before the current date
	const startDate = addDays(currentDate, -7);
	const days = Array.from({ length: 30 }, (_, i) => addDays(startDate, i));

	return (
		<div className="flex-1 overflow-auto custom-scrollbar p-5 flex flex-col h-full">
			<div className="flex-1 bg-[#3d3d54] rounded-[24px] border border-[#505060] shadow-2xl overflow-hidden flex flex-col min-w-[1000px]">
				{/* Timeline Header */}
				<div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/20 shrink-0">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 cursor-pointer transition-colors">
							<span className="text-[16px] font-bold text-white">
								{format(currentDate, "MMM yyyy")}
							</span>
							<ChevronDown className="w-4 h-4 text-white/40" />
						</div>

						<div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5">
							<button
								onClick={() => setCurrentDate(addDays(currentDate, -7))}
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
								onClick={() => setCurrentDate(addDays(currentDate, 7))}
								className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
							>
								<ChevronRight className="w-4 h-4 text-white/60" />
							</button>
						</div>

						<div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[13px] font-bold text-white/80 cursor-pointer">
							Week
							<ChevronDown className="w-4 h-4 text-white/40" />
						</div>
						<div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[13px] font-bold text-white/80 cursor-pointer">
							List
							<ChevronDown className="w-4 h-4 text-white/40" />
						</div>
					</div>
				</div>

				{/* Timeline Content */}
				<div className="flex-1 flex overflow-hidden">
					{/* Sidebar */}
					<div className="w-[200px] border-r border-white/5 flex flex-col bg-black/10 shrink-0">
						<div className="h-[60px] border-b border-white/5 flex items-center px-6 text-[11px] font-black text-white/20 uppercase tracking-widest">
							Lists
						</div>
						<div className="flex-1 overflow-y-auto custom-scrollbar">
							{columnOrder.map((colId) => {
								const columnTasks = columns[colId].taskIds.map((tid) => tasks[tid]).filter(Boolean);
								const scheduledCount = columnTasks.filter((t) => t.dueDate).length;

								return (
									<div
										key={colId}
										className="h-[120px] border-b border-white/5 flex flex-col justify-center px-6 gap-2 group hover:bg-white/[0.02] transition-colors"
									>
										<span className="text-[15px] font-black text-white/80 group-hover:text-white truncate">
											{columns[colId].name}
										</span>
										<div className="flex items-center justify-between">
											<span className="text-[11px] font-bold text-white/30">
												({scheduledCount}) Scheduled
											</span>
											<Plus className="w-4 h-4 text-white/20 hover:text-white cursor-pointer transition-colors" />
										</div>
									</div>
								);
							})}
						</div>
						<div className="p-4 border-t border-white/5 bg-black/20">
							<button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-[13px] transition-all border border-white/5 shadow-lg active:scale-95">
								<Plus className="w-4 h-4" />
								Add
							</button>
						</div>
					</div>

					{/* Timeline Grid */}
					<div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">
						{/* Day Header */}
						<div className="flex h-[60px] border-b border-white/10 bg-black/5 shrink-0 w-max">
							{days.map((day, idx) => {
								const isToday = isSameDay(day, new Date());
								return (
									<div
										key={idx}
										className={cn(
											"w-[140px] border-r border-white/10 flex flex-col items-center justify-center gap-0.5 relative shrink-0",
											isToday && "bg-blue-600/[0.05]",
										)}
									>
										<span
											className={cn(
												"text-[10px] font-black uppercase tracking-widest",
												isToday ? "text-blue-400" : "text-white/20",
											)}
										>
											{format(day, "eee")}
										</span>
										<span
											className={cn(
												"text-[12px] font-black",
												isToday ? "text-blue-400" : "text-white/40",
											)}
										>
											{format(day, "d")}
										</span>
										{isToday && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />}
									</div>
								);
							})}
						</div>

						{/* Grid Rows */}
						<div className="flex-1 flex flex-col w-max">
							{columnOrder.map((colId) => (
								<div
									key={colId}
									className="flex h-[120px] border-b border-white/10 relative group hover:bg-white/[0.01]"
								>
									{days.map((day, idx) => (
										<div key={idx} className="w-[140px] border-r border-white/10 relative shrink-0">
											{/* Tasks for this day in this column */}
											{columns[colId].taskIds
												.map((tid) => tasks[tid])
												.filter((t) => t?.dueDate && isSameDay(new Date(t.dueDate), day))
												.map((task) => (
													<div
														key={task.id}
														onClick={() => onTaskClick(task)}
														className="absolute inset-x-2 top-2 bottom-2 bg-[#505060] rounded-xl border border-[#606070] p-2.5 flex flex-col gap-1.5 hover:bg-[#5a5a70] hover:border-[#707080] transition-all cursor-pointer shadow-2xl group/task z-10"
													>
														<div className="flex items-center justify-between">
															<div className="flex gap-1">
																{task.labels?.slice(0, 2).map((l) => (
																	<div
																		key={l.id}
																		className="h-1 w-4 rounded-full"
																		style={{ backgroundColor: l.color }}
																	/>
																))}
															</div>
															<div className="w-5 h-5 rounded-full border border-white/10 bg-emerald-500 flex items-center justify-center text-[9px] font-black text-white">
																{task.assignees?.[0]?.user?.firstName?.[0] || "R"}
															</div>
														</div>
														<span className="text-[12px] font-bold text-white truncate leading-tight">
															{task.title}
														</span>
														<div className="flex items-center justify-between mt-auto">
															<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
														</div>
													</div>
												))}
										</div>
									))}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
