"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronsLeftRight, MoreHorizontal, Plus, X } from "lucide-react";
import { memo, useState } from "react";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import { SortableTaskCard } from "./TaskCard";

interface Column {
	id: string;
	name: string;
	color: string;
	taskIds: string[];
}

export const BoardColumn = memo(
	({
		column,
		tasks,
		onToggleTask,
		onRename,
		onAddTask,
		onTaskClick,
		onDeleteTask,
		isOverlay,
	}: {
		column: Column;
		tasks: Task[];
		onToggleTask?: (id: string) => void;
		onRename?: (id: string, name: string) => void;
		onAddTask?: (columnId: string, title: string) => void;
		onTaskClick?: (task: Task) => void;
		onDeleteTask?: (id: string) => void;
		isOverlay?: boolean;
	}) => {
		const [isEditing, setIsEditing] = useState(false);
		const [editName, setEditName] = useState(column.name);
		const [isAddingTask, setIsAddingTask] = useState(false);
		const [newTaskTitle, setNewTaskTitle] = useState("");
		const [isCollapsed, setIsCollapsed] = useState(false);

		const handleAddTask = () => {
			if (newTaskTitle.trim()) {
				onAddTask?.(column.id, newTaskTitle.trim());
				setNewTaskTitle("");
				setIsAddingTask(false);
			}
		};

		const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
			id: column.id,
			data: { type: "Column" },
		});

		const style = {
			transform: CSS.Translate.toString(transform),
			transition,
		};

		const handleRename = () => {
			if (editName.trim() && editName !== column.name) {
				onRename?.(column.id, editName);
			}
			setIsEditing(false);
		};

		return (
			<div
				ref={setNodeRef}
				style={{
					...style,
					backgroundColor: column.color,
					width: isCollapsed ? "48px" : "320px",
					minWidth: isCollapsed ? "48px" : "320px",
					height: "fit-content",
				}}
				className={cn(
					"rounded-[24px] overflow-hidden flex flex-col shadow-2xl border border-white/5 transition-all duration-300 ease-in-out",
					isDragging && !isOverlay && "opacity-30",
					isOverlay && "opacity-80 cursor-grabbing",
					isCollapsed && "flex-none self-start",
				)}
			>
				{isCollapsed ? (
					<div
						{...attributes}
						{...listeners}
						className="flex flex-col items-center py-8 cursor-grab active:cursor-grabbing gap-6"
						onClick={(_e) => {
							if (!isDragging) setIsCollapsed(false);
						}}
					>
						<div
							className="pointer-events-none flex items-center gap-2 mb-8"
							style={{ color: `color-mix(in srgb, white, ${column.color} 20%)` }}
						>
							<ChevronsLeftRight className="w-4 h-4 rotate-90" />
						</div>
						<span
							className="text-[13px] font-black uppercase tracking-[0.2em] whitespace-nowrap origin-center"
							style={{
								writingMode: "vertical-lr",
								color: `color-mix(in srgb, white, ${column.color} 20%)`,
							}}
						>
							{column.name}
						</span>
					</div>
				) : (
					<>
						<div
							{...attributes}
							{...listeners}
							className="px-5 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing group"
						>
							<div className="flex items-center gap-3">
								{isEditing ? (
									<input
										className="bg-black/20 border-none outline-none rounded px-2 py-1 text-white font-bold text-[15px] w-full"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										onBlur={handleRename}
										onKeyDown={(e) => e.key === "Enter" && handleRename()}
									/>
								) : (
									<span
										className="text-[14px] font-bold text-white/90"
										onDoubleClick={() => setIsEditing(true)}
									>
										{column.name}
									</span>
								)}
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										setIsCollapsed(true);
									}}
									className="p-1 hover:bg-black/20 rounded transition-colors"
								>
									<ChevronsLeftRight className="w-4 h-4 opacity-60 hover:opacity-100" />
								</button>
								<MoreHorizontal className="w-4 h-4 opacity-60" />
							</div>
						</div>
						<div className="p-2.5 space-y-2.5 flex-1 min-h-[100px] overflow-y-auto overflow-x-hidden">
							<SortableContext
								items={tasks.map((t) => `board-${t.id}`)}
								strategy={verticalListSortingStrategy}
							>
								{tasks.map((task) => (
									<SortableTaskCard
										key={task.id}
										task={task}
										idPrefix="board"
										onToggle={onToggleTask}
										onClick={() => onTaskClick?.(task)}
										onDelete={onDeleteTask}
									/>
								))}
							</SortableContext>

							{isAddingTask ? (
								<div className="mt-1 animate-in fade-in duration-200">
									<div className="bg-[#22272B] rounded-lg shadow-sm border border-transparent px-3 py-2.5 mb-2">
										<input
											className="w-full bg-transparent border-none outline-none text-white/90 text-[14px] placeholder:text-white/40"
											placeholder="Enter a title for this card..."
											value={newTaskTitle}
											onChange={(e) => setNewTaskTitle(e.target.value)}
											onBlur={() => {
												if (!newTaskTitle.trim()) setIsAddingTask(false);
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") handleAddTask();
												if (e.key === "Escape") {
													setNewTaskTitle("");
													setIsAddingTask(false);
												}
											}}
											autoFocus
										/>
									</div>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={handleAddTask}
											className="px-3 py-1.5 bg-[#579DFF] hover:bg-[#85B8FF] text-[#1D2125] rounded-[3px] text-[14px] font-semibold transition-colors"
										>
											Add card
										</button>
										<button
											type="button"
											onClick={() => setIsAddingTask(false)}
											className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
										>
											<X className="w-5 h-5" />
										</button>
									</div>
								</div>
							) : (
								<button
									type="button"
									onClick={() => setIsAddingTask(true)}
									className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/20 text-[14px] font-medium text-white/70 w-full transition-colors mt-1 group"
								>
									<Plus className="w-4 h-4 transition-transform group-hover:bg-white/10 rounded" /> Add a card
								</button>
							)}
						</div>
					</>
				)}
			</div>
		);
	},
);
