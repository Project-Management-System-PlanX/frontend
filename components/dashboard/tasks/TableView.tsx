"use client";

import { format } from "date-fns";
import { CheckCircle2, ChevronDown, ChevronUp, Circle } from "lucide-react";
import { useState } from "react";
import {
	TaskDatePickerPopover,
	TaskLabelPopover,
	TaskMemberPopover,
} from "@/components/modals/TaskDetailModal";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import { useWorkspaceMembersCached } from "./TaskCard";
import type { Column } from "./types";

type SortKey = "title" | "list" | "labels" | "members" | "dueDate";
type SortOrder = "asc" | "desc";

interface SortConfig {
	key: SortKey;
	order: SortOrder;
}

export function TableView({
	columns,
	columnOrder,
	tasks,
	onToggleTask,
	onTaskClick,
	onUpdateTask,
	onAddColumn,
	onAddTask,
}: {
	columns: Record<string, Column>;
	columnOrder: string[];
	tasks: Record<string, Task>;
	onToggleTask: (id: string) => void;
	onTaskClick: (task: Task) => void;
	onUpdateTask?: (id: string, data: Partial<Task>) => void;
	onAddColumn?: (name: string) => void;
	onAddTask?: (columnId: string, title: string) => void;
}) {
	const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "title", order: "asc" });

	// Flatten all tasks with their column info
	const allTasks = columnOrder
		.flatMap((colId) =>
			columns[colId].taskIds.map((taskId) => ({
				...tasks[taskId],
				columnName: columns[colId].name,
			})),
		)
		.filter(Boolean);

	const sortedTasks = [...allTasks].sort((a, b) => {
		const { key, order } = sortConfig;
		let comparison = 0;

		switch (key) {
			case "title":
				comparison = (a.title || "").localeCompare(b.title || "");
				break;
			case "list":
				comparison = (a.columnName || "").localeCompare(b.columnName || "");
				break;
			case "labels":
				comparison = (a.labels?.length || 0) - (b.labels?.length || 0);
				break;
			case "members":
				comparison = (a.assignees?.length || 0) - (b.assignees?.length || 0);
				break;
			case "dueDate":
				comparison = new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
				break;
		}

		return order === "asc" ? comparison : -comparison;
	});

	const handleSort = (key: SortKey) => {
		setSortConfig((prev) => ({
			key,
			order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
		}));
	};

	const SortIcon = ({ column }: { column: SortKey }) => {
		if (sortConfig.key !== column) return <ChevronDown className="w-3.5 h-3.5 opacity-20" />;
		return sortConfig.order === "asc" ? (
			<ChevronUp className="w-3.5 h-3.5 text-blue-400" />
		) : (
			<ChevronDown className="w-3.5 h-3.5 text-blue-400" />
		);
	};

	return (
		<div className="flex-1 overflow-auto custom-scrollbar p-5">
			<div className="w-full min-w-[800px] bg-[#3d3d54] rounded-[24px] border border-[#505060] shadow-2xl overflow-hidden">
				<div className="p-8">
					{/* Table Header - Sticky */}
					<div className="sticky top-0 z-10 bg-[#3d3d54] flex items-center px-4 py-4 border-b border-[#505060] text-[12px] font-black text-white/80 uppercase tracking-[0.1em]">
						<div
							className="flex-1 flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
							onClick={() => handleSort("title")}
						>
							Card
							<SortIcon column="title" />
						</div>
						<div
							className="w-[200px] flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
							onClick={() => handleSort("list")}
						>
							List
							<SortIcon column="list" />
						</div>
						<div
							className="w-[150px] flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
							onClick={() => handleSort("labels")}
						>
							Labels
							<SortIcon column="labels" />
						</div>
						<div
							className="w-[150px] flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
							onClick={() => handleSort("members")}
						>
							Members
							<SortIcon column="members" />
						</div>
						<div
							className="w-[150px] flex items-center justify-between cursor-pointer hover:text-white transition-colors"
							onClick={() => handleSort("dueDate")}
						>
							Due date
							<SortIcon column="dueDate" />
						</div>
					</div>

					{/* Table Body */}
					<div className="divide-y divide-white/10 relative">
						{sortedTasks.map((task) => (
							<TableRow
								key={task.id}
								task={task}
								onToggleTask={onToggleTask}
								onTaskClick={onTaskClick}
								onUpdateTask={onUpdateTask}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function TableRow({
	task,
	onToggleTask,
	onTaskClick,
	onUpdateTask,
}: {
	task: Task & { columnName?: string };
	onToggleTask: (id: string) => void;
	onTaskClick: (task: Task) => void;
	onUpdateTask?: (id: string, data: Partial<Task>) => void;
}) {
	const workspaceMembers = useWorkspaceMembersCached();
	const [labelOpen, setLabelOpen] = useState(false);
	const [memberOpen, setMemberOpen] = useState(false);
	const [dateOpen, setDateOpen] = useState(false);

	const isCompleted = task.resolution === "DONE" || (task.status?.isDone ?? false);

	return (
		<div className="flex items-center px-4 py-5 hover:bg-[#505060]/40 transition-colors cursor-pointer group bg-[#3d3d54]">
			<div className="flex-1 flex items-center gap-4" onClick={() => onTaskClick(task)}>
				<div
					className={cn(
						"cursor-pointer transition-all duration-300 transform",
						isCompleted
							? "opacity-100 scale-100"
							: "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100",
					)}
					onClick={(e) => {
						e.stopPropagation();
						onToggleTask(task.id);
					}}
				>
					{isCompleted ? (
						<CheckCircle2 className="w-5.5 h-5.5 text-white" />
					) : (
						<Circle className="w-5.5 h-5.5 text-white/40 hover:text-white" />
					)}
				</div>
				<span
					className={cn(
						"text-[16px] font-bold text-white tracking-tight transition-all",
						isCompleted && "opacity-60 line-through",
					)}
				>
					{task.title}
				</span>
			</div>

			<div
				className="w-[200px] text-[15px] font-bold text-white/80"
				onClick={() => onTaskClick(task)}
			>
				{task.columnName}
			</div>

			{/* Labels Column */}
			<div className="w-[150px] flex items-center justify-start">
				<TaskLabelPopover
					task={task}
					isOpen={labelOpen}
					setIsOpen={setLabelOpen}
					onUpdateTask={onUpdateTask}
					trigger={
						<div className="flex items-center gap-1 cursor-pointer min-h-[24px] w-full group/cell">
							{task.labels && task.labels.length > 0 ? (
								<div className="flex flex-wrap gap-1">
									{task.labels.map((l) => (
										<div
											key={l.id}
											className="h-4 w-10 rounded"
											style={{ backgroundColor: l.color }}
											title={l.name}
										/>
									))}
								</div>
							) : (
								<span className="text-[20px] text-white/20 font-black group-hover/cell:text-white/40 transition-colors">
									•
								</span>
							)}
						</div>
					}
				/>
			</div>

			{/* Members Column */}
			<div className="w-[150px] flex items-center justify-start">
				<TaskMemberPopover
					task={task}
					workspaceMembers={workspaceMembers}
					isOpen={memberOpen}
					setIsOpen={setMemberOpen}
					onUpdateTask={onUpdateTask}
					trigger={
						<div className="flex items-center gap-1 cursor-pointer min-h-[24px] w-full group/cell">
							{task.assignees && task.assignees.length > 0 ? (
								<div className="flex -space-x-1.5">
									{task.assignees.map((a) => {
										const initial = a.user?.firstName?.[0] || a.user?.email?.[0] || "U";
										return (
											<div
												key={a.userId}
												className="w-5 h-5 rounded-full bg-[#e85d04] flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm border border-[#3d3d54] uppercase"
												title={a.user?.firstName || a.user?.email || a.userId}
											>
												{initial}
											</div>
										);
									})}
								</div>
							) : task.assigneeId ? (
									<div className="w-5 h-5 rounded-full bg-[#e85d04] flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm border border-[#3d3d54] uppercase">
									{/* Not showing exact initials since we don't have the user object here, but it signals it's assigned */}
									U
								</div>
							) : (
								<span className="text-[20px] text-white/20 font-black group-hover/cell:text-white/40 transition-colors">
									•
								</span>
							)}
						</div>
					}
				/>
			</div>

			{/* Due Date Column */}
			<div className="w-[150px] flex items-center justify-start">
				<TaskDatePickerPopover
					task={task}
					isOpen={dateOpen}
					setIsOpen={setDateOpen}
					onUpdateTask={onUpdateTask}
					trigger={
						<div className="flex items-center gap-1 cursor-pointer min-h-[24px] w-full group/cell">
							{task.dueDate ? (
								<span className="text-[13px] text-white/80 font-medium whitespace-nowrap">
									{format(new Date(task.dueDate), "MMM d")}
								</span>
							) : (
								<span className="text-[20px] text-white/20 font-black group-hover/cell:text-white/40 transition-colors">
									•
								</span>
							)}
						</div>
					}
				/>
			</div>
		</div>
	);
}
