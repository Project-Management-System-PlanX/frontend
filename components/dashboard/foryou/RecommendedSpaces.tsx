"use client";

import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { useSpaces } from "@/hooks/api/use-spaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendedSpacesProps {
	activeSpaceTab: string;
	setActiveSpaceTab: (tab: string) => void;
}

export function RecommendedSpaces({ activeSpaceTab, setActiveSpaceTab }: RecommendedSpacesProps) {
	const { token } = useSupabaseAuth();
	const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
	const { data: spaces, isLoading } = useSpaces(activeWorkspaceId as string, token || undefined);

	return (
		<section className="mb-5 animate-[fadeInUp_0.4s_ease-out_0.1s_both]">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-[14px] font-semibold text-slate-900">Your spaces</h2>

				<div className="flex items-center gap-3">
					{["All", "Recent"].map((tab) => (
						<button
							key={tab}
							type="button"
							onClick={() => setActiveSpaceTab(tab)}
							className={`text-[12px] font-medium px-3 py-1 rounded-full transition-all ${activeSpaceTab === tab
									? "bg-[#0B6E4F] text-white"
									: "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
								}`}
						>
							{tab}
						</button>
					))}
				</div>
			</div>

			{/* Space Cards */}
			<div className="flex gap-3 animate-[fadeInUp_0.4s_ease-out_0.2s_both] overflow-x-auto pb-2">
				{isLoading ? (
					<>
						<Skeleton className="min-w-[190px] h-[120px] rounded-lg" />
						<Skeleton className="min-w-[190px] h-[120px] rounded-lg" />
					</>
				) : spaces && spaces.length > 0 ? (
					spaces.map((space) => (
						<Link
							key={space.id}
							href={`/dashboard/task/space/${space.id}`}
							className="group flex flex-col items-start p-4 rounded-lg border border-slate-200 hover:border-[#0B6E4F]/30 hover:shadow-md transition-all min-w-[190px] max-w-[210px] text-left bg-white"
						>
							{/* Icon */}
							<div
								className="w-9 h-9 rounded-md flex items-center justify-center text-white text-sm mb-3 shadow-sm"
								style={{ backgroundColor: space.color || "#0B6E4F" }}
							>
								{space.icon || "📋"}
							</div>

							{/* Name & Type */}
							<p className="text-[13px] font-medium text-slate-800 leading-tight truncate w-full">
								{space.name}
							</p>
							<p className="text-[11px] text-slate-400 mt-0.5">{space.prefix}</p>

							{/* Stats */}
							<div className="flex items-center gap-1.5 mt-3">
								<Users className="w-3 h-3 text-slate-400" />
								<span className="text-[10px] text-slate-400">
									{space.taskCounter || 0} tasks
								</span>
							</div>
						</Link>
					))
				) : (
					<div className="flex items-center justify-center py-8 w-full text-center">
						<div>
							<div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-3">
								<Plus className="w-5 h-5 text-slate-400" />
							</div>
							<p className="text-sm text-slate-500 font-medium">No spaces yet</p>
							<p className="text-xs text-slate-400 mt-1">
								Create a space from the sidebar to start managing tasks
							</p>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
