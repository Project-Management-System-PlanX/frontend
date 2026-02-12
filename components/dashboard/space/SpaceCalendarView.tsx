import { motion } from "framer-motion";
import {
	Calendar,
	CheckSquare,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Filter,
	Plus,
	Search,
	SlidersHorizontal,
	X,
} from "lucide-react";
import type { DragEvent, ReactNode } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";

export function SpaceCalendarView() {
	const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 11)); // Start at Feb 2026
	const [showUnscheduled, setShowUnscheduled] = useState(true);

	// Task State for Drag & Drop Demo
	const [tasks, setTasks] = useState<
		{ id: string; title: string; date: Date | null; status: string; color: string }[]
	>([
		{
			id: "KAN-1",
			title: "Task 1",
			date: new Date(2026, 1, 13),
			status: "scheduled",
			color: "slate",
		},
		{
			id: "KAN-2",
			title: "Task 2",
			date: new Date(2026, 1, 20),
			status: "scheduled",
			color: "blue",
		},
	]);
	const [explosion, setExplosion] = useState<{ x: number; y: number } | null>(null);

	const prevMonth = () =>
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
	const nextMonth = () =>
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
	const goToToday = () => setCurrentDate(new Date());

	const monthNames = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const currentMonthLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

	const generateCalendarDays = (date: Date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDayOfMonth = new Date(year, month, 1);
		const dayOfWeek = firstDayOfMonth.getDay();
		const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
		const startDate = new Date(year, month, 1 - offset);

		const days = [];
		for (let w = 0; w < 5; w++) {
			// 5 weeks
			for (let d = 0; d < 5; d++) {
				// Mon-Fri
				const current = new Date(startDate);
				current.setDate(startDate.getDate() + w * 7 + d);
				days.push(current);
			}
		}
		return days;
	};

	const calendarDays = generateCalendarDays(currentDate);
	const today = new Date();

	const isSameDate = (d1: Date, d2: Date) =>
		d1.getDate() === d2.getDate() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getFullYear() === d2.getFullYear();

	// Drag & Drop Handlers
	const handleDragStart = (e: DragEvent, taskId: string) => {
		e.dataTransfer.setData("taskId", taskId);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleUnscheduledDrop = (e: DragEvent) => {
		e.preventDefault();
		const taskId = e.dataTransfer.getData("taskId");
		if (taskId) {
			setTasks((prev) =>
				prev.map((t) => (t.id === taskId ? { ...t, status: "unscheduled", date: null } : t)),
			);
			setExplosion({ x: e.clientX, y: e.clientY });
			setTimeout(() => setExplosion(null), 1000);
		}
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	return (
		<div className="flex-1 flex overflow-hidden border-t border-slate-200 animate-[fadeInUp_0.35s_ease-out] relative">
			{explosion && <ParticleExplosion x={explosion.x} y={explosion.y} />}

			<div className="flex-1 flex flex-col bg-white">
				{/* Toolbar */}
				<div className="px-6 py-3 flex items-center justify-between border-b border-slate-200">
					<div className="relative w-64">
						<Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
						<input
							placeholder="Search calendar"
							className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-[#0B6E4F] transition-colors placeholder:text-slate-400"
						/>
					</div>

					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={goToToday}
								className="px-3 py-1.5 bg-white border border-slate-200 rounded-[4px] text-[13px] font-medium text-slate-700 hover:bg-slate-50"
							>
								Today
							</button>
							<div className="flex items-center border border-slate-200 rounded-[4px] bg-white">
								<button
									type="button"
									onClick={prevMonth}
									className="p-1 px-2 hover:bg-slate-50 border-r border-slate-200"
								>
									<ChevronLeft className="w-4 h-4 text-slate-500" />
								</button>
								<span className="px-3 py-1.5 text-[13px] font-bold text-slate-700 min-w-[100px] text-center">
									{currentMonthLabel}
								</span>
								<button
									type="button"
									onClick={nextMonth}
									className="p-1 px-2 hover:bg-slate-50 border-l border-slate-200"
								>
									<ChevronRight className="w-4 h-4 text-slate-500" />
								</button>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<button
								type="button"
								className="px-3 py-1.5 bg-white border border-slate-200 rounded-[4px] text-[13px] font-medium text-slate-700 flex items-center gap-2 hover:bg-slate-50"
							>
								Month <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
							</button>
							<div className="flex items-center border border-slate-200 rounded-[4px] bg-white">
								<button
									type="button"
									onClick={() => setShowUnscheduled(false)}
									className={`p-1.5 border-r border-slate-200 transition-colors ${!showUnscheduled ? "bg-blue-50 text-blue-600" : "hover:bg-slate-50 text-slate-500"}`}
								>
									<Calendar className="w-4 h-4" />
								</button>
								<button
									type="button"
									onClick={() => setShowUnscheduled(true)}
									className={`p-1.5 transition-colors ${showUnscheduled ? "bg-blue-50 text-blue-600" : "hover:bg-slate-50 text-slate-500"}`}
								>
									<SlidersHorizontal className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Grid */}
				<div className="flex-1 overflow-auto bg-white">
					<div className="grid grid-cols-5 border-b border-slate-200 sticky top-0 bg-white z-10">
						{["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
							<div
								key={day}
								className="h-10 flex items-center justify-center text-[11px] font-bold text-slate-500 uppercase border-r border-slate-200 last:border-r-0 bg-slate-50/50"
							>
								{day}
							</div>
						))}
					</div>
					<div className="grid grid-cols-5 auto-rows-[1fr] min-h-[600px] divide-x divide-slate-200 divide-y">
						{calendarDays.map((date, _i) => {
							const isTodayDate = isSameDate(date, today);
							const isCurrentMonth = date.getMonth() === currentDate.getMonth();
							return (
								<CalendarDay
									key={date.toISOString()}
									day={date.getDate().toString()}
									isToday={isTodayDate}
									isCurrentMonth={isCurrentMonth}
								>
									{/* Render Scheduled Tasks */}
									{tasks
										.filter((t) => t.status === "scheduled" && t.date && isSameDate(date, t.date))
										.map((task) => {
											const content = (
												// biome-ignore lint/a11y/noStaticElementInteractions: drag source
												<div
													key={task.id}
													draggable
													onDragStart={(e) => handleDragStart(e, task.id)}
													className={`
                                                    ${task.color === "blue" ? "bg-blue-50 border-blue-200" : "bg-slate-100 border-slate-200"}
                                                    border rounded p-1.5 cursor-move hover:shadow-md transition-all mb-1 shadow-sm opacity-100
                                                `}
												>
													<div
														className={`text-[11px] font-medium ${task.color === "blue" ? "text-blue-800" : "text-slate-700"} flex items-center gap-1.5`}
													>
														<CheckSquare
															className={`w-3 h-3 ${task.color === "blue" ? "text-blue-600" : "text-blue-600"} shrink-0`}
														/>
														<span className="truncate">
															{task.id} {task.title}
														</span>
													</div>
												</div>
											);
											return content;
										})}
								</CalendarDay>
							);
						})}
					</div>
				</div>
			</div>

			{/* Right Sidebar */}
			{showUnscheduled && (
				<div className="w-[320px] bg-white border-l border-slate-200 flex flex-col shrink-0">
					<div className="p-4 border-b border-slate-200 flex items-center justify-between">
						<h3 className="text-[14px] font-bold text-slate-800">Unscheduled work</h3>
						<button
							type="button"
							onClick={() => setShowUnscheduled(false)}
							className="text-slate-400 hover:text-slate-600"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
					<div className="p-4 flex-1 flex flex-col">
						<p className="text-[13px] text-slate-500 mb-4 leading-relaxed">
							Drag each work item onto the calendar to set a due date for the work.
						</p>

						<div className="mb-4 relative">
							<Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
							<input
								placeholder="Search unscheduled items"
								className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-white border border-slate-200 rounded-[4px] outline-none focus:border-[#0B6E4F] transition-colors"
							/>
						</div>

						<div className="flex items-center justify-between text-[12px] font-medium text-slate-500 mb-3">
							<button
								type="button"
								className="flex items-center gap-1 hover:text-slate-800 transition-colors"
							>
								Most recent <ChevronDown className="w-3 h-3" />
							</button>
							<button
								type="button"
								className="flex items-center gap-1 hover:text-slate-800 transition-colors"
							>
								<Filter className="w-3 h-3" /> Filters
							</button>
						</div>

						{/* Unscheduled Drop Zone */}
						<section
							onDragOver={handleDragOver}
							onDrop={handleUnscheduledDrop}
							aria-label="Unscheduled tasks drop zone" // { tasks.length > 0 ? "has items" : "empty" }
							className={`
                                flex-1 flex flex-col bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-2 transition-colors
                                ${tasks.filter((t) => t.status === "unscheduled").length > 0 ? "justify-start border-blue-200 bg-blue-50/20" : "items-center justify-center p-6 text-center"}
                            `}
						>
							{tasks.filter((t) => t.status === "unscheduled").length === 0 ? (
								<>
									<h4 className="text-[14px] font-bold text-slate-700 mb-2">
										All work has been scheduled
									</h4>
									<p className="text-[12px] text-slate-500 leading-relaxed max-w-[200px] mx-auto">
										To remove a work item from the calendar, drag it back into the unscheduled work
										panel
									</p>
								</>
							) : (
								<div className="space-y-2 w-full">
									{tasks
										.filter((t) => t.status === "unscheduled")
										.map((task) => {
											const content = (
												// biome-ignore lint/a11y/noStaticElementInteractions: drag source
												<div
													key={task.id}
													draggable
													onDragStart={(e) => handleDragStart(e, task.id)}
													className="bg-white border border-slate-200 rounded p-3 shadow-sm cursor-move hover:shadow-md transition-all flex items-center justify-between group"
												>
													<div className="flex items-center gap-2">
														<CheckSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
														<span className="text-[13px] font-medium text-slate-700">
															{task.title}
														</span>
													</div>
													<span className="text-[11px] text-slate-400 font-mono">{task.id}</span>
												</div>
											);
											return content;
										})}
									<div className="mt-4 text-center text-[12px] text-slate-400 italic py-4">
										Drop scheduled items here
									</div>
								</div>
							)}
						</section>
					</div>
				</div>
			)}
		</div>
	);
}

function CalendarDay({
	day,
	isToday,
	isCurrentMonth = true,
	children,
}: {
	day: string;
	isToday?: boolean;
	isCurrentMonth?: boolean;
	children?: ReactNode;
}) {
	if (!day) return <div className="p-2 min-h-[80px] bg-slate-50/30" />;
	return (
		<div
			className={`p-2 min-h-[80px] group transition-colors hover:bg-slate-50 ${isToday ? "bg-blue-50/20" : ""} ${!isCurrentMonth ? "bg-slate-50/30 opacity-60" : ""}`}
		>
			<div className="flex items-start justify-between mb-2">
				<span
					className={`text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-[4px] transition-colors ${isToday ? "bg-blue-600 text-white shadow-sm" : isCurrentMonth ? "text-slate-400 group-hover:text-slate-600" : "text-slate-300"}`}
				>
					{day}
				</span>
				<button
					type="button"
					className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1 hover:bg-slate-200 rounded"
				>
					<Plus className="w-3.5 h-3.5" />
				</button>
			</div>
			<div className="flex flex-col gap-1">{children}</div>
		</div>
	);
}

function ParticleExplosion({ x, y }: { x: number; y: number }) {
	const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];
	// Ensure we only render on the client side
	if (typeof document === "undefined") return null;

	return createPortal(
		<div
			className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
			style={{ left: x, top: y, width: 0, height: 0 }}
		>
			{[...Array(20)].map((_, i) => {
				const content = (
					<motion.div
						key={
							// biome-ignore lint/suspicious/noArrayIndexKey: ephemeral animation
							i
						}
						initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
						animate={{
							x: (Math.random() - 0.5) * 200,
							y: (Math.random() - 0.5) * 200,
							scale: [1, 0],
							opacity: [1, 0],
						}}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="absolute w-2 h-2 rounded-full shadow-sm"
						style={{ backgroundColor: colors[i % colors.length] }}
					/>
				);
				return content;
			})}
		</div>,
		document.body,
	);
}
