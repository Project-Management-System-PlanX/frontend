"use client";

import { motion } from "framer-motion";
import { ChevronDown, Globe, Link as LinkIcon, Lock, Users2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { workspaceService } from "@/lib/api/services/workspaces";

interface ShareBoardModalProps {
	isOpen: boolean;
	onClose: () => void;
	boardName: string;
	workspaceId?: string | null;
	spaceId?: string | null;
}

interface Member {
	name: string;
	handle: string;
	role?: string;
	isWorkspaceAdmin?: boolean;
	initial: string;
}

export function ShareBoardModal({
	isOpen,
	onClose,
	boardName,
	workspaceId,
	spaceId,
}: ShareBoardModalProps) {
	const [activeTab, setActiveTab] = useState<"members" | "requests">("members");
	const [visibility, setVisibility] = useState<"private" | "workspace" | "public">("workspace");
	const [isCopying, setIsCopying] = useState(false);
	const [copied, setCopied] = useState(false);
	const [emailInput, setEmailInput] = useState("");
	const [isSharing, setIsSharing] = useState(false);

	const { token, user } = useSupabaseAuth();
	const { members: otherMembers, currentUserProfile, isLoading } = useWorkspaceMembers();

	const members = useMemo(() => {
		const all: Member[] = [];
		if (currentUserProfile) {
			all.push({
				name: `${currentUserProfile.firstName} ${currentUserProfile.lastName}`.trim() || currentUserProfile.email || "You",
				handle: currentUserProfile.username ? `@${currentUserProfile.username}` : currentUserProfile.email,
				role: "Admin",
				isWorkspaceAdmin: true,
				initial: currentUserProfile.firstName?.[0] || currentUserProfile.email?.[0]?.toUpperCase() || "U",
			});
		}
		otherMembers.forEach((m) => {
			all.push({
				name: `${m.profile?.firstName} ${m.profile?.lastName}`.trim() || m.profile?.email || m.userId,
				handle: m.profile?.username ? `@${m.profile?.username}` : m.profile?.email || "",
				role: m.role.charAt(0) + m.role.slice(1).toLowerCase(),
				isWorkspaceAdmin: m.role === "OWNER" || m.role === "ADMIN",
				initial: m.profile?.firstName?.[0] || m.profile?.email?.[0]?.toUpperCase() || "M",
			});
		});
		return all;
	}, [otherMembers, currentUserProfile]);

	const copyToClipboard = async (text: string) => {
		try {
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(text);
				return true;
			}
			throw new Error("Clipboard API unavailable");
		} catch (err) {
			// Fallback: use a hidden textarea
			try {
				const textArea = document.createElement("textarea");
				textArea.value = text;
				// Ensure textarea is not visible but part of DOM
				textArea.style.position = "fixed";
				textArea.style.left = "-9999px";
				textArea.style.top = "0";
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				const successful = document.execCommand("copy");
				document.body.removeChild(textArea);
				return successful;
			} catch (fallbackErr) {
				console.error("Fallback copy failed:", fallbackErr);
				return false;
			}
		}
	};

	const handleCopyLink = async () => {
		if (!workspaceId || !token) return;
		setIsCopying(true);
		try {
			const data = await workspaceService.createInvite(workspaceId, spaceId || undefined, token);
			const link = `${window.location.origin}/invite/${data.token}`;

			const success = await copyToClipboard(link);
			if (success) {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} else {
				toast.error("Failed to copy link to clipboard");
			}
		} catch (err) {
			console.error("Failed to copy link:", err);
			toast.error("An error occurred while generating the invite link");
		} finally {
			setIsCopying(false);
		}
	};

	const handleShare = async () => {
		if (!workspaceId || !token || !emailInput.trim()) return;
		setIsSharing(true);
		try {
			await workspaceService.inviteByEmail(
				workspaceId,
				{
					emails: [emailInput.trim()],
					spaceId: spaceId || undefined,
				},
				token,
			);
			setEmailInput("");
		} catch (err) {
			console.error("Failed to share:", err);
		} finally {
			setIsSharing(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
			<motion.div
				initial={{ scale: 0.95, opacity: 0, y: 20 }}
				animate={{ scale: 1, opacity: 1, y: 0 }}
				exit={{ scale: 0.95, opacity: 0, y: 20 }}
				className="w-full max-w-[860px] bg-[#1A1C1E] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]"
			>
				<div className="px-8 pt-8 pb-6 flex items-center justify-between">
					<div>
						<h2 className="text-[26px] font-black text-white tracking-tight">Share board</h2>
						<p className="text-sm text-white/60 mt-2">
							Invite people to <span className="font-semibold text-white">{boardName}</span>.
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="px-8 pb-8 space-y-8">
					<div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
						<div className="space-y-6">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<div className="flex-1 relative group">
									<input
										type="text"
										placeholder="Email address or name"
										value={emailInput}
										onChange={(e) => setEmailInput(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleShare()}
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
									<PopoverContent className="w-64 bg-[#222] border border-white/10 p-3 shadow-2xl rounded-xl">
										<RoleItem
											title="Member"
											description="Can view and edit cards, lists, and board settings."
											active
										/>
										<RoleItem
											title="Observer"
											description="Can view and comment, but not move or edit cards."
										/>
									</PopoverContent>
								</Popover>
								<button
									onClick={handleShare}
									disabled={isSharing || !emailInput.trim()}
									className="px-8 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black text-[15px] shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
								>
									{isSharing ? "Sharing..." : "Share"}
								</button>
							</div>

							<div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5 flex flex-col gap-4">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
										<LinkIcon className="w-5 h-5 text-white/60" />
									</div>
									<div>
										<p className="text-[15px] font-bold text-white">
											Anyone with the link can join as a member
										</p>
										<p className="text-[13px] text-white/40 mt-1">
											Anyone with the link can find and join this board.
										</p>
									</div>
								</div>
								<div className="flex flex-wrap items-center gap-3">
									<button
										onClick={handleCopyLink}
										disabled={isCopying}
										className="text-[12px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
									>
										{copied ? "Link copied!" : isCopying ? "Generating..." : "Copy link"}
									</button>
									<span className="w-1 h-1 rounded-full bg-white/10" />
									<button className="text-[12px] font-black text-red-400/60 hover:text-red-400 transition-colors uppercase tracking-widest">
										Delete link
									</button>
								</div>
								<Popover>
									<PopoverTrigger asChild>
										<button className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all">
											<span className="text-[13px] font-bold">Change permissions</span>
											<ChevronDown className="w-4 h-4" />
										</button>
									</PopoverTrigger>
									<PopoverContent className="w-80 bg-[#222] border border-white/10 p-3 shadow-2xl rounded-xl">
										<div className="space-y-2">
											<RoleItem
												title="Can join as member"
												description="Board members can view and edit cards, lists, and board settings."
												active
											/>
											<RoleItem
												title="Can join as observer"
												description="Board observers can view and comment only."
											/>
										</div>
									</PopoverContent>
								</Popover>
							</div>

							<div className="rounded-[24px] bg-white/[0.03] border border-white/5 p-5">
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
										<button className="mt-4 w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all font-bold text-[14px]">
											<span>
												{visibility === "workspace"
													? "Workspace"
													: visibility === "private"
														? "Private"
														: "Public"}
											</span>
											<ChevronDown className="w-4 h-4" />
										</button>
									</PopoverTrigger>
									<PopoverContent className="w-80 bg-[#222] border border-white/10 p-3 shadow-2xl rounded-xl">
										<VisibilityItem
											icon={<Lock className="w-4 h-4 text-red-400" />}
											title="Private"
											description="Only board members and workspace admins can see and edit."
											active={visibility === "private"}
										/>
										<VisibilityItem
											icon={<Users2 className="w-4 h-4 text-blue-400" />}
											title="Workspace"
											description="All members of the workspace can see and edit."
											active={visibility === "workspace"}
										/>
										<VisibilityItem
											icon={<Globe className="w-4 h-4 text-green-400" />}
											title="Public"
											description="Anyone on the internet can see this board. Only members can edit."
											active={visibility === "public"}
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>
						<div className="rounded-[28px] bg-white/[0.03] border border-white/10 p-5">
							<div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
								<div>
									<p className="text-[13px] text-white/40 uppercase tracking-[0.24em] font-bold">
										Board members
									</p>
									<p className="text-[22px] font-black text-white leading-tight">
										{members.length}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={() => setActiveTab("members")}
										className={cn(
											"px-3 py-2 rounded-2xl text-[13px] font-bold transition-all",
											activeTab === "members"
												? "bg-white/10 text-white"
												: "text-white/40 hover:text-white",
										)}
									>
										Members
									</button>
									<button
										onClick={() => setActiveTab("requests")}
										className={cn(
											"px-3 py-2 rounded-2xl text-[13px] font-bold transition-all",
											activeTab === "requests"
												? "bg-white/10 text-white"
												: "text-white/40 hover:text-white",
										)}
									>
										Requests
									</button>
								</div>
							</div>
							<div className="space-y-3 max-h-[320px] overflow-auto custom-scrollbar pr-2 pt-4">
								{activeTab === "members" ? (
									members.map((member) => <MemberItem key={member.handle} {...member} />)
								) : (
									<div className="text-[14px] text-white/40">No join requests yet.</div>
								)}
							</div>
						</div>
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
			<p className="text-[12px] text-white/40 mt-1">{description}</p>
		</div>
	);
}

function MemberItem({
	name,
	handle,
	role = "Admin",
	isWorkspaceAdmin,
	initial,
}: {
	name: string;
	handle: string;
	role?: string;
	isWorkspaceAdmin?: boolean;
	initial: string;
}) {
	return (
		<div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group">
			<div className="flex items-center gap-4">
				<div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-[18px] shadow-lg shadow-emerald-500/10">
					{initial}
				</div>
				<div>
					<p className="text-[15px] font-bold text-white">{name}</p>
					<p className="text-[12px] text-white/20 font-medium">
						{handle} • {isWorkspaceAdmin ? "Workspace admin" : role}
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
