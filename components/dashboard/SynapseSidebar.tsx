"use client";

import { ChevronDown, Hash, Loader2, Plus, Search, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpaces } from "@/hooks/api/use-spaces";
import { useUnread } from "@/hooks/chat/use-unread";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceChannels } from "@/hooks/use-workspace-channels";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { fetchClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
import { cn } from "@/lib/utils";
import { useChannelStore } from "@/stores/channel-store";
import { useUnreadStore } from "@/stores/unread-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { CreateSpaceDialog } from "../modals/CreateSpaceDialog";
import { CreateChannelDialog } from "./CreateChannelDialog";

/* ═══════════════════════════════════════════════════════════
   SynapseSidebar — Secondary contextual sidebar (Tier 2)
   Focuses on contextual items like Channels, DMs, Spaces
   ═══════════════════════════════════════════════════════════ */

export function SynapseSidebar() {
	const pathname = usePathname();
	const { token, user } = useSupabaseAuth();
	const { activeWorkspaceName, activeWorkspaceId } = useWorkspaceStore();
	const { channels, isLoaded: channelsLoaded } = useWorkspaceChannels();
	const { members, currentUserProfile } = useWorkspaceMembers();
	const { updateChannel } = useChannelStore();
	const { counts: unreadCounts } = useUnreadStore();

	// Unread tracking
	const activeChannelId = useMemo(() => {
		const chMatch = pathname.match(/\/dashboard\/chat\/channel\/([^/]+)$/);
		if (chMatch) return chMatch[1];
		// For DMs, find the channel ID from the slug
		const dmMatch = pathname.match(/\/dashboard\/chat\/dm\/([^/]+)$/);
		if (dmMatch) {
			const member = members.find((m) => m.slug === dmMatch[1]);
			if (member && user?.id) {
				const expectedDmName = `dm-${[user.id, member.userId].sort().join("-")}`;
				const dmChannel = channels.find(
					(c) => c.type === "DIRECT_MESSAGE" && c.name === expectedDmName,
				);
				return dmChannel?.id || null;
			}
		}
		return null;
	}, [pathname, members, channels]);

	const { markChannelAsRead } = useUnread(
		activeWorkspaceId,
		user?.id || null,
		token || null,
		activeChannelId,
	);

	// ── Backend data hooks ──
	const { data: spaces } = useSpaces(activeWorkspaceId as string, token || undefined);

	// ── Section expand states ──
	const [channelsExpanded, setChannelsExpanded] = useState(true);
	const [dmsExpanded, setDmsExpanded] = useState(true);
	const [spacesExpanded, setSpacesExpanded] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// ── Dialogs ──
	const [createChannelOpen, setCreateChannelOpen] = useState(false);
	const [createSpaceOpen, setCreateSpaceOpen] = useState(false);

	// ── Derived data ──
	const nonDMChannels = useMemo(
		() =>
			[...channels]
				.filter((c) => c.type !== "DIRECT_MESSAGE")
				.sort((left, right) => {
					const pinnedOrder = Number(right.isStarred) - Number(left.isStarred);
					if (pinnedOrder !== 0) return pinnedOrder;
					const unreadOrder = Number(!!right.unread) - Number(!!left.unread);
					if (unreadOrder !== 0) return unreadOrder;
					const rightUpdated = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
					const leftUpdated = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
					return rightUpdated - leftUpdated;
				}),
		[channels],
	);

	const filteredChannels = useMemo(() => {
		if (!searchQuery.trim()) return nonDMChannels;
		const q = searchQuery.toLowerCase();
		return nonDMChannels.filter((c) => c.name.toLowerCase().includes(q));
	}, [nonDMChannels, searchQuery]);

	const getMemberDisplayName = useCallback(
		(member: (typeof members)[0]) => {
			if (member.profile) {
				const name = [member.profile.firstName, member.profile.lastName].filter(Boolean).join(" ");
				if (member.userId === currentUserProfile?.supabaseId) {
					return `${name || member.profile.email} (you)`;
				}
				return name || member.profile.username || member.profile.email;
			}
			return member.userId.slice(0, 8);
		},
		[currentUserProfile],
	);

	const handleToggleChannelStar = async (channelId: string, isStarred: boolean) => {
		if (!token) return;
		updateChannel(channelId, { isStarred });
		try {
			await fetchClient(API_ENDPOINTS.CHANNEL_STAR(channelId), {
				token,
				method: "PATCH",
				body: JSON.stringify({ isStarred }),
			});
		} catch (_error) {
			updateChannel(channelId, { isStarred: !isStarred });
		}
	};

	// Mark channel as read when opened
	useEffect(() => {
		if (!activeChannelId) return;
		const activeChannel = channels.find((channel) => channel.id === activeChannelId);
		if (activeChannel?.unread) {
			updateChannel(activeChannelId, { unread: false });
		}
		// Also mark as read via backend
		if (unreadCounts[activeChannelId] > 0) {
			markChannelAsRead(activeChannelId);
		}
	}, [activeChannelId, channels, updateChannel, unreadCounts, markChannelAsRead]);

	const isChat = pathname.startsWith("/dashboard/chat");
	const isTask = pathname.startsWith("/dashboard/task");

	return (
		<div
			className="w-full h-full flex flex-col overflow-hidden"
			style={{
				fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', sans-serif",
			}}
		>
			<div className="px-6 pt-[26px] pb-6 flex flex-col gap-1.5 min-h-[88px] justify-center">
				<h2 className="text-[19px] font-bold text-gray-900 tracking-tight">
					{isChat ? "Messages" : isTask ? "Projects" : "Documents"}
				</h2>
				<div className="h-0.5 w-5 bg-blue-500/20 rounded-full" />
			</div>

			<div className="px-4 mb-4">
				<div className="relative group">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search..."
						className="w-full bg-gray-100/80 border-none rounded-[10px] py-1.5 pl-8 pr-4 text-[13.5px] placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all outline-none"
					/>
				</div>
			</div>

			<ScrollArea className="flex-1 px-3">
				<div className="space-y-6 pb-8">
					{isChat && (
						<>
							<SidebarSection
								title="Channels"
								expanded={channelsExpanded}
								onToggle={() => setChannelsExpanded(!channelsExpanded)}
								action={
									<button
										type="button"
										onClick={() => setCreateChannelOpen(true)}
										className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
									>
										<Plus className="w-4 h-4" />
									</button>
								}
							>
								{!channelsLoaded ? (
									<div className="flex justify-center py-4">
										<Loader2 className="w-5 h-5 animate-spin text-slate-300" />
									</div>
								) : (
									filteredChannels.map((channel) => (
										<ChannelItem
											key={channel.id}
											channel={channel}
											active={pathname === `/dashboard/chat/channel/${channel.id}`}
											starred={!!channel.isStarred}
											unread={!!channel.unread}
											unreadCount={unreadCounts[channel.id] || 0}
											onToggleStar={() => handleToggleChannelStar(channel.id, !channel.isStarred)}
										/>
									))
								)}
							</SidebarSection>

							<SidebarSection
								title="Direct Messages"
								expanded={dmsExpanded}
								onToggle={() => setDmsExpanded(!dmsExpanded)}
							>
								{members.map((member) => {
									const displayName = getMemberDisplayName(member);
									const isActive = pathname === `/dashboard/chat/dm/${member.slug}`;
									// Find the DM channel for this member to get unread count (deterministic name)
									const expectedDmName = user?.id
										? `dm-${[user.id, member.userId].sort().join("-")}`
										: "";
									const dmChannel = channels.find(
										(c) => c.type === "DIRECT_MESSAGE" && c.name === expectedDmName,
									);
									const dmUnreadCount = dmChannel ? unreadCounts[dmChannel.id] || 0 : 0;
									const hasDmUnread = dmUnreadCount > 0;
									return (
										<Link key={member.id} href={`/dashboard/chat/dm/${member.slug}`}>
											<div
												className={cn(
													"flex items-center gap-3 px-3 py-2 rounded-xl transition-all group",
													isActive
														? "bg-gray-900/10 text-gray-900 font-semibold"
														: hasDmUnread
															? "text-gray-900 font-semibold hover:bg-black/5"
															: "text-gray-600 hover:bg-black/5",
												)}
											>
												<div className="relative">
													<Avatar className="w-8 h-8 rounded-lg shadow-sm">
														<AvatarImage
															src={member.profile?.imageUrl || undefined}
															referrerPolicy="no-referrer"
														/>
														<AvatarFallback className="bg-blue-50 text-[#007AFF] text-[10px] font-bold">
															{displayName.substring(0, 2).toUpperCase()}
														</AvatarFallback>
													</Avatar>
													{member.online && (
														<span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#34C759] rounded-full border-2 border-white" />
													)}
												</div>
												<span className="truncate flex-1">{displayName}</span>
												{hasDmUnread && !isActive && (
													<span
														className="min-w-[20px] h-5 flex items-center justify-center text-[10px] font-bold text-white bg-[#007AFF] rounded-full px-1.5 shadow-sm shadow-blue-500/30"
														style={{
															fontFamily:
																"'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', sans-serif",
															fontVariantNumeric: "tabular-nums",
														}}
													>
														{dmUnreadCount > 99 ? "99+" : dmUnreadCount}
													</span>
												)}
											</div>
										</Link>
									);
								})}
							</SidebarSection>
						</>
					)}

					{isTask && (
						<SidebarSection
							title="Spaces"
							expanded={spacesExpanded}
							onToggle={() => setSpacesExpanded(!spacesExpanded)}
							action={
								<button
									type="button"
									onClick={() => setCreateSpaceOpen(true)}
									className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
								>
									<Plus className="w-4 h-4" />
								</button>
							}
						>
							{spaces?.map((space: { id: string; name: string }) => (
								<Link key={space.id} href={`/dashboard/task/space/${space.id}`}>
									<div
										className={cn(
											"flex items-center gap-3 px-3 py-2 rounded-xl transition-all",
											pathname === `/dashboard/task/space/${space.id}`
												? "bg-gray-900/10 text-gray-900 font-semibold"
												: "text-gray-600 hover:bg-black/5",
										)}
									>
										<div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
											{space.name[0].toUpperCase()}
										</div>
										<span className="truncate">{space.name}</span>
									</div>
								</Link>
							))}
						</SidebarSection>
					)}
				</div>
			</ScrollArea>

			<CreateChannelDialog
				open={createChannelOpen}
				onOpenChange={setCreateChannelOpen}
				onChannelCreated={() => {}} // Integration logic kept in store
				workspaceName={activeWorkspaceName || "Workspace"}
			/>

			<CreateSpaceDialog open={createSpaceOpen} onOpenChange={setCreateSpaceOpen} />
		</div>
	);
}

interface SidebarSectionProps {
	title: string;
	expanded: boolean;
	onToggle: () => void;
	action?: React.ReactNode;
	children: React.ReactNode;
}

function SidebarSection({ title, expanded, onToggle, action, children }: SidebarSectionProps) {
	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between px-3 py-2">
				<button
					type="button"
					onClick={onToggle}
					className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
				>
					<ChevronDown
						className={cn("w-3.5 h-3.5 transition-transform", !expanded && "-rotate-90")}
					/>
					{title}
				</button>
				{action}
			</div>
			{expanded && <div className="space-y-0.5">{children}</div>}
		</div>
	);
}

interface ChannelItemProps {
	channel: { id: string; name: string };
	active: boolean;
	starred: boolean;
	unread: boolean;
	unreadCount: number;
	onToggleStar: () => void;
}

function ChannelItem({
	channel,
	active,
	starred,
	unread,
	unreadCount,
	onToggleStar,
}: ChannelItemProps) {
	const hasUnread = unreadCount > 0 || unread;

	return (
		<Link href={`/dashboard/chat/channel/${channel.id}`}>
			<div
				className={cn(
					"group flex items-center gap-3 px-3 py-2 rounded-xl transition-all",
					active
						? "bg-gray-900/10 text-gray-900 font-semibold"
						: hasUnread
							? "text-gray-900 font-semibold hover:bg-black/5"
							: "text-gray-600 hover:bg-black/5",
				)}
			>
				<div
					className={cn(
						"w-7 h-7 rounded-lg flex items-center justify-center transition-colors shadow-sm",
						active
							? "text-gray-900"
							: "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500",
					)}
				>
					<Hash className="w-4 h-4" />
				</div>
				<span className="truncate flex-1">{channel.name}</span>
				{hasUnread && !active && unreadCount > 0 && (
					<span
						className="min-w-[20px] h-5 flex items-center justify-center text-[10px] font-bold text-white bg-[#007AFF] rounded-full px-1.5 shadow-sm shadow-blue-500/30"
						style={{
							fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', sans-serif",
							fontVariantNumeric: "tabular-nums",
						}}
					>
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
				{hasUnread && !active && unreadCount === 0 && (
					<div className="w-2 h-2 rounded-full bg-[#007AFF]" />
				)}
				<button
					type="button"
					onClick={(e) => {
						e.preventDefault();
						onToggleStar();
					}}
					className={cn(
						"p-1 opacity-0 group-hover:opacity-100 transition-opacity",
						starred ? "opacity-100 text-amber-400" : "text-slate-400 hover:text-amber-400",
					)}
				>
					<Star className="w-3.5 h-3.5" fill={starred ? "currentColor" : "none"} />
				</button>
			</div>
		</Link>
	);
}
