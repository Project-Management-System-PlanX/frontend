"use client";

import confetti from "canvas-confetti";
import {
	AlertCircle,
	Calendar,
	Clock,
	MessageSquare,
	MoreHorizontal,
	Plus,
	User,
} from "lucide-react";
import type { DragEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useSpace } from "@/hooks/api/use-spaces";
import { useCreateTask, useMoveTask, useTasks } from "@/hooks/api/use-tasks";
import { useMemberLookup } from "@/hooks/use-member-lookup";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Task, TaskStatus } from "@/lib/types/models";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
	CRITICAL: { label: "Critical", color: "text-red-700", bg: "bg-red-50 border-red-200" },
	HIGH: { label: "High", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
	MEDIUM: { label: "Medium", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
	LOW: { label: "Low", color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
	NONE: { label: "", color: "", bg: "" },
};

export function SpaceBoardView({ spaceId }: { spaceId: string }) {
	const { token } = useSupabaseAuth();

	const { data: space, isLoading: isSpaceLoading } = useSpace(spaceId, token || undefined);
	const { data: serverTasks } = useTasks(spaceId, undefined, token || undefined);
	const { mutateAsync: createTask } = useCreateTask(token || undefined);
	const { mutateAsync: moveTask } = useMoveTask(token || undefined);

	const [tasks, setTasks] = useState<Task[]>([]);
	const [isCreating, setIsCreating] = useState<string | null>(null);
	const [newTitle, setNewTitle] = useState("");
	const inputRef = useRef<HTMLTextAreaElement>(null);

	// Sync local tasks with server
	useEffect(() => {
		if (serverTasks) {
			setTasks(serverTasks);
		}
	}, [serverTasks]);

	useEffect(() => {
		if (isCreating && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isCreating]);

	const columns = space?.statuses || [];

	const handleCreateTask = async (statusId: string) => {
		if (!newTitle.trim()) {
			setIsCreating(null);
			return;
		}

		const title = newTitle;
		setNewTitle("");
		setIsCreating(null);

		// Optimistic update
		const tempId = `temp-${Date.now()}`;
		const newTask: Task = {
			id: tempId,
			spaceId,
			statusId,
			title,
			priority: "NONE",
			workType: "TASK",
			taskNumber: 0,
			reporterId: "me", // Placeholder
			resolution: "UNRESOLVED",
			position: 0,
			flagged: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setTasks((prev) => [...prev, newTask]);

		try {
			await createTask({
				spaceId,
				statusId,
				title,
			});
		} catch (error) {
			console.error("Failed to create task", error);
			// Rollback on error handled mostly by invalidation if we refetch, but a strict rollback would filter tempId
			setTasks((prev) => prev.filter((t) => t.id !== tempId));
		}
	};

	const handleKeyDown = (e: KeyboardEvent, statusId: string) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleCreateTask(statusId);
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

	const triggerCelebration = () => {
		const count = 200;
		const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

		function fire(particleRatio: number, opts: confetti.Options) {
			confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
		}

		fire(0.25, {
			spread: 26,
			startVelocity: 55,
			colors: ["#0B6E4F", "#F59E0B"],
			shapes: ["circle"],
		});
		fire(0.2, { spread: 60, colors: ["#3B82F6", "#EF4444"], shapes: ["square"] });
		fire(0.35, {
			spread: 100,
			decay: 0.91,
			scalar: 0.8,
			colors: ["#8B5CF6", "#10B981"],
			shapes: ["star"],
		});
		fire(0.1, {
			spread: 120,
			startVelocity: 25,
			decay: 0.92,
			scalar: 1.2,
			colors: ["#F472B6"],
			shapes: ["circle"],
		});
		fire(0.1, { spread: 120, startVelocity: 45, shapes: ["circle"] });
	};

	const handleDrop = async (e: DragEvent, targetStatus: TaskStatus) => {
		e.preventDefault();
		const taskId = e.dataTransfer.getData("taskId");
		if (!taskId || taskId.startsWith("temp-")) return;

		const task = tasks.find((t) => t.id === taskId);
		if (task && task.statusId !== targetStatus.id) {
			// Trigger celebration if moving to a 'Done' column
			if (targetStatus.isDone && !columns.find((c) => c.id === task.statusId)?.isDone) {
				triggerCelebration();
			}

			// Optimistic UI update
			setTasks((prev) =>
				prev.map((t) => (t.id === taskId ? { ...t, statusId: targetStatus.id } : t)),
			);

			// Backend update
			try {
				await moveTask({ id: taskId, data: { statusId: targetStatus.id, position: tasks.length } });
			} catch (error) {
				console.error("Failed to move task", error);
				// Revert on error
				setTasks((prev) =>
					prev.map((t) => (t.id === taskId ? { ...t, statusId: task.statusId } : t)),
				);
			}
		}
	};

	const handleDragOver = (e: DragEvent) => e.preventDefault();
	const getColumnTasks = (statusId: string) => tasks.filter((t) => t.statusId === statusId);

	if (isSpaceLoading) {
		return <div className="p-6 text-slate-400">Loading board...</div>;
	}

	return (
		<div
			className="flex-1 overflow-x-auto bg-slate-50/50 animate-[fadeInUp_0.3s_ease-out]"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			<div className="p-6 flex gap-5 min-h-full min-w-max">
				{columns.map((col: TaskStatus) => {
					const colTasks = getColumnTasks(col.id);
					return (
						<ul
							key={col.id}
							className="w-[300px] flex flex-col shrink-0 list-none p-0 m-0"
							aria-label={`${col.name} tasks`}
							onDrop={(e) => handleDrop(e, col)}
							onDragOver={handleDragOver}
						>
							<div className="flex items-center justify-between mb-4 px-1">
								<div className="flex items-center gap-2.5">
									<div
										className="w-2.5 h-2.5 rounded-full"
										style={{ backgroundColor: col.color }}
									/>
									<span className="text-[13px] font-bold text-slate-700">{col.name}</span>
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

							<div className="h-[3px] rounded-full mb-3" style={{ backgroundColor: col.color }} />

							<div className="flex flex-col gap-2.5 flex-1 min-h-[80px]">
								{colTasks.map((task) => (
									<TaskCard
										key={task.id}
										task={task}
										isDone={col.isDone}
										prefix={space?.prefix || ""}
										onDragStart={handleDragStart}
										onDragEnd={handleDragEnd}
									/>
								))}

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
			</div>
		</div>
	);
}

function TaskCard({
	task,
	isDone,
	prefix,
	onDragStart,
	onDragEnd,
}: {
	task: Task;
	isDone: boolean;
	prefix: string;
	onDragStart: (e: DragEvent, id: string) => void;
	onDragEnd: (e: DragEvent) => void;
}) {
	const { getMember } = useMemberLookup();
	const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NONE;

	const displayId = task.taskNumber ? `${prefix}-${task.taskNumber}` : task.id;

	return (
		<div
			draggable
			onDragStart={(e) => onDragStart(e, task.id)}
			onDragEnd={onDragEnd}
			className={`group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${isDone ? "opacity-75" : ""}`}
		>
			<div className="p-3.5">
				{((task.labels && task.labels.length > 0) || task.priority !== "NONE") && (
					<div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
						{task.labels?.map((label) => (
							<span
								key={label.id}
								className="text-[10px] font-semibold px-2 py-[2px] rounded-full text-white"
								style={{ backgroundColor: label.color }}
							>
								{label.name}
							</span>
						))}
						{task.priority !== "NONE" && (
							<span
								className={`text-[10px] font-semibold px-2 py-[2px] rounded-full border ${pri.bg} ${pri.color}`}
							>
								{pri.label}
							</span>
						)}
					</div>
				)}

				<p
					className={`text-[13px] font-medium leading-snug mb-3 ${isDone ? "line-through text-slate-400" : "text-slate-800"}`}
				>
					{task.title}
				</p>

				<div className="flex items-center justify-between mt-2">
					<div className="flex items-center gap-2.5">
						<span className="text-[10px] font-mono text-slate-400 font-bold">{displayId}</span>

						{task.dueDate && (
							<div className="flex items-center gap-1 text-slate-400">
								<Clock className="w-3 h-3" />
								<span className="text-[10px] font-medium">
									{new Date(task.dueDate).toLocaleDateString()}
								</span>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						{task.comments && task.comments.length > 0 && (
							<div className="flex items-center gap-0.5 text-slate-400">
								<MessageSquare className="w-3 h-3" />
								<span className="text-[10px] font-medium">{task.comments.length}</span>
							</div>
						)}

						{task.assigneeId ? (
							<div
								title={getMember(task.assigneeId).name}
								className={`w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold`}
							>
								{getMember(task.assigneeId).initials}
							</div>
						) : (
							<div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center text-[9px] font-bold">
								<User className="w-3 h-3" />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
