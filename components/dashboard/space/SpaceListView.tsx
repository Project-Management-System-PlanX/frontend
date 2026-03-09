"use client";

import {
	Check,
	ChevronDown,
	ChevronRight,
	MoreHorizontal,
	Search,
	Trash2,
	User,
} from "lucide-react";
import { useState } from "react";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpace } from "@/hooks/api/use-spaces";
import { useDeleteTask, useTasks, useUpdateTask } from "@/hooks/api/use-tasks";
import { useMemberLookup } from "@/hooks/use-member-lookup";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import type { Task } from "@/lib/types/models";

/* ── Priority colour config ── */
const PRIORITY_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
	CRITICAL: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
	HIGH: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
	MEDIUM: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
	LOW: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
	NONE: { bg: "bg-slate-50", text: "text-slate-400", dot: "bg-slate-300" },
};

const COL_GRID =
	"grid-cols-[auto_minmax(260px,1fr)_120px_120px_120px_80px_110px_100px_150px_150px_110px_36px]";

export function SpaceListView({ spaceId }: { spaceId: string }) {
	const { token } = useSupabaseAuth();
	const { data: space } = useSpace(spaceId, token || undefined);
	const { data: tasks, isLoading } = useTasks(spaceId, undefined, token || undefined);
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
	const { token } = useSupabaseAuth();
	const { members } = useWorkspaceMembers();
	const updateTask = useUpdateTask(token || undefined);
	const deleteTask = useDeleteTask(token || undefined);
	const [assigneeOpen, setAssigneeOpen] = useState(false);
	const [memberSearch, setMemberSearch] = useState("");
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [actionsOpen, setActionsOpen] = useState(false);
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
			{/* biome-ignore lint/a11y/noStaticElementInteractions: Stops click propagation from the row */}
			<div
				className="px-3 py-2.5 flex items-center gap-2 min-w-0"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="flex items-center gap-2 min-w-0 rounded-md px-1 py-0.5 -mx-1 hover:bg-slate-100 transition-colors w-full text-left"
						>
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
									<span className="text-[13px] text-slate-400">Assign</span>
								</>
							)}
						</button>
					</PopoverTrigger>
					<PopoverContent
						className="w-56 p-0"
						align="start"
						sideOffset={4}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-2 border-b border-slate-100">
							<div className="flex items-center gap-2 rounded-md bg-slate-50 px-2 py-1.5">
								<Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
								<input
									type="text"
									placeholder="Search members…"
									className="text-[12px] bg-transparent outline-none w-full text-slate-700 placeholder:text-slate-400"
									value={memberSearch}
									onChange={(e) => setMemberSearch(e.target.value)}
								/>
							</div>
						</div>
						<div className="max-h-48 overflow-y-auto py-1">
							{/* Unassign option */}
							{task.assigneeId && (
								<button
									type="button"
									className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-slate-50 transition-colors"
									onClick={() => {
										updateTask.mutate({ id: task.id, data: { assigneeId: undefined } });
										setAssigneeOpen(false);
										setMemberSearch("");
									}}
								>
									<div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
										<User className="w-3 h-3" />
									</div>
									<span className="text-[12px] text-slate-500">Unassign</span>
								</button>
							)}
							{members
								.filter((m) => {
									if (!memberSearch) return true;
									const name =
										`${m.profile?.firstName ?? ""} ${m.profile?.lastName ?? ""}`.toLowerCase();
									return name.includes(memberSearch.toLowerCase());
								})
								.map((m) => {
									const isSelected = m.userId === task.assigneeId;
									const initials =
										`${(m.profile?.firstName ?? "")[0] ?? ""}${(m.profile?.lastName ?? "")[0] ?? ""}`.toUpperCase() ||
										"?";
									const name =
										[m.profile?.firstName, m.profile?.lastName].filter(Boolean).join(" ") ||
										m.profile?.email ||
										"Unknown";
									return (
										<button
											key={m.id}
											type="button"
											className={`flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}
											onClick={() => {
												updateTask.mutate({ id: task.id, data: { assigneeId: m.userId } });
												setAssigneeOpen(false);
												setMemberSearch("");
											}}
										>
											<div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
												{initials}
											</div>
											<span className="text-[12px] text-slate-700 truncate flex-1">{name}</span>
											{isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
										</button>
									);
								})}
						</div>
					</PopoverContent>
				</Popover>
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
				{(() => {
					const p = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.NONE;
					return (
						<span
							className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}
						>
							<span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
							{task.priority !== "NONE"
								? task.priority.charAt(0) + task.priority.slice(1).toLowerCase()
								: "None"}
						</span>
					);
				})()}
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
			{/* biome-ignore lint/a11y/noStaticElementInteractions: Stops click propagation from the row */}
			<div
				className="px-1 py-2.5"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<Popover
					open={actionsOpen}
					onOpenChange={(open) => {
						setActionsOpen(open);
						if (!open) setConfirmDelete(false);
					}}
				>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded"
						>
							<MoreHorizontal className="w-4 h-4 text-slate-400" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-44 p-1" align="end" sideOffset={4}>
						{!confirmDelete ? (
							<button
								type="button"
								className="flex items-center gap-2 w-full px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50 rounded-md transition-colors"
								onClick={() => setConfirmDelete(true)}
							>
								<Trash2 className="w-3.5 h-3.5" />
								Delete task
							</button>
						) : (
							<div className="px-3 py-2">
								<p className="text-[12px] text-slate-600 mb-2">Delete this task?</p>
								<div className="flex items-center gap-2">
									<button
										type="button"
										className="flex-1 text-[12px] font-medium px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
										onClick={() => {
											deleteTask.mutate(task.id);
											setActionsOpen(false);
											setConfirmDelete(false);
										}}
									>
										Confirm
									</button>
									<button
										type="button"
										className="flex-1 text-[12px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
										onClick={() => setConfirmDelete(false)}
									>
										Cancel
									</button>
								</div>
							</div>
						)}
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
