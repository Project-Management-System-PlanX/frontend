"use client";

import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Hash, Lightbulb, Link2, Loader2, Search, X } from "lucide-react";
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

const CHIP_COLORS = [
	"bg-green-600 hover:bg-green-700",
	"bg-blue-600 hover:bg-blue-700",
	"bg-teal-600 hover:bg-teal-700",
	"bg-purple-600 hover:bg-purple-700",
	"bg-orange-600 hover:bg-orange-700",
];

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
			if (email && email.includes("@") && !emailChips.includes(email)) {
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
			if (email && email.includes("@") && !emailChips.includes(email)) {
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

	const [sendSuccess, setSendSuccess] = useState(false);

	const handleSend = async () => {
		if (emailInput.trim()) addEmail(emailInput);

		// Collect final email list (including any just-typed one)
		const finalEmails = [...emailChips];
		if (emailInput.trim() && emailInput.includes("@") && !finalEmails.includes(emailInput.trim().toLowerCase())) {
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
				const skippedNote = alreadyMembers.length > 0
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
				className="absolute inset-0 bg-black/40 backdrop-blur-sm"
			/>

			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden"
			>
				{/* Header */}
				<div className="flex items-start justify-between px-6 pt-6 pb-0">
					<h2 className="text-lg font-bold text-gray-900">
						Invite people to {workspaceName}
					</h2>
					<button
						type="button"
						onClick={handleClose}
						className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="px-6 pt-2 pb-1">
					<div className="flex items-center gap-2 text-gray-500 text-sm">
						<Lightbulb className="w-4 h-4 shrink-0 text-amber-500" />
						<span>Invite someone else to help you build out the workspace.</span>
					</div>
				</div>

				<div className="px-6 py-4 space-y-4">
					{/* To field with email chips */}
					<div>
						<label className="text-sm font-medium text-gray-700 mb-1.5 block">To:</label>
						<div
							className="flex flex-wrap items-center gap-1.5 min-h-[68px] w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 cursor-text"
							onClick={() => emailInputRef.current?.focus()}
							onKeyDown={() => {}}
						>
							{emailChips.map((email) => {
									const isExisting = existingEmails.has(email);
									return (
								<span
									key={email}
									className={`inline-flex items-center gap-1 text-sm px-2.5 py-1 rounded-md ${
										isExisting
											? "bg-amber-50 border border-amber-300 text-amber-700"
											: "bg-gray-100 border border-gray-200 text-gray-700"
									}`}
									title={isExisting ? "Already a workspace member" : undefined}
								>
									{email}
									{isExisting && (
										<span className="text-[10px] text-amber-600 font-medium">member</span>
									)}
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												removeEmail(email);
											}}
											className="text-gray-400 hover:text-gray-600 ml-0.5"
										>
											<X className="w-3.5 h-3.5" />
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
								className="flex-1 min-w-[120px] bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
							/>
						</div>
					</div>

					{/* Add to channels */}
					<div>
						<p className="text-sm font-semibold text-gray-900">
							Add to team channels (optional)
						</p>
						<p className="text-xs text-gray-500 mt-0.5">
							Make sure your teammates are in the right conversations from the get go.
						</p>

						{/* Suggested chips */}
						{suggestedChannels.length > 0 && (
							<div className="flex items-center gap-2 mt-3 flex-wrap">
								<span className="text-xs text-gray-400">Suggested:</span>
								{suggestedChannels.map((ch, i) => (
									<button
										key={ch.id}
										type="button"
										onClick={() => toggleChannel(ch.id)}
										className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white transition-colors ${
											selectedChannelIds.has(ch.id)
												? "ring-2 ring-cyan-400 " + CHIP_COLORS[i % CHIP_COLORS.length]
												: CHIP_COLORS[i % CHIP_COLORS.length]
										}`}
									>
										{selectedChannelIds.has(ch.id) ? (
											<Hash className="w-3 h-3" />
										) : (
											<span className="text-xs">+</span>
										)}
										#{ch.name}
									</button>
								))}
							</div>
						)}

						{/* Channel search */}
						<div className="relative mt-3">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								type="text"
								value={channelSearch}
								onChange={(e) => setChannelSearch(e.target.value)}
								placeholder="Search channels"
								className="w-full bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
							/>
						</div>

						{/* Search results */}
						{filteredChannels.length > 0 && (
							<div className="mt-2 max-h-28 overflow-y-auto space-y-0.5">
								{filteredChannels.map((ch) => (
									<button
										key={ch.id}
										type="button"
										onClick={() => {
											toggleChannel(ch.id);
											setChannelSearch("");
										}}
										className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors"
									>
										<Hash className="w-3.5 h-3.5 text-gray-400" />
										{ch.name}
										{selectedChannelIds.has(ch.id) && (
											<span className="ml-auto text-cyan-600 text-xs">selected</span>
										)}
									</button>
								))}
							</div>
						)}
					</div>

					{error && (
						<div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center">
							{error}
						</div>
					)}

					{sendSuccess && (
						<div className="p-2.5 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm text-center">
							Invitations sent successfully!
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
					<button
						type="button"
						onClick={handleCopyLink}
						className="flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
					>
						<Link2 className="w-4 h-4" />
						{copied ? "Link copied!" : "Copy invite link"}
						{!copied && (
							<span className="text-gray-400">
								–{" "}
								<span className="text-cyan-600/70 hover:text-cyan-700">
									Edit link settings
								</span>
							</span>
						)}
					</button>
					<button
						type="button"
						onClick={handleSend}
						disabled={isLoading}
						className="px-5 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50"
					>
						{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
					</button>
				</div>
			</motion.div>
		</div>
	);
}
