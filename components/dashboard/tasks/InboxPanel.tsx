"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
	ChevronRight,
	Inbox as InboxIcon,
	ListFilter,
	MoreHorizontal,
	Plus,
	Settings,
} from "lucide-react";
import { useState } from "react";
import type { Task } from "@/lib/types/models";
import { SortableTaskCard } from "./TaskCard";
import { UI } from "./types";

export function InboxPanel({
	tasks,
	onToggleTask,
	onAddTask,
	onTaskClick,
	onDeleteTask,
}: {
	tasks: Task[];
	onToggleTask: (id: string) => void;
	onAddTask: (title: string) => void;
	onTaskClick: (task: Task) => void;
	onDeleteTask?: (id: string) => void;
}) {
	const [isAdding, setIsAdding] = useState(false);
	const [newTaskTitle, setNewTaskTitle] = useState("");

	const handleAdd = () => {
		if (newTaskTitle.trim()) {
			onAddTask(newTaskTitle.trim());
			setNewTaskTitle("");
			setIsAdding(false);
		}
	};

	return (
		<div className="h-full flex flex-col" style={{ background: UI.inbox.bg }}>
			<div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
				<div className="flex items-center gap-2">
					<InboxIcon className="w-5.5 h-5.5 text-white/90" />
					<span className="text-[18px] font-bold text-white">Inbox</span>
				</div>
				<div className="flex items-center gap-3">
					<ListFilter className="w-5.5 h-5.5 text-white/60 hover:text-white cursor-pointer transition-colors" />
					<MoreHorizontal className="w-5.5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
				</div>
			</div>
			<div className="p-4 flex-1 overflow-auto custom-scrollbar">
				<div className="space-y-3 min-w-fit">
					{isAdding ? (
						<div className="rounded-xl py-2 px-3 shadow-2xl bg-black/40 border border-white/10 mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
							<input
								autoFocus
								className="w-full bg-transparent border-none outline-none py-1.5 text-white font-bold text-[16px] placeholder:text-white/20"
								placeholder="What's on your mind?"
								value={newTaskTitle}
								onChange={(e) => setNewTaskTitle(e.target.value)}
								onBlur={() => {
									if (!newTaskTitle.trim()) setIsAdding(false);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleAdd();
									if (e.key === "Escape") {
										setNewTaskTitle("");
										setIsAdding(false);
									}
								}}
							/>
							<div className="flex items-center gap-2 mt-1 pb-1">
								<button
									type="button"
									onClick={handleAdd}
									className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-[12px] font-bold transition-colors"
								>
									Add Task
								</button>
								<button
									type="button"
									onClick={() => setIsAdding(false)}
									className="text-white/40 hover:text-white transition-colors"
								>
									<Plus className="w-4 h-4 rotate-45" />
								</button>
							</div>
						</div>
					) : (
						<div
							onClick={() => setIsAdding(true)}
							className="rounded-xl py-2.5 px-4.5 shadow-2xl bg-black/20 transition-all hover:bg-black/30 cursor-text mb-4 group border border-transparent hover:border-white/5"
						>
							<span className="text-[16px] text-white/40 flex items-center gap-2">
								<Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
								Add new task
							</span>
						</div>
					)}
					<SortableContext
						items={tasks.map((t) => `inbox-${t.id}`)}
						strategy={verticalListSortingStrategy}
					>
						{tasks.map((task) => (
							<SortableTaskCard
								key={task.id}
								task={task}
								idPrefix="inbox"
								onToggle={onToggleTask}
								onClick={() => onTaskClick(task)}
								onDelete={onDeleteTask}
							/>
						))}
					</SortableContext>
					{tasks.length === 0 && (
						<div className="flex-1 flex items-center justify-center h-40 text-white/20 italic text-[14px]">
							Empty Inbox
						</div>
					)}
				</div>
			</div>
			<div className="p-5 mt-auto">
				<div className="rounded-[18px] p-4 bg-black/20 flex items-center justify-between border border-white/5 hover:bg-black/30 transition-colors cursor-pointer">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
							<Settings className="w-4 h-4 text-white" />
						</div>
						<p className="text-[14px] font-bold text-white">Consolidate workflow</p>
					</div>
					<ChevronRight className="w-4 h-4 text-white/40" />
				</div>
			</div>
		</div>
	);
}
