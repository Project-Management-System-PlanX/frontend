"use client";

import {
	AtSign,
	Bold,
	CheckCircle2,
	Clock,
	FileText,
	Info,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
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

interface TaskMessage {
	id: string;
	user: {
		name: string;
		avatar?: string;
		isBot?: boolean;
	};
	content: string;
	timestamp: string;
	status?: "todo" | "in-progress" | "done";
	priority?: "low" | "medium" | "high";
	dueDate?: string;
	reactions?: { emoji: string; count: number }[];
	attachment?: {
		name: string;
		type: string;
		size: string;
	};
	comments?: {
		count: number;
		lastComment: string;
		avatars: string[];
	};
}

const tasks: TaskMessage[] = [
	{
		id: "1",
		user: { name: "Alex Morgan", avatar: "/avatars/alex.png" },
		content:
			"Design the new dashboard layout for the Q3 release. Focusing on improved data visualization and dark mode support.",
		timestamp: "Today, 10:30 AM",
		status: "in-progress",
		priority: "high",
		dueDate: "Tomorrow",
		reactions: [{ emoji: "👍", count: 3 }],
		attachment: {
			name: "Dashboard_V3_Draft.fig",
			type: "FIGMA FILE",
			size: "4.2 MB",
		},
	},
	{
		id: "2",
		user: { name: "Sarah Chen", avatar: "/avatars/sarah.png" },
		content:
			"Review and merge the latest PR for the authentication flow updates. Need to ensure all edge cases are covered.",
		timestamp: "Today, 11:15 AM",
		status: "todo",
		priority: "medium",
		dueDate: "Feb 14",
		comments: {
			count: 2,
			lastComment: "Looking into it now...",
			avatars: ["/avatars/user.png", "/avatars/alex.png"],
		},
	},
	{
		id: "3",
		user: { name: "TeamUP Bot", isBot: true },
		content: "Weekly team sync preparation. Please update your status items before the meeting.",
		timestamp: "Yesterday, 4:00 PM",
		status: "done",
	},
];

export function TasksArea() {
	const [taskInput, setTaskInput] = useState("");
	const [detailsOpen, setDetailsOpen] = useState(false);

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
					{tasks.map((task) => (
						<div
							key={task.id}
							className="p-4 rounded-xl border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors group"
						>
							<div className="flex gap-3">
								<div className="mt-1">
									<button
										type="button"
										className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === "done" ? "bg-[#0B6E4F] border-[#0B6E4F]" : "border-slate-300 hover:border-[#0B6E4F]"}`}
									>
										{task.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
									</button>
								</div>

								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between">
										<div className="space-y-1">
											<p
												className={`text-[15px] font-medium leading-normal ${task.status === "done" ? "text-slate-500 line-through" : "text-[#202020]"}`}
											>
												{task.content}
											</p>

											<div className="flex items-center gap-2 text-xs text-slate-500">
												<div className="flex items-center gap-1.5">
													<Avatar className="w-4 h-4">
														<AvatarImage src={task.user.avatar} />
														<AvatarFallback className="text-[8px] bg-slate-100">
															{task.user.name.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<span>{task.user.name}</span>
												</div>
												<span>•</span>
												<div className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													<span>{task.timestamp}</span>
												</div>
												{task.dueDate && (
													<>
														<span>•</span>
														<span className="text-[#0B6E4F] font-medium bg-[#0B6E4F]/10 px-1.5 py-0.5 rounded">
															Due {task.dueDate}
														</span>
													</>
												)}
												{task.priority && (
													<>
														<span>•</span>
														<Badge
															variant="secondary"
															className={`h-5 px-1.5 text-[10px] uppercase font-bold
															${
																task.priority === "high"
																	? "bg-red-50 text-red-600"
																	: task.priority === "medium"
																		? "bg-amber-50 text-amber-600"
																		: "bg-blue-50 text-blue-600"
															}`}
														>
															{task.priority}
														</Badge>
													</>
												)}
											</div>
										</div>
									</div>

									{/* Attachments */}
									{task.attachment && (
										<div className="mt-3 inline-flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-[#e5e7eb] max-w-sm">
											<div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
												<FileText className="w-4 h-4 text-white" />
											</div>
											<div className="min-w-0">
												<p className="text-sm font-medium text-[#202020] truncate">
													{task.attachment.name}
												</p>
												<p className="text-[10px] text-[#9a9a9a]">
													{task.attachment.type} • {task.attachment.size}
												</p>
											</div>
										</div>
									)}

									{/* Bottom Actions Row */}
									<div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
										<div className="flex items-center gap-2">
											{task.comments && (
												<Button
													variant="ghost"
													size="sm"
													className="h-7 text-slate-500 text-xs gap-1.5 px-2"
												>
													<span className="flex -space-x-1">
														{task.comments.avatars.map((ava) => (
															<Avatar key={ava} className="w-4 h-4 border border-white">
																<AvatarImage src={ava} />
															</Avatar>
														))}
													</span>
													{task.comments.count} comments
												</Button>
											)}
											{!task.comments && (
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
