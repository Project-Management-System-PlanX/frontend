"use client";

import { CheckCircle2, ChevronDown, Circle, Plus } from "lucide-react";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import type { Column } from "./types";

export function TableView({
	columns,
	columnOrder,
	tasks,
	onToggleTask,
	onTaskClick,
}: {
	columns: Record<string, Column>;
	columnOrder: string[];
	tasks: Record<string, Task>;
	onToggleTask: (id: string) => void;
	onTaskClick: (task: Task) => void;
}) {
	// Flatten all tasks with their column info
	const allTasks = columnOrder
		.flatMap((colId) =>
			columns[colId].taskIds.map((taskId) => ({
				...tasks[taskId],
				columnName: columns[colId].name,
			})),
		)
		.filter(Boolean);

	return (
		<div className="flex-1 overflow-auto custom-scrollbar p-5">
			<div className="w-full min-w-[800px] bg-[#141414] rounded-[24px] border border-white/5 shadow-2xl overflow-hidden">
				<div className="p-8">
					{/* Table Header */}
					<div className="flex items-center px-4 py-4 border-b border-white/20 text-[12px] font-black text-white/80 uppercase tracking-[0.1em]">
						<div className="flex-1">Card</div>
						<div className="w-[200px]">List</div>
						<div className="w-[150px]">Labels</div>
						<div className="w-[150px]">Members</div>
						<div className="w-[150px] flex items-center justify-between">
							Due date
							<ChevronDown className="w-4 h-4" />
						</div>
					</div>

					{/* Table Body */}
					<div className="divide-y divide-white/10">
						{allTasks.map((task) => (
							<div
								key={task.id}
								onClick={() => onTaskClick(task)}
								className="flex items-center px-4 py-5 hover:bg-white/5 transition-colors cursor-pointer group"
							>
								<div className="flex-1 flex items-center gap-4">
									<div
										className={cn(
											"cursor-pointer transition-all duration-300 transform",
											task.status?.isDone
												? "opacity-100 scale-100"
												: "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100",
										)}
										onClick={(e) => {
											e.stopPropagation();
											onToggleTask(task.id);
										}}
									>
										{task.status?.isDone ? (
											<CheckCircle2 className="w-5.5 h-5.5 text-white" />
										) : (
											<Circle className="w-5.5 h-5.5 text-white/40 hover:text-white" />
										)}
									</div>
									<span
										className={cn(
											"text-[16px] font-bold text-white tracking-tight",
											task.status?.isDone && "opacity-60 line-through",
										)}
									>
										{task.title}
									</span>
								</div>
								<div className="w-[200px] text-[15px] font-bold text-white/80">
									{task.columnName}
								</div>
								<div className="w-[150px] text-[20px] text-white/40 font-black flex items-center justify-start">
									•
								</div>
								<div className="w-[150px] text-[20px] text-white/40 font-black flex items-center justify-start">
									•
								</div>
								<div className="w-[150px] text-[20px] text-white/40 font-black flex items-center justify-start">
									•
								</div>
							</div>
						))}
					</div>

					{/* Add Button */}
					<button className="mt-8 flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-[15px] transition-all shadow-xl active:scale-95">
						<Plus className="w-5 h-5" />
						Add
					</button>
				</div>
			</div>
		</div>
	);
}
