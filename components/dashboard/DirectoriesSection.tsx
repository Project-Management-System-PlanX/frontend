"use client";

import { Hash, MoreHorizontal, UserCheck, Users, Users2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DirectoriesSectionProps {
	onDirectorySelect?: (directory: string) => void;
}

const directories = [
	{ id: "people", label: "People", icon: Users2, href: "/dashboard/chat/directories/people" },
	{ id: "channels", label: "Channels", icon: Hash, href: "/dashboard/chat/directories/channel" },
	{ id: "groups", label: "Groups", icon: Users, href: "#" },
	{ id: "invitations", label: "Invitations", icon: UserCheck, href: "/dashboard/chat/directories/invitations" },
];

export function DirectoriesSection(_props: DirectoriesSectionProps) {
	const pathname = usePathname();

	return (
		<div className="mt-4 px-2">
			<h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
				Directories
			</h3>

			<div className="grid grid-cols-3 gap-2">
				{directories.slice(0, 3).map((dir) => {
					const Icon = dir.icon;
					const isActive = pathname.startsWith(dir.href) && dir.href !== "#";
					return (
						<Link
							key={dir.id}
							href={dir.href}
							className={cn(
								"flex h-auto flex-col items-center gap-1 rounded-lg p-2 transition-colors",
								"hover:bg-slate-100",
								isActive && "bg-slate-100",
							)}
						>
							<div
								className={cn(
									"flex w-7 h-7 items-center justify-center rounded-md",
									isActive ? "bg-[#0B6E4F]" : "bg-slate-100 text-slate-500",
								)}
							>
								<Icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : "")} />
							</div>
							<span
								className={cn(
									"text-[9px] font-medium",
									isActive ? "text-slate-900" : "text-slate-500",
								)}
							>
								{dir.label}
							</span>
						</Link>
					);
				})}
				<div className="flex items-center gap-1">
					{(() => {
						const invDir = directories[3];
						const Icon = invDir.icon;
						const isActive = pathname.startsWith(invDir.href) && invDir.href !== "#";
						return (
							<Link
								href={invDir.href}
								className="flex h-auto flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-slate-100"
							>
								<div
									className={cn(
										"flex w-7 h-7 items-center justify-center rounded-md",
										isActive ? "bg-[#0B6E4F]" : "bg-slate-100 text-slate-500",
									)}
								>
									<Icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : "")} />
								</div>
								<span
									className={cn(
										"text-[9px] font-medium",
										isActive ? "text-slate-900" : "text-slate-500",
									)}
								>
									Invitations
								</span>
							</Link>
						);
					})()}
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 rounded-lg transition-colors hover:bg-slate-100"
					>
						<MoreHorizontal className="h-3.5 w-3.5 text-slate-500" />
					</Button>
				</div>
			</div>
		</div>
	);
}
