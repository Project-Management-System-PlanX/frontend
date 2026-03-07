"use client";

import { ChevronDown, ChevronRight, MoreHorizontal, User } from "lucide-react";
import { useState } from "react";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpace } from "@/hooks/api/use-spaces";
import { useTasks } from "@/hooks/api/use-tasks";
import { useMemberLookup } from "@/hooks/use-member-lookup";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Task } from "@/lib/types/models";

const COL_GRID =
	"grid-cols-[auto_minmax(260px,1fr)_120px_120px_120px_80px_110px_100px_150px_150px_110px_36px]";

export function SpaceListView({ spaceId }: { spaceId: string }) {
	const { token, user } = useSupabaseAuth();
	const { data: space } = useSpace(spaceId, token || undefined);
	const { data: tasks, isLoading } = useTasks(spaceId, { assignee: user?.id }, token || undefined);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

	const selectedTask = tasks?.find((t) => t.id === selectedTaskId) || null;

	return (
		<>
			<ScrollArea className="flex-1">
				<div className="pb-10 animate-[fadeInUp_0.35s_ease-out]">
					<div className="border-y border-slate-200 overflow-hidden">
						{/* ── Table Header ── */}
						<div
							className={`grid ${COL_GRID} gap-0 items-center bg-[#f8f8f8] border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider select-none`}
						>
							<div className="px-3 py-2 flex items-center justify-center">
								<div className="w-4 h-4 border border-slate-300 rounded bg-white" />
							</div>
							<div className="px-3 py-2 pl-8">Work</div>
							<div className="px-3 py-2">Assignee</div>
							<div className="px-3 py-2">Reporter</div>
							<div className="px-3 py-2">Team</div>
							<div className="px-3 py-2">Priority</div>
							<div className="px-3 py-2">Status</div>
							<div className="px-3 py-2">Resolution</div>
							<div className="px-3 py-2">Created</div>
							<div className="px-3 py-2">Updated</div>
							<div className="px-3 py-2">Due date</div>
							<div className="px-1 py-2" />
						</div>

						{/* ── Rows ── */}
						<div className="divide-y divide-slate-100 bg-white">
							{isLoading ? (
								<div className="p-4 text-center text-sm text-slate-400">Loading tasks...</div>
							) : tasks && tasks.length > 0 ? (
								tasks.map((task) => (
									<TaskRow
										key={task.id}
										task={task}
										prefix={space?.prefix || ""}
										onClick={() => setSelectedTaskId(task.id)}
									/>
								))
							) : (
								<div className="p-4 text-center text-sm text-slate-400">No tasks in this space</div>
							)}
						</div>
					</div>
				</div>
			</ScrollArea>

			<TaskDetailModal
				task={selectedTask}
				isOpen={!!selectedTaskId}
				onClose={() => setSelectedTaskId(null)}
				spaceName={space?.name}
			/>
		</>
	);
}

function TaskRow({ task, prefix, onClick }: { task: Task; prefix: string; onClick: () => void }) {
	const { getMember } = useMemberLookup();
	const displayId = task.taskNumber ? `${prefix}-${task.taskNumber}` : task.id;

	const fmtDate = (iso: string) =>
		new Date(iso).toLocaleString(undefined, {
			month: "short",
			day: "2-digit",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});

	const createdDate = fmtDate(task.createdAt);
	const updatedDate = fmtDate(task.updatedAt);
	const dueDate = task.dueDate
		? new Date(task.dueDate).toLocaleDateString(undefined, {
				month: "short",
				day: "2-digit",
				year: "numeric",
			})
		: "—";

	// Status badge colours
	const statusName = task.status?.name || "Status";
	const statusColor = (() => {
		const s = statusName.toLowerCase();
		if (task.status?.isDone || s.includes("done") || s.includes("complete"))
			return "bg-green-100 text-green-700";
		if (s.includes("review")) return "bg-amber-100 text-amber-700";
		if (s.includes("progress")) return "bg-blue-100 text-blue-700";
		return "bg-slate-100 text-slate-700";
	})();

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: Row click handler
		<div
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
			className={`grid ${COL_GRID} w-full text-left gap-0 items-center hover:bg-slate-50/80 transition-colors group cursor-pointer border-none bg-transparent p-0 m-0`}
		>
			{/* Checkbox */}
			<div className="px-3 py-2.5 flex items-center justify-center">
				{/* biome-ignore lint/a11y/useSemanticElements: custom checkbox style */}
				<button
					type="button"
					role="checkbox"
					aria-checked={task.resolution === "DONE"}
					className={`w-4 h-4 border rounded cursor-pointer transition-colors ${task.resolution === "DONE" ? "bg-[#0B6E4F] border-[#0B6E4F]" : "border-slate-300 bg-white hover:border-[#0B6E4F]"}`}
				/>
			</div>

			{/* Work (Type icon + Key + Title) */}
			<div className="px-3 py-2.5 flex items-center gap-2 min-w-0">
				<button
					type="button"
					className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
				>
					<ChevronRight className="w-4 h-4" />
				</button>

				{/* Type icon (Epic purple, Task blue, etc.) */}
				<div className="w-5 h-5 bg-purple-600 rounded-sm flex items-center justify-center shrink-0">
					<svg
						className="w-3 h-3 text-white"
						fill="currentColor"
						viewBox="0 0 16 16"
						aria-hidden="true"
					>
						<path d="M13 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1zM3 1a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V3a2 2 0 00-2-2H3z" />
						<path d="M5 8h6v1H5V8z" />
					</svg>
				</div>

				<span className="text-[12px] text-slate-500 font-medium whitespace-nowrap shrink-0">
					{displayId}
				</span>
				<span className="text-[13px] text-slate-900 truncate">{task.title}</span>
			</div>

			{/* Assignee */}
			<div className="px-3 py-2.5 flex items-center gap-2 min-w-0">
				{task.assigneeId ? (
					<>
						<div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
							{getMember(task.assigneeId).initials}
						</div>
						<span className="text-[13px] text-slate-600 truncate">
							{getMember(task.assigneeId).name}
						</span>
					</>
				) : (
					<>
						<div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
							<User className="w-3 h-3" />
						</div>
						<span className="text-[13px] text-slate-500">Unassigned</span>
					</>
				)}
			</div>

			{/* Reporter */}
			<div className="px-3 py-2.5 flex items-center gap-2 min-w-0">
				<div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0">
					<span className="text-[10px] font-bold">{getMember(task.reporterId).initials}</span>
				</div>
				<span className="text-[13px] text-slate-600 truncate">
					{getMember(task.reporterId).name}
				</span>
			</div>

			{/* Team */}
			<div className="px-3 py-2.5 flex items-center gap-2 min-w-0">
				{task.team ? (
					<span className="text-[13px] text-slate-600 truncate font-medium">{task.team.name}</span>
				) : (
					<span className="text-[13px] text-slate-400 truncate">—</span>
				)}
			</div>

			{/* Priority */}
			<div className="px-3 py-2.5">
				{task.priority !== "NONE" ? (
					<span className="text-[13px] text-slate-600 capitalize">
						{task.priority.toLowerCase()}
					</span>
				) : (
					<span className="text-[13px] text-slate-400">None</span>
				)}
			</div>

			{/* Status */}
			<div className="px-3 py-2.5">
				<span
					className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded capitalize whitespace-nowrap ${statusColor}`}
				>
					{statusName}
					<ChevronDown className="w-3 h-3 opacity-60" />
				</span>
			</div>

			{/* Resolution */}
			<div className="px-3 py-2.5">
				<span className="text-[13px] text-slate-600 capitalize">
					{task.resolution.toLowerCase().replace("_", " ")}
				</span>
			</div>

			{/* Created */}
			<div className="px-3 py-2.5">
				<span className="text-[12px] text-slate-500 whitespace-nowrap">{createdDate}</span>
			</div>

			{/* Updated */}
			<div className="px-3 py-2.5">
				<span className="text-[12px] text-slate-500 whitespace-nowrap">{updatedDate}</span>
			</div>

			{/* Due Date */}
			<div className="px-3 py-2.5">
				<span className="text-[12px] text-slate-600 whitespace-nowrap">{dueDate}</span>
			</div>

			{/* Actions */}
			<div className="px-1 py-2.5">
				<button
					type="button"
					className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded"
				>
					<MoreHorizontal className="w-4 h-4 text-slate-400" />
				</button>
			</div>
		</div>
	);
}
