"use client";

import {
	CheckSquare,
	FolderOpen,
	Home,
	LayoutGrid,
	LogOut,
	MessageSquare,
	Settings,
	User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ProfileCompletionModal } from "@/components/modals/ProfileCompletionModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/dashboard", icon: Home, label: "Dashboard", exact: true },
	{ href: "/dashboard/chat", icon: MessageSquare, label: "Chat", exact: false },
	{ href: "/dashboard/task", icon: CheckSquare, label: "Tasks", exact: false },
	{ href: "/dashboard/files", icon: FolderOpen, label: "Files", exact: true },
];

export function IconRail() {
	const pathname = usePathname();
	const { user, signOut } = useSupabaseAuth();
	const [settingsOpen, setSettingsOpen] = useState(false);

	const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || undefined;
	const firstName =
		user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(" ")[0] || "";
	const lastName =
		user?.user_metadata?.last_name || user?.user_metadata?.full_name?.split(" ")[1] || "";
	const email = user?.email || "";
	const initials =
		firstName && lastName
			? `${firstName[0]}${lastName[0]}`.toUpperCase()
			: email
				? email.substring(0, 2).toUpperCase()
				: "?";

	return (
		<div className="w-14 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 gap-3">
			{/* Workspace */}
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Link href="/workspaces">
							<Button
								variant="ghost"
								size="icon"
								className="w-9 h-9 rounded-lg text-slate-500 hover:text-[#0B6E4F] hover:bg-[#D1F2EB] transition-colors"
							>
								<LayoutGrid className="w-5 h-5" />
							</Button>
						</Link>
					</TooltipTrigger>
					<TooltipContent side="right">Workspace</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<div className="w-7 border-t border-slate-200" />

			<ProfileCompletionModal />
			<TooltipProvider delayDuration={0}>
				{navItems.map((item) => {
					const href = item.label === "Tasks" ? "/dashboard/task/for-you" : item.href;

					const Icon = item.icon;
					const isActive = item.exact
						? pathname === item.href
						: item.label === "Tasks"
							? pathname.startsWith("/dashboard/task")
							: pathname.startsWith(item.href);

					return (
						<Tooltip key={item.href}>
							<TooltipTrigger asChild>
								<Link href={href}>
									<Button
										variant="ghost"
										size="icon"
										className={cn(
											"w-9 h-9 rounded-lg transition-colors",
											isActive
												? "bg-[#0B6E4F] text-white hover:bg-[#0B6E4F]/90"
												: "text-slate-500 hover:text-slate-900 hover:bg-slate-200",
										)}
									>
										<Icon className="w-5 h-5" />
									</Button>
								</Link>
							</TooltipTrigger>
							<TooltipContent side="right">{item.label}</TooltipContent>
						</Tooltip>
					);
				})}
			</TooltipProvider>

			<div className="flex-1" />

			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setSettingsOpen(true)}
							className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200"
						>
							<Settings className="w-5 h-5" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right">Settings</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						suppressHydrationWarning
						className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#0B6E4F] focus:ring-offset-2 transition-all mt-auto"
					>
						<Avatar className="w-9 h-9 ring-2 ring-[#0B6E4F]/20 cursor-pointer hover:opacity-80 transition-opacity">
							<AvatarImage src={avatarUrl} />
							<AvatarFallback className="bg-[#0B6E4F] text-white text-sm font-medium">
								{initials}
							</AvatarFallback>
						</Avatar>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end" side="right" sideOffset={16}>
					<DropdownMenuLabel>
						<p className="font-semibold text-slate-800 truncate">
							{firstName} {lastName}
						</p>
						<p className="text-xs font-normal text-slate-500 truncate">{email}</p>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer gap-2">
						<UserIcon className="w-4 h-4" />
						<span>Profile Settings</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => signOut()}
						className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
					>
						<LogOut className="w-4 h-4" />
						<span>Log out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
		</div>
	);
}
