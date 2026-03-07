"use client";

import {
	AlertTriangle,
	CalendarIcon,
	ChevronDown,
	Flag,
	LinkIcon,
	Loader2,
	Paperclip,
	Plus,
	Upload,
	X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSpaces } from "@/hooks/api/use-spaces";
import { useCreateTask } from "@/hooks/api/use-tasks";
import { useTeams } from "@/hooks/api/use-teams";
import { useWorkspaceMembers } from "@/hooks/api/use-workspaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Space, TaskStatus } from "@/lib/types/models";
import { useAppStore } from "@/stores/app-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

const WORK_TYPES = [
	{ value: "TASK", label: "Task", icon: "T", color: "bg-green-500" },
	{ value: "STORY", label: "Story", icon: "S", color: "bg-purple-500" },
	{ value: "BUG", label: "Bug", icon: "B", color: "bg-red-500" },
	{ value: "EPIC", label: "Epic", icon: "E", color: "bg-orange-500" },
	{ value: "SUBTASK", label: "Subtask", icon: "ST", color: "bg-slate-500" },
];

const PRIORITIES = [
	{ value: "CRITICAL", label: "Critical", color: "bg-red-500" },
	{ value: "HIGH", label: "High", color: "bg-orange-500" },
	{ value: "MEDIUM", label: "Medium", color: "bg-blue-500" },
	{ value: "LOW", label: "Low", color: "bg-slate-400" },
	{ value: "NONE", label: "None", color: "bg-slate-200" },
];

interface CreateTaskModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultSpaceId?: string;
}

export function CreateTaskModal({ open, onOpenChange, defaultSpaceId }: CreateTaskModalProps) {
	const { token } = useSupabaseAuth();
	const user = useAppStore((s) => s.user);
	const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

	// Data queries
	const { data: spaces } = useSpaces(activeWorkspaceId || "", token || undefined);
	const { data: members } = useWorkspaceMembers(activeWorkspaceId || "", token || undefined);
	const { data: teams } = useTeams(activeWorkspaceId || "", token || undefined);
	const { mutateAsync: createTask, isPending } = useCreateTask(token || undefined);

	// Form state
	const [spaceId, setSpaceId] = useState(defaultSpaceId || "");
	const [workType, setWorkType] = useState("TASK");
	const [summary, setSummary] = useState("");
	const [description, setDescription] = useState("");
	const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
	const [priority, setPriority] = useState("MEDIUM");
	const [parentId, setParentId] = useState<string | undefined>(undefined);
	const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [labelInput, setLabelInput] = useState("");
	const [labels, setLabels] = useState<string[]>([]);
	const [teamId, setTeamId] = useState<string | undefined>(undefined);
	const [flagged, setFlagged] = useState(false);
	const [restrictTo, setRestrictTo] = useState<string | undefined>(undefined);
	const [linkedWorkItem, setLinkedWorkItem] = useState("");
	const [createAnother, setCreateAnother] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const fileInputRef = useRef<HTMLInputElement>(null);

	const selectedSpace = spaces?.find((s: Space) => s.id === spaceId);

	const resetForm = useCallback(() => {
		if (!createAnother) {
			setSpaceId(defaultSpaceId || "");
		}
		setWorkType("TASK");
		setSummary("");
		setDescription("");
		setAssigneeId(undefined);
		setPriority("MEDIUM");
		setParentId(undefined);
		setDueDate(undefined);
		setStartDate(undefined);
		setLabelInput("");
		setLabels([]);
		setTeamId(undefined);
		setFlagged(false);
		setRestrictTo(undefined);
		setLinkedWorkItem("");
		setFiles([]);
		setErrors({});
	}, [createAnother, defaultSpaceId]);

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!spaceId) newErrors.spaceId = "Space is required";
		if (!summary.trim()) newErrors.summary = "Summary is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		const resolvedAssigneeId = assigneeId || undefined;

		try {
			await createTask({
				spaceId,
				title: summary.trim(),
				description: description.trim() || undefined,
				workType,
				priority,
				assigneeId: resolvedAssigneeId,
				dueDate: dueDate?.toISOString(),
				startDate: startDate?.toISOString(),
				parentId: parentId || undefined,
				teamId: teamId || undefined,
				flagged,
				restrictTo: restrictTo || undefined,
				labels: labels.length > 0 ? labels : undefined,
			});

			if (createAnother) {
				resetForm();
			} else {
				resetForm();
				onOpenChange(false);
			}
		} catch (err) {
			console.error("Failed to create task:", err);
		}
	};

	const handleAddLabel = () => {
		const trimmed = labelInput.trim();
		if (trimmed && !labels.includes(trimmed)) {
			setLabels([...labels, trimmed]);
			setLabelInput("");
		}
	};

	const handleFileDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		const droppedFiles = Array.from(e.dataTransfer.files);
		setFiles((prev) => [...prev, ...droppedFiles]);
	}, []);

	const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
		}
	}, []);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[1100px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-lg font-semibold">Create Task</DialogTitle>
					<DialogDescription className="text-sm text-slate-500">
						Fill in the details below to create a new work item.
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-x-6 gap-y-4 py-2">
					{/* ── Left Column ── */}

					{/* Space * */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">
							Space <span className="text-red-500">*</span>
						</Label>
						<Select value={spaceId} onValueChange={setSpaceId}>
							<SelectTrigger className={errors.spaceId ? "border-red-500" : ""}>
								<SelectValue placeholder="Select a space" />
							</SelectTrigger>
							<SelectContent>
								{spaces?.map((s: Space) => (
									<SelectItem key={s.id} value={s.id}>
										<span className="flex items-center gap-2">
											<span>{s.icon}</span>
											<span>
												{s.name} ({s.prefix})
											</span>
										</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.spaceId && <p className="text-xs text-red-500">{errors.spaceId}</p>}
					</div>

					{/* Work Type * */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">
							Work Type <span className="text-red-500">*</span>
						</Label>
						<Select value={workType} onValueChange={setWorkType}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{WORK_TYPES.map((wt) => (
									<SelectItem key={wt.value} value={wt.value}>
										<span className="flex items-center gap-2">
											<span
												className={`w-4 h-4 rounded text-[9px] font-bold text-white flex items-center justify-center ${wt.color}`}
											>
												{wt.icon}
											</span>{" "}
											{wt.label}
										</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Summary * — full width */}
					<div className="col-span-2 grid gap-1.5">
						<Label className="text-sm font-medium">
							Summary <span className="text-red-500">*</span>
						</Label>
						<Input
							value={summary}
							onChange={(e) => setSummary(e.target.value)}
							placeholder="Short title of the task"
							className={errors.summary ? "border-red-500" : ""}
						/>
						{errors.summary && <p className="text-xs text-red-500">{errors.summary}</p>}
					</div>

					{/* Description — full width */}
					<div className="col-span-2 grid gap-1.5">
						<Label className="text-sm font-medium">Description</Label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add a detailed description..."
							rows={3}
						/>
					</div>

					{/* Assignee */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">Assignee</Label>
						<Select
							value={assigneeId || "__none"}
							onValueChange={(v) => setAssigneeId(v === "__none" ? undefined : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Unassigned" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="__none">Unassigned</SelectItem>
								{(members as any[])?.map((m: any) => {
									const u = m.user;
									const name = u
										? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || u.email
										: m.userId.slice(0, 8);
									const initials =
										u?.firstName?.charAt(0)?.toUpperCase() || name.charAt(0)?.toUpperCase() || "?";
									const isMe = m.userId === user?.id;
									return (
										<SelectItem key={m.userId} value={m.userId}>
											<span className="flex items-center gap-2">
												<span
													className={`w-5 h-5 rounded-full ${isMe ? "bg-orange-500" : "bg-slate-500"} text-white flex items-center justify-center text-[9px] font-bold`}
												>
													{initials}
												</span>
												{name}
												{isMe ? " (me)" : ""}
											</span>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</div>

					{/* Priority */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">Priority</Label>
						<Select value={priority} onValueChange={setPriority}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PRIORITIES.map((p) => (
									<SelectItem key={p.value} value={p.value}>
										<span className="flex items-center gap-2">
											<span className={`w-2 h-2 rounded-full ${p.color}`} />
											{p.label}
										</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Start Date */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">Start Date</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" className="justify-start text-left font-normal">
									<CalendarIcon className="mr-2 h-4 w-4" />
									{startDate ? startDate.toLocaleDateString() : "Pick a date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar mode="single" selected={startDate} onSelect={setStartDate} />
							</PopoverContent>
						</Popover>
					</div>

					{/* Due Date */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">Due Date</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" className="justify-start text-left font-normal">
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dueDate ? dueDate.toLocaleDateString() : "Pick a date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
							</PopoverContent>
						</Popover>
					</div>

					{/* Parent */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">Parent</Label>
						<Select
							value={parentId || "none"}
							onValueChange={(v) => setParentId(v === "none" ? undefined : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select parent work item" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">None</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Team */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">Team</Label>
						<Select
							value={teamId || "none"}
							onValueChange={(v) => setTeamId(v === "none" ? undefined : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a team" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">None</SelectItem>
								{teams?.map((t) => (
									<SelectItem key={t.id} value={t.id}>
										{t.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Labels — full width */}
					<div className="col-span-2 grid gap-1.5">
						<Label className="text-sm font-medium">Labels</Label>
						<div className="flex items-center gap-2">
							<Input
								value={labelInput}
								onChange={(e) => setLabelInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddLabel();
									}
								}}
								placeholder="Type a label and press Enter"
								className="flex-1"
							/>
							<Button type="button" variant="outline" size="sm" onClick={handleAddLabel}>
								<Plus className="w-3 h-3" />
							</Button>
						</div>
						{labels.length > 0 && (
							<div className="flex flex-wrap gap-1.5 mt-1">
								{labels.map((label) => (
									<span
										key={label}
										className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full"
									>
										{label}
										<button
											type="button"
											onClick={() => setLabels(labels.filter((l) => l !== label))}
											className="hover:text-red-500"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					{/* Reporter (auto-filled) */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">Reporter</Label>
						<div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm">
							<div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[9px] font-bold">
								{user?.name?.charAt(0)?.toUpperCase() || "U"}
							</div>
							<span className="text-slate-700">{user?.name || user?.email || "Current User"}</span>
						</div>
					</div>

					{/* Restrict To */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">Restrict To</Label>
						<Select
							value={restrictTo || "none"}
							onValueChange={(v) => setRestrictTo(v === "none" ? undefined : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No restriction</SelectItem>
								<SelectItem value="ADMIN">Admin</SelectItem>
								<SelectItem value="MEMBER">Member</SelectItem>
								<SelectItem value="OWNER">Owner</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Attachment — full width */}
					<div className="col-span-2 grid gap-1.5">
						<Label className="text-sm font-medium">Attachment</Label>
						<div
							onDrop={handleFileDrop}
							onDragOver={(e) => e.preventDefault()}
							className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center hover:border-[#0B6E4F] hover:bg-[#0B6E4F]/5 transition-colors cursor-pointer"
							onClick={() => fileInputRef.current?.click()}
							onKeyDown={(e) => {
								if (e.key === "Enter") fileInputRef.current?.click();
							}}
						>
							<input
								ref={fileInputRef}
								type="file"
								multiple
								className="hidden"
								onChange={handleFileSelect}
							/>
							<Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
							<p className="text-xs text-slate-500">
								Drag & drop or <span className="text-[#0B6E4F] font-medium">browse</span>
							</p>
						</div>
						{files.length > 0 && (
							<div className="space-y-1 mt-1">
								{files.map((file, idx) => (
									<div
										key={`${file.name}-${idx}`}
										className="flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded text-sm"
									>
										<div className="flex items-center gap-2 min-w-0">
											<Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
											<span className="truncate text-slate-700">{file.name}</span>
											<span className="text-xs text-slate-400 shrink-0">
												{(file.size / 1024).toFixed(1)} KB
											</span>
										</div>
										<button
											type="button"
											onClick={() => setFiles(files.filter((_, i) => i !== idx))}
											className="text-slate-400 hover:text-red-500"
										>
											<X className="w-3.5 h-3.5" />
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Linked Work Items — full width */}
					<div className="col-span-2 grid gap-1.5">
						<Label className="text-sm font-medium">Linked Work Items</Label>
						<div className="flex items-center gap-2">
							<Select defaultValue="blocks">
								<SelectTrigger className="w-[140px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="blocks">blocks</SelectItem>
									<SelectItem value="is-blocked-by">is blocked by</SelectItem>
									<SelectItem value="relates-to">relates to</SelectItem>
									<SelectItem value="duplicates">duplicates</SelectItem>
								</SelectContent>
							</Select>
							<Input
								value={linkedWorkItem}
								onChange={(e) => setLinkedWorkItem(e.target.value)}
								placeholder="Search or paste a URL"
								className="flex-1"
							/>
						</div>
					</div>

					{/* Flagged — full width */}
					<div className="col-span-2 flex items-center justify-between rounded-lg border border-slate-200 p-3">
						<div className="flex items-center gap-2">
							<Flag className={`w-4 h-4 ${flagged ? "text-red-500" : "text-slate-400"}`} />
							<div>
								<Label className="text-sm font-medium">Flagged</Label>
								<p className="text-xs text-slate-400">Mark as impediment</p>
							</div>
						</div>
						<Switch checked={flagged} onCheckedChange={setFlagged} />
					</div>
				</div>

				{/* Footer */}
				<DialogFooter className="flex items-center justify-between gap-2 pt-4 border-t border-slate-200">
					<label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
						<Checkbox checked={createAnother} onCheckedChange={(v) => setCreateAnother(!!v)} />
						Create another
					</label>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={() => {
								resetForm();
								onOpenChange(false);
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={isPending}
							className="bg-[#0B6E4F] hover:bg-[#095C42] text-white"
						>
							{isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
							Create
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
