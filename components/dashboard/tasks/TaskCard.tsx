"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, Trash2 } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { workspaceService } from "@/lib/api/services/workspaces";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";

let cachedMembersPromise: Promise<any[]> | null = null;
let cachedWorkspaceId: string | null = null;
let cachedToken: string | null = null;

export function useWorkspaceMembersCached() {
	const { token } = useSupabaseAuth();
	const { activeWorkspaceId } = useWorkspaceStore();
	const [members, setMembers] = useState<any[]>([]);

	useEffect(() => {
		if (!activeWorkspaceId || !token) return;

		if (cachedWorkspaceId !== activeWorkspaceId || cachedToken !== token || !cachedMembersPromise) {
			cachedWorkspaceId = activeWorkspaceId;
			cachedToken = token;
			cachedMembersPromise = workspaceService.listMembers(activeWorkspaceId, token);
		}

		cachedMembersPromise
			.then((data) => {
				if (Array.isArray(data)) {
					setMembers(data);
				}
			})
			.catch(() => {
				// Reset cache on error so it can retry
				cachedMembersPromise = null;
				cachedWorkspaceId = null;
				cachedToken = null;
			});
	}, [activeWorkspaceId, token]);

	return members;
}

// ─── TaskCard ──────────────────────────────────────────────────────────────
// Pure display card. All interactive areas (checkbox, delete) stop BOTH
// click AND pointerDown propagation so DnD listeners on the parent wrapper
// never intercept those events.

export const TaskCard = memo(
	({
		task,
		isOverlay,
		onToggle,
		onDelete,
		onClick,
		hideAssignee,
	}: {
		task: Task;
		isOverlay?: boolean;
		onToggle?: (id: string) => void;
		onDelete?: (id: string) => void;
		onClick?: () => void;
		hideAssignee?: boolean;
	}) => {
		const isCompleted = task.resolution === "DONE" || (task.status?.isDone ?? false);
		const members = useWorkspaceMembersCached();
		const assignee = members.find((m) => m.userId === task.assigneeId);
		const assigneeInitial = assignee?.user?.firstName?.[0] || assignee?.user?.email?.[0] || "U";

		const handleCheckbox = useCallback(
			(e: React.MouseEvent) => {
				e.stopPropagation();
				e.preventDefault();
				onToggle?.(task.id);
			},
			[task.id, onToggle],
		);

		const handleDelete = useCallback(
			(e: React.MouseEvent) => {
				e.stopPropagation();
				e.preventDefault();
				onDelete?.(task.id);
			},
			[task.id, onDelete],
		);

		// Stop pointer events from checkbox/delete reaching DnD listeners
		const stopPointer = useCallback((e: React.PointerEvent) => {
			e.stopPropagation();
		}, []);

		return (
			<div
				className={cn(
					"rounded-xl shadow-xl border border-white/10 group transition-all flex flex-col relative overflow-hidden",
					isOverlay ? "bg-[#1F2933]" : "bg-[#1F2933] hover:bg-white/[0.04]",
					isCompleted && "opacity-60",
				)}
				onClick={onClick}
			>
				{/* Cover color bar */}
				{task.coverColor && (
					<div
						className="w-full h-8 shrink-0 rounded-t-xl"
						style={{ backgroundColor: task.coverColor }}
					/>
				)}
				<div className="flex items-center gap-3 py-2.5 px-3">
					{/* ── Checkbox ─────────────────────────── */}
					<div
						role="checkbox"
						aria-checked={isCompleted}
						aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
						tabIndex={0}
						className="cursor-pointer shrink-0 flex items-center justify-center w-5 h-5 mt-1"
						onPointerDown={stopPointer}
						onClick={handleCheckbox}
						onKeyDown={(e) => {
							if (e.key === " " || e.key === "Enter") {
								e.preventDefault();
								e.stopPropagation();
								onToggle?.(task.id);
							}
						}}
					>
						{isCompleted ? (
							<CheckCircle2 className="w-5 h-5 text-emerald-500 transition-all duration-200" />
						) : (
							<Circle className="w-5 h-5 text-white/30 hover:text-white/70 transition-all duration-200" />
						)}
					</div>

					{/* ── Title + Subtasks ─────────────────── */}
					<div className="flex flex-col flex-1 min-w-0">
						{/* Labels */}
						{task.labels && task.labels.length > 0 && (
							<div className="flex flex-wrap gap-1 mb-1.5">
								{task.labels.slice(0, 1).map((label) => (
									<div
										key={label.id}
										className="h-2 w-10 rounded-full"
										style={{ backgroundColor: label.color }}
										title={label.name}
									/>
								))}
							</div>
						)}

						<p
							className={cn(
								"text-[15px] font-semibold text-white truncate transition-all duration-200",
								isCompleted && "line-through text-white/40",
							)}
						>
							{task.title}
						</p>

						{/* Meta Info */}
						<div className="flex items-center justify-between mt-2.5 pr-1 min-h-[14px]">
							<div className="flex items-center gap-3 text-white/50">
								{task.dueDate && (
									<div className="flex items-center gap-1.5 text-[12px]">
										<Clock className="w-3.5 h-3.5" />
										<span>{format(new Date(task.dueDate), "MMM d")}</span>
									</div>
								)}
							</div>

							{!hideAssignee && (
								<div className="flex -space-x-1.5">
									{task.assignees && task.assignees.length > 0 ? (
										task.assignees.map((a) => {
											const initial = a.user?.firstName?.[0] || a.user?.email?.[0] || "U";
											return (
												<div
													key={a.userId}
													className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center text-[11px] font-bold text-black shrink-0 shadow-sm border border-[#1F2933] uppercase"
													title={a.user?.firstName || a.user?.email || a.userId}
												>
													{initial}
												</div>
											);
										})
									) : task.assigneeId ? (
										<div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center text-[11px] font-bold text-black shrink-0 shadow-sm border border-[#1F2933] uppercase">
											{assigneeInitial}
										</div>
									) : null}
								</div>
							)}
						</div>

						{task.children && task.children.length > 0 && (
							<div className="mt-1.5 space-y-1 ml-1">
								{task.children.map((subtask) => {
									const subDone =
										(subtask as any).resolution === "DONE" ||
										((subtask as any).status?.isDone ?? false);
									return (
										<div
											key={subtask.id}
											className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-white/5 transition-colors"
											onClick={(e) => e.stopPropagation()}
											onPointerDown={(e) => e.stopPropagation()}
										>
											<div className="shrink-0">
												{subDone ? (
													<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
												) : (
													<Circle className="w-3.5 h-3.5 text-white/20" />
												)}
											</div>
											<span
												className={cn(
													"text-[12px] text-white/50 truncate",
													subDone && "line-through text-white/30",
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

					{/* ── Delete ───────────────────────────── */}
					<div
						aria-label="Delete task"
						className="opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 shrink-0"
						onPointerDown={stopPointer}
						onClick={handleDelete}
					>
						<Trash2 className="w-4 h-4" />
					</div>
				</div>
			</div>
		);
	},
	// Custom memo comparator — only re-render if the task data or handlers change
	(prev, next) =>
		prev.task.id === next.task.id &&
		prev.task.resolution === next.task.resolution &&
		prev.task.status?.isDone === next.task.status?.isDone &&
		prev.task.title === next.task.title &&
		prev.task.coverColor === next.task.coverColor &&
		prev.task.labels?.length === next.task.labels?.length &&
		prev.task.assignees?.length === next.task.assignees?.length &&
		prev.isOverlay === next.isOverlay &&
		prev.onToggle === next.onToggle &&
		prev.onDelete === next.onDelete &&
		prev.onClick === next.onClick &&
		prev.hideAssignee === next.hideAssignee,
);

TaskCard.displayName = "TaskCard";

// ─── SortableTaskCard ──────────────────────────────────────────────────────
// DnD wrapper. Listeners are on the wrapper div but interactive children
// stop pointer propagation so DnD never fires on checkbox/delete clicks.

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
				"cursor-grab active:cursor-grabbing transition-opacity duration-200 touch-none select-none",
				isDragging ? "opacity-0" : "opacity-100",
			)}
		>
			{isDragging ? (
				<div className="w-full h-[54px] rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02]" />
			) : (
				<TaskCard
					task={task}
					onToggle={onToggle}
					onDelete={onDelete}
					onClick={onClick}
					hideAssignee={idPrefix === "inbox"}
				/>
			)}
		</div>
	);
}
