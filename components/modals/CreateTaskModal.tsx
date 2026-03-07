"use client";

import { CalendarIcon, Loader2, Paperclip, Plus, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { useSpaces } from "@/hooks/api/use-spaces";
import { useCreateTask } from "@/hooks/api/use-tasks";
import { useAddTeamMember, useCreateTeam, useTeams } from "@/hooks/api/use-teams";
import { useWorkspaceMembers } from "@/hooks/api/use-workspaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Space, WorkspaceMember } from "@/lib/types/models";
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
	parentTaskId?: string;
}

export function CreateTaskModal({
	open,
	onOpenChange,
	defaultSpaceId,
	parentTaskId,
}: CreateTaskModalProps) {
	const { token, user: supabaseUser } = useSupabaseAuth();
	const user = useAppStore((s) => s.user);
	const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

	// Data queries
	const { data: spaces } = useSpaces(activeWorkspaceId || "", token || undefined);
	const { data: members } = useWorkspaceMembers(activeWorkspaceId || "", token || undefined);
	const { data: teams } = useTeams(activeWorkspaceId || "", token || undefined);
	const { mutateAsync: createTask, isPending: isCreatingTask } = useCreateTask(token || undefined);
	const { mutateAsync: createTeam, isPending: isCreatingTeamService } = useCreateTeam(
		token || undefined,
	);
	const { mutateAsync: addTeamMember } = useAddTeamMember(token || undefined);

	// Form state
	const [spaceId, setSpaceId] = useState(defaultSpaceId || "");
	const [workType, setWorkType] = useState("TASK");
	const [summary, setSummary] = useState("");
	const [description, setDescription] = useState("");
	const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
	const [priority, setPriority] = useState("MEDIUM");
	const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [labelInput, setLabelInput] = useState("");
	const [labels, setLabels] = useState<string[]>([]);
	const [teamId, setTeamId] = useState<string | undefined>(undefined);
	const [parentId, setParentId] = useState<string | undefined>(parentTaskId);
	const [subtaskTitles, setSubtaskTitles] = useState<string[]>([]);
	const [subtaskInput, setSubtaskInput] = useState("");

	// Team creation state inline
	const [isCreatingNewTeam, setIsCreatingNewTeam] = useState(false);
	const [newTeamName, setNewTeamName] = useState("");
	const [newTeamMembers, setNewTeamMembers] = useState<string[]>([]);

	const [linkedWorkItem, setLinkedWorkItem] = useState("");
	const [createAnother, setCreateAnother] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const fileInputRef = useRef<HTMLInputElement>(null);

	const _selectedSpace = spaces?.find((s: Space) => s.id === spaceId);

	const resetForm = useCallback(() => {
		if (!createAnother) {
			setSpaceId(defaultSpaceId || "");
		}
		setWorkType("TASK");
		setSummary("");
		setDescription("");
		setAssigneeId(undefined);
		setPriority("MEDIUM");
		setDueDate(undefined);
		setStartDate(undefined);
		setLabelInput("");
		setLabels([]);
		setTeamId(undefined);
		setParentId(parentTaskId);
		setSubtaskTitles([]);
		setSubtaskInput("");
		setIsCreatingNewTeam(false);
		setNewTeamName("");
		setNewTeamMembers([]);
		setLinkedWorkItem("");
		setFiles([]);
		setErrors({});
	}, [createAnother, defaultSpaceId, parentTaskId]);

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!spaceId) newErrors.spaceId = "Space is required";
		if (!summary.trim()) newErrors.summary = "Summary is required";
		if (isCreatingNewTeam && !newTeamName.trim()) newErrors.newTeamName = "Team name is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		const resolvedAssigneeId = assigneeId || undefined;

		try {
			let finalTeamId = teamId;
			if (isCreatingNewTeam && newTeamName.trim()) {
				// Create the team first
				const newTeam = await createTeam({
					workspaceId: activeWorkspaceId || "",
					name: newTeamName.trim(),
				});
				finalTeamId = newTeam?.id;

				if (finalTeamId) {
					// Implicitly include the current user who is creating the task/team
					const currentUserId = supabaseUser?.id || user?.id;
					const membersToProcess = Array.from(
						new Set([...(currentUserId ? [currentUserId] : []), ...newTeamMembers]),
					);

					// Add members to the new team
					await Promise.all(
						membersToProcess.map((memberId) =>
							addTeamMember({
								teamId: finalTeamId as string,
								data: { userId: memberId, role: "MEMBER" },
							}),
						),
					);
				}
			}

			const createdTask = await createTask({
				spaceId,
				title: summary.trim(),
				description: description.trim() || undefined,
				workType,
				priority,
				assigneeId: resolvedAssigneeId,
				dueDate: dueDate
					? new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000).toISOString()
					: undefined,
				startDate: startDate
					? new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString()
					: undefined,
				teamId: finalTeamId || undefined,
				parentId: parentId,
			});

			// Create subtasks after main task
			if (subtaskTitles.length > 0 && createdTask?.id) {
				await Promise.all(
					subtaskTitles.map((title) => createTask({ spaceId, title, parentId: createdTask.id })),
				);
			}

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
		const selectedFiles = e.target.files;
		if (selectedFiles) {
			setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
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

					{/* Assigned To */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">Assigned To</Label>
						<Select
							value={assigneeId || "__none"}
							onValueChange={(v) => setAssigneeId(v === "__none" ? undefined : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Unassigned" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="__none">Unassigned</SelectItem>
								{(
									members as (WorkspaceMember & {
										user?: {
											firstName?: string;
											lastName?: string;
											username?: string;
											email?: string;
										};
									})[]
								)?.map((m) => {
									const u = m.user;
									const name = u
										? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || u.email
										: m.userId.slice(0, 8);
									const initials =
										u?.firstName?.charAt(0)?.toUpperCase() ||
										(name ?? "").charAt(0)?.toUpperCase() ||
										"?";
									const isMe = m.userId === (supabaseUser?.id || user?.id);
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
								<Button variant="outline" className="justify-start text-left font-normal bg-white">
									<CalendarIcon className="mr-2 h-4 w-4" />
									{startDate ? startDate.toLocaleDateString() : "Pick a date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0 bg-white" align="start">
								<Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
							</PopoverContent>
						</Popover>
					</div>

					{/* Due Date */}
					<div className="grid gap-1.5">
						<Label className="text-sm font-medium">Due Date</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" className="justify-start text-left font-normal bg-white">
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dueDate ? dueDate.toLocaleDateString() : "Pick a date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0 bg-white" align="start">
								<Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
							</PopoverContent>
						</Popover>
					</div>

					{/* Team */}
					<div className="col-span-2 grid gap-1.5">
						<div className="flex items-center justify-between">
							<Label className="text-sm font-medium">Team</Label>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => setIsCreatingNewTeam(!isCreatingNewTeam)}
								className="h-6 text-xs text-[#0B6E4F]"
							>
								{isCreatingNewTeam ? "Select Existing Team" : "Create New Team"}
							</Button>
						</div>

						{isCreatingNewTeam ? (
							<div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
								<div className="grid gap-1.5">
									<Label className="text-xs text-slate-500">New Team Name</Label>
									<Input
										value={newTeamName}
										onChange={(e) => setNewTeamName(e.target.value)}
										placeholder="e.g. Frontend Team"
										className={errors.newTeamName ? "border-red-500 bg-white" : "bg-white"}
									/>
									{errors.newTeamName && (
										<p className="text-xs text-red-500">{errors.newTeamName}</p>
									)}
								</div>

								<div className="grid gap-1.5">
									<Label className="text-xs text-slate-500">Initial Team Members</Label>
									<Select
										value=""
										onValueChange={(v) => {
											if (v && !newTeamMembers.includes(v)) {
												setNewTeamMembers([...newTeamMembers, v]);
											}
										}}
									>
										<SelectTrigger className="bg-white">
											<SelectValue placeholder="Add members..." />
										</SelectTrigger>
										<SelectContent>
											{/* biome-ignore lint/suspicious/noExplicitAny: members include nested user from API */}
											{(members as any[])
												?.filter(
													(m) =>
														!newTeamMembers.includes(m.userId) &&
														m.userId !== (supabaseUser?.id || user?.id),
												)
												.map((m: any) => {
													const u = m.user;
													const name = u
														? [u.firstName, u.lastName].filter(Boolean).join(" ") ||
															u.username ||
															u.email
														: m.userId.slice(0, 8);
													return (
														<SelectItem key={m.userId} value={m.userId}>
															{name}
														</SelectItem>
													);
												})}
										</SelectContent>
									</Select>

									{newTeamMembers.length > 0 && (
										<div className="flex flex-wrap gap-1.5 mt-1">
											{newTeamMembers.map((memberId) => {
												// biome-ignore lint/suspicious/noExplicitAny: members include nested user from API
												const m = (members as any[])?.find((x) => x.userId === memberId);
												const u = m?.user;
												const name = u
													? [u.firstName, u.lastName].filter(Boolean).join(" ") ||
														u.username ||
														u.email
													: memberId.slice(0, 8);
												return (
													<span
														key={memberId}
														className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-full"
													>
														{name}
														<button
															type="button"
															onClick={() =>
																setNewTeamMembers(newTeamMembers.filter((id) => id !== memberId))
															}
															className="hover:text-red-500"
														>
															<X className="w-3 h-3" />
														</button>
													</span>
												);
											})}
										</div>
									)}
								</div>
							</div>
						) : (
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
						)}
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
								{(() => {
									const m = (members as any[])?.find(
										(x) => x.userId === (supabaseUser?.id || user?.id),
									);
									const u = m?.user;
									const name = u
										? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || u.email
										: (user as any)?.user_metadata?.full_name ||
											(user as any)?.user_metadata?.name ||
											user?.email ||
											"Current User";
									return name.charAt(0).toUpperCase() || "U";
								})()}
							</div>
							<span className="text-slate-700">
								{(() => {
									// biome-ignore lint/suspicious/noExplicitAny: members include nested user from API
									const m = (members as any[])?.find(
										(x) => x.userId === (supabaseUser?.id || user?.id),
									);
									const u = m?.user;
									return u
										? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || u.email
										: (user as any)?.user_metadata?.full_name ||
												(user as any)?.user_metadata?.name ||
												user?.email ||
												"Current User";
								})()}
							</span>
						</div>
					</div>

					{/* Attachment — full width */}
					<div className="col-span-2 grid gap-1.5">
						<Label className="text-sm font-medium">Attachment</Label>
						<div
							role="button"
							tabIndex={0}
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
								{files.map((file) => (
									<div
										key={`${file.name}-${file.size}-${file.lastModified}`}
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
											onClick={() => setFiles(files.filter((f) => f !== file))}
											className="text-slate-400 hover:text-red-500"
										>
											<X className="w-3.5 h-3.5" />
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Subtasks — full width */}
					<div className="col-span-2 grid gap-2">
						<Label className="text-sm font-medium">
							Subtasks <span className="text-slate-400 font-normal">(optional)</span>
						</Label>

						{/* Existing subtask list */}
						{subtaskTitles.length > 0 && (
							<div className="space-y-1.5 mb-1">
								{subtaskTitles.map((title, idx) => (
									<div
										key={`subtask-${title}`}
										className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
									>
										<span className="w-4 h-4 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
											{idx + 1}
										</span>
										<span className="flex-1 text-sm text-slate-700">{title}</span>
										<button
											type="button"
											onClick={() => setSubtaskTitles((prev) => prev.filter((_, i) => i !== idx))}
											className="text-slate-400 hover:text-red-500 transition-colors"
										>
											<X className="w-3.5 h-3.5" />
										</button>
									</div>
								))}
							</div>
						)}

						{/* Input to add new subtask */}
						<div className="flex items-center gap-2">
							<Input
								value={subtaskInput}
								onChange={(e) => setSubtaskInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										const t = subtaskInput.trim();
										if (t) {
											setSubtaskTitles((prev) => [...prev, t]);
											setSubtaskInput("");
										}
									}
								}}
								placeholder="Type a subtask title and press Enter…"
								className="flex-1"
							/>
							<button
								type="button"
								onClick={() => {
									const t = subtaskInput.trim();
									if (t) {
										setSubtaskTitles((prev) => [...prev, t]);
										setSubtaskInput("");
									}
								}}
								disabled={!subtaskInput.trim()}
								className="flex items-center gap-1 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors disabled:opacity-40"
							>
								<Plus className="w-3.5 h-3.5" />
								Add
							</button>
						</div>
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
				</div>

				{/* Footer */}
				<DialogFooter className="flex items-center justify-between gap-2 pt-4 border-t border-slate-200">
					<div className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
						<Checkbox
							id="create-another"
							checked={createAnother}
							onCheckedChange={(v) => setCreateAnother(!!v)}
						/>
						<Label htmlFor="create-another" className="text-sm text-slate-600 cursor-pointer">
							Create another
						</Label>
					</div>
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
							disabled={isCreatingTask || isCreatingTeamService}
							className="bg-[#0B6E4F] hover:bg-[#095C42] text-white"
						>
							{(isCreatingTask || isCreatingTeamService) && (
								<Loader2 className="w-4 h-4 mr-1 animate-spin" />
							)}
							Create
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
