"use client";

import { ChevronDown, ExternalLink, Hash, Loader2, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InviteMembersDialog } from "@/components/workspaces/InviteMembersDialog";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceChannels } from "@/hooks/use-workspace-channels";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { channelService } from "@/lib/api/services";
import { cn } from "@/lib/utils";
import { type Channel, useChannelStore } from "@/stores/channel-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { DirectoriesSection } from "./DirectoriesSection";
import { IconRail } from "./IconRail";

interface TeamSidebarProps {
	activeChannel?: string;
	onChannelSelect?: (channelId: string) => void;
}

export function TeamSidebar(_props: TeamSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { token, user } = useSupabaseAuth();
	const { channels, isLoaded, activeWorkspaceId } = useWorkspaceChannels();
	const { members, currentUserProfile } = useWorkspaceMembers();
	const { addChannel } = useChannelStore();
	const { activeWorkspaceName } = useWorkspaceStore();
	const [channelsExpanded, setChannelsExpanded] = useState(true);
	const [starredExpanded, setStarredExpanded] = useState(true);
	const [dmsExpanded, setDmsExpanded] = useState(true);
	const [createChannelOpen, setCreateChannelOpen] = useState(false);
	const [inviteOpen, setInviteOpen] = useState(false);

	const starredChannels = useMemo(
		() => channels.filter((c) => c.isStarred && c.type !== "DIRECT_MESSAGE"),
		[channels],
	);

	const isChannelActive = (channelId: string) => {
		return pathname === `/dashboard/chat/channel/${channelId}`;
	};

	const isDMActive = (slug: string) => {
		return pathname === `/dashboard/chat/dm/${slug}`;
	};

	// Generate display name for a member
	const getMemberDisplayName = (member: (typeof members)[0]) => {
		if (member.profile) {
			const name = [member.profile.firstName, member.profile.lastName].filter(Boolean).join(" ");
			if (member.userId === currentUserProfile?.supabaseId) {
				return `${name || member.profile.email} (you)`;
			}
			return name || member.profile.username || member.profile.email;
		}
		if (member.userId === currentUserProfile?.supabaseId) {
			return `${currentUserProfile?.firstName || "You"} (you)`;
		}
		return member.userId.slice(0, 8);
	};

	// Generate slug for DM routing
	const getMemberSlug = (member: (typeof members)[0]) => {
		if (member.profile) {
			const name = [member.profile.firstName, member.profile.lastName]
				.filter(Boolean)
				.join("-")
				.toLowerCase();
			return name || member.profile.username || member.userId;
		}
		return member.userId;
	};

	// Handle channel creation via real API
	const handleChannelCreated = async (channel: {
		name: string;
		visibility: "public" | "private";
	}) => {
		if (!activeWorkspaceId || !token) return;

		try {
			const newChannel = await channelService.create(
				{
					workspaceId: activeWorkspaceId,
					name: channel.name,
					type: channel.visibility === "public" ? "PUBLIC" : "PRIVATE",
				},
				token,
			);

			// Add to local store immediately for responsiveness
			addChannel({
				id: newChannel.id,
				name: newChannel.name,
				workspaceId: newChannel.workspaceId,
				type: newChannel.type as Channel["type"],
				description: newChannel.description,
				members: 1,
				isJoined: true,
				createdAt: newChannel.createdAt,
				updatedAt: newChannel.updatedAt,
			});

			router.push(`/dashboard/chat/channel/${newChannel.id}`);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: (error as { message?: string })?.message || "Unknown error";
			console.error("Failed to create channel:", errorMessage, error);
			alert(`Failed to create channel: ${errorMessage}`);
		}
	};

	return (
		<div className="flex h-full" style={{ fontFamily: "var(--font-body), 'DM Sans', sans-serif" }}>
			{/* Shared Icon Rail */}
			<IconRail />

			{/* Channel List */}
			<div className="w-56 bg-white flex flex-col border-r border-[#d8f3dc]">
				{/* Team Header */}
				<div className="p-4 flex items-center justify-between border-b border-[#d8f3dc]">
					<span
						className="font-semibold text-[#0f2318] text-base"
						style={{ fontFamily: "var(--font-heading)" }}
					>
						{activeWorkspaceName || "Team UP"}
					</span>
					<Button
						variant="ghost"
						size="icon"
						className="w-7 h-7 text-[#4a6552] hover:text-[#0f2318]"
					>
						<ExternalLink className="w-4 h-4" />
					</Button>
				</div>

				<ScrollArea className="flex-1">
					<div className="p-3">
						{/* Starred Section */}
						{starredChannels.length > 0 && (
							<div className="mb-4">
								<div className="flex items-center justify-between w-full px-2 py-1.5">
									<button
										type="button"
										onClick={() => setStarredExpanded(!starredExpanded)}
										className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-900"
									>
										<ChevronDown
											className={cn(
												"w-3.5 h-3.5 transition-transform",
												!starredExpanded && "-rotate-90",
											)}
										/>
										<span>Starred</span>
									</button>
								</div>

								{starredExpanded && (
									<div className="mt-1.5 space-y-0.5">
										{starredChannels.map((channel) => (
											<Link
												key={`starred-${channel.id}`}
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
						)}

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
									{!isLoaded ? (
										<div className="flex items-center justify-center py-4">
											<Loader2 className="w-4 h-4 animate-spin text-slate-400" />
											<span className="ml-2 text-xs text-slate-400">Loading channels...</span>
										</div>
									) : channels.filter((c) => c.type !== "DIRECT_MESSAGE").length === 0 ? (
										<div className="px-2 py-3 text-xs text-slate-400 text-center">
											No channels yet. Create one!
										</div>
									) : (
										channels
											.filter((c) => c.type !== "DIRECT_MESSAGE")
											.map((channel) => (
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
											))
									)}
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
									{members.length === 0 ? (
										<div className="px-2 py-3 text-xs text-slate-400 text-center">
											No team members yet.
										</div>
									) : (
										members.map((member) => {
											const displayName = getMemberDisplayName(member);
											const slug = getMemberSlug(member);
											return (
												<Link
													key={member.id}
													href={`/dashboard/chat/dm/${slug}`}
													className={cn(
														"flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors",
														isDMActive(slug)
															? "bg-[#0B6E4F] text-white"
															: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
													)}
												>
													<div className="relative">
														<Avatar className="w-5 h-5">
															<AvatarImage src={member.profile?.imageUrl || undefined} />
															<AvatarFallback className="text-[10px] bg-slate-200 text-slate-600">
																{displayName
																	.replace(" (you)", "")
																	.split(" ")
																	.map((n) => n[0])
																	.join("")
																	.slice(0, 2)
																	.toUpperCase()}
															</AvatarFallback>
														</Avatar>
														{member.online && (
															<span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#22c55e] rounded-full border-2 border-white" />
														)}
													</div>
													<span className="truncate">{displayName}</span>
												</Link>
											);
										})
									)}
								</div>
							)}
						</div>

						{/* Directories */}
						<DirectoriesSection />
					</div>
				</ScrollArea>

				{/* Invite Teammates */}
				<div className="p-3 border-t border-slate-200">
					<Button
						variant="ghost"
						className="w-full justify-start gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
						onClick={() => setInviteOpen(true)}
					>
						<UserPlus className="w-4 h-4" />
						<span className="text-sm">Invite Teammates</span>
					</Button>
				</div>
			</div>

			{/* Invite Members Dialog */}
			{activeWorkspaceId && (
				<InviteMembersDialog
					isOpen={inviteOpen}
					onClose={() => setInviteOpen(false)}
					workspaceId={activeWorkspaceId}
					workspaceName={activeWorkspaceName || "Team UP"}
					userId={user?.id ?? ""}
				/>
			)}

			{/* Create Channel Dialog */}
			<CreateChannelDialog
				open={createChannelOpen}
				onOpenChange={setCreateChannelOpen}
				onChannelCreated={handleChannelCreated}
				workspaceName={activeWorkspaceName || "Team UP"}
			/>
		</div>
	);
}
