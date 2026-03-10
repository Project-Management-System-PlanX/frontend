"use client";

import {
	Activity,
	ChevronDown,
	ChevronRight,
	FileText,
	FolderOpen,
	Hash,
	ListChecks,
	Loader2,
	PanelLeftClose,
	PanelLeftOpen,
	Plus,
	Settings,
	Sparkles,
	UserPlus,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InviteMembersDialog } from "@/components/workspaces/InviteMembersDialog";
import { useFilesByWorkspace } from "@/hooks/api/use-files";
import { useSpaces } from "@/hooks/api/use-spaces";
import { useTasksAssignedToMe } from "@/hooks/api/use-tasks";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceChannels } from "@/hooks/use-workspace-channels";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { channelService } from "@/lib/api/services";
import { cn } from "@/lib/utils";
import { type Channel, useChannelStore } from "@/stores/channel-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { CreateChannelDialog } from "./CreateChannelDialog";

/* ═══════════════════════════════════════════════════════════
   Synapse Sidebar — unified sidebar replacing IconRail
   + TeamSidebar / TaskSidebar / FilesSidebar
   All data is fetched from backend APIs — no hardcoded values
   ═══════════════════════════════════════════════════════════ */

export function SynapseSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, token } = useSupabaseAuth();
	const { activeWorkspaceName, activeWorkspaceId } = useWorkspaceStore();
	const { channels, isLoaded: channelsLoaded } = useWorkspaceChannels();
	const { members, currentUserProfile } = useWorkspaceMembers();
	const { addChannel } = useChannelStore();

	// ── Backend data hooks ──
	const { data: spaces, isLoading: isLoadingSpaces } = useSpaces(
		activeWorkspaceId as string,
		token || undefined,
	);

	const { data: myTasks } = useTasksAssignedToMe(token || undefined);

	const { data: files } = useFilesByWorkspace(activeWorkspaceId || "", token || undefined);

	// ── Section expand states ──
	const [foldersExpanded, setFoldersExpanded] = useState(true);
	const [spaceExpanded, setSpaceExpanded] = useState(true);
	const [channelsExpanded, setChannelsExpanded] = useState(true);
	const [dmsExpanded, setDmsExpanded] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

	// ── Dialogs ──
	const [inviteOpen, setInviteOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [createChannelOpen, setCreateChannelOpen] = useState(false);

	// ── Space creation inline form ──
	const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
	const [newSpaceName, setNewSpaceName] = useState("");

	// ── User info ──
	const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || undefined;
	const firstName =
		user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(" ")[0] || "";
	const lastName =
		user?.user_metadata?.last_name || user?.user_metadata?.full_name?.split(" ")[1] || "";
	const email = user?.email || "";
	const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";
	const initials =
		firstName && lastName
			? `${firstName[0]}${lastName[0]}`.toUpperCase()
			: email
				? email.substring(0, 2).toUpperCase()
				: "?";

	// ── Derived data ──
	const nonDMChannels = useMemo(
		() => channels.filter((c) => c.type !== "DIRECT_MESSAGE"),
		[channels],
	);

	const myTaskCount = myTasks?.length ?? 0;
	const memberCount = members.length;
	const fileCount = files?.length ?? 0;

	// ── Route matching ──
	const isActive = (href: string, exact = false) => {
		if (exact) return pathname === href;
		return pathname.startsWith(href);
	};

	// ── Channel creation handler ──
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
		}
	};

	// ── DM helpers ──
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

	if (isCollapsed) {
		return (
			<aside className="w-[60px] bg-[#f9f9fa] flex flex-col items-center border-r border-[#ebebeb] shrink-0 h-full select-none pt-5 pb-5">
				<button
					type="button"
					onClick={() => setIsCollapsed(false)}
					className="text-[#aaa] hover:text-[#555] transition-colors p-2 rounded-md hover:bg-[#e8e8e8]"
					title="Expand sidebar"
				>
					<PanelLeftOpen className="w-5 h-5" />
				</button>
			</aside>
		);
	}

	return (
		<>
			<aside
				className="w-[220px] bg-[#f9f9fa] flex flex-col border-r border-[#ebebeb] shrink-0 h-full select-none transition-all duration-300"
				style={{
					fontFamily: "var(--font-figtree), Figtree, -apple-system, sans-serif",
				}}
			>
				{/* ──── Logo / Brand ──── */}
				<div className="flex items-center gap-2 px-[18px] pt-5 pb-5">
					<button
						type="button"
						onClick={() => setIsCollapsed(true)}
						className="text-[#aaa] hover:text-[#555] transition-colors p-[3px] rounded hover:bg-[#e8e8e8] -ml-1 mr-0.5"
						title="Close sidebar"
					>
						<PanelLeftClose className="w-[15px] h-[15px]" />
					</button>
					<div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-[#4f8ef7] to-[#3b6fd4] flex items-center justify-center shadow-sm">
						<Zap className="w-[14px] h-[14px] text-white" strokeWidth={2.2} />
					</div>
					<span className="text-[15px] font-bold text-[#111] truncate flex-1 leading-none pt-0.5">
						{activeWorkspaceName || "Synapse"}
					</span>
				</div>

				{/* ──── Scrollable Content ──── */}
				<ScrollArea className="flex-1 overflow-y-auto">
					<div className="pb-2 pt-2">
						{/* ═══════════════════════════════════
						   FOLDERS section
						   Dashboard, My Tasks
						   ═══════════════════════════════════ */}
						<SidebarSection
							label="Folders"
							expanded={foldersExpanded}
							onToggle={() => setFoldersExpanded(!foldersExpanded)}
						>
							<SidebarNavItem
								icon={SquareGrid}
								label="Dashboard"
								href="/dashboard"
								badge=""
								active={isActive("/dashboard", true)}
							/>
							<SidebarNavItem
								icon={Sparkles}
								label="My Tasks"
								href="/dashboard/task/for-you"
								badge={myTaskCount > 0 ? String(myTaskCount) : ""}
								active={isActive("/dashboard/task/for-you")}
							/>
						</SidebarSection>

						{/* ═══════════════════════════════════
						   CHANNELS section
						   ═══════════════════════════════════ */}
						<div className="mb-4">
							<div className="flex items-center justify-between px-[18px] py-[3px]">
								<button
									type="button"
									onClick={() => setChannelsExpanded(!channelsExpanded)}
									className="flex items-center gap-1 text-[11px] font-semibold text-[#aaa] uppercase tracking-[0.05em] hover:text-[#777] transition-colors"
								>
									<ChevronDown
										className={cn(
											"w-3 h-3 transition-transform duration-200",
											!channelsExpanded && "-rotate-90",
										)}
										strokeWidth={2}
									/>
									Channels
								</button>
								<button
									type="button"
									onClick={() => setCreateChannelOpen(true)}
									className="text-[#aaa] hover:text-[#555] transition-colors p-0.5 rounded hover:bg-[#e5e5e5]"
									title="Create channel"
								>
									<Plus className="w-3 h-3" />
								</button>
							</div>
							{channelsExpanded && (
								<div className="space-y-[1px] mt-[6px]">
									{!channelsLoaded ? (
										<div className="flex items-center justify-center py-2">
											<Loader2 className="w-3 h-3 animate-spin text-[#aaa]" />
										</div>
									) : nonDMChannels.length === 0 ? (
										<div className="px-8 py-2 text-[11px] text-[#aaa]">No channels yet</div>
									) : (
										nonDMChannels.map((channel) => (
											<SidebarTreeItem
												key={channel.id}
												icon={Hash}
												label={channel.name}
												href={`/dashboard/chat/channel/${channel.id}`}
												active={pathname === `/dashboard/chat/channel/${channel.id}`}
											/>
										))
									)}
								</div>
							)}
						</div>

						{/* ═══════════════════════════════════
						   DIRECT MESSAGES section
						   ═══════════════════════════════════ */}
						<div className="mb-4">
							<button
								type="button"
								onClick={() => setDmsExpanded(!dmsExpanded)}
								className="flex items-center gap-1 px-[18px] py-[3px] text-[11px] font-semibold text-[#aaa] uppercase tracking-[0.05em] hover:text-[#777] transition-colors w-full text-left"
							>
								<ChevronDown
									className={cn(
										"w-3 h-3 transition-transform duration-200",
										!dmsExpanded && "-rotate-90",
									)}
									strokeWidth={2}
								/>
								Direct Messages
								{memberCount > 0 && (
									<span className="ml-auto text-[10px] text-[#bbb] tabular-nums">
										{memberCount}
									</span>
								)}
							</button>
							{dmsExpanded && (
								<div className="space-y-[1px] mt-[6px]">
									{members.length === 0 ? (
										<div className="px-8 py-2 text-[11px] text-[#aaa]">No team members yet</div>
									) : (
										members.map((member) => {
											const displayName = getMemberDisplayName(member);
											const slug = member.slug;
											const dmActive = pathname === `/dashboard/chat/dm/${slug}`;
											return (
												<Link key={member.id} href={`/dashboard/chat/dm/${slug}`}>
													<div
														className={cn(
															"flex items-center gap-2 py-[5px] px-[18px] pl-8 text-[12.5px] cursor-pointer rounded-[7px] mx-[6px] transition-colors",
															dmActive
																? "bg-[#e8eefb] text-[#2b5fcc] font-medium"
																: "text-[#555] hover:bg-[#eee]",
														)}
													>
														<Avatar className="w-4 h-4">
															<AvatarImage src={member.profile?.imageUrl || undefined} />
															<AvatarFallback className="text-[8px] bg-slate-200 text-slate-600">
																{displayName
																	.replace(" (you)", "")
																	.split(" ")
																	.map((n) => n[0])
																	.join("")
																	.slice(0, 2)
																	.toUpperCase()}
															</AvatarFallback>
														</Avatar>
														<span className="truncate">{displayName}</span>
														{member.online && (
															<span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0 ml-auto" />
														)}
													</div>
												</Link>
											);
										})
									)}
								</div>
							)}
						</div>

						{/* ═══════════════════════════════════
						   WORKSPACE SPACE section
						   Spaces (from API), Folders/Files,
						   Tasks, Activity
						   ═══════════════════════════════════ */}
						<SidebarSection
							label={activeWorkspaceName ? `${activeWorkspaceName} Space` : "Workspace Space"}
							expanded={spaceExpanded}
							onToggle={() => setSpaceExpanded(!spaceExpanded)}
						>
							{/* —— Spaces from API —— */}
							{isLoadingSpaces ? (
								<div className="flex items-center justify-center py-3">
									<Loader2 className="w-3.5 h-3.5 animate-spin text-[#aaa]" />
									<span className="ml-2 text-[11px] text-[#aaa]">Loading spaces...</span>
								</div>
							) : spaces && spaces.length > 0 ? (
								spaces.map((space) => (
									<SidebarNavItem
										key={space.id}
										icon={Activity}
										label={space.name}
										href={`/dashboard/task/space/${space.id}`}
										badge=""
										active={isActive(`/dashboard/task/space/${space.id}`)}
										colorDot={space.color || "#0B6E4F"}
										iconChar={space.icon || space.prefix?.charAt(0) || space.name.charAt(0)}
									/>
								))
							) : (
								<div className="px-[18px] py-1 text-[11px] text-[#aaa] italic">
									{activeWorkspaceId ? "No spaces yet" : "Select a workspace"}
								</div>
							)}

							{/* —— Create Space Inline —— */}
							{isCreateSpaceOpen ? (
								<div className="mx-[6px] mb-1 p-2 bg-white rounded-[7px] border border-[#ddd]">
									<input
										type="text"
										value={newSpaceName}
										onChange={(e) => setNewSpaceName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Escape") {
												setIsCreateSpaceOpen(false);
												setNewSpaceName("");
											}
										}}
										placeholder="Space name..."
										className="w-full px-2 py-1 text-[12px] bg-[#f5f5f5] border border-[#ddd] rounded outline-none focus:border-[#4f8ef7]"
										// biome-ignore lint/a11y/noAutofocus: intentional
										autoFocus
									/>
									<div className="flex justify-end gap-1 mt-1.5">
										<button
											type="button"
											onClick={() => {
												setIsCreateSpaceOpen(false);
												setNewSpaceName("");
											}}
											className="px-2 py-0.5 text-[11px] text-[#888] hover:text-[#555] rounded hover:bg-[#eee]"
										>
											Cancel
										</button>
										<button
											type="button"
											disabled={!newSpaceName.trim()}
											className="px-2 py-0.5 text-[11px] text-white bg-[#4f8ef7] rounded hover:bg-[#3b6fd4] disabled:opacity-50"
										>
											Create
										</button>
									</div>
								</div>
							) : (
								<button
									type="button"
									onClick={() => setIsCreateSpaceOpen(true)}
									className="flex items-center gap-2 py-[5px] px-[18px] text-[12px] text-[#aaa] hover:text-[#555] transition-colors w-full text-left"
								>
									<Plus className="w-3 h-3" />
									<span>New space</span>
								</button>
							)}

							{/* —— Folders / Files —— */}
							<SidebarNavItem
								icon={FolderOpen}
								label="Folders"
								href="/dashboard/files"
								badge={fileCount > 0 ? String(fileCount) : ""}
								active={isActive("/dashboard/files")}
							/>

							{/* —— Documents tree item —— */}
							<SidebarTreeItem
								icon={FileText}
								label="Documents"
								href="/dashboard/files"
								active={isActive("/dashboard/files", true)}
							/>

							{/* —— Tasks —— */}
							<SidebarNavItem
								icon={ListChecks}
								label="Tasks"
								href="/dashboard/task/for-you"
								badge={myTaskCount > 0 ? String(myTaskCount) : ""}
								active={isActive("/dashboard/task")}
							/>
						</SidebarSection>
					</div>
				</ScrollArea>

				{/* ──── Bottom Section ──── */}
				<div className="border-t border-[#ebebeb] pt-3">
					<SidebarBottomItem
						icon={UserPlus}
						label="Invite members"
						onClick={() => setInviteOpen(true)}
					/>
					<SidebarBottomItem
						icon={Settings}
						label="Settings"
						onClick={() => setSettingsOpen(true)}
					/>

					{/* User Row */}
					<div className="flex items-center gap-[9px] px-[18px] py-2 cursor-pointer hover:bg-[#f0f0f0] transition-colors mt-1 mb-2 rounded-md mx-1">
						<Avatar className="w-[30px] h-[30px] shrink-0 ring-1 ring-black/5">
							<AvatarImage src={avatarUrl} />
							<AvatarFallback className="bg-gradient-to-br from-[#e07b6b] to-[#c45fa0] text-white text-[11px] font-semibold">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<div className="text-[12.5px] font-semibold text-[#222] truncate">{fullName}</div>
							<div className="text-[11px] text-[#999] truncate">{email}</div>
						</div>
						<ChevronRight className="w-[14px] h-[14px] text-[#bbb] shrink-0" strokeWidth={2} />
					</div>
				</div>
			</aside>

			{/* ──── Dialogs ──── */}
			{activeWorkspaceId && (
				<InviteMembersDialog
					isOpen={inviteOpen}
					onClose={() => setInviteOpen(false)}
					workspaceId={activeWorkspaceId}
					workspaceName={activeWorkspaceName || "Team UP"}
					userId={user?.id ?? ""}
				/>
			)}
			<SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
			<CreateChannelDialog
				open={createChannelOpen}
				onOpenChange={setCreateChannelOpen}
				onChannelCreated={handleChannelCreated}
				workspaceName={activeWorkspaceName || "Team UP"}
			/>
		</>
	);
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

/** Dashboard icon — 4 squares */
function SquareGrid({ className, strokeWidth }: { className?: string; strokeWidth?: number }) {
	return (
		<svg
			aria-label="Dashboard Icon"
			role="img"
			className={className}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={strokeWidth || 1.8}
		>
			<rect x="3" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="14" width="7" height="7" rx="1" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
		</svg>
	);
}

function SidebarSection({
	label,
	expanded,
	onToggle,
	children,
}: {
	label: string;
	expanded: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}) {
	return (
		<div className="mb-4">
			<button
				type="button"
				onClick={onToggle}
				className="flex items-center gap-1 px-[18px] pb-[6px] pt-1 text-[11px] font-semibold text-[#aaa] uppercase tracking-[0.05em] hover:text-[#777] transition-colors w-full text-left"
			>
				<ChevronDown
					className={cn("w-3 h-3 transition-transform duration-200", !expanded && "-rotate-90")}
					strokeWidth={2}
				/>
				{label}
			</button>
			{expanded && <div className="space-y-[1px]">{children}</div>}
		</div>
	);
}

function SidebarItem({
	active,
	children,
	onClick,
}: {
	active: boolean;
	children: React.ReactNode;
	onClick?: () => void;
}) {
	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onClick?.();
			}}
			className={cn(
				"flex items-center justify-between py-[6px] px-[18px] rounded-[7px] mx-[6px] cursor-pointer text-[13px] transition-colors",
				active ? "bg-[#e8eefb] text-[#2b5fcc]" : "text-[#444] hover:bg-[#eee]",
			)}
		>
			{children}
		</div>
	);
}

function SidebarNavItem({
	icon: Icon,
	label,
	href,
	badge,
	active,
	colorDot,
	iconChar,
}: {
	icon: React.ComponentType<{
		className?: string;
		strokeWidth?: number;
	}>;
	label: string;
	href: string;
	badge: string;
	active: boolean;
	colorDot?: string;
	iconChar?: string;
}) {
	return (
		<Link href={href}>
			<SidebarItem active={active}>
				<div className="flex items-center gap-2 min-w-0">
					{colorDot ? (
						<span
							className="w-[15px] h-[15px] rounded flex items-center justify-center text-[8px] text-white font-bold shrink-0"
							style={{
								backgroundColor: colorDot,
							}}
						>
							{iconChar || label.charAt(0)}
						</span>
					) : (
						<Icon
							className={cn(
								"w-[15px] h-[15px] shrink-0 transition-opacity",
								active ? "opacity-100" : "opacity-60",
							)}
							strokeWidth={1.8}
						/>
					)}
					<span className="truncate">{label}</span>
				</div>
				{badge && (
					<span className="text-[11px] text-[#999] tabular-nums shrink-0 ml-2">{badge}</span>
				)}
			</SidebarItem>
		</Link>
	);
}

function SidebarTreeItem({
	icon: Icon,
	label,
	href,
	active,
}: {
	icon: React.ComponentType<{
		className?: string;
		strokeWidth?: number;
	}>;
	label: string;
	href: string;
	active: boolean;
}) {
	return (
		<Link href={href}>
			<div
				className={cn(
					"flex items-center gap-2 py-[5px] px-[18px] pl-8 text-[12.5px] cursor-pointer rounded-[7px] mx-[6px] transition-colors",
					active ? "bg-[#e8eefb] text-[#2b5fcc] font-medium" : "text-[#555] hover:bg-[#eee]",
				)}
			>
				<Icon
					className={cn("w-[13px] h-[13px] shrink-0", active ? "text-[#2b5fcc]" : "text-current")}
					strokeWidth={2}
				/>
				<span className="truncate">{label}</span>
			</div>
		</Link>
	);
}

function SidebarBottomItem({
	icon: Icon,
	label,
	onClick,
}: {
	icon: React.ComponentType<{
		className?: string;
		strokeWidth?: number;
	}>;
	label: string;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-2 px-[18px] py-[7px] text-[13px] text-[#555] cursor-pointer hover:bg-[#eee] transition-colors w-full text-left"
		>
			<Icon className="w-[15px] h-[15px] opacity-60" strokeWidth={1.8} />
			{label}
		</button>
	);
}
