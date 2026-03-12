"use client";

import {
	Bot,
	CalendarIcon,
	Check,
	ChevronDown,
	Loader2,
	Send,
	Sparkles,
	User,
	X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBulkCreateTasks } from "@/hooks/api/use-tasks";
import { useMemberLookup } from "@/hooks/use-member-lookup";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";

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
	LOW: { label: "Low", color: "text-blue-700", bg: "bg-blue-50" },
	MEDIUM: { label: "Medium", color: "text-yellow-700", bg: "bg-yellow-50" },
	HIGH: { label: "High", color: "text-orange-700", bg: "bg-orange-50" },
	CRITICAL: { label: "Critical", color: "text-red-700", bg: "bg-red-50" },
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
}: {
	open: boolean;
	onClose: () => void;
	spaceId: string;
}) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [confirmedMsgIds, setConfirmedMsgIds] = useState<Set<string>>(new Set());
	const [creatingMsgId, setCreatingMsgId] = useState<string | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const { members } = useWorkspaceMembers();
	const { getMember } = useMemberLookup();
	const { token } = useSupabaseAuth();
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
				await bulkCreate.mutateAsync(
					msg.tasks.map((task) => ({
						spaceId,
						title: task.title,
						priority: task.priority,
						workType: task.workType,
						assigneeId: task.assigneeId,
						startDate: task.startDate?.toISOString(),
						dueDate: task.dueDate?.toISOString(),
					})),
				);
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
		[messages, spaceId, bulkCreate, scrollToBottom],
	);

	if (!open) return null;

	return (
		<div className="fixed bottom-5 right-5 w-[420px] h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-[fadeInUp_0.25s_ease-out] overflow-hidden">
			{/* ── Header ── */}
			<div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#0B6E4F] to-[#0d8c64] text-white rounded-t-2xl">
				<div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
					<Bot className="w-5 h-5" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold leading-tight">TeamUP AI</p>
					<p className="text-[11px] text-white/70">Describe your work, I'll break it into tasks</p>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="p-1 hover:bg-white/20 rounded-full transition-colors"
				>
					<X className="w-4 h-4" />
				</button>
			</div>

			{/* ── Chat body ── */}
			<div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-slate-50/60">
				{messages.length === 0 && (
					<div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
						<div className="w-14 h-14 rounded-full bg-[#0B6E4F]/10 flex items-center justify-center">
							<Sparkles className="w-7 h-7 text-[#0B6E4F]" />
						</div>
						<div>
							<p className="text-sm font-semibold text-slate-700">What are you working on?</p>
							<p className="text-xs text-slate-400 mt-1 max-w-[260px]">
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
									className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 text-slate-600 rounded-full hover:border-[#0B6E4F] hover:text-[#0B6E4F] transition-colors"
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
								<div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-br-sm bg-[#0B6E4F] text-white text-[13px]">
									{msg.content}
								</div>
							</div>
						) : (
							<div className="space-y-2">
								<div className="flex items-start gap-2">
									<div className="w-6 h-6 rounded-full bg-[#0B6E4F]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
										<Bot className="w-3.5 h-3.5 text-[#0B6E4F]" />
									</div>
									<p className="text-[13px] text-slate-600 leading-relaxed">{msg.content}</p>
								</div>

								{msg.tasks && (
									<div className="ml-8 space-y-2">
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

										{/* Confirm button */}
										{confirmedMsgIds.has(msg.id) ? (
											<div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg mt-1">
												<Check className="w-4 h-4 text-green-600" />
												<span className="text-[12px] font-medium text-green-700">
													Tasks created successfully
												</span>
											</div>
										) : (
											<button
												type="button"
												onClick={() => handleConfirmTasks(msg.id)}
												disabled={creatingMsgId === msg.id}
												className="w-full mt-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B6E4F] text-white text-[13px] font-semibold rounded-lg hover:bg-[#095a40] disabled:opacity-60 transition-colors shadow-sm"
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
						<div className="w-6 h-6 rounded-full bg-[#0B6E4F]/10 flex items-center justify-center flex-shrink-0">
							<Bot className="w-3.5 h-3.5 text-[#0B6E4F]" />
						</div>
						<div className="flex items-center gap-1 px-3 py-2 bg-white rounded-2xl rounded-bl-sm border border-slate-100">
							<span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
							<span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
							<span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
						</div>
					</div>
				)}
			</div>

			{/* ── Input bar ── */}
			<div className="px-3 py-3 border-t border-slate-100 bg-white">
				<div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-[#0B6E4F] transition-colors">
					<Sparkles className="w-4 h-4 text-[#0B6E4F] flex-shrink-0" />
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
						className="flex-1 bg-transparent outline-none text-[13px] text-slate-800 placeholder:text-slate-400"
					/>
					<button
						type="button"
						onClick={handleSend}
						disabled={!input.trim()}
						className="p-1.5 rounded-lg bg-[#0B6E4F] text-white hover:bg-[#095a40] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					>
						<Send className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
		</div>
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

	const fmtDate = (d?: Date) =>
		d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";

	const assignee = task.assigneeId ? getMember(task.assigneeId) : null;

	return (
		<div
			className={`group bg-white border border-slate-150 rounded-lg p-3 shadow-sm transition-shadow animate-[fadeInUp_0.3s_ease-out] ${disabled ? "opacity-70" : "hover:shadow-md"}`}
		>
			{/* Row 1: Order, type badge, title */}
			<div className="flex items-start gap-2">
				<span className="text-[11px] font-bold text-slate-400 mt-0.5 w-4 text-center flex-shrink-0">
					{index + 1}
				</span>
				{disabled && <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />}
				<span
					className={`${wt.color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 uppercase tracking-wide`}
				>
					{wt.label}
				</span>
				<p className="text-[13px] font-medium text-slate-800 leading-snug">{task.title}</p>
			</div>

			{/* Row 2: Priority, Assignee, Dates */}
			<div className="flex items-center gap-2 mt-2 ml-6 flex-wrap">
				{/* Priority */}
				<span
					className={`${pri.bg} ${pri.color} text-[10px] font-semibold px-2 py-0.5 rounded-full`}
				>
					{pri.label}
				</span>

				{/* Assignee */}
				<Popover open={showAssigneeDropdown} onOpenChange={setShowAssigneeDropdown}>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border border-slate-200 hover:border-[#0B6E4F] text-slate-600 transition-colors"
						>
							{assignee ? (
								<>
									<div className="w-4 h-4 rounded-full bg-[#0B6E4F] text-white flex items-center justify-center text-[8px] font-bold">
										{assignee.initials}
									</div>
									<span className="max-w-[60px] truncate">{assignee.name}</span>
								</>
							) : (
								<>
									<User className="w-3 h-3 text-slate-400" />
									<span>Assign</span>
								</>
							)}
							<ChevronDown className="w-2.5 h-2.5 text-slate-400" />
						</button>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-48 p-1" side="bottom">
						<ScrollArea className="max-h-36">
							{members.map((m) => {
								const info = getMember(m.userId);
								return (
									<button
										key={m.userId}
										type="button"
										onClick={() => {
											onUpdate({ assigneeId: m.userId });
											setShowAssigneeDropdown(false);
										}}
										className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50 rounded transition-colors"
									>
										<Avatar className="w-5 h-5">
											{info.imageUrl && <AvatarImage src={info.imageUrl} />}
											<AvatarFallback className="text-[9px] bg-[#0B6E4F] text-white">
												{info.initials}
											</AvatarFallback>
										</Avatar>
										<span className="truncate">{info.name}</span>
									</button>
								);
							})}
							{members.length === 0 && (
								<p className="text-xs text-slate-400 text-center py-2">No members found</p>
							)}
						</ScrollArea>
					</PopoverContent>
				</Popover>

				{/* Start Date */}
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border border-slate-200 hover:border-[#0B6E4F] text-slate-600 transition-colors"
						>
							<CalendarIcon className="w-3 h-3 text-slate-400" />
							<span>{fmtDate(task.startDate)}</span>
						</button>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-auto p-0" side="bottom">
						<Calendar
							mode="single"
							selected={task.startDate}
							onSelect={(d) => d && onUpdate({ startDate: d })}
						/>
					</PopoverContent>
				</Popover>

				{/* Due Date */}
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border border-dashed border-red-300 hover:border-red-500 text-red-600 transition-colors"
						>
							<CalendarIcon className="w-3 h-3" />
							<span>{fmtDate(task.dueDate)}</span>
						</button>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-auto p-0" side="bottom">
						<Calendar
							mode="single"
							selected={task.dueDate}
							onSelect={(d) => d && onUpdate({ dueDate: d })}
						/>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
