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
	Edit2,
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
	Smile,
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
import type { Task, TaskComment, TaskLabel } from "@/lib/types/models";
import { cn } from "@/lib/utils";

interface TaskDetailModalProps {
	task: Task | null;
	isOpen: boolean;
	onClose: () => void;
	columnName?: string;
	onUpdateTask?: (id: string, data: Partial<Task>) => void;
	workspaceId?: string | null;
}
export default function TaskDetailModal({
	task,
	isOpen,
	onClose,
	columnName = "Today",
	onUpdateTask,
	workspaceId,
}: TaskDetailModalProps) {
	const { token, user } = useSupabaseAuth();
	const [comment, setComment] = useState("");
	const [localComments, setLocalComments] = useState<TaskComment[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isAddingComment, setIsAddingComment] = useState(false);
	const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
	const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
	const [isLabelPickerOpen, setIsLabelPickerOpen] = useState(false);

	const [localAssigneeId, setLocalAssigneeId] = useState<string | null>(task?.assigneeId || null);
	const [localDueDate, setLocalDueDate] = useState<Date | undefined>(
		task?.dueDate ? new Date(task.dueDate) : undefined,
	);
	const [localLabels, setLocalLabels] = useState<TaskLabel[]>(task?.labels || []);

	useEffect(() => {
		setLocalAssigneeId(task?.assigneeId || null);
		setLocalDueDate(task?.dueDate ? new Date(task.dueDate) : undefined);
		setLocalLabels(task?.labels || []);
	}, [task?.assigneeId, task?.dueDate, task?.labels]);

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
		if (!task || !editor || !onUpdateTask) return;
		setIsSaving(true);
		try {
			await onUpdateTask(task.id, { description: editor.getHTML() });
		} finally {
			setIsSaving(false);
		}
	};

	const handleAddComment = async () => {
		if (!task || !comment.trim() || !token) return;
		setIsAddingComment(true);
		try {
			const newComment = await taskService.addComment(task.id, comment, token);
			setLocalComments((prev) => [...prev, newComment]);
			setComment("");
		} catch (error) {
			console.error("Failed to add comment", error);
		} finally {
			setIsAddingComment(false);
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
					{/* Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
						<div className="flex items-center gap-2"></div>
						<div className="flex items-center gap-4 text-white/40">
							<button className="hover:text-white transition-colors p-1">
								<ImageIcon className="w-5 h-5" />
							</button>
							<button className="hover:text-white transition-colors p-1">
								<Eye className="w-5 h-5" />
							</button>
							<button className="hover:text-white transition-colors p-1">
								<MoreHorizontal className="w-5 h-5" />
							</button>
							<button onClick={onClose} className="hover:text-white transition-colors p-1 ml-2">
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
								/>

								<TaskMemberPopover
									task={task}
									workspaceMembers={workspaceMembers}
									isOpen={isMemberPickerOpen}
									setIsOpen={setIsMemberPickerOpen}
									onUpdateTask={onUpdateTask}
									onSelectionChange={setLocalAssigneeId}
								/>

								<ActionButton icon={<CheckSquare className="w-4 h-4" />} label="Checklist" />
							</div>

							{/* Assigned Meta Info Section */}
							{(localAssigneeId || localDueDate || (localLabels && localLabels.length > 0)) && (
								<div className="flex flex-wrap gap-8 mb-6 ml-1">
									{localAssigneeId && (
										<div className="flex flex-col gap-1.5">
											<h3 className="text-[11px] font-bold text-white/50 tracking-wide uppercase">
												Members
											</h3>
											<div className="flex items-center gap-1.5">
												<div className="w-7 h-7 rounded-full bg-[#F59E0B] flex items-center justify-center text-[11px] font-bold text-black shadow-sm uppercase shrink-0">
													{workspaceMembers.find((m) => m.userId === localAssigneeId)?.user
														?.firstName?.[0] || "U"}
												</div>
												<TaskMemberPopover
													task={task}
													workspaceMembers={workspaceMembers}
													isOpen={isMemberPickerOpen}
													setIsOpen={setIsMemberPickerOpen}
													onUpdateTask={onUpdateTask}
													onSelectionChange={setLocalAssigneeId}
													trigger={
														<button className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors border border-dashed border-white/20 cursor-pointer shrink-0">
															<Plus className="w-3.5 h-3.5" />
														</button>
													}
												/>
											</div>
										</div>
									)}

									{localLabels && localLabels.length > 0 && (
										<div className="flex flex-col gap-1.5">
											<h3 className="text-[11px] font-bold text-white/50 tracking-wide uppercase">
												Labels
											</h3>
											<div className="flex flex-wrap items-center gap-1.5">
												{localLabels.map((label) => (
													<div
														key={label.id}
														className="w-8 h-8 rounded shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
														style={{ backgroundColor: label.color }}
														title={label.name}
													/>
												))}
												<TaskLabelPopover
													task={task}
													isOpen={isLabelPickerOpen}
													setIsOpen={setIsLabelPickerOpen}
													onUpdateLabels={setLocalLabels}
													trigger={
														<button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors border border-dashed border-white/20 cursor-pointer shrink-0">
															<Plus className="w-3.5 h-3.5" />
														</button>
													}
												/>
											</div>
										</div>
									)}

									{localDueDate && (
										<div className="flex flex-col gap-1.5">
											<h3 className="text-[11px] font-bold text-white/50 tracking-wide uppercase">
												Due date
											</h3>
											<TaskDatePickerPopover
												task={task}
												isOpen={isDatePickerOpen}
												setIsOpen={setIsDatePickerOpen}
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
											disabled={isSaving}
											className="px-5 py-2 bg-[#5294E2] hover:bg-[#4A85CC] text-white rounded font-bold text-[14px] transition-colors disabled:opacity-50"
										>
											{isSaving ? "Saving..." : "Save"}
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
									disabled={isAddingComment}
									className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
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
									const initial = authorName.charAt(0).toUpperCase();

									return (
										<div key={c.id} className="flex gap-4">
											<div className="w-9 h-9 rounded-full bg-[#E67E22] flex items-center justify-center text-[14px] font-black shrink-0">
												{initial}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<span className="font-bold text-[14px]">{authorName}</span>
													<span className="text-blue-400 text-[12px] underline cursor-pointer">
														{format(new Date(c.createdAt), "MMM d, h:mm a")}
													</span>
												</div>
												<div className="bg-[#1A1A1A] rounded-lg p-3 text-[14px] text-white/80 border border-white/5 shadow-sm">
													{c.content}
												</div>
												<div className="flex items-center gap-3 mt-2 text-white/40 text-[12px]">
													<button className="hover:text-white flex items-center gap-1.5">
														<Smile className="w-3.5 h-3.5" />
													</button>
													{isMe && (
														<>
															<span>•</span>
															<button className="hover:text-white">Edit</button>
															<span>•</span>
															<button className="hover:text-[#FF6B6B]">Delete</button>
														</>
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
	}
>(({ icon, label, onClick, className, ...props }, ref) => {
	return (
		<button
			ref={ref}
			onClick={onClick}
			type="button"
			className={cn(
				"flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[14px] font-bold text-white/80 transition-colors",
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

function TaskDatePickerPopover({
	task,
	isOpen,
	setIsOpen,
	onUpdateTask,
	trigger,
	onDueDateChange,
}: {
	task: Task;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	onUpdateTask?: (id: string, data: Partial<Task>) => void;
	trigger?: React.ReactNode;
	onDueDateChange?: (date: Date | undefined) => void;
}) {
	const [startDate, setStartDate] = useState<Date | undefined>(
		task.startDate ? new Date(task.startDate) : undefined,
	);
	const [dueDate, setDueDate] = useState<Date | undefined>(
		task.dueDate ? new Date(task.dueDate) : undefined,
	);
	const [isStartEnabled, setIsStartEnabled] = useState(!!task.startDate);
	const [isDueEnabled, setIsDueEnabled] = useState(!!task.dueDate || true);

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
		if (isStartEnabled && startDate) {
			const s = new Date(startDate);
			s.setHours(12, 0, 0, 0);
			payload.startDate = s.toISOString();
		} else {
			payload.startDate = null as unknown as string;
		}

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
	};

	const handleRemove = () => {
		isSavingRef.current = true;
		if (onUpdateTask) {
			onUpdateTask(task.id, {
				startDate: null as unknown as string,
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
					/>
				)}
			</PopoverTrigger>
			<PopoverContent
				className="w-[340px] p-0 border-white/10 bg-[#2A2B2E] text-white shadow-2xl rounded-xl z-[9999]"
				align="start"
			>
				{/* Header */}
				<div className="flex items-center justify-between p-3 border-b border-white/10 relative">
					<div className="flex-1 text-center font-bold text-[14px]">Dates</div>
					<button
						onClick={() => setIsOpen(false)}
						className="absolute right-3 text-white/50 hover:text-white transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

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

				{/* Buttons */}
				<div className="p-3 pt-0 flex gap-2">
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

function TaskMemberPopover({
	task,
	workspaceMembers,
	isOpen,
	setIsOpen,
	onUpdateTask,
	trigger,
	onSelectionChange,
}: {
	task: Task;
	workspaceMembers: any[];
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	onUpdateTask?: (id: string, data: Partial<Task>) => void;
	trigger?: React.ReactNode;
	onSelectionChange?: (id: string | null) => void;
}) {
	const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(
		task.assigneeId || null,
	);

	useEffect(() => {
		if (isOpen) {
			setSelectedAssigneeId(task.assigneeId || null);
		}
	}, [isOpen, task.assigneeId]);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
	};

	const handleSelect = (userId: string | null) => {
		setSelectedAssigneeId(userId);
		onSelectionChange?.(userId);
		if (onUpdateTask) {
			onUpdateTask(task.id, { assigneeId: userId as string });
		}
		setIsOpen(false);
	};

	const selectedMember = workspaceMembers.find(
		(m) => m.userId === (isOpen ? selectedAssigneeId : task.assigneeId),
	);

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				{trigger || (
					<ActionButton
						icon={<Users className="w-4 h-4" />}
						label={selectedMember?.user?.firstName || selectedMember?.user?.email || "Members"}
					/>
				)}
			</PopoverTrigger>
			<PopoverContent
				className="w-[280px] p-0 border-white/10 bg-[#2A2B2E] text-white shadow-2xl rounded-xl z-[9999]"
				align="start"
			>
				{/* Header */}
				<div className="flex items-center justify-between p-3 border-b border-white/10 relative">
					<div className="flex-1 text-center font-bold text-[14px]">Members</div>
					<button
						onClick={() => setIsOpen(false)}
						className="absolute right-3 text-white/50 hover:text-white transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Search */}
				<div className="p-3 pb-0">
					<input
						type="text"
						placeholder="Search members"
						className="w-full bg-[#1A1C1E] border border-white/10 rounded px-3 py-1.5 text-[13px] text-white/90 focus:outline-none"
					/>
				</div>

				{/* Members List */}
				<div className="p-2 max-h-[200px] overflow-y-auto mt-2">
					<div className="px-2 pb-1 text-[11px] font-bold text-white/50 uppercase tracking-wider">
						Board members
					</div>
					{workspaceMembers.map((m) => {
						const isSelected = selectedAssigneeId === m.userId;
						return (
							<button
								key={m.userId}
								onClick={() => {
									const newId = isSelected ? null : m.userId;
									handleSelect(newId);
								}}
								className={cn(
									"w-full flex items-center gap-3 px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-left",
									isSelected && "bg-white/10",
								)}
							>
								<div className="w-6 h-6 rounded-full bg-[#5294E2] flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
									{m.user?.firstName?.[0] || m.user?.email?.[0] || "U"}
								</div>
								<div className="flex flex-col flex-1 min-w-0">
									<span className="text-[13px] font-medium truncate">
										{m.user?.firstName || m.user?.email}
									</span>
								</div>
								{isSelected && <CheckSquare className="w-4 h-4 text-[#5294E2] shrink-0" />}
							</button>
						);
					})}
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

function TaskLabelPopover({
	task,
	isOpen,
	setIsOpen,
	onUpdateLabels,
	trigger,
}: {
	task: Task;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	onUpdateLabels?: (labels: TaskLabel[]) => void;
	trigger?: React.ReactNode;
}) {
	const { token } = useSupabaseAuth();
	const [localLabels, setLocalLabels] = useState<TaskLabel[]>(task.labels || []);
	const [search, setSearch] = useState("");

	useEffect(() => {
		if (isOpen) {
			setLocalLabels(task.labels || []);
		}
	}, [isOpen, task.labels]);

	const handleToggleLabel = async (labelInfo: { name: string; color: string }) => {
		if (!token) return;

		const existing = localLabels.find((l) => l.color === labelInfo.color);

		if (existing) {
			// Remove
			const newLabels = localLabels.filter((l) => l.id !== existing.id);
			setLocalLabels(newLabels);
			onUpdateLabels?.(newLabels);
			try {
				await taskService.removeLabel(task.id, existing.id, token);
			} catch (err) {
				console.error("Failed to remove label", err);
			}
		} else {
			// Add
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
			try {
				const savedLabel = await taskService.addLabel(
					task.id,
					labelInfo.name,
					labelInfo.color,
					token,
				);
				const finalLabels = newLabels.map((l) => (l.id === tempId ? savedLabel : l));
				setLocalLabels(finalLabels);
				onUpdateLabels?.(finalLabels);
			} catch (err) {
				console.error("Failed to add label", err);
			}
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
								const isSelected = localLabels.some((l) => l.color === lc.color);
								return (
									<div key={lc.color} className="flex items-center gap-2 group">
										<div className="w-5 h-5 flex items-center justify-center">
											<Checkbox
												checked={isSelected}
												onCheckedChange={() => handleToggleLabel(lc)}
												className="border-white/20 data-[state=checked]:bg-[#5294E2] data-[state=checked]:border-[#5294E2]"
											/>
										</div>
										<button
											onClick={() => handleToggleLabel(lc)}
											className="flex-1 h-8 rounded flex items-center px-3 text-[13px] font-medium transition-all group-hover:brightness-110"
											style={{ backgroundColor: lc.color, color: "rgba(0,0,0,0.7)" }}
										>
											{lc.name === "Teal" ? "net" : ""}
										</button>
										<button className="p-1.5 hover:bg-white/5 rounded opacity-0 group-hover:opacity-100 transition-all">
											<Edit2 className="w-3.5 h-3.5 text-white/50" />
										</button>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
