"use client";

import {
	ChevronDown,
	ChevronRight,
	ExternalLink,
	Globe,
	List,
	Loader2,
	MoreHorizontal,
	Plus,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconRail } from "./IconRail";
import { useSpaces, useCreateSpace } from "@/hooks/api/use-spaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskSidebarProps {
	forYouActive?: boolean;
	activeSpaceId?: string;
}

export function TaskSidebar(_props: TaskSidebarProps) {
	const pathname = usePathname();
	const [spacesExpanded, setSpacesExpanded] = useState(true);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newSpaceName, setNewSpaceName] = useState("");
	const [createError, setCreateError] = useState<string | null>(null);

	const { token } = useSupabaseAuth();
	const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
	const { data: spaces, isLoading: isLoadingSpaces } = useSpaces(activeWorkspaceId as string, token || undefined);
	const { mutateAsync: createSpace, isPending: isCreating } = useCreateSpace(token || undefined);

	const isForYouActive = pathname === "/dashboard/task/for-you";

	const isSpaceActive = (spaceId: string) => {
		return pathname === `/dashboard/task/space/${spaceId}`;
	};

	const handleCreateSpace = async () => {
		if (!newSpaceName.trim() || !activeWorkspaceId) return;
		setCreateError(null);

		try {
			const name = newSpaceName.trim();
			const prefix = name
				.split(/\s+/)
				.map((w) => w[0])
				.join("")
				.toUpperCase()
				.slice(0, 4);

			await createSpace({
				workspaceId: activeWorkspaceId,
				name,
				prefix: prefix || name.slice(0, 3).toUpperCase(),
			});

			setNewSpaceName("");
			setIsCreateOpen(false);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to create space";
			setCreateError(message);
		}
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
								className={`flex items-center gap-2 w-full px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors rounded-md ${isForYouActive
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
										onClick={() => setIsCreateOpen(true)}
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
									{/* Create Space Inline Form */}
									{isCreateOpen && (
										<div className="mx-2 mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200 animate-[fadeIn_0.15s_ease-out]">
											<input
												type="text"
												value={newSpaceName}
												onChange={(e) => setNewSpaceName(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleCreateSpace();
													if (e.key === "Escape") {
														setIsCreateOpen(false);
														setNewSpaceName("");
														setCreateError(null);
													}
												}}
												placeholder="Space name..."
												className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-[#0B6E4F] focus:ring-1 focus:ring-[#0B6E4F]/30"
												// biome-ignore lint/a11y/noAutofocus: intentional
												autoFocus
												disabled={isCreating}
											/>
											{createError && (
												<p className="text-[10px] text-red-500 mt-1 px-1">{createError}</p>
											)}
											<div className="flex items-center justify-end gap-1.5 mt-2">
												<button
													type="button"
													onClick={() => {
														setIsCreateOpen(false);
														setNewSpaceName("");
														setCreateError(null);
													}}
													className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 rounded hover:bg-slate-100"
													disabled={isCreating}
												>
													Cancel
												</button>
												<button
													type="button"
													onClick={handleCreateSpace}
													disabled={!newSpaceName.trim() || isCreating}
													className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0B6E4F] rounded hover:bg-[#095C42] disabled:opacity-50 flex items-center gap-1"
												>
													{isCreating && <Loader2 className="w-3 h-3 animate-spin" />}
													Create
												</button>
											</div>
										</div>
									)}

									{/* All Spaces - from API */}
									<div className="mb-3">
										<span className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
											All Spaces
										</span>
										<div className="mt-1.5 space-y-0.5">
											{isLoadingSpaces ? (
												<div className="px-2 py-1 space-y-2">
													<Skeleton className="h-6 w-full" />
													<Skeleton className="h-6 w-3/4" />
												</div>
											) : spaces && spaces.length > 0 ? (
												spaces.map((space) => (
													<Link
														key={space.id}
														href={`/dashboard/task/space/${space.id}`}
														className={`flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm transition-colors ${isSpaceActive(space.id)
															? "bg-slate-100 text-slate-900"
															: "text-slate-700 hover:bg-slate-100"
															}`}
													>
														<span
															className="w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0"
															style={{ backgroundColor: space.color || "#0B6E4F", color: "#fff" }}
														>
															{space.icon || "📋"}
														</span>
														<span className="truncate">{space.name}</span>
													</Link>
												))
											) : (
												<div className="px-2 py-1 text-xs text-slate-400 italic">
													{activeWorkspaceId
														? "No spaces yet — click + to create one"
														: "Select a workspace first"}
												</div>
											)}
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
