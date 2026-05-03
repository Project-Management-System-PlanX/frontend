"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Calendar as CalendarIcon, ListFilter, MoreHorizontal } from "lucide-react";
import type { Task } from "@/lib/types/models";
import { SortableTaskCard } from "./TaskCard";
import { UI } from "./types";

export function PlannerPanel({
	tasks,
	onToggleTask,
	onTaskClick,
	onDeleteTask,
}: {
	tasks: Task[];
	onToggleTask: (id: string) => void;
	onTaskClick: (task: Task) => void;
	onDeleteTask?: (id: string) => void;
}) {
	return (
		<div className="h-full flex flex-col" style={{ backgroundColor: UI.planner.bg }}>
			<div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
				<div className="flex items-center gap-3">
					<CalendarIcon className="w-5.5 h-5.5 text-white/90" />
					<span className="text-[18px] font-bold text-white">Planner</span>
				</div>
				<div className="flex items-center gap-3">
					<ListFilter className="w-5.5 h-5.5 text-white/60 hover:text-white cursor-pointer transition-colors" />
					<MoreHorizontal className="w-5.5 h-5.5 text-white/60 hover:text-white cursor-pointer transition-colors" />
				</div>
			</div>
			<div className="flex-1 overflow-auto custom-scrollbar p-4">
				<div className="flex flex-col space-y-4 min-w-fit">
					<SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
						{tasks.map((task) => (
							<SortableTaskCard
								key={task.id}
								task={task}
								onToggle={onToggleTask}
								onClick={() => onTaskClick(task)}
								onDelete={onDeleteTask}
							/>
						))}
					</SortableContext>

					{tasks.length === 0 && (
						<div className="flex flex-col items-center py-10 text-center opacity-40">
							<div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 shadow-inner">
								<CalendarIcon className="w-8 h-8" style={{ color: UI.planner.accent }} />
							</div>
							<h1 className="text-[20px] font-extrabold text-white mb-2 tracking-tight">
								Schedule Tasks
							</h1>
							<p
								className="text-[13px] max-w-[200px] leading-relaxed"
								style={{ color: UI.planner.muted }}
							>
								Drag tasks here to schedule them.
							</p>
						</div>
					)}

					<div className="w-full mt-auto space-y-6 pt-8 border-t border-white/5 text-left">
						{[9, 10, 11, 12, 1].map((h) => (
							<div key={h} className="flex gap-4 items-center">
								<span
									className="text-[11px] w-10 font-black uppercase tracking-widest"
									style={{ color: UI.planner.muted }}
								>
									{h}
									{h >= 9 && h < 12 ? "am" : "pm"}
								</span>
								<div className="h-[1.5px] flex-1 bg-white/5 rounded-full" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
