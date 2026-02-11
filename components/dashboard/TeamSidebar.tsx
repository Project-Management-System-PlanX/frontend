"use client";

import {
	CheckSquare,
	ChevronDown,
	ExternalLink,
	FolderOpen,
	Hash,
	Home,
	MessageSquare,
	Plus,
	Settings,
	UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DirectoriesSection } from "./DirectoriesSection";

interface Channel {
	id: string;
	name: string;
	unread?: boolean;
}

interface DirectMessage {
	id: string;
	name: string;
	avatar?: string;
	online?: boolean;
}

interface TeamSidebarProps {
	activeChannel: string;
	onChannelSelect: (channelId: string) => void;
	onDirectorySelect?: (directory: string) => void;
}

const channels: Channel[] = [
	{ id: "all-teamup", name: "all-teamup" },
	{ id: "product-design", name: "product-design" },
	{ id: "marketing-dev", name: "marketing-dev" },
];

const directMessages: DirectMessage[] = [
	{ id: "user-1", name: "Ravikrishna J (you)", online: true },
	{ id: "user-2", name: "Sarah Chen", online: true },
	{ id: "user-3", name: "Alex Morgan", online: false },
];

export function TeamSidebar({
	activeChannel,
	onChannelSelect,
	onDirectorySelect,
}: TeamSidebarProps) {
	const [channelsExpanded, setChannelsExpanded] = useState(true);
	const [dmsExpanded, setDmsExpanded] = useState(true);
	const [activeDirectory, setActiveDirectory] = useState<string | undefined>("channels");
	const pathname = usePathname();

	const handleDirectorySelect = (directory: string) => {
		setActiveDirectory(directory);
		onChannelSelect(""); // Clear active channel
		onDirectorySelect?.(directory);
	};

	const handleChannelSelect = (channelId: string) => {
		setActiveDirectory(undefined); // Clear active directory
		onChannelSelect(channelId);
	};

	return (
		<div className="flex h-full" style={{ fontFamily: "var(--font-figtree), Figtree" }}>
			{/* Icon Rail */}
			<div className="w-14 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 gap-3">
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Link href="/dashboard">
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"w-9 h-9 rounded-lg transition-colors",
										pathname === "/dashboard"
											? "bg-[#0B6E4F] text-white hover:bg-[#0B6E4F]/90"
											: "text-slate-500 hover:text-slate-900 hover:bg-slate-200",
									)}
								>
									<Home className="w-5 h-5" />
								</Button>
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">Dashboard</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Link href="/dashboard/chat">
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"w-9 h-9 rounded-lg transition-colors",
										pathname === "/dashboard/chat"
											? "bg-[#0B6E4F] text-white hover:bg-[#0B6E4F]/90"
											: "text-slate-500 hover:text-slate-900 hover:bg-slate-200",
									)}
								>
									<MessageSquare className="w-5 h-5" />
								</Button>
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">Chat</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Link href="/dashboard/task">
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"w-9 h-9 rounded-lg transition-colors",
										pathname === "/dashboard/task"
											? "bg-[#0B6E4F] text-white hover:bg-[#0B6E4F]/90"
											: "text-slate-500 hover:text-slate-900 hover:bg-slate-200",
									)}
								>
									<CheckSquare className="w-5 h-5" />
								</Button>
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">Tasks</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Link href="/dashboard/files">
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"w-9 h-9 rounded-lg transition-colors",
										pathname === "/dashboard/files"
											? "bg-[#0B6E4F] text-white hover:bg-[#0B6E4F]/90"
											: "text-slate-500 hover:text-slate-900 hover:bg-slate-200",
									)}
								>
									<FolderOpen className="w-5 h-5" />
								</Button>
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">Files</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<div className="flex-1" />

				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200"
							>
								<Settings className="w-5 h-5" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">Settings</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<Avatar className="w-9 h-9 ring-2 ring-[#0B6E4F]/20">
					<AvatarImage src="/avatars/user.png" />
					<AvatarFallback className="bg-[#0B6E4F] text-white text-sm font-medium">
						RJ
					</AvatarFallback>
				</Avatar>
			</div>

			{/* Channel List */}
			<div className="w-56 bg-white flex flex-col border-r border-slate-200">
				{/* Team Header */}
				<div className="p-4 flex items-center justify-between border-b border-slate-200">
					<span className="font-semibold text-slate-900 text-base">Team UP</span>
					<Button
						variant="ghost"
						size="icon"
						className="w-7 h-7 text-slate-500 hover:text-slate-900"
					>
						<ExternalLink className="w-4 h-4" />
					</Button>
				</div>

				<ScrollArea className="flex-1">
					<div className="p-3">
						{/* Channels Section */}
						<div className="mb-4">
							<button
								type="button"
								onClick={() => setChannelsExpanded(!channelsExpanded)}
								className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-900"
							>
								<span>Channels</span>
								<div className="flex items-center gap-1">
									<Plus className="w-3.5 h-3.5" />
									<ChevronDown
										className={cn(
											"w-3.5 h-3.5 transition-transform",
											!channelsExpanded && "-rotate-90",
										)}
									/>
								</div>
							</button>

							{channelsExpanded && (
								<div className="mt-1.5 space-y-0.5">
									{channels.map((channel) => (
										<button
											type="button"
											key={channel.id}
											onClick={() => handleChannelSelect(channel.id)}
											className={cn(
												"flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors",
												activeChannel === channel.id
													? "bg-[#0B6E4F] text-white"
													: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
											)}
										>
											<Hash className="w-4 h-4 shrink-0" />
											<span className="truncate">{channel.name}</span>
										</button>
									))}
								</div>
							)}
						</div>

						{/* Direct Messages Section */}
						<div>
							<button
								type="button"
								onClick={() => setDmsExpanded(!dmsExpanded)}
								className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-900"
							>
								<span>Direct Messages</span>
								<div className="flex items-center gap-1">
									<Plus className="w-3.5 h-3.5" />
									<ChevronDown
										className={cn("w-3.5 h-3.5 transition-transform", !dmsExpanded && "-rotate-90")}
									/>
								</div>
							</button>

							{dmsExpanded && (
								<div className="mt-1.5 space-y-0.5">
									{directMessages.map((dm) => (
										<button
											type="button"
											key={dm.id}
											className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
										>
											<div className="relative">
												<Avatar className="w-5 h-5">
													<AvatarImage src={dm.avatar} />
													<AvatarFallback className="text-[10px] bg-slate-200 text-slate-600">
														{dm.name
															.split(" ")
															.map((n) => n[0])
															.join("")
															.slice(0, 2)}
													</AvatarFallback>
												</Avatar>
												{dm.online && (
													<span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#22c55e] rounded-full border-2 border-white" />
												)}
											</div>
											<span className="truncate">{dm.name}</span>
										</button>
									))}
								</div>
							)}
						</div>

						<DirectoriesSection
							onDirectorySelect={handleDirectorySelect}
							activeDirectory={activeDirectory}
						/>
					</div>
				</ScrollArea>

				{/* Invite Teammates */}
				<div className="p-3 border-t border-slate-200">
					<Button
						variant="ghost"
						className="w-full justify-start gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
					>
						<UserPlus className="w-4 h-4" />
						<span className="text-sm">Invite Teammates</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
