"use client";

import { Hash, MoreHorizontal, UserCheck, Users, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DirectoriesSectionProps {
	onDirectorySelect: (directory: string) => void;
	activeDirectory?: string;
}

export function DirectoriesSection({
	onDirectorySelect,
	activeDirectory,
}: DirectoriesSectionProps) {
	const directories = [
		{ id: "people", label: "People", icon: Users2 },
		{ id: "channels", label: "Channels", icon: Hash },
		{ id: "groups", label: "Groups", icon: Users },
		{ id: "invitations", label: "Invitations", icon: UserCheck },
	];

	return (
		<div className="mt-4 px-2">
			<h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
				Directories
			</h3>

			<div className="grid grid-cols-3 gap-2">
				{directories.slice(0, 3).map((dir) => {
					const Icon = dir.icon;
					const isActive = activeDirectory === dir.id;
					return (
						<Button
							key={dir.id}
							variant="ghost"
							className={cn(
								"flex h-auto flex-col items-center gap-1 rounded-lg p-2 transition-colors",
								"hover:bg-slate-100",
							)}
							onClick={() => onDirectorySelect(dir.id)}
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
						</Button>
					);
				})}
				<div className="flex items-center gap-1">
					{(() => {
						const isActive = activeDirectory === "invitations";
						return (
							<Button
								variant="ghost"
								className="flex h-auto flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-slate-100"
								onClick={() => onDirectorySelect("invitations")}
							>
								<div
									className={cn(
										"flex w-7 h-7 items-center justify-center rounded-md",
										isActive ? "bg-[#0B6E4F]" : "bg-slate-100 text-slate-500",
									)}
								>
									<UserCheck className={cn("h-3.5 w-3.5", isActive ? "text-white" : "")} />
								</div>
								<span
									className={cn(
										"text-[9px] font-medium",
										isActive ? "text-slate-900" : "text-slate-500",
									)}
								>
									Invitations
								</span>
							</Button>
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
