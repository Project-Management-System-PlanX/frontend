"use client";

import {
	AlertCircle,
	Calendar,
	Clock,
	MessageSquare,
	MoreHorizontal,
	Paperclip,
	Plus,
	User,
} from "lucide-react";
import type { DragEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════ */

interface Task {
	id: string;
	title: string;
	columnId: string;
	priority: "critical" | "high" | "medium" | "low" | "none";
	assignee: string;
	avatar: string;
	avatarColor: string;
	dueDate?: string;
	tags?: string[];
	comments?: number;
	attachments?: number;
	progress?: number;
}

const INITIAL_TASKS: Task[] = [
	{
		id: "KAN-12",
		title: "Research competitor onboarding flows",
		columnId: "todo",
		priority: "medium",
		assignee: "Sarah Chen",
		avatar: "SC",
		avatarColor: "bg-pink-500",
		dueDate: "Feb 18",
		tags: ["Research"],
		comments: 3,
	},
	{
		id: "KAN-15",
		title: "Write API documentation for v2 endpoints",
		columnId: "todo",
		priority: "high",
		assignee: "Alex Morgan",
		avatar: "AM",
		avatarColor: "bg-blue-500",
		dueDate: "Feb 20",
		tags: ["Docs", "API"],
		attachments: 2,
	},
	{
		id: "KAN-18",
		title: "Set up E2E test pipeline",
		columnId: "todo",
		priority: "low",
		assignee: "James Lee",
		avatar: "JL",
		avatarColor: "bg-teal-500",
		tags: ["DevOps"],
	},
	{
		id: "KAN-7",
		title: "Implement notification preferences UI",
		columnId: "inprogress",
		priority: "high",
		assignee: "Ravikrishna J",
		avatar: "RJ",
		avatarColor: "bg-orange-500",
		dueDate: "Feb 14",
		tags: ["Frontend", "UI"],
		comments: 5,
		progress: 60,
	},
	{
		id: "KAN-9",
		title: "Optimize database query for dashboard analytics",
		columnId: "inprogress",
		priority: "critical",
		assignee: "Priya Patel",
		avatar: "PP",
		avatarColor: "bg-violet-500",
		dueDate: "Feb 13",
		tags: ["Backend", "Perf"],
		comments: 8,
		attachments: 1,
		progress: 35,
	},
	{
		id: "KAN-11",
		title: "Design email template system",
		columnId: "inprogress",
		priority: "medium",
		assignee: "Sarah Chen",
		avatar: "SC",
		avatarColor: "bg-pink-500",
		tags: ["Design"],
		progress: 80,
	},
	{
		id: "KAN-3",
		title: "Review PR #247 — auth middleware refactor",
		columnId: "review",
		priority: "high",
		assignee: "Alex Morgan",
		avatar: "AM",
		avatarColor: "bg-blue-500",
		tags: ["Review"],
		comments: 12,
	},
	{
		id: "KAN-5",
		title: "QA sign-off on billing module",
		columnId: "review",
		priority: "critical",
		assignee: "Priya Patel",
		avatar: "PP",
		avatarColor: "bg-violet-500",
		dueDate: "Feb 12",
		tags: ["QA"],
		attachments: 3,
	},
	{
		id: "KAN-1",
		title: "Landing page redesign with new brand colors",
		columnId: "done",
		priority: "high",
		assignee: "Sarah Chen",
		avatar: "SC",
		avatarColor: "bg-pink-500",
		tags: ["Design", "UI"],
		comments: 6,
	},
	{
		id: "KAN-2",
		title: "Set up CI/CD pipeline for staging",
		columnId: "done",
		priority: "medium",
		assignee: "James Lee",
		avatar: "JL",
		avatarColor: "bg-teal-500",
		tags: ["DevOps"],
	},
	{
		id: "KAN-4",
		title: "User authentication flow — SSO integration",
		columnId: "done",
		priority: "critical",
		assignee: "Ravikrishna J",
		avatar: "RJ",
		avatarColor: "bg-orange-500",
		tags: ["Auth", "Backend"],
		comments: 14,
		attachments: 4,
	},
];

const COLUMNS = [
	{ id: "todo", title: "To Do", color: "#94A3B8", dotColor: "bg-slate-400" },
	{ id: "inprogress", title: "In Progress", color: "#3B82F6", dotColor: "bg-blue-500" },
	{ id: "review", title: "In Review", color: "#F59E0B", dotColor: "bg-amber-500" },
	{ id: "done", title: "Done", color: "#0B6E4F", dotColor: "bg-[#0B6E4F]" },
];

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
	critical: { label: "Critical", color: "text-red-700", bg: "bg-red-50 border-red-200" },
	high: { label: "High", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
	medium: { label: "Medium", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
	low: { label: "Low", color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
	none: { label: "", color: "", bg: "" },
};

/* ═══════════════════════════════════════════════
   Main Board
   ═══════════════════════════════════════════════ */

export function SpaceBoardView() {
	const [tasks, setTasks] = useState(INITIAL_TASKS);
	const [isCreating, setIsCreating] = useState<string | null>(null);
	const [newTitle, setNewTitle] = useState("");
	const inputRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (isCreating && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isCreating]);

	const handleCreateTask = (columnId: string) => {
		if (!newTitle.trim()) {
			setIsCreating(null);
			return;
		}
		const newTask: Task = {
			id: `KAN-${Math.floor(Math.random() * 900) + 100}`,
			title: newTitle,
			columnId,
			priority: "none",
			assignee: "Unassigned",
			avatar: "?",
			avatarColor: "bg-slate-400",
		};
		setTasks((prev) => [...prev, newTask]);
		setNewTitle("");
		setIsCreating(null);
	};

	const handleKeyDown = (e: KeyboardEvent, columnId: string) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleCreateTask(columnId);
		} else if (e.key === "Escape") {
			setIsCreating(null);
			setNewTitle("");
		}
	};

	const handleDragStart = (e: DragEvent, taskId: string) => {
		e.dataTransfer.setData("taskId", taskId);
		if (e.currentTarget instanceof HTMLElement) {
			e.currentTarget.style.opacity = "0.4";
		}
	};

	const handleDragEnd = (e: DragEvent) => {
		if (e.currentTarget instanceof HTMLElement) {
			e.currentTarget.style.opacity = "1";
		}
	};

	const handleDrop = (e: DragEvent, targetColumnId: string) => {
		e.preventDefault();
		const taskId = e.dataTransfer.getData("taskId");
		if (!taskId) return;
		setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, columnId: targetColumnId } : t)));
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	const getColumnTasks = (colId: string) => tasks.filter((t) => t.columnId === colId);

	return (
		<div
			className="flex-1 overflow-x-auto bg-slate-50/50 animate-[fadeInUp_0.3s_ease-out]"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			<div className="p-6 flex gap-5 min-h-full min-w-max">
				{COLUMNS.map((col) => {
					const colTasks = getColumnTasks(col.id);
					return (
						<ul
							key={col.id}
							className="w-[300px] flex flex-col shrink-0 list-none p-0 m-0"
							aria-label={`${col.title} tasks`}
							onDrop={(e) => handleDrop(e, col.id)}
							onDragOver={handleDragOver}
						>
							{/* Column Header */}
							<div className="flex items-center justify-between mb-4 px-1">
								<div className="flex items-center gap-2.5">
									<div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
									<span className="text-[13px] font-bold text-slate-700">{col.title}</span>
									<span className="px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums bg-slate-100 text-slate-500">
										{colTasks.length}
									</span>
								</div>
								<div className="flex items-center gap-1">
									<button
										type="button"
										onClick={() => setIsCreating(col.id)}
										className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
									>
										<Plus className="w-4 h-4" />
									</button>
									<button
										type="button"
										className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
									>
										<MoreHorizontal className="w-4 h-4" />
									</button>
								</div>
							</div>

							{/* Column accent line */}
							<div className="h-[3px] rounded-full mb-3" style={{ backgroundColor: col.color }} />

							{/* Cards */}
							<div className="flex flex-col gap-2.5 flex-1 min-h-[80px]">
								{colTasks.map((task) => (
									<TaskCard
										key={task.id}
										task={task}
										isDone={col.id === "done"}
										onDragStart={handleDragStart}
										onDragEnd={handleDragEnd}
									/>
								))}

								{/* Create new task inline */}
								{isCreating === col.id && (
									<div className="bg-white p-3 rounded-xl border-2 border-[#0B6E4F] shadow-md animate-[fadeIn_0.15s_ease-out]">
										<textarea
											ref={inputRef}
											value={newTitle}
											onChange={(e) => setNewTitle(e.target.value)}
											onKeyDown={(e) => handleKeyDown(e, col.id)}
											onBlur={() => {
												if (!newTitle.trim()) setIsCreating(null);
											}}
											placeholder="What needs to be done?"
											className="w-full text-[13px] text-slate-800 placeholder:text-slate-400 resize-none outline-none bg-transparent min-h-[44px]"
										/>
										<div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
											<div className="flex items-center gap-1.5">
												<button
													type="button"
													className="p-1 rounded hover:bg-slate-100 text-slate-400"
												>
													<User className="w-3.5 h-3.5" />
												</button>
												<button
													type="button"
													className="p-1 rounded hover:bg-slate-100 text-slate-400"
												>
													<Calendar className="w-3.5 h-3.5" />
												</button>
												<button
													type="button"
													className="p-1 rounded hover:bg-slate-100 text-slate-400"
												>
													<AlertCircle className="w-3.5 h-3.5" />
												</button>
											</div>
											<div className="flex items-center gap-1.5">
												<button
													type="button"
													onClick={() => {
														setIsCreating(null);
														setNewTitle("");
													}}
													className="px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100"
												>
													Cancel
												</button>
												<button
													type="button"
													onClick={() => handleCreateTask(col.id)}
													className="px-3 py-1 text-[11px] font-semibold text-white bg-[#0B6E4F] rounded-md hover:bg-[#095C42] transition-colors"
												>
													Add
												</button>
											</div>
										</div>
									</div>
								)}
							</div>
						</ul>
					);
				})}

				{/* Add Column button */}
				<button
					type="button"
					className="w-[300px] shrink-0 h-10 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
				>
					<Plus className="w-4 h-4" />
					<span className="text-[13px] font-medium">Add Column</span>
				</button>
			</div>
		</div>
	);
}

/* ═══════════════════════════════════════════════
   Task Card
   ═══════════════════════════════════════════════ */

function TaskCard({
	task,
	isDone,
	onDragStart,
	onDragEnd,
}: {
	task: Task;
	isDone: boolean;
	onDragStart: (e: DragEvent, id: string) => void;
	onDragEnd: (e: DragEvent) => void;
}) {
	const pri = PRIORITY_CONFIG[task.priority];

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: drag source
		<div
			draggable
			onDragStart={(e) => onDragStart(e, task.id)}
			onDragEnd={onDragEnd}
			className={`group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${isDone ? "opacity-75" : ""}`}
		>
			{/* Card Body */}
			<div className="p-3.5">
				{/* Tags Row */}
				{task.tags && task.tags.length > 0 && (
					<div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
						{task.tags.map((tag) => (
							<span
								key={tag}
								className="text-[10px] font-semibold px-2 py-[2px] rounded-full bg-slate-100 text-slate-500"
							>
								{tag}
							</span>
						))}
						{task.priority !== "none" && (
							<span
								className={`text-[10px] font-semibold px-2 py-[2px] rounded-full border ${pri.bg} ${pri.color}`}
							>
								{pri.label}
							</span>
						)}
					</div>
				)}

				{/* Title */}
				<p
					className={`text-[13px] font-medium leading-snug mb-3 ${isDone ? "line-through text-slate-400" : "text-slate-800"}`}
				>
					{task.title}
				</p>

				{/* Progress Bar (if present) */}
				{task.progress !== undefined && task.progress > 0 && (
					<div className="mb-3">
						<div className="flex items-center justify-between mb-1">
							<span className="text-[10px] text-slate-400 font-medium">Progress</span>
							<span className="text-[10px] font-bold text-slate-500">{task.progress}%</span>
						</div>
						<div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
							<div
								className="h-full rounded-full bg-gradient-to-r from-[#0B6E4F] to-emerald-400 transition-all"
								style={{ width: `${task.progress}%` }}
							/>
						</div>
					</div>
				)}

				{/* Footer */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						{/* ID */}
						<span className="text-[10px] font-mono text-slate-400">{task.id}</span>

						{/* Due Date */}
						{task.dueDate && (
							<div className="flex items-center gap-1 text-slate-400">
								<Clock className="w-3 h-3" />
								<span className="text-[10px] font-medium">{task.dueDate}</span>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						{/* Comments */}
						{task.comments && (
							<div className="flex items-center gap-0.5 text-slate-400">
								<MessageSquare className="w-3 h-3" />
								<span className="text-[10px] font-medium">{task.comments}</span>
							</div>
						)}

						{/* Attachments */}
						{task.attachments && (
							<div className="flex items-center gap-0.5 text-slate-400">
								<Paperclip className="w-3 h-3" />
								<span className="text-[10px] font-medium">{task.attachments}</span>
							</div>
						)}

						{/* Assignee Avatar */}
						<div
							className={`w-6 h-6 rounded-full ${task.avatarColor} text-white flex items-center justify-center text-[9px] font-bold`}
							title={task.assignee}
						>
							{task.avatar}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
