"use client";

import { Hash, MoreHorizontal, UserCheck, Users, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DirectoriesSection() {
	return (
		<div className="mt-4 px-2">
			<h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
				Directories
			</h3>
			<div className="grid grid-cols-3 gap-2">
				<Button
					variant="ghost"
					className="flex h-auto flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-slate-100"
				>
					<div className="flex w-7 h-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
						<Users2 className="h-3.5 w-3.5" />
					</div>
					<span className="text-[9px] font-medium text-slate-500">People</span>
				</Button>
				<Button
					variant="ghost"
					className="flex h-auto flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-slate-100"
				>
					<div className="flex w-7 h-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
						<Hash className="h-3.5 w-3.5" />
					</div>
					<span className="text-[9px] font-medium text-slate-500">Channels</span>
				</Button>
				<Button
					variant="ghost"
					className="flex h-auto flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-slate-100"
				>
					<div className="flex w-7 h-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
						<Users className="h-3.5 w-3.5" />
					</div>
					<span className="text-[9px] font-medium text-slate-500">User Groups</span>
				</Button>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						className="flex h-auto flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-slate-100"
					>
						<div className="flex w-7 h-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
							<UserCheck className="h-3.5 w-3.5" />
						</div>
						<span className="text-[9px] font-medium text-slate-500">Invitations</span>
					</Button>
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
