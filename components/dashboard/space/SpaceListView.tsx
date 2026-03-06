"use client";

import { CheckSquare, ChevronDown, ChevronRight, LayoutList, Plus, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTasks } from "@/hooks/api/use-tasks";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Task } from "@/lib/types/models";
import { useSpace } from "@/hooks/api/use-spaces";

export function SpaceListView({ spaceId }: { spaceId: string }) {
	const { token } = useSupabaseAuth();
	const { data: space } = useSpace(spaceId, token || undefined);
	const { data: tasks, isLoading } = useTasks(spaceId, undefined, token || undefined);

	return (
		<ScrollArea className="flex-1">
			<div className="px-6 pb-10 animate-[fadeInUp_0.35s_ease-out]">
				<div className="border border-slate-200 rounded-lg overflow-hidden">
					{/* Table Header */}
					<div className="grid grid-cols-[auto_1fr_130px_130px_100px_120px_120px_160px_40px] gap-4 items-center bg-slate-50/80 px-4 py-2 border-b border-slate-200">
						<div className="w-4 h-4 border border-slate-300 rounded bg-white" />
						<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pl-8">
							Work
						</span>
						<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
							Assignee
						</span>
						<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
							Reporter
						</span>
						<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
							Priority
						</span>
						<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
							Status
						</span>
						<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
							Resolution
						</span>
						<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
							Created
						</span>
						<span className="w-4" /> {/* Settings */}
					</div>

					{/* Rows */}
					<div className="divide-y divide-slate-100 bg-white">
						{isLoading ? (
							<div className="p-4 text-center text-sm text-slate-400">Loading tasks...</div>
						) : tasks && tasks.length > 0 ? (
							tasks.map((task) => (
								<TaskRow
									key={task.id}
									task={task}
									prefix={space?.prefix || ""}
									isExpanded={false}
								/>
							))
						) : (
							<div className="p-4 text-center text-sm text-slate-400">No tasks in this space</div>
						)}
					</div>
				</div>

				{/* Create Button Footer */}
				<button
					type="button"
					className="mt-2 border border-slate-200 rounded-md p-2 flex items-center gap-2 hover:bg-slate-50 cursor-pointer transition-colors w-full"
				>
					<Plus className="w-4 h-4 text-slate-400" />
					<span className="text-[13px] text-slate-500">Create</span>
				</button>
			</div>
		</ScrollArea>
	);
}

function TaskRow({
	task,
	prefix,
	isExpanded,
}: {
	task: Task;
	prefix: string;
	isExpanded: boolean;
}) {
	const displayId = task.taskNumber ? `${prefix}-${task.taskNumber}` : task.id;

	// Convert standard dates
	const createdDate = new Date(task.createdAt).toLocaleString(undefined, {
		month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit"
	});

	return (
		<div className="grid grid-cols-[auto_1fr_130px_130px_100px_120px_120px_160px_40px] gap-4 items-center px-4 py-2.5 hover:bg-slate-50 transition-colors group">
			{/* biome-ignore lint/a11y/useSemanticElements: custom checkbox style */}
			<button
				type="button"
				role="checkbox"
				aria-checked={task.resolution === "DONE"}
				className={`w-4 h-4 border rounded cursor-pointer transition-colors ${task.resolution === "DONE" ? "bg-[#0B6E4F] border-[#0B6E4F]" : "border-slate-300 bg-white hover:border-[#0B6E4F]"}`}
			/>

			<div className="flex items-center gap-3 min-w-0">
				<button
					type="button"
					className={`text-slate-400 hover:text-slate-600 transition-colors ${isExpanded ? "rotate-90" : ""}`}
				>
					<ChevronRight className="w-4 h-4" />
				</button>
				<div className="flex items-center gap-2 min-w-0">
					<div className="w-5 h-5 bg-blue-100 rounded-sm flex items-center justify-center shrink-0">
						<CheckSquare className="w-3 h-3 text-blue-600" />
					</div>
					<button
						type="button"
						className="text-[13px] text-slate-500 font-medium hover:underline cursor-pointer"
					>
						{displayId}
					</button>
					<span className="text-[13px] text-slate-900 font-normal truncate">{task.title}</span>
				</div>
			</div>

			<div className="flex items-center gap-2">
				{task.assigneeId ? (
					<div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
						{task.assigneeId.substring(0, 2).toUpperCase()}
					</div>
				) : (
					<div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
						<User className="w-3 h-3" />
					</div>
				)}
				<span className="text-[13px] text-slate-600">{task.assigneeId ? "Assigned" : "Unassigned"}</span>
			</div>

			<div className="flex items-center gap-2">
				<div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
					<span className="text-[10px] font-bold">R</span>
				</div>
				<span className="text-[13px] text-slate-600 truncate">{task.reporterId}</span>
			</div>

			<div className="flex items-center gap-2">
				{task.priority !== "NONE" ? (
					<div className="flex items-center gap-1.5">
						<div className="flex flex-col gap-[2px]">
							<div className={`w-3 h-[2px] ${task.priority === "CRITICAL" || task.priority === "HIGH" ? "bg-red-500" : "bg-orange-400"}`} />
							<div className={`w-3 h-[2px] ${task.priority === "CRITICAL" ? "bg-red-500" : "bg-orange-400"}`} />
						</div>
						<span className="text-[13px] text-slate-600 capitalize">{task.priority.toLowerCase()}</span>
					</div>
				) : (
					<span className="text-[13px] text-slate-400">None</span>
				)}
			</div>

			<div>
				<span
					className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${task.status?.isDone ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
				>
					{task.status?.name || "Status"}
					{task.status?.isDone && <ChevronDown className="w-3 h-3 inline-block ml-1" />}
				</span>
				{!task.status?.isDone && <ChevronDown className="w-3 h-3 text-slate-400 inline-block ml-1" />}
			</div>

			<span className="text-[13px] text-slate-600 capitalize">{task.resolution.toLowerCase().replace("_", " ")}</span>
			<span className="text-[13px] text-slate-600">{createdDate}</span>

			<button
				type="button"
				className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded"
			>
				<LayoutList className="w-4 h-4 text-slate-500" />
			</button>
		</div>
	);
}
