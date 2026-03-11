"use client";

import { motion } from "framer-motion";
import { Check, Hash, Link2, Loader2, Mail, Search, UserPlus, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { workspaceService } from "@/lib/api/services/workspaces";
import { useChannelStore } from "@/stores/channel-store";

interface InviteMembersDialogProps {
	isOpen: boolean;
	onClose: () => void;
	workspaceId: string;
	workspaceName: string;
	userId: string;
}

export function InviteMembersDialog({
	isOpen,
	onClose,
	workspaceId,
	workspaceName,
}: InviteMembersDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [emailChips, setEmailChips] = useState<string[]>([]);
	const [emailInput, setEmailInput] = useState("");
	const [channelSearch, setChannelSearch] = useState("");
	const [selectedChannelIds, setSelectedChannelIds] = useState<Set<string>>(new Set());
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sendSuccess, setSendSuccess] = useState(false);
	const emailInputRef = useRef<HTMLInputElement>(null);

	const { token } = useSupabaseAuth();
	const { channels } = useChannelStore();
	const { members } = useWorkspaceMembers();

	const existingEmails = useMemo(
		() => new Set(members.map((m) => m.profile?.email?.toLowerCase()).filter(Boolean) as string[]),
		[members],
	);

	const nonDmChannels = useMemo(
		() => channels.filter((c) => c.type !== "DIRECT_MESSAGE"),
		[channels],
	);

	const suggestedChannels = useMemo(() => nonDmChannels.slice(0, 3), [nonDmChannels]);

	const filteredChannels = useMemo(() => {
		if (!channelSearch.trim()) return [];
		const q = channelSearch.toLowerCase();
		return nonDmChannels.filter(
			(c) => c.name.toLowerCase().includes(q) && !suggestedChannels.some((s) => s.id === c.id),
		);
	}, [channelSearch, nonDmChannels, suggestedChannels]);

	const addEmail = useCallback(
		(raw: string) => {
			const email = raw.trim().toLowerCase();
			if (email?.includes("@") && !emailChips.includes(email)) {
				setEmailChips((prev) => [...prev, email]);
			}
			setEmailInput("");
		},
		[emailChips],
	);

	const removeEmail = useCallback((email: string) => {
		setEmailChips((prev) => prev.filter((e) => e !== email));
	}, []);

	const handleEmailKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
			e.preventDefault();
			if (emailInput.trim()) addEmail(emailInput);
		}
		if (e.key === "Backspace" && !emailInput && emailChips.length > 0) {
			removeEmail(emailChips[emailChips.length - 1]);
		}
	};

	const handleEmailPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pasted = e.clipboardData.getData("text");
		const parts = pasted.split(/[,;\s]+/);
		for (const part of parts) {
			const email = part.trim().toLowerCase();
			if (email?.includes("@") && !emailChips.includes(email)) {
				setEmailChips((prev) => [...prev, email]);
			}
		}
	};

	if (!isOpen) return null;

	const toggleChannel = (id: string) => {
		setSelectedChannelIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const handleSend = async () => {
		if (emailInput.trim()) addEmail(emailInput);

		const finalEmails = [...emailChips];
		if (
			emailInput.trim() &&
			emailInput.includes("@") &&
			!finalEmails.includes(emailInput.trim().toLowerCase())
		) {
			finalEmails.push(emailInput.trim().toLowerCase());
		}

		if (finalEmails.length === 0) {
			setError("Please add at least one email address");
			return;
		}

		const alreadyMembers = finalEmails.filter((e) => existingEmails.has(e));
		const newEmails = finalEmails.filter((e) => !existingEmails.has(e));

		if (newEmails.length === 0) {
			setError("All entered emails are already workspace members");
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			const channelIds = Array.from(selectedChannelIds);
			const result = await workspaceService.inviteByEmail(
				workspaceId,
				{ emails: newEmails, channelIds: channelIds.length > 0 ? channelIds : undefined },
				token || undefined,
			);

			if (result.failed.length > 0 && result.sent.length === 0) {
				setError(`Failed to send to: ${result.failed.join(", ")}`);
			} else {
				const skippedNote =
					alreadyMembers.length > 0
						? ` (${alreadyMembers.length} already-member email${alreadyMembers.length > 1 ? "s" : ""} skipped)`
						: "";
				setSendSuccess(true);
				if (skippedNote) setError(skippedNote.trim());
				setTimeout(() => {
					handleClose();
				}, 2000);
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to send invite";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopyLink = async () => {
		setError(null);
		try {
			const data = await workspaceService.createInvite(workspaceId, token || undefined);
			const link = `${window.location.origin}/invite/${data.token}`;
			await navigator.clipboard.writeText(link);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to generate link";
			setError(message);
		}
	};

	const handleClose = () => {
		setEmailChips([]);
		setEmailInput("");
		setChannelSearch("");
		setSelectedChannelIds(new Set());
		setCopied(false);
		setSendSuccess(false);
		setError(null);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={handleClose}
				className="absolute inset-0 bg-black/20 backdrop-blur-sm"
			/>

			<motion.div
				initial={{ opacity: 0, scale: 0.96, y: 10 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.96, y: 10 }}
				transition={{ type: "spring", stiffness: 400, damping: 30 }}
				className="relative w-full max-w-[500px] bg-white/95 backdrop-blur-3xl rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.12)] border border-white/60 overflow-hidden"
				style={{
					fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', sans-serif",
				}}
			>
				{/* Header */}
				<div className="flex items-start justify-between px-8 pt-8 pb-0">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center shadow-md shadow-blue-500/20">
							<UserPlus className="w-5 h-5 text-white" />
						</div>
						<div>
							<h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
								Invite to {workspaceName}
							</h2>
							<p className="text-[12px] text-gray-400 mt-0.5">
								Invite someone to collaborate with your team
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={handleClose}
						className="p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-all -mr-2 -mt-2"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				<div className="px-8 py-6 space-y-5">
					{/* Email chips input */}
					<div>
						{/* biome-ignore lint/a11y/noLabelWithoutControl: custom chip input */}
						<label className="text-[13px] font-semibold text-gray-700 mb-2 block flex items-center gap-1.5">
							<Mail className="w-3.5 h-3.5 text-gray-400" />
							Email addresses
						</label>
						{/* biome-ignore lint/a11y/noStaticElementInteractions: click delegates to input */}
						<div
							className="flex flex-wrap items-center gap-1.5 min-h-[56px] w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#007AFF] focus-within:ring-4 focus-within:ring-[#007AFF]/10 cursor-text transition-all"
							onClick={() => emailInputRef.current?.focus()}
							onKeyDown={() => {}}
						>
							{emailChips.map((email) => {
								const isExisting = existingEmails.has(email);
								return (
									<span
										key={email}
										className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-lg ${
											isExisting
												? "bg-[#FF9500]/10 border border-[#FF9500]/20 text-[#FF9500]"
												: "bg-gray-100 border border-gray-200 text-gray-700"
										}`}
										title={isExisting ? "Already a workspace member" : undefined}
									>
										{email}
										{isExisting && (
											<span className="text-[10px] text-[#FF9500] font-semibold">member</span>
										)}
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												removeEmail(email);
											}}
											className="text-gray-400 hover:text-gray-600 ml-0.5"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								);
							})}
							<input
								ref={emailInputRef}
								type="text"
								value={emailInput}
								onChange={(e) => setEmailInput(e.target.value)}
								onKeyDown={handleEmailKeyDown}
								onPaste={handleEmailPaste}
								onBlur={() => {
									if (emailInput.trim()) addEmail(emailInput);
								}}
								placeholder={emailChips.length === 0 ? "name@gmail.com" : ""}
								className="flex-1 min-w-[120px] bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400 outline-none font-medium"
							/>
						</div>
					</div>

					{/* Channels */}
					<div>
						<p className="text-[13px] font-semibold text-gray-700 mb-1">
							Add to channels <span className="font-normal text-gray-400">(optional)</span>
						</p>

						{suggestedChannels.length > 0 && (
							<div className="flex items-center gap-2 mt-3 flex-wrap">
								<span className="text-[11px] text-gray-400 font-medium">Suggested:</span>
								{suggestedChannels.map((ch) => (
									<button
										key={ch.id}
										type="button"
										onClick={() => toggleChannel(ch.id)}
										className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
											selectedChannelIds.has(ch.id)
												? "bg-[#007AFF] text-white shadow-md shadow-blue-500/20"
												: "bg-gray-100 text-gray-600 hover:bg-gray-200"
										}`}
									>
										{selectedChannelIds.has(ch.id) ? (
											<Check className="w-3 h-3" />
										) : (
											<Hash className="w-3 h-3" />
										)}
										{ch.name}
									</button>
								))}
							</div>
						)}

						<div className="relative mt-3">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
							<input
								type="text"
								value={channelSearch}
								onChange={(e) => setChannelSearch(e.target.value)}
								placeholder="Search channels"
								className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 font-medium focus:bg-white focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 outline-none transition-all"
							/>
						</div>

						{filteredChannels.length > 0 && (
							<div className="mt-2 max-h-28 overflow-y-auto space-y-0.5 rounded-xl bg-gray-50 p-1">
								{filteredChannels.map((ch) => (
									<button
										key={ch.id}
										type="button"
										onClick={() => {
											toggleChannel(ch.id);
											setChannelSearch("");
										}}
										className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-600 hover:bg-white transition-colors font-medium"
									>
										<Hash className="w-3.5 h-3.5 text-gray-400" />
										{ch.name}
										{selectedChannelIds.has(ch.id) && (
											<span className="ml-auto text-[#007AFF] text-[11px] font-semibold">
												selected
											</span>
										)}
									</button>
								))}
							</div>
						)}
					</div>

					{error && (
						<div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-600 text-center font-medium">
							{error}
						</div>
					)}

					{sendSuccess && (
						<div className="p-3 bg-green-50 border border-green-100 rounded-xl text-[13px] text-[#34C759] text-center font-semibold flex items-center justify-center gap-2">
							<Check className="w-4 h-4" />
							Invitations sent successfully!
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50/30">
					<button
						type="button"
						onClick={handleCopyLink}
						className="flex items-center gap-1.5 text-[13px] font-medium text-[#007AFF] hover:text-[#0056B3] transition-colors"
					>
						<Link2 className="w-4 h-4" />
						{copied ? "Link copied!" : "Copy invite link"}
					</button>
					<button
						type="button"
						onClick={handleSend}
						disabled={isLoading}
						className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 text-[13px] font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
					>
						{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invites"}
					</button>
				</div>
			</motion.div>
		</div>
	);
}
