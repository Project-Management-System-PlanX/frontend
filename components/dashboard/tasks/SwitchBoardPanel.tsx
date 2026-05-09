"use client";

import { Layout, Check, Plus, Search, MoreHorizontal, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Space } from "@/lib/types/models";

interface SwitchBoardPanelProps {
	spaces: Space[];
	selectedSpaceId: string | null;
	onSelect: (id: string) => void;
	onCreateNew?: () => void;
}

export function SwitchBoardPanel({
	spaces,
	selectedSpaceId,
	onSelect,
	onCreateNew,
}: SwitchBoardPanelProps) {
	return (
		<div className="h-full flex flex-col bg-[#0D0D0D]">
			<div className="px-6 py-5 flex items-center justify-between border-b border-white/5">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
						<Layout className="w-5 h-5 text-blue-400" />
					</div>
					<div>
						<h2 className="text-[18px] font-black text-white tracking-tight">Switch Board</h2>
						<p className="text-[12px] text-white/40 font-bold uppercase tracking-widest">
							{spaces.length} Boards available
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative group">
						<Search className="w-4 h-4 text-white/20 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white/60 transition-colors" />
						<input 
							type="text" 
							placeholder="Search boards..."
							className="bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[13px] text-white outline-none focus:border-white/10 w-48 transition-all"
						/>
					</div>
					<button 
						onClick={onCreateNew}
						className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
					>
						<Plus className="w-5 h-5" />
					</button>
				</div>
			</div>

			<div className="p-6 flex-1 overflow-auto custom-scrollbar">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{spaces.map((space) => (
						<div
							key={space.id}
							onClick={() => onSelect(space.id)}
							className={cn(
								"group relative p-5 rounded-[24px] border transition-all cursor-pointer overflow-hidden",
								selectedSpaceId === space.id
									? "bg-white/[0.03] border-white/20 shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)]"
									: "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
							)}
						>
							<div className="flex items-start justify-between relative z-10">
								<div className="flex items-center gap-4">
									<div className={cn(
										"w-12 h-12 rounded-2xl flex items-center justify-center text-[20px] font-black border transition-all",
										selectedSpaceId === space.id
											? "bg-white text-black border-white shadow-lg"
											: "bg-black border-white/10 text-white/40 group-hover:border-white/20 group-hover:text-white"
									)}>
										{space.name.charAt(0).toUpperCase()}
									</div>
									<div>
										<div className="flex items-center gap-2 mb-1">
											<h3 className={cn(
												"text-[16px] font-bold transition-colors",
												selectedSpaceId === space.id ? "text-white" : "text-white/60 group-hover:text-white"
											)}>
												{space.name}
											</h3>
											{selectedSpaceId === space.id && (
												<div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
													<Check className="w-2.5 h-2.5 text-black font-black" />
												</div>
											)}
										</div>
										<div className="flex items-center gap-3">
											<span className="text-[11px] font-black text-white/20 uppercase tracking-tighter">
												{space.prefix || "BOARD"} • {space.statuses?.length || 0} Statuses
											</span>
										</div>
									</div>
								</div>
								<button className="p-1.5 text-white/10 hover:text-white/40 transition-colors">
									<Star className="w-4 h-4" />
								</button>
							</div>

							{/* Subtle background glow for active board */}
							{selectedSpaceId === space.id && (
								<div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] -mr-16 -mt-16 pointer-events-none" />
							)}
							
							<div className="mt-6 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
								{space.statuses?.slice(0, 4).map((status, i) => (
									<div 
										key={status.id}
										className="h-1 rounded-full flex-1"
										style={{ backgroundColor: status.color || '#333' }}
									/>
								))}
							</div>
						</div>
					))}

					{/* Create New Card */}
					<div 
						onClick={onCreateNew}
						className="p-5 rounded-[24px] border border-dashed border-white/10 hover:border-white/20 bg-transparent hover:bg-white/[0.02] transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group min-h-[140px]"
					>
						<div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
							<Plus className="w-5 h-5 text-white/20 group-hover:text-white" />
						</div>
						<span className="text-[14px] font-bold text-white/20 group-hover:text-white transition-colors">
							Create New Board
						</span>
					</div>
				</div>
			</div>

			<div className="p-6 mt-auto border-t border-white/5 bg-black/20">
				<div className="rounded-2xl p-4 bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors cursor-pointer">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
							<Star className="w-4 h-4 text-purple-400" />
						</div>
						<p className="text-[13px] font-bold text-white/80">Try Pro for unlimited boards</p>
					</div>
					<MoreHorizontal className="w-4 h-4 text-white/20 group-hover:text-white" />
				</div>
			</div>
		</div>
	);
}
