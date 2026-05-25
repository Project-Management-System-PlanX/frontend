"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	CheckSquare,
	Files,
	LayoutGrid,
	type LucideIcon,
	MessageSquare,
	PanelLeftClose,
	Settings,
	UserPlus,
	Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { useUnreadStore } from "@/stores/unread-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const SettingsModal = dynamic(
	() => import("@/components/modals/SettingsModal").then((mod) => mod.SettingsModal),
	{ ssr: false },
);

const InviteMembersDialog = dynamic(
	() =>
		import("@/components/workspaces/InviteMembersDialog").then((mod) => mod.InviteMembersDialog),
	{ ssr: false },
);

interface PrimarySidebarProps {
	defaultCollapsed?: boolean;
	variant?: "side" | "top";
}

export function PrimarySidebar({
	defaultCollapsed = false,
	variant = "side",
}: PrimarySidebarProps) {
	const pathname = usePathname();
	const { user } = useSupabaseAuth();
	const { activeWorkspaceId, activeWorkspaceName } = useWorkspaceStore();
	const { setSidebarOpen, toggleSidebar } = useAppStore();
	const isTop = variant === "top";

	const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
	const [inviteOpen, setInviteOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [topSearch, setTopSearch] = useState("");
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		if (hasMounted) {
			setIsExpanded(!defaultCollapsed);
		} else {
			setHasMounted(true);
		}
	}, [defaultCollapsed, hasMounted]);

	useEffect(() => {
		if (
			pathname.includes("/channel/") ||
			pathname.includes("/dm/") ||
			pathname.includes("/space/")
		) {
			setIsExpanded(false);
		}
	}, [pathname]);

	const totalUnread = useUnreadStore((s) => {
		const c = s.counts;
		return Object.values(c).reduce((sum, v) => sum + v, 0);
	});

	const navItems = [
		{ icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
		{
			icon: MessageSquare,
			label: "Chats",
			href: "/dashboard/chat",
			active: pathname.startsWith("/dashboard/chat"),
			badge: totalUnread > 0 ? (totalUnread > 99 ? "99+" : String(totalUnread)) : undefined,
		},
		{
			icon: CheckSquare,
			label: "Tasks",
			href: "/dashboard/task",
			active: pathname.startsWith("/dashboard/task"),
		},
		{
			icon: Files,
			label: "Documents",
			href: "/dashboard/files",
			active: pathname.startsWith("/dashboard/files"),
		},
	];

	const bottomItems = [
		{ icon: UserPlus, label: "Invite Member", onClick: () => setInviteOpen(true) },
		{ icon: Settings, label: "Settings", onClick: () => setSettingsOpen(true) },
		{
			label: "Account",
			href: "/dashboard/account",
			active: pathname === "/dashboard/account",
			isAccount: true,
		},
	];

	return (
		<>
			{isTop ? (
				<div className="w-full flex items-center gap-4">
					{/* Logo */}
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-[10px] bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
							<Zap className="w-4.5 h-4.5 fill-white/20" />
						</div>
						<span
							className="font-semibold text-white tracking-tight text-[15px]"
							style={{
								fontFamily:
									"'-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', sans-serif",
							}}
						>
							TeamUp
						</span>
					</div>

					{/* Search */}
					<div className="hidden md:flex flex-1 max-w-[520px]">
						<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 w-full">
							<input
								value={topSearch}
								onChange={(event) => setTopSearch(event.target.value)}
								placeholder="Search"
								className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/60 outline-none"
							/>
						</div>
					</div>

					{/* Nav items */}
					<div className="flex items-center gap-2">
						{navItems.map((item) => (
							<PrimaryNavItem
								key={item.label}
								{...item}
								isActive={item.active ?? pathname === item.href}
								isExpanded
								layout="top"
								onItemClick={() => {
									if (item.active) {
										toggleSidebar();
									} else {
										setSidebarOpen(true);
									}
								}}
							/>
						))}
					</div>

					{/* Right side — Bell + bottom items */}
					<div className="ml-auto flex items-center gap-2">
						<NotificationBell />
						{bottomItems.map((item) => (
							<PrimaryNavItem
								key={item.label}
								{...item}
								isActive={item.active}
								isExpanded
								layout="top"
							/>
						))}
					</div>
				</div>
			) : (
				<motion.div
					animate={{ width: isExpanded ? 240 : 76 }}
					transition={{ type: "spring", stiffness: 260, damping: 32 }}
					className="h-full flex flex-col shrink-0 z-50 overflow-hidden"
				>
					{/* Header: Logo + Toggle */}
					<div
						className={cn(
							"py-6 flex items-center transition-all duration-300",
							isExpanded ? "px-6 justify-between mb-4" : "px-0 justify-center mb-6",
						)}
					>
						<button
							type="button"
							onClick={() => setIsExpanded(!isExpanded)}
							className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] group outline-none"
							title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
						>
							<div className="w-10 h-10 rounded-[12px] bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 transition-all group-hover:shadow-blue-500/30">
								<Zap className="w-5.5 h-5.5 fill-white/20" />
							</div>
							<AnimatePresence>
								{isExpanded && (
									<motion.span
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -10 }}
										className="font-bold text-gray-900 tracking-tight text-[19px] whitespace-nowrap"
										style={{
											fontFamily:
												"'-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', sans-serif",
										}}
									>
										TeamUp
									</motion.span>
								)}
							</AnimatePresence>
						</button>
						{isExpanded && (
							<button
								type="button"
								onClick={() => setIsExpanded(false)}
								className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
							>
								<PanelLeftClose className="w-4.5 h-4.5" />
							</button>
						)}
					</div>

					{/* Navigation */}
					<div className={cn("flex-1 flex flex-col gap-1 px-3")}>
						{navItems.map((item) => (
							<PrimaryNavItem
								key={item.label}
								{...item}
								isActive={item.active ?? pathname === item.href}
								isExpanded={isExpanded}
								onItemClick={() => {
									if (item.active) {
										toggleSidebar();
										if (item.label !== "Dashboard" && isExpanded) {
											setIsExpanded(false);
										}
									} else {
										setSidebarOpen(true);
										if (isExpanded) setIsExpanded(false);
									}
								}}
							/>
						))}
					</div>

					{/* Bottom Actions */}
					<div className={cn("flex flex-col gap-1 px-3 pt-4 border-t border-slate-200/60 mb-6")}>
						{/* Notification Bell */}
						<div className={cn("flex mb-1", isExpanded ? "px-1" : "justify-center")}>
							<NotificationBell />
						</div>

						{bottomItems.map((item) => (
							<PrimaryNavItem
								key={item.label}
								{...item}
								isActive={item.active}
								isExpanded={isExpanded}
								onItemClick={() => {
									if (isExpanded) setIsExpanded(false);
								}}
							/>
						))}
					</div>
				</motion.div>
			)}

			{/* Dialogs */}
			{hasMounted &&
				activeWorkspaceId &&
				createPortal(
					<InviteMembersDialog
						isOpen={inviteOpen}
						onClose={() => setInviteOpen(false)}
						workspaceId={activeWorkspaceId}
						workspaceName={activeWorkspaceName || "Workspace"}
						userId={user?.id || ""}
					/>,
					document.body,
				)}
			{hasMounted &&
				createPortal(
					<SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />,
					document.body,
				)}
		</>
	);
}

function PrimaryNavItem({
	icon: Icon,
	label,
	href,
	onClick,
	isActive,
	isExpanded,
	isAccount,
	onItemClick,
	layout = "side",
}: {
	icon?: LucideIcon;
	label: string;
	href?: string;
	onClick?: () => void;
	isActive?: boolean;
	isExpanded: boolean;
	isAccount?: boolean;
	onItemClick?: () => void;
	layout?: "side" | "top";
}) {
	const { user } = useSupabaseAuth();
	const initials = user?.email?.substring(0, 2).toUpperCase() || "?";
	const imageUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

	const content = (
		<button
			type="button"
			className={cn(
				"relative flex items-center transition-all duration-200 group outline-none rounded-xl cursor-pointer",
				layout === "top"
					? "px-3 py-1.5 gap-2 text-white/90 hover:bg-white/10"
					: isExpanded
						? "px-3 py-2.5 gap-3 w-full"
						: "h-11 w-11 mx-auto justify-center",
				layout === "top"
					? isActive
						? "bg-white/15 text-white"
						: "text-white/80"
					: isActive
						? "bg-gray-900/10 text-gray-900 font-semibold"
						: "text-gray-500 hover:text-gray-900 hover:bg-gray-900/5",
			)}
			onClick={() => {
				onClick?.();
				onItemClick?.();
			}}
		>
			{isAccount ? (
				<Avatar
					className={cn(
						"transition-all",
						isExpanded ? "w-5 h-5 shadow-sm" : "w-[26px] h-[26px] shadow-sm",
					)}
				>
					<AvatarImage src={imageUrl} alt={label} referrerPolicy="no-referrer" />
					<AvatarFallback className="text-[8px] bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-bold">
						{initials}
					</AvatarFallback>
				</Avatar>
			) : (
				Icon && (
					<Icon
						className={cn(
							isExpanded ? "w-5 h-5" : "w-[22px] h-[22px]",
							isActive ? "stroke-[2.5]" : "stroke-[1.5]",
						)}
					/>
				)
			)}

			<AnimatePresence mode="wait">
				{isExpanded && (
					<motion.span
						initial={{ opacity: 0, x: -5 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -5 }}
						className={cn(
							"text-[13.5px] font-medium whitespace-nowrap",
							isActive ? "text-gray-900 font-semibold" : "text-gray-600 group-hover:text-gray-900",
						)}
						style={{
							fontFamily:
								"'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', sans-serif",
						}}
					>
						{label}
					</motion.span>
				)}
			</AnimatePresence>
		</button>
	);

	const linkedContent =
		href && !isActive ? (
			<Link href={href} className={cn(layout === "top" ? "" : "w-full")}>
				{content}
			</Link>
		) : (
			content
		);

	if (isExpanded || layout === "top") {
		return linkedContent;
	}

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex justify-center w-full">{linkedContent}</div>
				</TooltipTrigger>
				<TooltipContent
					side="right"
					sideOffset={12}
					className="bg-gray-800/90 backdrop-blur-md border-none text-white text-[11px] font-medium tracking-wide px-3 py-1.5 rounded-lg shadow-xl"
					style={{
						fontFamily:
							"'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', sans-serif",
					}}
				>
					{label}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}