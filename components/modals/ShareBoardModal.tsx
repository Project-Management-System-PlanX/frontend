"use client";

import { motion } from "framer-motion";
import { ChevronDown, Globe, Link as LinkIcon, Lock, Users2, X } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ShareBoardModalProps {
	isOpen: boolean;
	onClose: () => void;
	boardName: string;
}

export function ShareBoardModal({ isOpen, onClose, boardName }: ShareBoardModalProps) {
	const [activeTab, setActiveTab] = useState<"members" | "requests">("members");
	const [_visibility, _setVisibility] = useState<"private" | "workspace" | "public">("workspace");

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
			<motion.div
				initial={{ scale: 0.95, opacity: 0, y: 20 }}
				animate={{ scale: 1, opacity: 1, y: 0 }}
				exit={{ scale: 0.95, opacity: 0, y: 20 }}
				className="w-full max-w-[580px] bg-[#1A1C1E] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]"
			>
				{/* Header */}
				<div className="px-8 pt-8 pb-6 flex items-center justify-between">
					<h2 className="text-[24px] font-black text-white tracking-tight">Share board</h2>
					<button
						onClick={onClose}
						className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="px-8 pb-8 space-y-8">
					{/* Invite Input Section */}
					<div className="flex items-center gap-3">
						<div className="flex-1 relative group">
							<input
								type="text"
								placeholder="Email address or name"
								className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-[15px] outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
							/>
						</div>
						<Popover>
							<PopoverTrigger asChild>
								<button className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all">
									<span className="text-[14px] font-bold">Member</span>
									<ChevronDown className="w-4 h-4" />
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-64 bg-[#222] border-white/10 p-2 shadow-2xl rounded-xl">
								<RoleItem
									title="Member"
									description="Can view and edit cards, lists, and some board settings."
									active
								/>
								<RoleItem
									title="Observer"
									description="Can view and comment, but not move or edit cards."
								/>
							</PopoverContent>
						</Popover>
						<button className="px-8 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black text-[15px] shadow-lg shadow-blue-500/20 transition-all active:scale-95">
							Share
						</button>
					</div>

					{/* Invite Link Section */}
					<div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center gap-5 group">
						<div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
							<LinkIcon className="w-5 h-5 text-white/60" />
						</div>
						<div className="flex-1">
							<p className="text-[15px] font-bold text-white mb-0.5">
								Anyone with the link can join as a member
							</p>
							<div className="flex items-center gap-3">
								<button className="text-[12px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">
									Copy link
								</button>
								<span className="w-1 h-1 rounded-full bg-white/10" />
								<button className="text-[12px] font-black text-red-400/60 hover:text-red-400 transition-colors uppercase tracking-widest">
									Delete link
								</button>
							</div>
						</div>
						<Popover>
							<PopoverTrigger asChild>
								<button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
									<span className="text-[13px] font-bold">Change permissions</span>
									<ChevronDown className="w-4 h-4" />
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-80 bg-[#222] border-white/10 p-2 shadow-2xl rounded-xl">
								<div className="space-y-1">
									<div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
										<p className="text-[14px] font-bold text-blue-400">Can join as member</p>
										<p className="text-[12px] text-blue-400/60">
											Board members can view and edit cards, lists, and some board settings.
										</p>
									</div>
									<div className="p-3 rounded-lg hover:bg-white/5 cursor-pointer group">
										<p className="text-[14px] font-bold text-white/60 group-hover:text-white transition-colors">
											Can join as observer
										</p>
										<p className="text-[12px] text-white/20 group-hover:text-white/40 transition-colors">
											Board observers can view and comment.
										</p>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>

					{/* Tabs & List */}
					<div className="space-y-6">
						<div className="flex items-center gap-8 border-b border-white/5 px-2">
							<button
								onClick={() => setActiveTab("members")}
								className={cn(
									"pb-4 text-[15px] font-bold transition-all relative",
									activeTab === "members" ? "text-white" : "text-white/20 hover:text-white/40",
								)}
							>
								Board members
								<span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/10 text-[11px] font-black">
									1
								</span>
								{activeTab === "members" && (
									<motion.div
										layoutId="tab"
										className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"
									/>
								)}
							</button>
							<button
								onClick={() => setActiveTab("requests")}
								className={cn(
									"pb-4 text-[15px] font-bold transition-all relative",
									activeTab === "requests" ? "text-white" : "text-white/20 hover:text-white/40",
								)}
							>
								Join requests
								{activeTab === "requests" && (
									<motion.div
										layoutId="tab"
										className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"
									/>
								)}
							</button>
						</div>

						<div className="space-y-2 max-h-[240px] overflow-auto custom-scrollbar pr-2">
							<MemberItem
								name="ravikrishnaj25 (you)"
								handle="@ravikrishnaj25"
								isWorkspaceAdmin
								initial="R"
							/>
						</div>
					</div>

					{/* Visibility Settings Footer */}
					<div className="pt-4 border-t border-white/5 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
								<Globe className="w-5 h-5 text-white/40" />
							</div>
							<div>
								<p className="text-[14px] font-bold text-white">Board visibility</p>
								<p className="text-[12px] text-white/40">
									Workspace members can see and edit this board.
								</p>
							</div>
						</div>
						<Popover>
							<PopoverTrigger asChild>
								<button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/80 transition-all font-bold text-[14px]">
									Workspace
									<ChevronDown className="w-4 h-4" />
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-80 bg-[#222] border-white/10 p-2 shadow-2xl rounded-xl">
								<VisibilityItem
									icon={<Lock className="w-4 h-4 text-red-400" />}
									title="Private"
									description="Only board members and workspace admins can see and edit."
								/>
								<VisibilityItem
									icon={<Users2 className="w-4 h-4 text-blue-400" />}
									title="Workspace"
									description="All members of the workspace can see and edit."
									active
								/>
								<VisibilityItem
									icon={<Globe className="w-4 h-4 text-green-400" />}
									title="Public"
									description="Anyone on the internet can see this board. Only members can edit."
								/>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			</motion.div>
		</div>
	);
}

function RoleItem({
	title,
	description,
	active,
}: {
	title: string;
	description: string;
	active?: boolean;
}) {
	return (
		<div
			className={cn(
				"p-3 rounded-lg cursor-pointer transition-all",
				active ? "bg-white/5 border border-white/10" : "hover:bg-white/5 border border-transparent",
			)}
		>
			<p className="text-[14px] font-bold text-white">{title}</p>
			<p className="text-[12px] text-white/40">{description}</p>
		</div>
	);
}

function MemberItem({
	name,
	handle,
	role,
	isWorkspaceAdmin,
	initial,
}: {
	name: string;
	handle: string;
	role: string;
	isWorkspaceAdmin?: boolean;
	initial: string;
}) {
	return (
		<div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group">
			<div className="flex items-center gap-4">
				<div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-[18px] shadow-lg shadow-orange-500/10">
					{initial}
				</div>
				<div>
					<p className="text-[15px] font-bold text-white">{name}</p>
					<p className="text-[12px] text-white/20 font-medium">
						{handle} • {isWorkspaceAdmin ? "Workspace admin" : "Member"}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[14px] font-bold flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
					{role}
					<ChevronDown className="w-4 h-4" />
				</div>
			</div>
		</div>
	);
}

function VisibilityItem({
	icon,
	title,
	description,
	active,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	active?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all",
				active ? "bg-white/5 border border-white/10" : "hover:bg-white/5 border border-transparent",
			)}
		>
			<div className="mt-1">{icon}</div>
			<div className="flex-1">
				<div className="flex items-center justify-between">
					<p className="text-[15px] font-bold text-white">{title}</p>
					{active && (
						<div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
					)}
				</div>
				<p className="text-[13px] text-white/40 leading-relaxed mt-0.5">{description}</p>
			</div>
		</div>
	);
}
