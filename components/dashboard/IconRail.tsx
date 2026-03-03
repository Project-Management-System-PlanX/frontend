"use client";

import { CheckSquare, FolderOpen, Home, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileCompletionModal } from "@/components/modals/ProfileCompletionModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/dashboard", icon: Home, label: "Dashboard", exact: true },
	{ href: "/dashboard/chat", icon: MessageSquare, label: "Chat", exact: false },
	{ href: "/dashboard/task", icon: CheckSquare, label: "Tasks", exact: false },
	{ href: "/dashboard/files", icon: FolderOpen, label: "Files", exact: true },
];

export function IconRail() {
	const pathname = usePathname();

	return (
		<div className="w-14 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 gap-3">
			<ProfileCompletionModal />
			<TooltipProvider delayDuration={0}>
				{navItems.map((item) => {
					// Use /dashboard/task/for-you as the default link for Tasks
					// but keep highlighting active for any /dashboard/task route
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
				<AvatarFallback className="bg-[#0B6E4F] text-white text-sm font-medium">RJ</AvatarFallback>
			</Avatar>
		</div>
	);
}
