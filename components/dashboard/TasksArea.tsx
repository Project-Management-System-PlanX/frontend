"use client";

import {
	AtSign,
	Bold,
	CheckCircle2,
	Clock,
	Info,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	MessageSquare,
	Mic,
	MoreHorizontal,
	PlusCircle,
	Search,
	Star,
	Strikethrough,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useTasksAssignedToMe } from "@/hooks/api/use-tasks";
import { useMemberLookup } from "@/hooks/use-member-lookup";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Task } from "@/lib/types/models";

export function TasksArea() {
	const [taskInput, setTaskInput] = useState("");
	const [detailsOpen, setDetailsOpen] = useState(false);

	const { token } = useSupabaseAuth();
	const { data: serverTasks, isLoading } = useTasksAssignedToMe(token || undefined);
	const { getMember } = useMemberLookup();
	const tasks = serverTasks || [];

	return (
		<div
			className="flex-1 flex flex-col bg-white min-w-0"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* Tasks Header */}
			<div className="h-14 px-4 flex items-center justify-between border-b border-[#e5e7eb] shrink-0">
				<div className="flex items-center gap-3">
					<span className="text-[#202020] font-medium text-lg flex items-center gap-2">
						<CheckCircle2 className="w-5 h-5 text-[#0B6E4F]" />
						Tasks
					</span>
					<Button variant="ghost" size="icon" className="w-6 h-6 text-amber-400">
						<Star className="w-4 h-4 fill-current" />
					</Button>
				</div>

				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1 mr-2">
						<Badge
							variant="outline"
							className="text-xs font-normal text-slate-500 border-slate-200"
						>
							All Tasks
						</Badge>
						<Badge
							variant="outline"
							className="text-xs font-normal text-slate-500 border-slate-200"
						>
							My Tasks
						</Badge>
					</div>

					<div className="w-px h-6 bg-[#e5e7eb] mx-2" />

					<TooltipProvider delayDuration={0}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="w-8 h-8 text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"
								>
									<Search className="w-4 h-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Search tasks</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setDetailsOpen(!detailsOpen)}
									className={`w-8 h-8 hover:bg-[#f5f5f5] ${detailsOpen ? "text-[#0B6E4F]" : "text-[#9a9a9a] hover:text-[#202020]"}`}
								>
									<Info className="w-4 h-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{detailsOpen ? "Hide details" : "Show details"}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			{/* Tasks List Area */}
			<ScrollArea className="flex-1">
				<div className="p-4 space-y-4">
					{isLoading && <div className="p-4 text-center text-slate-400">Loading tasks...</div>}
					{!isLoading && tasks.length === 0 && (
						<div className="p-4 text-center text-slate-400">
							No tasks currently assigned to you.
						</div>
					)}
					{tasks.map((task: Task) => (
						<div
							key={task.id}
							className="p-4 rounded-xl border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors group"
						>
							<div className="flex gap-3">
								<div className="mt-1">
									<button
										type="button"
										className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.resolution === "DONE" ? "bg-[#0B6E4F] border-[#0B6E4F]" : "border-slate-300 hover:border-[#0B6E4F]"}`}
									>
										{task.resolution === "DONE" && (
											<CheckCircle2 className="w-3.5 h-3.5 text-white" />
										)}
									</button>
								</div>

								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between">
										<div className="space-y-1">
											<p
												className={`text-[15px] font-medium leading-normal ${task.resolution === "DONE" ? "text-slate-500 line-through" : "text-[#202020]"}`}
											>
												{task.title}
											</p>

											<div className="flex items-center gap-2 text-xs text-slate-500">
												<div className="flex items-center gap-1.5">
													<Avatar className="w-4 h-4">
													<AvatarImage src={getMember(task.reporterId).imageUrl} />
													<AvatarFallback className="text-[8px] bg-slate-100 uppercase">
														{getMember(task.reporterId).initials}
													</AvatarFallback>
												</Avatar>
												<span>{getMember(task.reporterId).name}</span>
												</div>
												<span>•</span>
												<div className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													<span>{new Date(task.createdAt).toLocaleDateString()}</span>
												</div>
												{task.dueDate && (
													<>
														<span>•</span>
														<span className="text-[#0B6E4F] font-medium bg-[#0B6E4F]/10 px-1.5 py-0.5 rounded">
															Due {new Date(task.dueDate).toLocaleDateString()}
														</span>
													</>
												)}
												{task.priority !== "NONE" && (
													<>
														<span>•</span>
														<Badge
															variant="secondary"
															className={`h-5 px-1.5 text-[10px] uppercase font-bold
															${
																task.priority === "CRITICAL" || task.priority === "HIGH"
																	? "bg-red-50 text-red-600"
																	: task.priority === "MEDIUM"
																		? "bg-amber-50 text-amber-600"
																		: "bg-blue-50 text-blue-600"
															}`}
														>
															{task.priority.toLowerCase()}
														</Badge>
													</>
												)}
											</div>
										</div>
									</div>

									{/* Attachments - none from backend currently mapped */}

									{/* Bottom Actions Row */}
									<div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
										<div className="flex items-center gap-2">
											{task.comments && task.comments.length > 0 ? (
												<Button
													variant="ghost"
													size="sm"
													className="h-7 text-slate-500 text-xs gap-1.5 px-2"
												>
													<MessageSquare className="w-3 h-3" />
													{task.comments.length} comments
												</Button>
											) : (
												<Button
													variant="ghost"
													size="sm"
													className="h-7 text-slate-500 text-xs px-2"
												>
													Comment
												</Button>
											)}
										</div>
										<Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
											<MoreHorizontal className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</ScrollArea>

			{/* Task Input */}
			<div className="p-4 border-t border-[#e5e7eb] shrink-0">
				<div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm">
					{/* Formatting Toolbar - Similar to Chat */}
					<div className="flex items-center gap-1 px-3 py-2 border-b border-[#e5e7eb]">
						<TooltipProvider delayDuration={0}>
							{[
								{ icon: Bold, label: "Bold" },
								{ icon: Italic, label: "Italic" },
								{ icon: Strikethrough, label: "Strikethrough" },
							].map(({ icon: Icon, label }) => (
								<Tooltip key={label}>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="w-7 h-7 text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"
										>
											<Icon className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>{label}</TooltipContent>
								</Tooltip>
							))}

							<div className="w-px h-4 bg-[#e5e7eb] mx-1" />

							{[
								{ icon: LinkIcon, label: "Add link" },
								{ icon: List, label: "Bulleted list" },
								{ icon: ListOrdered, label: "Numbered list" },
							].map(({ icon: Icon, label }) => (
								<Tooltip key={label}>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="w-7 h-7 text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"
										>
											<Icon className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>{label}</TooltipContent>
								</Tooltip>
							))}
						</TooltipProvider>
					</div>

					{/* Input */}
					<div className="px-3 py-3">
						<input
							type="text"
							value={taskInput}
							onChange={(e) => setTaskInput(e.target.value)}
							placeholder="Add a new task..."
							className="w-full bg-transparent text-[#202020] placeholder-[#9a9a9a] outline-none text-[15px]"
						/>
					</div>

					{/* Bottom Actions */}
					<div className="flex items-center justify-between px-3 py-2 border-t border-[#e5e7eb]">
						<div className="flex items-center gap-1">
							<TooltipProvider delayDuration={0}>
								{[
									{ icon: PlusCircle, label: "Attach" },
									{ icon: AtSign, label: "Assign" },
									{ icon: Clock, label: "Due Date" },
									{ icon: Mic, label: "Voice Note" },
								].map(({ icon: Icon, label }) => (
									<Tooltip key={label}>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="w-8 h-8 text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"
											>
												<Icon className="w-4 h-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>{label}</TooltipContent>
									</Tooltip>
								))}
							</TooltipProvider>
						</div>

						<Button
							size="icon"
							className="w-9 h-9 rounded-lg bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white"
							disabled={!taskInput.trim()}
						>
							<PlusCircle className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
