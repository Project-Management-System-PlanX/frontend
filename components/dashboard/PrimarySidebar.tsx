"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	CheckSquare,
	Files,
	LayoutGrid,
	type LucideIcon,
	MessageSquare,
	PanelLeftClose,
	PanelLeftOpen,
	Settings,
	User,
	UserPlus,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InviteMembersDialog } from "@/components/workspaces/InviteMembersDialog";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";

interface PrimarySidebarProps {
	defaultCollapsed?: boolean;
}

export function PrimarySidebar({ defaultCollapsed = false }: PrimarySidebarProps) {
	const pathname = usePathname();
	const { user } = useSupabaseAuth();
	const { activeWorkspaceId, activeWorkspaceName } = useWorkspaceStore();

	const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
	const [inviteOpen, setInviteOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

	// Sync expansion state when entering contextual sections, but allow override
	const [hasMounted, setHasMounted] = useState(false);
	useEffect(() => {
		if (hasMounted) {
			setIsExpanded(!defaultCollapsed);
		} else {
			setHasMounted(true);
		}
	}, [defaultCollapsed, hasMounted]);

	const navItems = [
		{ icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
		{
			icon: MessageSquare,
			label: "Chats",
			href: "/dashboard/chat",
			active: pathname.startsWith("/dashboard/chat"),
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
			icon: User,
			label: "Account",
			href: "/dashboard/account",
			active: pathname === "/dashboard/account",
		},
	];

	return (
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
					/>
				))}
			</div>

			{/* Bottom Actions */}
			<div className={cn("flex flex-col gap-1 px-3 pt-4 border-t border-slate-200/60 mb-6")}>
				{bottomItems.map((item) => (
					<PrimaryNavItem
						key={item.label}
						{...item}
						isActive={item.active}
						isExpanded={isExpanded}
					/>
				))}

				{!isExpanded && (
					<button
						type="button"
						onClick={() => setIsExpanded(true)}
						className="mt-2 w-12 h-12 flex items-center justify-center rounded-xl hover:bg-slate-200/60 text-slate-400 transition-all mx-auto"
						title="Expand Sidebar"
					>
						<PanelLeftOpen className="w-5 h-5" />
					</button>
				)}
			</div>

			{/* Dialogs */}
			{activeWorkspaceId && (
				<InviteMembersDialog
					isOpen={inviteOpen}
					onClose={() => setInviteOpen(false)}
					workspaceId={activeWorkspaceId}
					workspaceName={activeWorkspaceName || "Workspace"}
					userId={user?.id ?? ""}
				/>
			)}
			<SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
		</motion.div>
	);
}

function PrimaryNavItem({
	icon: Icon,
	label,
	href,
	onClick,
	isActive,
	isExpanded,
}: {
	icon: LucideIcon;
	label: string;
	href?: string;
	onClick?: () => void;
	isActive?: boolean;
	isExpanded: boolean;
}) {
	const content = (
		<button
			type="button"
			className={cn(
				"relative flex items-center transition-all duration-200 group outline-none w-full rounded-xl cursor-pointer",
				isExpanded ? "px-3 py-2.5 gap-3" : "h-11 w-11 mx-auto justify-center",
				isActive
					? "bg-white text-[#007AFF] shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 font-medium"
					: "text-gray-500 hover:text-gray-900 hover:bg-gray-900/5",
			)}
			onClick={onClick}
		>
			<Icon
				className={cn(
					isExpanded ? "w-5 h-5" : "w-[22px] h-[22px]",
					isActive ? "stroke-[2.5]" : "stroke-[2]",
				)}
			/>

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

	const linkedContent = href ? (
		<Link href={href} className="w-full">
			{content}
		</Link>
	) : (
		content
	);

	if (isExpanded) {
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
						fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', sans-serif",
					}}
				>
					{label}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
