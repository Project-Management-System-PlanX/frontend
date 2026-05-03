"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { memo } from "react";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";

export const TaskCard = memo(
	({
		task,
		isOverlay,
		onToggle,
		onDelete,
	}: {
		task: Task;
		isOverlay?: boolean;
		onToggle?: (id: string) => void;
		onDelete?: (id: string) => void;
	}) => {
		const isCompleted = task.status?.isDone || false;

		return (
			<div
				className={cn(
					"rounded-xl py-2.5 px-4.5 shadow-xl border border-white/10 group transition-all flex items-center gap-3 relative overflow-hidden",
					isOverlay ? "bg-[#1F2933]" : "bg-[#1F2933] hover:bg-white/[0.03]",
				)}
			>
				<div
					className={cn(
						"cursor-pointer transition-all duration-300 transform shrink-0",
						isCompleted
							? "opacity-100 scale-100"
							: "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100",
					)}
					onClick={(e) => {
						e.stopPropagation();
						onToggle?.(task.id);
					}}
				>
					{isCompleted ? (
						<CheckCircle2 className="w-5 h-5 text-green-500" />
					) : (
						<Circle className="w-5 h-5 text-white/40 hover:text-white/80" />
					)}
				</div>
				<div className="flex flex-col flex-1 min-w-0">
					<p
						className={cn(
							"text-[16px] font-bold text-white truncate transition-all duration-300",
							!isCompleted && "group-hover:translate-x-1",
							isCompleted && "translate-x-0",
						)}
					>
						{task.title}
					</p>

					{/* Subtasks List */}
					{task.children && task.children.length > 0 && (
						<div className="mt-2 space-y-1.5 ml-1">
							{task.children.map((subtask) => {
								const subIsCompleted = (subtask as any).status?.isDone || false;
								return (
									<div
										key={subtask.id}
										className="flex items-center gap-2 group/subtask px-1 py-0.5 rounded hover:bg-white/5 transition-colors"
										onClick={(e) => {
											e.stopPropagation();
											// Subtask toggle logic would go here if we had the handler
										}}
									>
										<div
											className={cn(
												"transition-all duration-300 transform shrink-0",
												subIsCompleted
													? "opacity-100 scale-100"
													: "opacity-0 scale-75 group-hover/subtask:opacity-100 group-hover/subtask:scale-100",
											)}
										>
											{subIsCompleted ? (
												<CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
											) : (
												<Circle className="w-3.5 h-3.5 text-white/20 hover:text-white/40" />
											)}
										</div>
										<span
											className={cn(
												"text-[13px] text-white/50 truncate transition-colors",
												subIsCompleted ? "text-white/80" : "group-hover/subtask:text-white/70",
											)}
										>
											{subtask.title}
										</span>
									</div>
								);
							})}
						</div>
					)}
				</div>

				<div
					className="opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 cursor-pointer p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500"
					onClick={(e) => {
						e.stopPropagation();
						onDelete?.(task.id);
					}}
				>
					<Trash2 className="w-4.5 h-4.5" />
				</div>
			</div>
		);
	},
);

export function SortableTaskCard({
	task,
	onToggle,
	onClick,
	onDelete,
	idPrefix = "",
}: {
	task: Task;
	onToggle?: (id: string) => void;
	onClick?: () => void;
	onDelete?: (id: string) => void;
	idPrefix?: string;
}) {
	const dndId = idPrefix ? `${idPrefix}-${task.id}` : task.id;
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: dndId,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={cn(
				"cursor-grab active:cursor-grabbing transition-all duration-200",
				isDragging ? "opacity-100 z-0" : "opacity-100",
			)}
			onClick={onClick}
		>
			{isDragging ? (
				<div className="w-full h-[54px] rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02]" />
			) : (
				<TaskCard task={task} onToggle={onToggle} onDelete={onDelete} />
			)}
		</div>
	);
}
