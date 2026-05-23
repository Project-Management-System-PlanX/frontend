"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlignLeft,
	Bold,
	Calendar as CalendarIcon,
	CheckSquare,
	ChevronDown,
	Eye,
	HelpCircle,
	Image as ImageIcon,
	Italic,
	Link2,
	List,
	MessageSquare,
	MoreHorizontal,
	Paperclip,
	Plus,
	Tag,
	Type,
	Users,
	X,
} from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { taskService } from "@/lib/api/services/tasks";
import { supabase } from "@/lib/supabase/client";
import type { Task, TaskComment, TaskLabel, UserProfile } from "@/lib/types/models";
import { cn } from "@/lib/utils";


interface TaskDetailModalProps {
	task: Task | null;
	isOpen: boolean;
	onClose: () => void;
	columnName?: string;
	onUpdateTask?: (id: string, data: any) => void;
	workspaceId?: string | null;
	isInbox?: boolean;
}
export default function TaskDetailModal({
	task,
	isOpen,
	onClose,
	columnName = "Today",
	onUpdateTask,
	workspaceId,
	isInbox,
}: TaskDetailModalProps) {
	const { token, user } = useSupabaseAuth();
	const [comment, setComment] = useState("");
	const [localComments, setLocalComments] = useState<TaskComment[]>([]);
	const [_isSaving, _setIsSaving] = useState(false);
	const [_isAddingComment, _setIsAddingComment] = useState(false);
	const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
	const [isMetaDatePickerOpen, setIsMetaDatePickerOpen] = useState(false);
	const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
	const [isMetaMemberPickerOpen, setIsMetaMemberPickerOpen] = useState(false);
	const [isLabelPickerOpen, setIsLabelPickerOpen] = useState(false);
	const [isMetaLabelPickerOpen, setIsMetaLabelPickerOpen] = useState(false);
	const [isCoverOpen, setIsCoverOpen] = useState(false);

	const [localAssignees, setLocalAssignees] = useState<{ userId: string; user: UserProfile }[]>(
		task?.assignees || [],
	);
	const [localDueDate, setLocalDueDate] = useState<Date | undefined>(
		task?.dueDate ? new Date(task.dueDate) : undefined,
	);
	const [localLabels, setLocalLabels] = useState<TaskLabel[]>(task?.labels || []);
	const [coverColor, setCoverColor] = useState<string | null>(task?.coverColor ?? null);
	const [coverSize, setCoverSize] = useState<"partial" | "full">("partial");

	useEffect(() => {
		setLocalAssignees(task?.assignees || []);
		setLocalDueDate(task?.dueDate ? new Date(task.dueDate) : undefined);
		setLocalLabels(task?.labels || []);
		setCoverColor(task?.coverColor ?? null);

		// Auto-cleanup legacy multiple labels
		if (isOpen && task?.labels && task.labels.length > 1 && token) {
			const keep = task.labels[0];
			const toRemove = task.labels.slice(1);
			setLocalLabels([keep]);
			Promise.all(toRemove.map((l) => taskService.removeLabel(task.id, l.id, token))).catch((err) =>
				console.error("Auto-cleanup failed", err),
			);
		}
	}, [task?.assignees, task?.dueDate, task?.labels, task?.coverColor, isOpen, token, task?.id]);

	useEffect(() => {
		if (task?.comments) {
			setLocalComments(task.comments);
		}
	}, [task?.comments]);

	useEffect(() => {
		const fetchMembers = async () => {
			if (workspaceId && token) {
				try {
					const { workspaceService } = await import("@/lib/api/services/workspaces");
					const members = await workspaceService.listMembers(workspaceId, token);
					setWorkspaceMembers(members);
				} catch (err) {
					console.error("Failed to fetch members", err);
				}
			}
		};
		if (isOpen) fetchMembers();
	}, [workspaceId, token, isOpen]);

	// ─── Realtime Comments ───
	useEffect(() => {
		if (!task?.id || !isOpen) return;

		const channel = supabase
			.channel(`task-comments-${task.id}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "task_comments",
					filter: `taskId=eq.${task.id}`,
				},
				async (payload) => {
					if (payload.eventType === "INSERT") {
						const newComment = payload.new as TaskComment;
						// If we don't have user info, we might want to fetch it or just show Team Member
						setLocalComments((prev) => {
							if (prev.some((c) => c.id === newComment.id)) return prev;
							return [newComment, ...prev];
						});
					} else if (payload.eventType === "DELETE") {
						setLocalComments((prev) => prev.filter((c) => c.id !== payload.old.id));
					} else if (payload.eventType === "UPDATE") {
						const updated = payload.new as TaskComment;
						setLocalComments((prev) =>
							prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
						);
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [task?.id, isOpen]);

	// ─── Realtime Task Attributes ───
	useEffect(() => {
		if (!task?.id || !isOpen) return;

		const channel = supabase
			.channel(`task-attributes-${task.id}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "tasks",
					filter: `id=eq.${task.id}`,
				},
				async (payload) => {
					const updatedTask = payload.new as Task;
					// Update local states if needed, or trigger a re-fetch
					if (updatedTask.dueDate) setLocalDueDate(new Date(updatedTask.dueDate));
					if (updatedTask.assigneeId !== undefined) {
						// Since we now have multi-assignees, we might need to handle those separately
						// but this will handle the legacy single-assignee if still used
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [task?.id, isOpen]);

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit,
			Underline,
			Link.configure({
				openOnClick: false,
			}),
			Placeholder.configure({
				placeholder:
					"Use Markdown shortcuts to format your page as you type, like * for lists, # for headers, and --- for a horizontal rule.",
			}),
		],
		content: task?.description || "",
		editorProps: {
			attributes: {
				class:
					"prose prose-invert max-w-none focus:outline-none min-h-[280px] p-6 text-[15px] text-white/80 leading-relaxed",
			},
		},
	});

	useEffect(() => {
		if (editor && task?.description) {
			editor.commands.setContent(task.description);
		}
	}, [task, editor]);

	const handleSaveDescription = async () => {
		if (!task || !editor || !token) return;
		const content = editor.getHTML();
		// Optimistic: update parent state + close immediately
		onUpdateTask?.(task.id, { description: content });
		onClose();
		// Fire-and-forget backend sync
		taskService
			.update(task.id, { description: content }, token)
			.catch((err) => console.error("Failed to save description", err));
	};

	const handleAddComment = async () => {
		if (!task || !comment.trim() || !token) return;
		const commentText = comment.trim();
		// Optimistic: show comment immediately
		const tempComment: TaskComment = {
			id: `temp-${Date.now()}`,
			taskId: task.id,
			userId: user?.id || "",
			content: commentText,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setLocalComments((prev) => [tempComment, ...prev]);
		setComment("");
		// Background sync
		try {
			const saved = await taskService.addComment(task.id, commentText, token);
			setLocalComments((prev) => prev.map((c) => (c.id === tempComment.id ? saved : c)));
		} catch (error) {
			console.error("Failed to add comment", error);
			// Rollback on failure
			setLocalComments((prev) => prev.filter((c) => c.id !== tempComment.id));
		}
	};

	if (!isOpen || !task) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
				{/* Overlay */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				/>

				{/* Modal Content */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					className="relative w-full max-w-[1000px] h-[85vh] bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col text-white"
				>
					{/* Cover Bar */}
					{coverColor && (
						<div
							className={cn(
								"w-full shrink-0 transition-all duration-300",
								coverSize === "full" ? "h-40" : "h-16",
							)}
							style={{ backgroundColor: coverColor }}
						/>
					)}

					{/* Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
						{/* Top-left: column name pill + label pill */}
						<div className="flex items-center gap-2">
							<button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8B2323] hover:bg-[#A52A2A] transition-colors text-[13px] font-bold text-white shadow-sm group">
								{isInbox ? "Inbox" : task.status?.name || columnName}
								<ChevronDown className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" />
							</button>
						</div>
						{/* Top-right controls */}
						<div className="flex items-center gap-1 text-white/40">
							<CoverPopover
								isOpen={isCoverOpen}
								setIsOpen={setIsCoverOpen}
								coverColor={coverColor}
								coverSize={coverSize}
								onCoverChange={(color, size) => {
									// Optimistic: update UI immediately
									setCoverColor(color);
									if (size) setCoverSize(size);
									// Persist to backend
									onUpdateTask?.(task.id, { coverColor: color });
								}}
							/>
							<button className="hover:text-white transition-colors p-1">
								<Eye className="w-5 h-5" />
							</button>
							<button className="hover:text-white transition-colors p-1">
								<MoreHorizontal className="w-5 h-5" />
							</button>
							<button onClick={onClose} className="hover:text-white transition-colors p-1 ml-1">
								<X className="w-6 h-6" />
							</button>
						</div>
					</div>

					{/* Main Body */}
					<div className="flex flex-1 min-h-0 overflow-hidden">
						{/* Left Content */}
						<div className="flex-1 overflow-y-auto custom-scrollbar p-8 pr-4">
							<div className="flex items-start gap-4 mb-8">
								<h1 className="text-3xl font-black tracking-tight">{task.title}</h1>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-wrap gap-2 mb-10">
								<TaskDatePickerPopover
									task={task}
									isOpen={isDatePickerOpen}
									setIsOpen={setIsDatePickerOpen}
									onUpdateTask={onUpdateTask}
									onDueDateChange={setLocalDueDate}
								/>

								<TaskLabelPopover
									task={task}
									isOpen={isLabelPickerOpen}
									setIsOpen={setIsLabelPickerOpen}
									onUpdateLabels={setLocalLabels}
									onUpdateTask={onUpdateTask}
									trigger={
										<ActionButton
											icon={<Tag className="w-4 h-4" />}
											label={task.id.startsWith("temp-") ? "Syncing..." : "Labels"}
											active={isLabelPickerOpen}
											disabled={task.id.startsWith("temp-")}
										/>
									}
								/>
								{!isInbox && (
									<TaskMemberPopover
										task={task}
										workspaceMembers={workspaceMembers}
										isOpen={isMemberPickerOpen}
										setIsOpen={setIsMemberPickerOpen}
										onUpdateAssignees={setLocalAssignees}
										onUpdateTask={onUpdateTask}
										workspaceId={workspaceId || undefined}
										trigger={
											<ActionButton
												icon={<Users className="w-4 h-4" />}
												label={task.id.startsWith("temp-") ? "Syncing..." : "Members"}
												active={isMemberPickerOpen}
												disabled={task.id.startsWith("temp-")}
											/>
										}
									/>
								)}
								<ActionButton icon={<CheckSquare className="w-4 h-4" />} label="Checklist" />
							</div>

							{/* Assigned Meta Info Section */}
							{(localAssignees.length > 0 ||
								localDueDate ||
								(localLabels && localLabels.length > 0)) && (
								<div className="flex flex-wrap gap-8 mb-6 ml-1">
									{localAssignees && localAssignees.length > 0 && !isInbox && (
										<div className="flex flex-col gap-1.5">
											<h3 className="text-[11px] font-bold text-white/50 tracking-wide uppercase">
												Members
											</h3>
											<TaskMemberPopover
												task={task}
												workspaceMembers={workspaceMembers}
												isOpen={isMetaMemberPickerOpen}
												setIsOpen={setIsMetaMemberPickerOpen}
												onUpdateAssignees={setLocalAssignees}
												onUpdateTask={onUpdateTask}
												workspaceId={workspaceId || undefined}
												trigger={
													<div className="flex items-center gap-1.5 cursor-pointer group">
														<div className="flex -space-x-2">
															{localAssignees.map((assignee) => (
																<div
																	key={assignee.userId}
																	className="w-7 h-7 rounded-full bg-[#F59E0B] flex items-center justify-center text-[11px] font-bold text-black shadow-sm uppercase border-2 border-[#1E1F21]"
																>
																	{assignee.user?.firstName?.[0] || "U"}
																</div>
															))}
														</div>
														<button className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-white/50 group-hover:text-white transition-colors border border-dashed border-white/20 shrink-0">
															<Plus className="w-3.5 h-3.5" />
														</button>
													</div>
												}
											/>
										</div>
									)}

									{localLabels && localLabels.length > 0 && (
										<div className="flex flex-col gap-1.5">
											<h3 className="text-[11px] font-bold text-white/50 tracking-wide uppercase">
												Labels
											</h3>
											<TaskLabelPopover
												task={task}
												isOpen={isMetaLabelPickerOpen}
												setIsOpen={setIsMetaLabelPickerOpen}
												onUpdateLabels={setLocalLabels}
												onUpdateTask={onUpdateTask}
												trigger={
													<div className="flex flex-wrap items-center gap-1.5 cursor-pointer group">
														{localLabels.slice(0, 1).map((label) => (
															<div
																key={label.id}
																className="w-10 h-8 rounded shrink-0 hover:opacity-80 transition-opacity"
																style={{ backgroundColor: label.color }}
																title={label.name}
															/>
														))}
														<button className="w-8 h-8 rounded bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-white/50 group-hover:text-white transition-colors border border-dashed border-white/20 shrink-0">
															<Plus className="w-3.5 h-3.5" />
														</button>
													</div>
												}
											/>
										</div>
									)}

									{localDueDate && (
										<div className="flex flex-col gap-1.5">
											<h3 className="text-[11px] font-bold text-white/50 tracking-wide uppercase">
												Due date
											</h3>
											<TaskDatePickerPopover
												task={task}
												isOpen={isMetaDatePickerOpen}
												setIsOpen={setIsMetaDatePickerOpen}
												onUpdateTask={onUpdateTask}
												onDueDateChange={setLocalDueDate}
												trigger={
													<button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/5 transition-colors cursor-pointer text-[12px] font-medium text-white/90 hover:text-white">
														<span>{format(localDueDate, "MMM d, h:mm a")}</span>
														<ChevronDown className="w-3.5 h-3.5 text-white/50" />
													</button>
												}
											/>
										</div>
									)}
								</div>
							)}

							{/* Description Section */}
							<div className="mb-10">
								<div className="flex items-center gap-3 mb-4 text-white/60">
									<AlignLeft className="w-5 h-5" />
									<h2 className="text-[16px] font-bold">Description</h2>
								</div>

								<div className="bg-[#1A1A1A] border border-white/10 rounded-lg overflow-hidden">
									{/* Editor Toolbar */}
									<div className="flex items-center gap-1 px-4 py-2.5 border-b border-white/5 bg-white/5">
										<ToolbarBtn
											icon={<Type className="w-4 h-4" />}
											hasArrow
											active={editor?.isActive("heading")}
										/>
										<div className="w-px h-4 bg-white/10 mx-1" />
										<ToolbarBtn
											icon={<Bold className="w-4 h-4" />}
											active={editor?.isActive("bold")}
											onClick={() => editor?.chain().focus().toggleBold().run()}
										/>
										<ToolbarBtn
											icon={<Italic className="w-4 h-4" />}
											active={editor?.isActive("italic")}
											onClick={() => editor?.chain().focus().toggleItalic().run()}
										/>
										<ToolbarBtn icon={<MoreHorizontal className="w-4 h-4" />} />
										<div className="w-px h-4 bg-white/10 mx-1" />
										<ToolbarBtn
											icon={<List className="w-4 h-4" />}
											hasArrow
											active={editor?.isActive("bulletList")}
											onClick={() => editor?.chain().focus().toggleBulletList().run()}
										/>
										<div className="w-px h-4 bg-white/10 mx-1" />
										<ToolbarBtn icon={<Link2 className="w-4 h-4" />} />
										<ToolbarBtn icon={<ImageIcon className="w-4 h-4" />} />
										<ToolbarBtn icon={<Plus className="w-4 h-4" />} hasArrow />
										<div className="w-px h-4 bg-white/10 mx-1" />
										<ToolbarBtn
											icon={
												<div className="w-4 h-4 rounded-full border border-white/40 bg-gradient-to-br from-blue-400 via-purple-400 to-orange-400" />
											}
										/>
										<div className="ml-auto flex items-center gap-2">
											<ToolbarBtn icon={<Paperclip className="w-4 h-4" />} />
											<ToolbarBtn icon={<span className="text-[10px] font-bold">M↓</span>} />
											<ToolbarBtn icon={<HelpCircle className="w-4 h-4" />} />
										</div>
									</div>

									{/* Editor Content */}
									<EditorContent editor={editor} />
								</div>

								<div className="flex items-center justify-between mt-4">
									<div className="flex items-center gap-3">
										<button
											onClick={handleSaveDescription}
											className="px-5 py-2 bg-[#5294E2] hover:bg-[#4A85CC] text-white rounded font-bold text-[14px] transition-colors active:scale-95"
										>
											Save
										</button>
										<button
											onClick={() => editor?.commands.setContent(task.description || "")}
											className="text-white/40 hover:text-white font-bold text-[14px] transition-colors"
										>
											Cancel
										</button>
									</div>
									<button className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-[12px] font-bold text-white/60 transition-colors border border-white/5">
										Formatting help
									</button>
								</div>
							</div>
						</div>

						{/* Right Sidebar */}
						<div className="w-[380px] border-l border-white/5 bg-[#0D0D0D] overflow-y-auto custom-scrollbar p-6">
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-3 text-white/80">
									<MessageSquare className="w-5 h-5" />
									<h2 className="text-[15px] font-bold">Comments and activity</h2>
								</div>
								<button className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-[12px] font-bold text-white/80 transition-colors border border-white/5">
									Show details
								</button>
							</div>

							{/* Comment Input */}
							<div className="mb-8">
								<input
									type="text"
									placeholder="Write a comment..."
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleAddComment();
									}}
									className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-white/20 transition-colors"
								/>
							</div>

							{/* Activity Feed */}
							<div className="space-y-8">
								{/* Dynamic Comments */}
								{localComments.map((c) => {
									const isMe = c.userId === user?.id;
									const authorName = isMe
										? user?.user_metadata?.first_name || user?.email?.split("@")[0] || "You"
										: "Team Member";
									return (
										<div key={c.id} className="flex gap-4 group">
											<div className="w-9 h-9 rounded-full bg-[#3498DB] flex items-center justify-center text-[14px] font-black shrink-0 border border-white/10 shadow-sm">
												{authorName[0].toUpperCase()}
											</div>
											<div className="flex-1">
												<div className="flex items-center justify-between mb-1">
													<span className="text-[14px] font-bold text-white/90">{authorName}</span>
													<span className="text-[11px] text-white/30 font-medium">
														{format(new Date(c.createdAt), "h:mm a")}
													</span>
												</div>
												<div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-none px-4 py-2.5 text-[14px] text-white/80 leading-relaxed group-hover:bg-white/[0.05] transition-colors">
													{c.content}
												</div>
												<div className="flex items-center gap-3 mt-1.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
													<button className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-medium">
														Reply
													</button>
													<button className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-medium">
														React
													</button>
													{isMe && (
														<button className="text-[11px] text-white/30 hover:text-[#FF6B6B] transition-colors font-medium">
															Delete
														</button>
													)}
												</div>
											</div>
										</div>
									);
								})}
								{/* System Activity (Creation) */}
								<div className="flex gap-4">
									<div className="w-9 h-9 rounded-full bg-[#E67E22] flex items-center justify-center text-[14px] font-black shrink-0">
										S
									</div>
									<div className="flex-1 pt-1">
										<p className="text-[14px]">
											<span className="font-bold">System</span> added this card to{" "}
											<span className="underline cursor-pointer">{columnName}</span>
										</p>
										<p className="text-blue-400 text-[12px] underline cursor-pointer mt-1">
											{task.createdAt
												? format(new Date(task.createdAt), "MMM d, yyyy, h:mm a")
												: "Unknown"}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}

const ActionButton = forwardRef<
	HTMLButtonElement,
	{
		icon: React.ReactNode;
		label: string;
		onClick?: React.MouseEventHandler<HTMLButtonElement>;
		className?: string;
		active?: boolean;
		disabled?: boolean;
	}
>(({ icon, label, onClick, className, active, disabled, ...props }, ref) => {
	return (
		<button
			ref={ref}
			onClick={onClick}
			type="button"
			disabled={disabled}
			className={cn(
				"flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border text-[14px] font-bold",
				active
					? "bg-white/20 text-white border-white/20 shadow-lg"
					: "bg-white/5 hover:bg-white/10 border-white/5 text-white/80",
				disabled && "opacity-50 cursor-not-allowed grayscale",
				className,
			)}
			{...props}
		>
			{icon}
			{label}
		</button>
	);
});
ActionButton.displayName = "ActionButton";

function ToolbarBtn({
	icon,
	hasArrow,
	active,
	onClick,
}: {
	icon: React.ReactNode;
	hasArrow?: boolean;
	active?: boolean;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-1 p-1.5 rounded transition-colors",
				active ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/60",
			)}
		>
			{icon}
			{hasArrow && <ChevronDown className="w-3 h-3" />}
		</button>
	);
}

export function TaskDatePickerPopover({
	task,
	isOpen,
	setIsOpen,
	onUpdateTask,
	trigger,
	onDueDateChange,
	onCloseModal,
}: {
	task: Task;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	onUpdateTask?: (id: string, data: Partial<Task>) => void;
	trigger?: React.ReactNode;
	onDueDateChange?: (date: Date | undefined) => void;
	onCloseModal?: () => void;
}) {
	const [startDate, setStartDate] = useState<Date | undefined>(
		task.startDate ? new Date(task.startDate) : undefined,
	);
	const [dueDate, setDueDate] = useState<Date | undefined>(
		task.dueDate ? new Date(task.dueDate) : undefined,
	);
	const [isStartEnabled, setIsStartEnabled] = useState(!!task.startDate);
	const [isDueEnabled, setIsDueEnabled] = useState<boolean>(!!task.dueDate || true);

	useEffect(() => {
		if (isOpen) {
			setStartDate(task.startDate ? new Date(task.startDate) : undefined);
			setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
			setIsStartEnabled(!!task.startDate);
			setIsDueEnabled(!!task.dueDate || true);
		}
	}, [isOpen, task.startDate, task.dueDate]);

	const isSavingRef = useRef(false);

	const handleOpenChange = (open: boolean) => {
		if (!open && !isSavingRef.current) {
			onDueDateChange?.(task.dueDate ? new Date(task.dueDate) : undefined);
		}
		if (open) {
			isSavingRef.current = false;
		}
		setIsOpen(open);
	};

	const handleSave = () => {
		isSavingRef.current = true;
		const payload: Partial<Task> = {};

		if (isDueEnabled && dueDate) {
			const d = new Date(dueDate);
			d.setHours(12, 0, 0, 0);
			payload.dueDate = d.toISOString();
			onDueDateChange?.(d);
		} else {
			payload.dueDate = null as unknown as string;
			onDueDateChange?.(undefined);
		}

		onUpdateTask?.(task.id, payload);
		setIsOpen(false);
		onCloseModal?.();
	};

	const handleRemove = () => {
		isSavingRef.current = true;
		if (onUpdateTask) {
			onUpdateTask(task.id, {
				dueDate: null as unknown as string,
			});
			onDueDateChange?.(undefined);
		}
		setIsOpen(false);
	};

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				{trigger || (
					<ActionButton
						icon={<CalendarIcon className="w-4 h-4" />}
						label={task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "Dates"}
						active={isOpen}
					/>
				)}
			</PopoverTrigger>
			<PopoverContent
				className="w-[340px] p-0 border-white/10 bg-[#2A2B2E] text-white shadow-2xl rounded-xl z-[9999] overflow-hidden"
				align="start"
			>
				{/* Header (Fixed) */}
				<div className="flex items-center justify-between p-3 border-b border-white/10 relative shrink-0">
					<div className="flex-1 text-center font-bold text-[14px]">Dates</div>
					<button
						onClick={() => setIsOpen(false)}
						className="absolute right-3 text-white/50 hover:text-white transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Scrollable Content */}
				<div className="max-h-[450px] overflow-y-auto custom-scrollbar">
					{/* Calendar */}
					<div className="p-2 pb-0 flex justify-center scale-95 origin-top">
						<Calendar
							mode="single"
							selected={isStartEnabled && !isDueEnabled ? startDate : dueDate}
							onSelect={(date) => {
								if (isStartEnabled && !isDueEnabled) {
									setStartDate(date);
								} else {
									setDueDate(date);
									setIsDueEnabled(true);
								}
							}}
							initialFocus
							captionLayout="dropdown"
							fromYear={2020}
							toYear={2030}
							className="bg-transparent text-white"
						/>
					</div>

					{/* Start Date */}
					<div className="px-3 py-1 flex flex-col gap-1">
						<label className="text-[11px] font-bold text-white/60">Start date</label>
						<div className="flex items-center gap-2">
							<Checkbox
								checked={isStartEnabled}
								onCheckedChange={(c) => setIsStartEnabled(!!c)}
								className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 rounded h-3.5 w-3.5"
							/>
							<input
								type="text"
								value={isStartEnabled && startDate ? format(startDate, "M/d/yyyy") : "M/D/YYYY"}
								readOnly
								className="flex-1 bg-[#1A1C1E] border border-white/10 rounded px-2 py-1 text-[13px] disabled:opacity-50 text-white/90 focus:outline-none"
							/>
						</div>
					</div>

					{/* Due Date */}
					<div className="px-3 py-1 flex flex-col gap-1">
						<label className="text-[11px] font-bold text-white/60">Due date</label>
						<div className="flex items-center gap-2">
							<Checkbox
								checked={isDueEnabled}
								onCheckedChange={(c) => setIsDueEnabled(!!c)}
								className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 rounded h-3.5 w-3.5"
							/>
							<input
								type="text"
								value={isDueEnabled && dueDate ? format(dueDate, "M/d/yyyy") : "M/D/YYYY"}
								readOnly
								className="flex-1 w-full bg-[#1A1C1E] border border-white/10 rounded px-2 py-1 text-[13px] disabled:opacity-50 text-white/90 focus:outline-none"
							/>
							<input
								type="text"
								value="12:00 AM"
								readOnly
								className="w-[80px] bg-[#1A1C1E] border border-white/10 rounded px-2 py-1 text-[13px] disabled:opacity-50 text-white/90 text-center focus:outline-none"
							/>
						</div>
					</div>

					{/* Recurring */}
					<div className="px-3 py-1 flex flex-col gap-1">
						<label className="text-[11px] font-bold text-white/60">Recurring</label>
						<select className="w-full bg-[#1A1C1E] border border-white/10 rounded px-2 py-1 text-[13px] text-white/90 focus:outline-none appearance-none">
							<option>Never</option>
							<option>Daily</option>
							<option>Weekly</option>
							<option>Monthly</option>
						</select>
					</div>

					{/* Reminders */}
					<div className="px-3 py-1 flex flex-col gap-1">
						<label className="text-[11px] font-bold text-white/60">Set due date reminder</label>
						<select className="w-full bg-[#1A1C1E] border border-white/10 rounded px-2 py-1 text-[13px] text-white/90 focus:outline-none appearance-none">
							<option>1 Day before</option>
							<option>1 Hour before</option>
							<option>At time of due date</option>
						</select>
					</div>

					<div className="px-3 py-1 pb-2">
						<p className="text-[11px] text-white/50 leading-tight">
							Reminders will be sent to all members and watchers of this card.
						</p>
					</div>
				</div>

				{/* Buttons (Fixed) */}
				<div className="p-3 border-t border-white/10 flex gap-2 shrink-0">
					<button
						onClick={handleSave}
						className="flex-1 bg-[#5294E2] hover:bg-[#4A85CC] text-white font-bold py-1.5 rounded transition-colors text-[13px]"
					>
						Save
					</button>
					<button
						onClick={handleRemove}
						className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-1.5 rounded transition-colors text-[13px] border border-white/5"
					>
						Remove
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export function TaskMemberPopover({
	task,
	workspaceMembers,
	isOpen,
	setIsOpen,
	onUpdateAssignees,
	onUpdateTask,
	workspaceId,
	trigger,
}: {
	task: Task;
	workspaceMembers: any[];
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	onUpdateAssignees?: (assignees: any[]) => void;
	onUpdateTask?: (id: string, data: Partial<Task>) => void;
	workspaceId?: string;
	trigger?: React.ReactNode;
}) {
	const { token } = useSupabaseAuth();
	const [localAssignees, setLocalAssignees] = useState<any[]>(task.assignees || []);
	const [search, setSearch] = useState("");

	useEffect(() => {
		if (isOpen) {
			setLocalAssignees(task.assignees || []);
		}
	}, [isOpen, task.assignees]);

	const handleToggleMember = async (member: any) => {
		if (!token) return;

		const previousAssignees = [...localAssignees];
		const existing = localAssignees.find((a) => a.userId === member.userId);

		if (existing) {
			const newAssignees: any[] = [];
			setLocalAssignees(newAssignees);
			onUpdateAssignees?.(newAssignees);
			onUpdateTask?.(task.id, { assignees: newAssignees, assigneeId: null });
		} else {
			const tempAssignee = { userId: member.userId, user: member.user };
			const newAssignees = [tempAssignee];
			setLocalAssignees(newAssignees);
			onUpdateAssignees?.(newAssignees);
			onUpdateTask?.(task.id, { assignees: newAssignees, assigneeId: member.userId });
		}
	};

	const filteredMembers = workspaceMembers.filter((m) => {
		const u = m.user;
		if (!u) return false;
		const q = search.toLowerCase();
		return (
			u.firstName?.toLowerCase().includes(q) ||
			u.lastName?.toLowerCase().includes(q) ||
			u.email?.toLowerCase().includes(q) ||
			u.username?.toLowerCase().includes(q)
		);
	});

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				{trigger || (
					<ActionButton
						icon={<Users className="w-4 h-4" />}
						label="Members"
						active={localAssignees.length > 0}
					/>
				)}
			</PopoverTrigger>
			<PopoverContent
				className="w-[300px] p-0 border-white/10 bg-[#2A2B2E] text-white shadow-2xl rounded-xl z-[9999]"
				align="start"
			>
				<div className="flex items-center justify-between p-3 border-b border-white/10 relative">
					<div className="flex-1 text-center font-bold text-[14px]">Members</div>
					<button
						onClick={() => setIsOpen(false)}
						className="absolute right-3 text-white/50 hover:text-white transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
				<div className="p-3">
					<div className="relative mb-3">
						<input
							type="text"
							placeholder="Search members..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full bg-[#1A1C1E] border border-white/10 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-blue-500/50 transition-colors"
						/>
					</div>
					<div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
						<div className="text-[11px] font-bold text-white/40 mb-2 uppercase px-1">
							Workspace members
						</div>
						{filteredMembers.map((member) => {
							const memberUserId = member.userId; // supabaseId
							const memberUser = member.user;
							const isSelected = localAssignees.some((a) => a.userId === memberUserId);
							const initials =
								memberUser?.firstName?.[0] || memberUser?.email?.[0]?.toUpperCase() || "U";
							const displayName =
								[memberUser?.firstName, memberUser?.lastName].filter(Boolean).join(" ") ||
								memberUser?.email ||
								"Unknown";
							return (
								<button
									key={member.id}
									onClick={() => handleToggleMember({ userId: memberUserId, user: memberUser })}
									className="w-full flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors text-left group"
								>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-[#F59E0B] flex items-center justify-center text-[12px] font-bold text-black uppercase">
											{initials}
										</div>
										<div className="flex flex-col">
											<span className="text-[13px] font-medium text-white/90">{displayName}</span>
											{memberUser?.username && (
												<span className="text-[11px] text-white/40">@{memberUser.username}</span>
											)}
										</div>
									</div>
									{isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
								</button>
							);
						})}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

const LABEL_COLORS = [
	{ name: "Green", color: "#4BCE97" },
	{ name: "Yellow", color: "#F5CD47" },
	{ name: "Orange", color: "#FEA362" },
	{ name: "Red", color: "#F87168" },
	{ name: "Purple", color: "#9F8FEF" },
	{ name: "Blue", color: "#579DFF" },
	{ name: "Teal", color: "#60C6D2" },
];

const COVER_COLORS = [
	"#61BD4F", // green
	"#F2D600", // yellow
	"#FF9F1A", // orange
	"#EB5A46", // red
	"#C377E0", // purple
	"#0079BF", // blue
	"#00C2E0", // teal
	"#51E898", // mint
	"#FF78CB", // pink
	"#344563", // dark navy
];

function CoverPopover({
	isOpen,
	setIsOpen,
	coverColor,
	coverSize,
	onCoverChange,
}: {
	isOpen: boolean;
	setIsOpen: (v: boolean) => void;
	coverColor: string | null;
	coverSize: "partial" | "full";
	onCoverChange: (color: string | null, size?: "partial" | "full") => void;
}) {
	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<button
					className={cn(
						"hover:text-white transition-colors p-1 rounded",
						isOpen ? "text-white bg-white/10" : "text-white/40",
					)}
					title="Cover"
				>
					<ImageIcon className="w-5 h-5" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[320px] p-0 border-white/10 bg-[#2A2B2E] text-white shadow-2xl rounded-xl z-[9999] overflow-hidden"
				align="end"
				sideOffset={8}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
					<span className="text-[14px] font-bold">Cover</span>
					<button
						onClick={() => setIsOpen(false)}
						className="text-white/50 hover:text-white transition-colors p-0.5"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				<div className="p-4 space-y-4">
					{/* Size picker */}
					<div>
						<p className="text-[11px] font-bold text-white/50 uppercase tracking-wide mb-2">Size</p>
						<div className="flex gap-2">
							{/* Partial size preview */}
							<button
								onClick={() => onCoverChange(coverColor, "partial")}
								className={cn(
									"flex-1 h-[70px] rounded-lg overflow-hidden border-2 transition-all relative",
									coverSize === "partial" ? "border-white" : "border-white/20",
								)}
								style={{ backgroundColor: coverColor ?? "#2A2B2E" }}
							>
								{/* Mock card lines */}
								<div className="absolute bottom-0 left-0 right-0 h-[42px] bg-[#1F2933] rounded-b-lg flex flex-col justify-center px-2 gap-1">
									<div className="h-1.5 w-14 rounded-full bg-white/30" />
									<div className="h-1 w-10 rounded-full bg-white/15" />
									<div className="h-1 w-8 rounded-full bg-white/10" />
								</div>
								{coverSize === "partial" && (
									<div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white flex items-center justify-center">
										<div className="w-2 h-2 rounded-full bg-[#2A2B2E]" />
									</div>
								)}
							</button>
							{/* Full size preview */}
							<button
								onClick={() => onCoverChange(coverColor, "full")}
								className={cn(
									"flex-1 h-[70px] rounded-lg overflow-hidden border-2 transition-all relative",
									coverSize === "full" ? "border-white" : "border-white/20",
								)}
								style={{ backgroundColor: coverColor ?? "#2A2B2E" }}
							>
								{coverSize === "full" && (
									<div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white flex items-center justify-center">
										<div className="w-2 h-2 rounded-full bg-[#2A2B2E]" />
									</div>
								)}
							</button>
						</div>
					</div>

					{/* Remove cover */}
					{coverColor && (
						<button
							onClick={() => {
								onCoverChange(null);
								setIsOpen(false);
							}}
							className="w-full py-1.5 text-[13px] font-bold text-white/80 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
						>
							Remove cover
						</button>
					)}

					{/* Color palette */}
					<div>
						<p className="text-[11px] font-bold text-white/50 uppercase tracking-wide mb-2">
							Colors
						</p>
						<div className="grid grid-cols-5 gap-2">
							{COVER_COLORS.map((c) => (
								<button
									key={c}
									onClick={() => onCoverChange(c, coverSize)}
									className="h-9 rounded-lg transition-all hover:scale-105 hover:shadow-lg relative border-2"
									style={{
										backgroundColor: c,
										borderColor: coverColor === c ? "white" : "transparent",
									}}
								>
									{coverColor === c && (
										<span className="absolute inset-0 flex items-center justify-center">
											<svg
												className="w-4 h-4 text-white drop-shadow"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={3}
											>
												<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
											</svg>
										</span>
									)}
								</button>
							))}
						</div>
					</div>

					{/* Colorblind mode */}
					<button className="w-full py-1.5 text-[13px] font-bold text-white/80 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
						Enable colorblind friendly mode
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export function TaskLabelPopover({
	task,
	isOpen,
	setIsOpen,
	onUpdateLabels,
	onCloseModal,
	trigger,
	onUpdateTask,
}: {
	task: Task;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	onUpdateLabels?: (labels: TaskLabel[]) => void;
	onCloseModal?: () => void;
	trigger?: React.ReactNode;
	onUpdateTask?: (id: string, data: Partial<Task>) => void;
	workspaceId?: string;
}) {
	const { token } = useSupabaseAuth();
	const [localLabels, setLocalLabels] = useState<TaskLabel[]>(task.labels || []);
	const [search, setSearch] = useState("");

	const handleToggleLabel = async (labelInfo: { name: string; color: string }) => {
		if (!token) return;

		const previousLabels = [...localLabels];
		const existing = localLabels.find((l) => l.color === labelInfo.color);

		if (existing) {
			// If clicking the existing label, remove it (toggle off)
			setLocalLabels([]);
			onUpdateLabels?.([]);
			onUpdateTask?.(task.id, { labels: [] });
		} else {
			// Add the new label
			const tempId = `temp-${Date.now()}`;
			const newLabel: TaskLabel = {
				id: tempId,
				taskId: task.id,
				name: labelInfo.name,
				color: labelInfo.color,
			};

			const newLabels = [...localLabels, newLabel];
			setLocalLabels(newLabels);
			onUpdateLabels?.(newLabels);
			onUpdateTask?.(task.id, { labels: newLabels });
		}
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				{trigger || (
					<ActionButton icon={<Tag className="w-4 h-4" />} label="Labels" active={isOpen} />
				)}
			</PopoverTrigger>
			<PopoverContent
				className="w-72 p-0 border-white/10 bg-[#2A2B2E] text-white shadow-2xl rounded-xl z-[9999]"
				align="start"
			>
				<div className="p-3 border-b border-white/10 flex items-center justify-between">
					<span className="text-sm font-bold text-white/70">Labels</span>
					<button
						onClick={() => setIsOpen(false)}
						className="p-1 hover:bg-white/10 rounded transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				<div className="p-3">
					<div className="relative mb-4">
						<input
							type="text"
							placeholder="Search labels..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full bg-[#1A1C1E] border border-white/10 rounded px-3 py-1.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#5294E2] transition-colors"
						/>
					</div>

					<div className="space-y-2">
						<h4 className="text-[11px] font-bold text-white/50 tracking-wide uppercase px-1">
							Labels
						</h4>
						<div className="space-y-1">
							{LABEL_COLORS.filter((lc) =>
								lc.name.toLowerCase().includes(search.toLowerCase()),
							).map((lc) => {
								const isSelected = localLabels.length > 0 && localLabels[0].color === lc.color;
								return (
									<button
										key={lc.color}
										onClick={() => handleToggleLabel(lc)}
										className="w-full h-8 rounded flex items-center justify-between px-3 text-[13px] font-medium transition-all hover:brightness-110 relative group"
										style={{ backgroundColor: lc.color, color: "rgba(0,0,0,0.8)" }}
									>
										<span>{lc.name}</span>
										{isSelected && (
											<svg
												className="w-4 h-4 text-black/60"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={3}
											>
												<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
											</svg>
										)}
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
