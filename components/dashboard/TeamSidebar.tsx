"use client";

import { ChevronDown, ExternalLink, Hash, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type Channel, useChannelStore } from "@/stores/channel-store";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { DirectoriesSection } from "./DirectoriesSection";
import { IconRail } from "./IconRail";

interface DirectMessage {
	id: string;
	name: string;
	slug: string;
	avatar?: string;
	online?: boolean;
}

interface TeamSidebarProps {
	activeChannel?: string;
	onChannelSelect?: (channelId: string) => void;
}

const directMessages: DirectMessage[] = [
	{ id: "user-1", name: "Ravikrishna J (you)", slug: "ravikrishna-j", online: true },
	{ id: "user-2", name: "Sarah Chen", slug: "sarah-chen", online: true },
	{ id: "user-3", name: "Alex Morgan", slug: "alex-morgan", online: false },
];

export function TeamSidebar(_props: TeamSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { channels, addChannel } = useChannelStore();
	const [channelsExpanded, setChannelsExpanded] = useState(true);
	const [dmsExpanded, setDmsExpanded] = useState(true);
	const [createChannelOpen, setCreateChannelOpen] = useState(false);

	const isChannelActive = (channelId: string) => {
		return pathname === `/dashboard/chat/channel/${channelId}`;
	};

	const isDMActive = (slug: string) => {
		return pathname === `/dashboard/chat/dm/${slug}`;
	};

	return (
		<div className="flex h-full" style={{ fontFamily: "var(--font-figtree), Figtree" }}>
			{/* Shared Icon Rail */}
			<IconRail />

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
							<div className="flex items-center justify-between w-full px-2 py-1.5">
								<button
									type="button"
									onClick={() => setChannelsExpanded(!channelsExpanded)}
									className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-900"
								>
									<ChevronDown
										className={cn(
											"w-3.5 h-3.5 transition-transform",
											!channelsExpanded && "-rotate-90",
										)}
									/>
									<span>Channels</span>
								</button>
								<button
									type="button"
									onClick={() => setCreateChannelOpen(true)}
									className="text-slate-400 hover:text-slate-900 transition-colors p-0.5 rounded hover:bg-slate-100"
									title="Create channel"
								>
									<Plus className="w-3.5 h-3.5" />
								</button>
							</div>

							{channelsExpanded && (
								<div className="mt-1.5 space-y-0.5">
									{channels.map((channel) => (
										<Link
											key={channel.id}
											href={`/dashboard/chat/channel/${channel.id}`}
											className={cn(
												"flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors",
												isChannelActive(channel.id)
													? "bg-[#0B6E4F] text-white"
													: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
											)}
										>
											<Hash className="w-4 h-4 shrink-0" />
											<span className="truncate">{channel.name}</span>
										</Link>
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
										<Link
											key={dm.id}
											href={`/dashboard/chat/dm/${dm.slug}`}
											className={cn(
												"flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors",
												isDMActive(dm.slug)
													? "bg-[#0B6E4F] text-white"
													: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
											)}
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
										</Link>
									))}
								</div>
							)}
						</div>

						<DirectoriesSection />
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

			{/* Create Channel Dialog */}
			<CreateChannelDialog
				open={createChannelOpen}
				onOpenChange={setCreateChannelOpen}
				onChannelCreated={(channel) => {
					const newChannel: Channel = {
						id: channel.name,
						name: channel.name,
						unread: true,
						isJoined: true,
					};
					addChannel(newChannel);
					router.push(`/dashboard/chat/channel/${channel.name}`);
				}}
			/>
		</div>
	);
}
