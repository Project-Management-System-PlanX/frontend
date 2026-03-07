"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
	AlignLeft,
	ArrowRight,
	CalendarIcon,
	CheckCircle2,
	ChevronDown,
	Flag,
	ListTodo,
	Lock,
	MoreHorizontal,
	Search,
	Send,
	Sparkles,
	Trash2,
	User,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSpace } from "@/hooks/api/use-spaces";
import {
	useCreateComment,
	useCreateTask,
	useDeleteComment,
	useTaskComments,
	useUpdateTask,
} from "@/hooks/api/use-tasks";
import { useMemberLookup } from "@/hooks/use-member-lookup";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Task } from "@/lib/types/models";

interface TaskDetailModalProps {
	task: Task | null;
	isOpen: boolean;
	onClose: () => void;
	spaceName?: string;
}

export function TaskDetailModal({
	task,
	isOpen,
	onClose,
	spaceName = "Workspace",
}: TaskDetailModalProps) {
	const { getMember } = useMemberLookup();
	const { token, user } = useSupabaseAuth();
	const [_isCreatingSubtask, setIsCreatingSubtask] = useState(false);
	const [subtaskTitle, setSubtaskTitle] = useState("");
	const [commentText, setCommentText] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Live comments from backend
	const { data: comments = [], isLoading: commentsLoading } = useTaskComments(
		task?.id || "",
		token || undefined,
	);
	const { mutateAsync: postComment, isPending: isPosting } = useCreateComment(token || undefined);
	const { mutateAsync: removeComment } = useDeleteComment(token || undefined);
	const { mutateAsync: createTask, isPending: isCreatingSubtaskTask } = useCreateTask(
		token || undefined,
	);
	const { mutateAsync: updateTask } = useUpdateTask(token || undefined);

	// Space statuses for status picker
	const { data: space } = useSpace(task?.spaceId || "", token || undefined);
	const statuses = space?.statuses || [];

	if (!task) return null;

	const priColors: Record<string, string> = {
		CRITICAL: "text-red-600",
		HIGH: "text-orange-500",
		MEDIUM: "text-blue-600",
		LOW: "text-slate-500",
		NONE: "text-slate-400",
	};

	const assignee = task.assigneeId ? getMember(task.assigneeId) : null;
	const reporter = task.reporterId ? getMember(task.reporterId) : null;

	const handlePostComment = async () => {
		const text = commentText.trim();
		if (!text || isPosting) return;
		setCommentText("");
		await postComment({ taskId: task.id, data: { content: text } });
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			handlePostComment();
		}
	};

	const handleCreateSubtask = async () => {
		const title = subtaskTitle.trim();
		if (!title || isCreatingSubtaskTask) return;
		setSubtaskTitle("");
		setIsCreatingSubtask(false);
		await createTask({
			spaceId: task.spaceId,
			title,
			parentId: task.id,
		});
	};

	const handleStatusChange = async (statusId: string) => {
		await updateTask({ id: task.id, data: { statusId } });
	};

	const handleSubtaskToggle = async (childId: string, currentStatusId: string) => {
		// Find a "done" status or cycle to next
		const doneStatus = statuses.find((s) => s.isDone);
		const isCurrentlyDone = statuses.find((s) => s.id === currentStatusId)?.isDone;
		if (doneStatus) {
			if (isCurrentlyDone) {
				// Uncheck: go back to first non-done status
				const todoStatus = statuses.find((s) => !s.isDone);
				if (todoStatus) await updateTask({ id: childId, data: { statusId: todoStatus.id } });
			} else {
				await updateTask({ id: childId, data: { statusId: doneStatus.id } });
			}
		}
	};

	const _handleSubtaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleCreateSubtask();
		}
		if (e.key === "Escape") {
			setIsCreatingSubtask(false);
			setSubtaskTitle("");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="max-w-[1200px] w-[95vw] h-[85vh] p-0 bg-white border-slate-200 text-slate-800 flex flex-col overflow-hidden rounded-xl shadow-2xl"
				style={{ fontFamily: "var(--font-figtree), Figtree" }}
			>
				<DialogTitle className="sr-only">Task Details: {task.title}</DialogTitle>

				{/* ──────── TOP BAR ──────── */}
				<div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 shrink-0 bg-slate-50/50">
					<div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
						<div className="w-5 h-5 rounded bg-purple-100 text-purple-700 flex items-center justify-center">
							<span className="text-[10px] font-bold">S</span>
						</div>
						<span className="hover:text-slate-800 cursor-pointer transition-colors">
							Shared with me
						</span>
						<span className="text-slate-300">/</span>
						<div className="flex items-center gap-1 hover:text-slate-800 cursor-pointer transition-colors">
							<ListTodo className="w-3.5 h-3.5" />
							<span>{spaceName}</span>
							<Lock className="w-3.5 h-3.5 ml-1" />
						</div>
					</div>

					<div className="flex items-center gap-4 text-[12px] text-slate-500">
						<span>Created {format(new Date(task.createdAt), "MMM d, yyyy")}</span>
						<div className="flex items-center gap-1.5">
							<button
								type="button"
								className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 transition-colors text-slate-700 font-medium shadow-sm"
							>
								<Sparkles className="w-3.5 h-3.5 text-blue-600" />
								Ask AI
							</button>
							<button
								type="button"
								className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500"
							>
								<MoreHorizontal className="w-4 h-4" />
							</button>
							<button
								onClick={onClose}
								type="button"
								className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>

				{/* ──────── MAIN SPLIT CONTAINER ──────── */}
				<div className="flex flex-1 min-h-0 overflow-hidden">
					{/* ── LEFT PANE: Task Details ── */}
					<div className="flex-1 border-r border-slate-200 flex flex-col overflow-y-auto bg-white">
						<div className="px-8 py-8 flex flex-col gap-6 max-w-4xl">
							{/* Task Title */}
							<h1 className="text-3xl font-bold text-slate-900 tracking-tight">{task.title}</h1>

							{/* Meta Grid */}
							<div className="grid grid-cols-2 gap-x-12 gap-y-4">
								{/* Col 1 */}
								<div className="space-y-4">
									<MetaRow label="Status" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
										<Popover>
											<PopoverTrigger asChild>
												<button
													type="button"
													className="flex items-center gap-1.5 border text-xs font-semibold px-2.5 py-1.5 rounded-md cursor-pointer transition-all hover:opacity-90 shadow-sm"
													style={{
														backgroundColor: task.status?.color
															? `${task.status.color}18`
															: "#f1f5f9",
														borderColor: task.status?.color || "#cbd5e1",
														color: task.status?.color || "#475569",
													}}
												>
													<span
														className="w-1.5 h-1.5 rounded-full"
														style={{ backgroundColor: task.status?.color || "#94a3b8" }}
													/>
													<span className="uppercase tracking-wide">
														{task.status?.name || "TO DO"}
													</span>
													<ChevronDown className="w-3 h-3 opacity-60" />
												</button>
											</PopoverTrigger>
											<PopoverContent className="w-52 p-1.5" align="start" sideOffset={6}>
												<p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 pb-1.5">
													Change status
												</p>
												{statuses.length === 0 ? (
													<p className="text-[12px] text-slate-400 px-2 py-1">No statuses found</p>
												) : (
													statuses.map((s) => (
														<button
															type="button"
															key={s.id}
															onClick={() => handleStatusChange(s.id)}
															className={`w-full text-left flex items-center gap-2.5 px-2 py-2 rounded-md text-[12px] font-medium transition-colors ${
																task.statusId === s.id ? "bg-slate-100" : "hover:bg-slate-50"
															}`}
														>
															<span
																className="w-2.5 h-2.5 rounded-full shrink-0"
																style={{ backgroundColor: s.color }}
															/>
															<span
																className="flex-1 uppercase tracking-wide"
																style={{ color: s.color }}
															>
																{s.name}
															</span>
															{task.statusId === s.id && (
																<CheckCircle2
																	className="w-3.5 h-3.5 shrink-0"
																	style={{ color: s.color }}
																/>
															)}
														</button>
													))
												)}
											</PopoverContent>
										</Popover>
									</MetaRow>

									<MetaRow label="Due date" icon={<CalendarIcon className="w-3.5 h-3.5" />}>
										<Popover>
											<PopoverTrigger asChild>
												<button
													type="button"
													className="flex items-center gap-1.5 text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[13px] hover:bg-blue-100 transition-colors"
												>
													<CalendarIcon className="w-3.5 h-3.5" />
													{task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "Not set"}
												</button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0 bg-white" align="start">
												<Calendar
													mode="single"
													selected={task.dueDate ? new Date(task.dueDate) : undefined}
													onSelect={(date) => {
														const iso = date
															? new Date(
																	date.getTime() - date.getTimezoneOffset() * 60000,
																).toISOString()
															: null;
														updateTask({ id: task.id, data: { dueDate: iso } });
													}}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</MetaRow>

									{task.parent && (
										<MetaRow label="Parent task" icon={<ArrowRight className="w-3.5 h-3.5" />}>
											<span className="text-[13px] text-blue-600 font-medium hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
												{task.space?.prefix}-{task.parent.taskNumber}: {task.parent.title}
											</span>
										</MetaRow>
									)}
								</div>

								{/* Col 2 */}
								<div className="space-y-4">
									<MetaRow label="Assignee" icon={<User className="w-3.5 h-3.5" />}>
										{assignee ? (
											<div className="flex items-center gap-2">
												<div
													className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium border-2 border-white bg-blue-600 text-white shadow-sm"
													title={assignee.name}
												>
													{assignee.initials}
												</div>
												<span className="text-[13px] text-slate-700 font-medium">
													{assignee.name}
												</span>
											</div>
										) : (
											<span className="text-[13px] text-slate-400">Unassigned</span>
										)}
									</MetaRow>

									<MetaRow label="Reporter" icon={<User className="w-3.5 h-3.5" />}>
										{reporter ? (
											<div className="flex items-center gap-2">
												<div
													className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium border-2 border-white bg-orange-500 text-white shadow-sm"
													title={reporter.name}
												>
													{reporter.initials}
												</div>
												<span className="text-[13px] text-slate-700 font-medium">
													{reporter.name}
												</span>
											</div>
										) : (
											<span className="text-[13px] text-slate-400">—</span>
										)}
									</MetaRow>

									<MetaRow label="Priority" icon={<Flag className="w-3.5 h-3.5" />}>
										<div className="flex items-center gap-1.5 text-[13px] font-medium px-2 py-0.5 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
											<Flag
												className={`w-3.5 h-3.5 ${priColors[task.priority || "NONE"]}`}
												fill="currentColor"
											/>
											<span className="text-slate-700">
												{task.priority !== "NONE"
													? task.priority.charAt(0) + task.priority.slice(1).toLowerCase()
													: "None"}
											</span>
										</div>
									</MetaRow>

									{task.team && (
										<MetaRow label="Team" icon={<User className="w-3.5 h-3.5" />}>
											<span className="text-[13px] text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
												{task.team.name}
											</span>
										</MetaRow>
									)}
								</div>
							</div>

							{/* Description */}
							{task.description ? (
								<>
									<div className="w-full h-px bg-slate-200" />
									<div className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
										{task.description}
									</div>
								</>
							) : (
								<>
									<div className="w-full h-px bg-slate-200" />
									<p className="text-[14px] text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
										No description — add one...
									</p>
								</>
							)}

							{/* Subtasks */}
							{task.children && task.children.length > 0 && (
								<>
									<div className="w-full h-px bg-slate-200" />
									<div>
										<p className="text-[13px] font-semibold text-slate-700 mb-2">
											Subtasks ({task.children.length})
										</p>
										<div className="space-y-1">
											{task.children.map((child) => {
												const childDone =
													statuses.find((s) => s.id === child.statusId)?.isDone ?? false;
												const childStatus = statuses.find((s) => s.id === child.statusId);
												return (
													<div
														key={child.id}
														className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-[13px] text-slate-700 hover:bg-slate-100 transition-colors group"
													>
														<button
															type="button"
															onClick={() => handleSubtaskToggle(child.id, child.statusId)}
															className="shrink-0 transition-colors"
															title={childDone ? "Mark incomplete" : "Mark complete"}
														>
															<CheckCircle2
																className={`w-4 h-4 ${childDone ? "text-emerald-500" : "text-slate-300 group-hover:text-slate-400"}`}
																fill={childDone ? "currentColor" : "none"}
															/>
														</button>
														<span className={childDone ? "line-through text-slate-400" : ""}>
															{task.space?.prefix && `${task.space.prefix}-${child.taskNumber}: `}
															{child.title}
														</span>
														{childStatus && (
															<span
																className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase"
																style={{
																	backgroundColor: `${childStatus.color}20`,
																	color: childStatus.color,
																}}
															>
																{childStatus.name}
															</span>
														)}
													</div>
												);
											})}
										</div>
									</div>
								</>
							)}
						</div>
					</div>

					{/* ── RIGHT PANE: Activity & Comments ── */}
					<div className="w-[320px] shrink-0 bg-slate-50 flex flex-col">
						{/* Header */}
						<div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 bg-white shadow-sm z-10">
							<span className="text-[13px] font-semibold text-slate-800">
								Activity
								{comments.length > 0 && (
									<span className="ml-2 text-[11px] font-medium bg-slate-200 px-1.5 py-0.5 rounded-full text-slate-600">
										{comments.length}
									</span>
								)}
							</span>
							<div className="flex items-center gap-1.5 text-slate-400">
								<button
									type="button"
									className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-500"
								>
									<Search className="w-3.5 h-3.5" />
								</button>
								<button
									type="button"
									className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-500"
								>
									<AlignLeft className="w-3.5 h-3.5" />
								</button>
							</div>
						</div>

						{/* Comment list */}
						<div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
							{/* Creation activity item */}
							<div className="flex items-start gap-3">
								<div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
									{reporter?.initials || "?"}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-[12px] text-slate-600">
										<span className="font-semibold text-slate-800">
											{reporter?.name || "Someone"}
										</span>{" "}
										created this task
									</p>
									<p className="text-[11px] text-slate-400 mt-0.5">
										{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
									</p>
								</div>
							</div>

							{commentsLoading ? (
								<div className="flex items-center justify-center py-8">
									<div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
								</div>
							) : comments.length === 0 ? (
								<div className="py-6 text-center text-[12px] text-slate-400">
									No comments yet. Be the first to comment!
								</div>
							) : (
								comments.map((comment) => {
									const commenter = getMember(comment.userId);
									const isOwn = comment.userId === user?.id;
									return (
										<div key={comment.id} className="flex items-start gap-3 group">
											<div
												className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
												title={commenter.name}
											>
												{commenter.initials}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between gap-2">
													<p className="text-[12px] font-semibold text-slate-800">
														{commenter.name}
													</p>
													<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
														<p className="text-[11px] text-slate-400">
															{formatDistanceToNow(new Date(comment.createdAt), {
																addSuffix: true,
															})}
														</p>
														{isOwn && (
															<button
																type="button"
																onClick={() =>
																	removeComment({ taskId: task.id, commentId: comment.id })
																}
																className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500 transition-colors"
																title="Delete comment"
															>
																<Trash2 className="w-3 h-3" />
															</button>
														)}
													</div>
												</div>
												<div className="mt-1 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm leading-relaxed break-words">
													{comment.content}
												</div>
											</div>
										</div>
									);
								})
							)}
						</div>

						{/* Comment input */}
						<div className="p-4 border-t border-slate-200 bg-white">
							<div className="border border-slate-200 bg-white rounded-xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden shadow-sm">
								<textarea
									ref={textareaRef}
									value={commentText}
									onChange={(e) => setCommentText(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Write a comment… (Ctrl+Enter to send)"
									rows={2}
									className="w-full bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 outline-none resize-none px-4 py-3"
								/>
								<div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-slate-100 bg-slate-50/50">
									<div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
										<Sparkles className="w-3.5 h-3.5 text-blue-500" />
										<span>Ctrl+Enter to send</span>
									</div>
									<button
										type="button"
										onClick={handlePostComment}
										disabled={!commentText.trim() || isPosting}
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
									>
										{isPosting ? (
											<div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
										) : (
											<Send className="w-3.5 h-3.5" />
										)}
										Send
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function MetaRow({
	label,
	icon,
	children,
}: {
	label: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center min-h-[32px]">
			<div className="w-[140px] flex items-center gap-2 text-[13px] text-slate-500 font-medium">
				{icon}
				<span>{label}</span>
			</div>
			<div className="flex-1 flex items-center">{children}</div>
		</div>
	);
}

function _ActionItem({
	icon,
	label,
	highlight,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	highlight?: boolean;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.();
				}
			}}
			className={`flex w-full items-center gap-3 px-3 py-2 text-[13px] cursor-pointer rounded-lg transition-colors ${
				highlight
					? "bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold border border-slate-200"
					: "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
			}`}
		>
			{icon}
			<span className="font-medium">{label}</span>
		</button>
	);
}
