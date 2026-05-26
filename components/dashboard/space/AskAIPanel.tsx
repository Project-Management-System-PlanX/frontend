"use client";

import { motion, useDragControls } from "framer-motion";
import {
	Bot,
	CalendarIcon,
	Check,
	ChevronDown,
	Loader2,
	Maximize2,
	Minus,
	Send,
	Sparkles,
	User,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpaces } from "@/hooks/api/use-spaces";
import { useBulkCreateTasks } from "@/hooks/api/use-tasks";
import { useMemberLookup } from "@/hooks/use-member-lookup";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { useWorkspaceStore } from "@/stores/workspace-store";

// ─── Types ───
interface SuggestedTask {
	id: string;
	title: string;
	priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
	workType: "TASK" | "STORY" | "BUG" | "EPIC";
	assigneeId?: string;
	startDate?: Date;
	dueDate?: Date;
}

interface ChatMessage {
	id: string;
	role: "user" | "ai";
	content: string;
	tasks?: SuggestedTask[];
}

// ─── API integration ───
const AI_TASK_API = "/api/process-task";

function mapPriority(value?: string): SuggestedTask["priority"] {
	const v = (value || "medium").toLowerCase();
	if (v.includes("critical") || v.includes("urgent")) return "CRITICAL";
	if (v.includes("high")) return "HIGH";
	if (v.includes("low")) return "LOW";
	return "MEDIUM";
}

function mapWorkType(value?: string): SuggestedTask["workType"] {
	const v = (value || "task").toLowerCase();
	if (v.includes("bug") || v.includes("fix")) return "BUG";
	if (v.includes("story") || v.includes("feature")) return "STORY";
	if (v.includes("epic")) return "EPIC";
	return "TASK";
}

function parseDate(dateStr?: string): Date | undefined {
	if (!dateStr || dateStr === "TBD") return undefined;
	const d = new Date(dateStr);
	return Number.isNaN(d.getTime()) ? undefined : d;
}

async function fetchAITasks(
	description: string,
): Promise<{ tasks: SuggestedTask[]; summary: string }> {
	const res = await fetch(AI_TASK_API, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ task_description: description }),
	});

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.detail?.error || "Failed to generate tasks");
	}

	const data = await res.json();
	const today = new Date();

	const tasks: SuggestedTask[] = (data.subtasks || []).map(
		(
			st: {
				id?: string;
				title?: string;
				effort?: string;
				start_date?: string;
				due_date?: string;
			},
			i: number,
		) => ({
			id: st.id || `ai-${i + 1}`,
			title: st.title || `Subtask ${i + 1}`,
			priority: mapPriority(st.effort || data.priority),
			workType: mapWorkType(data.task_type),
			startDate:
				parseDate(st.start_date) ||
				new Date(today.getFullYear(), today.getMonth(), today.getDate() + i * 2),
			dueDate:
				parseDate(st.due_date) ||
				new Date(today.getFullYear(), today.getMonth(), today.getDate() + i * 2 + 3),
		}),
	);

	return {
		tasks,
		summary: data.llm_summary || `Here are ${tasks.length} suggested tasks for your project.`,
	};
}

// ─── Priority badge ───
const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
	LOW: { label: "Low", color: "text-blue-300", bg: "bg-blue-500/15" },
	MEDIUM: { label: "Medium", color: "text-yellow-300", bg: "bg-yellow-500/15" },
	HIGH: { label: "High", color: "text-emerald-300", bg: "bg-emerald-500/15" },
	CRITICAL: { label: "Critical", color: "text-red-300", bg: "bg-red-500/15" },
};

const workTypeConfig: Record<string, { label: string; color: string }> = {
	TASK: { label: "Task", color: "bg-blue-500" },
	STORY: { label: "Story", color: "bg-green-500" },
	BUG: { label: "Bug", color: "bg-red-500" },
	EPIC: { label: "Epic", color: "bg-purple-500" },
};

// ─── Component ───
export function AskAIPanel({
	open,
	onClose,
	spaceId,
	onTasksCreated,
}: {
	open: boolean;
	onClose: () => void;
	spaceId: string;
	onTasksCreated?: () => void;
}) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [confirmedMsgIds, setConfirmedMsgIds] = useState<Set<string>>(new Set());
	const [creatingMsgId, setCreatingMsgId] = useState<string | null>(null);
	const [isMinimized, setIsMinimized] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const dragControls = useDragControls();

	const { members } = useWorkspaceMembers();
	const { getMember } = useMemberLookup();
	const { token } = useSupabaseAuth();
	const { activeWorkspaceId } = useWorkspaceStore();
	const { data: spaces } = useSpaces(activeWorkspaceId || "", token || undefined);
	const space = spaces?.find((s) => s.id === spaceId);
	const defaultStatusId = space?.statuses?.[0]?.id || "";

	const bulkCreate = useBulkCreateTasks(token || undefined);

	const scrollToBottom = useCallback(() => {
		setTimeout(() => {
			if (scrollRef.current) {
				scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
			}
		}, 50);
	}, []);

	const handleSend = useCallback(async () => {
		const trimmed = input.trim();
		if (!trimmed) return;

		const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed };
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setIsTyping(true);
		scrollToBottom();

		try {
			const { tasks, summary } = await fetchAITasks(trimmed);

			const aiMsg: ChatMessage = {
				id: `a-${Date.now()}`,
				role: "ai",
				content: `${summary} You can assign members and adjust dates before creating them:`,
				tasks,
			};
			setMessages((prev) => [...prev, aiMsg]);
		} catch (err) {
			const errorMsg: ChatMessage = {
				id: `e-${Date.now()}`,
				role: "ai",
				content: `Sorry, I couldn't generate tasks right now. ${err instanceof Error ? err.message : "Please try again."}`,
			};
			setMessages((prev) => [...prev, errorMsg]);
		} finally {
			setIsTyping(false);
			scrollToBottom();
		}
	}, [input, scrollToBottom]);

	const updateTask = useCallback(
		(msgId: string, taskId: string, updates: Partial<SuggestedTask>) => {
			setMessages((prev) =>
				prev.map((m) =>
					m.id === msgId
						? {
								...m,
								tasks: m.tasks?.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
							}
						: m,
				),
			);
		},
		[],
	);

	const handleConfirmTasks = useCallback(
		async (msgId: string) => {
			const msg = messages.find((m) => m.id === msgId);
			if (!msg?.tasks || !spaceId) return;

			setCreatingMsgId(msgId);

			try {
				await bulkCreate.mutateAsync({
					tasks: msg.tasks.map((task) => ({
						spaceId,
						statusId: defaultStatusId, // Add statusId as well
						title: task.title,
						priority: task.priority,
						assigneeId: task.assigneeId,
						dueDate: task.dueDate?.toISOString(),
					})),
				});
				onTasksCreated?.();
			} catch (err) {
				console.error("Failed to bulk create tasks:", err);
			}

			setCreatingMsgId(null);
			setConfirmedMsgIds((prev) => new Set(prev).add(msgId));

			const successMsg: ChatMessage = {
				id: `s-${Date.now()}`,
				role: "ai",
				content: `All ${msg.tasks.length} tasks have been created successfully! They're now visible in your List, Board, and other views.`,
			};
			setMessages((prev) => [...prev, successMsg]);
			scrollToBottom();
		},
		[messages, spaceId, bulkCreate, scrollToBottom, defaultStatusId, onTasksCreated],
	);

	if (!open) return null;

	return (
		<motion.div
			drag
			dragListener={false}
			dragControls={dragControls}
			dragMomentum={false}
			style={{
				resize: isMinimized ? "none" : "both",
				overflow: isMinimized ? "hidden" : "visible",
			}}
			className={`fixed top-20 right-20 bg-[#111111] rounded-2xl shadow-2xl border border-white/10 flex flex-col z-[100] animate-[fadeInUp_0.25s_ease-out] ${
				isMinimized ? "w-[340px] h-auto" : "w-[500px] min-w-[300px] min-h-[400px] h-[650px]"
			}`}
		>
			{/* ── Header ── */}
			<div
				onPointerDown={(e) => dragControls.start(e)}
				className="flex items-center gap-3 px-4 py-3 bg-[#0D0D0D] border-b border-white/10 text-white cursor-grab active:cursor-grabbing"
			>
				<div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
					<Bot className="w-5 h-5" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold leading-tight">TeamUP AI</p>
					<p className="text-[11px] text-white/70">Describe your work, I'll break it into tasks</p>
				</div>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => setIsMinimized(!isMinimized)}
						className="p-1 hover:bg-white/20 rounded-full transition-colors"
					>
						{isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-4 h-4" />}
					</button>
					<button
						type="button"
						onClick={onClose}
						className="p-1 hover:bg-white/20 rounded-full transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			</div>

			{!isMinimized && (
				<>
					{/* ── Chat body ── */}
					<div
						ref={scrollRef}
						className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-4 bg-[#111111]"
						onScroll={() => {
							window.dispatchEvent(new CustomEvent("teamup-ai-scroll"));
						}}
					>
						{messages.length === 0 && (
							<div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
								<div className="w-14 h-14 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
									<Sparkles className="w-7 h-7 text-[#8B5CF6]" />
								</div>
								<div>
									<p className="text-sm font-semibold text-white/80">What are you working on?</p>
									<p className="text-xs text-white/50 mt-1 max-w-[260px]">
										Describe your feature or project and I'll suggest an ordered list of tasks with
										priorities.
									</p>
								</div>
								<div className="flex flex-wrap gap-1.5 mt-2 justify-center">
									{["Build a landing page", "Set up user auth", "Fix checkout bug"].map((ex) => (
										<button
											key={ex}
											type="button"
											onClick={() => {
												setInput(ex);
												inputRef.current?.focus();
											}}
											className="px-2.5 py-1 text-[11px] bg-[#1A1A1A] border border-white/10 text-white/70 rounded-full hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-colors"
										>
											{ex}
										</button>
									))}
								</div>
							</div>
						)}

						{messages.map((msg) => (
							<div key={msg.id}>
								{msg.role === "user" ? (
									<div className="flex justify-end">
										<div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-br-sm bg-[#8B5CF6] text-white text-[13px]">
											{msg.content}
										</div>
									</div>
								) : (
									<div className="space-y-2">
										<div className="flex items-start gap-2">
											<div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
												<Bot className="w-3.5 h-3.5 text-[#8B5CF6]" />
											</div>
											<p className="text-[13px] text-white/70 leading-relaxed">{msg.content}</p>
										</div>

										{msg.tasks && (
											<div className="ml-8 space-y-2">
												<div
													className="max-h-[320px] overflow-y-auto pr-1 custom-scrollbar"
													onScroll={() => {
														window.dispatchEvent(new CustomEvent("teamup-ai-scroll"));
													}}
												>
													{msg.tasks.map((task, idx) => (
														<TaskCard
															key={task.id}
															task={task}
															index={idx}
															members={members}
															getMember={getMember}
															onUpdate={(updates) => updateTask(msg.id, task.id, updates)}
															disabled={confirmedMsgIds.has(msg.id)}
														/>
													))}
												</div>

												{/* Confirm button */}
												{confirmedMsgIds.has(msg.id) ? (
													<div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg mt-1">
														<Check className="w-4 h-4 text-green-400" />
														<span className="text-[12px] font-medium text-green-400">
															Tasks created successfully
														</span>
													</div>
												) : (
													<button
														type="button"
														onClick={() => handleConfirmTasks(msg.id)}
														disabled={creatingMsgId === msg.id}
														className="w-full mt-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8B5CF6] text-white text-[13px] font-semibold rounded-lg hover:bg-[#7C3AED] disabled:opacity-60 transition-colors shadow-sm"
													>
														{creatingMsgId === msg.id ? (
															<>
																<Loader2 className="w-4 h-4 animate-spin" />
																Creating tasks...
															</>
														) : (
															<>
																<Check className="w-4 h-4" />
																Confirm & Create {msg.tasks.length} Tasks
															</>
														)}
													</button>
												)}
											</div>
										)}
									</div>
								)}
							</div>
						))}

						{isTyping && (
							<div className="flex items-start gap-2">
								<div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0">
									<Bot className="w-3.5 h-3.5 text-[#8B5CF6]" />
								</div>
								<div className="flex items-center gap-1 px-3 py-2 bg-white/5 rounded-2xl rounded-bl-sm border border-white/10">
									<span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:0ms]" />
									<span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:150ms]" />
									<span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:300ms]" />
								</div>
							</div>
						)}
					</div>

					{/* ── Input bar ── */}
					<div className="px-3 py-3 border-t border-white/5 bg-[#0D0D0D]">
						<div className="flex items-center gap-2 bg-[#1A1A1A] rounded-xl px-3 py-2 border border-white/10 focus-within:border-[#8B5CF6] transition-colors">
							<Sparkles className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
							<input
								ref={inputRef}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleSend();
									}
								}}
								placeholder="Describe your feature or project..."
								className="flex-1 bg-transparent outline-none text-[13px] text-white/90 placeholder:text-white/50"
							/>
							<button
								type="button"
								onClick={handleSend}
								disabled={!input.trim()}
								className="p-1.5 rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
							>
								<Send className="w-3.5 h-3.5" />
							</button>
						</div>
					</div>
				</>
			)}

			{/* Resize grip indicator */}
			{!isMinimized && (
				<div className="absolute bottom-1 right-1 w-4 h-4 flex items-center justify-center text-white/20 pointer-events-none">
					<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
						<title>Resize grip</title>
						<circle cx="8" cy="2" r="1" />
						<circle cx="8" cy="5.5" r="1" />
						<circle cx="8" cy="9" r="1" />
						<circle cx="4.5" cy="5.5" r="1" />
						<circle cx="4.5" cy="9" r="1" />
						<circle cx="1" cy="9" r="1" />
					</svg>
				</div>
			)}
		</motion.div>
	);
}

// ─── Task Card ───
function TaskCard({
	task,
	index,
	members,
	getMember,
	onUpdate,
	disabled,
}: {
	task: SuggestedTask;
	index: number;
	members: {
		userId: string;
		profile?: { firstName?: string; lastName?: string; imageUrl?: string };
	}[];
	getMember: (id: string) => { name: string; initials: string; imageUrl?: string };
	onUpdate: (updates: Partial<SuggestedTask>) => void;
	disabled?: boolean;
}) {
	const pri = priorityConfig[task.priority];
	const wt = workTypeConfig[task.workType];
	const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showDueDatePicker, setShowDueDatePicker] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setShowAssigneeDropdown(false);
			setShowStartDatePicker(false);
			setShowDueDatePicker(false);
		};

		window.addEventListener("teamup-ai-scroll", handleScroll);
		return () => {
			window.removeEventListener("teamup-ai-scroll", handleScroll);
		};
	}, []);

	const fmtDate = (d?: Date) =>
		d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";

	const assignee = task.assigneeId ? getMember(task.assigneeId) : null;

	return (
		<div
			className={`group bg-[#1A1A1A] border border-white/10 rounded-lg p-3 shadow-sm transition-all animate-[fadeInUp_0.3s_ease-out] ${disabled ? "opacity-60 cursor-default" : "hover:bg-[#222222] hover:border-white/20 hover:shadow-md"}`}
		>
			{/* Row 1: Order, type badge, title */}
			<div className="flex items-start gap-2">
				<span className="text-[11px] font-bold text-white/40 mt-0.5 w-4 text-center flex-shrink-0">
					{index + 1}
				</span>
				{disabled && <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />}
				<span
					className={`${wt.color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 uppercase tracking-wide`}
				>
					{wt.label}
				</span>
				<p className="text-[13px] font-semibold text-white/95 leading-snug flex-1">{task.title}</p>
			</div>

			{/* Row 2: Priority, Assignee, Dates - Enhanced */}
			<div className="flex items-center gap-2 mt-3 ml-6 flex-wrap">
				{/* Priority Badge */}
				<span
					className={`${pri.bg} ${pri.color} text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/10`}
				>
					{pri.label}
				</span>

				{/* Assignee Dropdown */}
				<Popover
					open={showAssigneeDropdown}
					onOpenChange={(openState) => {
						setShowAssigneeDropdown(openState);
						if (openState) {
							setShowStartDatePicker(false);
							setShowDueDatePicker(false);
						}
					}}
				>
					<PopoverTrigger asChild>
						<button
							type="button"
							disabled={disabled}
							className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all ${
								assignee
									? "border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20"
									: "border-white/20 bg-white/5 text-white/70 hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6]"
							} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
						>
							{assignee ? (
								<>
									<Avatar className="w-4 h-4">
										{assignee.imageUrl && <AvatarImage src={assignee.imageUrl} />}
										<AvatarFallback className="text-[7px] bg-[#8B5CF6] text-white font-bold">
											{assignee.initials}
										</AvatarFallback>
									</Avatar>
									<span className="max-w-[70px] truncate">{assignee.name}</span>
									<span
										role="button"
										tabIndex={disabled ? -1 : 0}
										aria-label="Clear assignee"
										onClick={(e) => {
											e.stopPropagation();
											if (!disabled) onUpdate({ assigneeId: undefined });
										}}
										onKeyDown={(e) => {
											if (disabled) return;
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												e.stopPropagation();
												onUpdate({ assigneeId: undefined });
											}
										}}
										className={`ml-0.5 hover:text-red-400 transition-colors ${
											disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
										}`}
									>
										<X className="w-3 h-3" />
									</span>
								</>
							) : (
								<>
									<User className="w-3.5 h-3.5" />
									<span>Assign</span>
									<ChevronDown className="w-3 h-3 ml-auto" />
								</>
							)}
						</button>
					</PopoverTrigger>
					<PopoverContent
						align="start"
						side="bottom"
						sideOffset={8}
						collisionPadding={12}
						className="w-56 p-2 z-[20000] bg-[#2A2B2E] text-white border border-white/10 shadow-2xl"
					>
						<div className="space-y-1">
							<button
								type="button"
								onClick={() => {
									onUpdate({ assigneeId: undefined });
									setShowAssigneeDropdown(false);
								}}
								className="w-full flex items-center gap-2 px-2 py-2 text-[12px] text-white/60 hover:bg-[#1A1A1A] hover:text-white/80 rounded transition-colors"
							>
								<X className="w-3.5 h-3.5" />
								<span>Unassigned</span>
							</button>
							<div className="h-px bg-white/10 my-1" />
							<ScrollArea className="max-h-40">
								{members.map((m) => {
									const info = getMember(m.userId);
									const isSelected = task.assigneeId === m.userId;
									return (
										<button
											key={m.userId}
											type="button"
											onClick={() => {
												onUpdate({ assigneeId: m.userId });
												setShowAssigneeDropdown(false);
											}}
											className={`w-full flex items-center gap-2 px-2 py-2 text-[12px] rounded transition-colors ${
												isSelected
													? "bg-[#8B5CF6]/20 text-white"
													: "text-white/70 hover:bg-[#1A1A1A] hover:text-white"
											}`}
										>
											<Avatar className="w-5 h-5">
												{info.imageUrl && <AvatarImage src={info.imageUrl} />}
												<AvatarFallback className="text-[8px] bg-[#8B5CF6] text-white font-bold">
													{info.initials}
												</AvatarFallback>
											</Avatar>
											<span className="flex-1 truncate text-left">{info.name}</span>
											{isSelected && <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />}
										</button>
									);
								})}
								{members.length === 0 && (
									<p className="text-xs text-white/40 text-center py-3">No members available</p>
								)}
							</ScrollArea>
						</div>
					</PopoverContent>
				</Popover>

				{/* Start Date Picker */}
				<Popover
					open={showStartDatePicker}
					onOpenChange={(openState) => {
						setShowStartDatePicker(openState);
						if (openState) {
							setShowAssigneeDropdown(false);
							setShowDueDatePicker(false);
						}
					}}
				>
					<PopoverTrigger asChild>
						<button
							type="button"
							disabled={disabled}
							className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all ${
								task.startDate
									? "border-blue-500/30 bg-blue-500/10 text-blue-300 hover:border-blue-500 hover:bg-blue-500/20"
									: "border-white/20 bg-white/5 text-white/60 hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
							} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
						>
							<CalendarIcon className="w-3.5 h-3.5" />
							<span>Start: {fmtDate(task.startDate)}</span>
						</button>
					</PopoverTrigger>
					<PopoverContent
						align="start"
						side="bottom"
						sideOffset={8}
						collisionPadding={12}
						className="w-auto p-3 z-[20000] bg-[#2A2B2E] text-white border border-white/10 shadow-2xl"
					>
						<Calendar
							mode="single"
							selected={task.startDate}
							onSelect={(d) => {
								if (d) onUpdate({ startDate: d });
								setShowStartDatePicker(false);
							}}
						/>
					</PopoverContent>
				</Popover>

				{/* Due Date Picker */}
				<Popover
					open={showDueDatePicker}
					onOpenChange={(openState) => {
						setShowDueDatePicker(openState);
						if (openState) {
							setShowAssigneeDropdown(false);
							setShowStartDatePicker(false);
						}
					}}
				>
					<PopoverTrigger asChild>
						<button
							type="button"
							disabled={disabled}
							className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all ${
								task.dueDate
									? "border-red-500/40 bg-red-500/10 text-red-300 hover:border-red-500 hover:bg-red-500/20"
									: "border-white/20 bg-white/5 text-white/60 hover:border-red-400 hover:bg-red-500/10 hover:text-red-300"
							} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
						>
							<CalendarIcon className="w-3.5 h-3.5" />
							<span>Due: {fmtDate(task.dueDate)}</span>
						</button>
					</PopoverTrigger>
					<PopoverContent
						align="start"
						side="bottom"
						sideOffset={8}
						collisionPadding={12}
						className="w-auto p-3 z-[20000] bg-[#2A2B2E] text-white border border-white/10 shadow-2xl"
					>
						<Calendar
							mode="single"
							selected={task.dueDate}
							onSelect={(d) => {
								if (d) onUpdate({ dueDate: d });
								setShowDueDatePicker(false);
							}}
						/>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
