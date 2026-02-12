"use client";

import {
	ChevronDown,
	ChevronRight,
	ExternalLink,
	Globe,
	List,
	MoreHorizontal,
	Plus,
	User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconRail } from "./IconRail";

interface SpaceItem {
	id: string;
	name: string;
	color: string;
	icon: string;
}

interface TaskSidebarProps {
	forYouActive?: boolean;
	activeSpaceId?: string;
}

const starredSpaces: SpaceItem[] = [
	{ id: "sales-outreach", name: "(Example) Sales Outre...", color: "#00BCD4", icon: "📦" },
];

const recentSpaces: SpaceItem[] = [
	{ id: "my-sales-team", name: "My Sales Team", color: "#FF9800", icon: "📋" },
	{ id: "my-sales-team-2", name: "My Sales Team", color: "#FF9800", icon: "📋" },
];

export function TaskSidebar(_props: TaskSidebarProps) {
	const pathname = usePathname();
	const [spacesExpanded, setSpacesExpanded] = useState(true);

	const isForYouActive = pathname === "/dashboard/task/for-you";

	const isSpaceActive = (spaceId: string) => {
		return pathname === `/dashboard/task/space/${spaceId}`;
	};

	return (
		<div className="flex h-full" style={{ fontFamily: "var(--font-figtree), Figtree" }}>
			{/* Shared Icon Rail */}
			<IconRail />

			{/* Sidebar List */}
			<div className="w-56 bg-white flex flex-col border-r border-slate-200">
				{/* Team Header */}
				<div className="p-4 flex items-center justify-between border-b border-slate-200">
					<span className="font-semibold text-slate-900 text-base">Team UP</span>
					<Button
						variant="ghost"
						size="icon"
						className="w-7 h-7 text-slate-500 hover:text-slate-900"
					>
						<ExternalLink className="w-4 h-4" />
					</Button>
				</div>

				<ScrollArea className="flex-1">
					<div className="p-3">
						{/* For You */}
						<div className="mb-4">
							<Link
								href="/dashboard/task/for-you"
								className={`flex items-center gap-2 w-full px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors rounded-md ${
									isForYouActive
										? "text-[#0B6E4F] bg-[#0B6E4F]/8"
										: "text-slate-500 hover:text-slate-900"
								}`}
							>
								<User className="w-3.5 h-3.5" />
								<span>FOR YOU</span>
							</Link>
						</div>

						{/* Spaces Section */}
						<div className="mb-4">
							{/* Spaces Header */}
							<div className="flex items-center justify-between px-2 py-1.5">
								<button
									type="button"
									onClick={() => setSpacesExpanded(!spacesExpanded)}
									className="group flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-900 transition-colors"
								>
									<span className="relative w-3.5 h-3.5">
										<Globe className="w-3.5 h-3.5 absolute inset-0 transition-opacity group-hover:opacity-0" />
										<ChevronDown className="w-3.5 h-3.5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
									</span>
									<span>Spaces</span>
								</button>
								<div className="flex items-center gap-0.5">
									<Button
										variant="ghost"
										size="icon"
										className="w-6 h-6 text-slate-400 hover:text-slate-700"
									>
										<Plus className="w-3.5 h-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="w-6 h-6 text-slate-400 hover:text-slate-700"
									>
										<MoreHorizontal className="w-3.5 h-3.5" />
									</Button>
								</div>
							</div>

							{spacesExpanded && (
								<div className="mt-1">
									{/* Starred */}
									<div className="mb-3">
										<span className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
											Starred
										</span>
										<div className="mt-1.5 space-y-0.5">
											{starredSpaces.map((space) => (
												<Link
													key={space.id}
													href={`/dashboard/task/space/${space.id}`}
													className={`flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm transition-colors ${
														isSpaceActive(space.id)
															? "bg-slate-100 text-slate-900"
															: "text-slate-700 hover:bg-slate-100"
													}`}
												>
													<span
														className="w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0"
														style={{ backgroundColor: space.color }}
													>
														{space.icon}
													</span>
													<span className="truncate">{space.name}</span>
												</Link>
											))}
										</div>
									</div>

									{/* Recent */}
									<div className="mb-3">
										<span className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
											Recent
										</span>
										<div className="mt-1.5 space-y-0.5">
											{recentSpaces.map((space) => (
												<Link
													key={space.id}
													href={`/dashboard/task/space/${space.id}`}
													className={`flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm transition-colors ${
														isSpaceActive(space.id)
															? "bg-slate-100 text-slate-900"
															: "text-slate-700 hover:bg-slate-100"
													}`}
												>
													<span
														className="w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0"
														style={{ backgroundColor: space.color }}
													>
														{space.icon}
													</span>
													<span className="truncate">{space.name}</span>
												</Link>
											))}
										</div>
									</div>

									{/* More spaces */}
									<button
										type="button"
										className="flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
									>
										<div className="flex items-center gap-2.5">
											<List className="w-4 h-4 shrink-0" />
											<span>More spaces</span>
										</div>
										<ChevronRight className="w-3.5 h-3.5" />
									</button>
								</div>
							)}
						</div>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
