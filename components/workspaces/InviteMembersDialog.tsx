"use client";

import { motion } from "framer-motion";
import { Check, Copy, Link2, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { workspaceService } from "@/lib/api/services/workspaces";

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
	const [inviteLink, setInviteLink] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { token } = useSupabaseAuth();

	if (!isOpen) return null;

	const handleGenerateLink = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const data = await workspaceService.createInvite(workspaceId, token || undefined);

			const link = `${window.location.origin}/invite/${data.token}`;
			setInviteLink(link);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to create invite link";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopy = async () => {
		if (!inviteLink) return;
		await navigator.clipboard.writeText(inviteLink);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleClose = () => {
		setInviteLink(null);
		setCopied(false);
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
				className="absolute inset-0 bg-white/60 backdrop-blur-md"
			/>

			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				transition={{ duration: 0.35, ease: "easeOut" }}
				className="relative w-full max-w-md bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#D1F2EB] overflow-hidden"
			>
				<button
					type="button"
					onClick={handleClose}
					className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
				>
					<X className="w-4 h-4" />
				</button>

				<div className="p-8 space-y-6">
					<div className="text-center space-y-3">
						<div className="w-14 h-14 mx-auto bg-[#D1F2EB] rounded-2xl flex items-center justify-center">
							<Link2 className="w-7 h-7 text-[#0B6E4F]" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-[#013220]">Invite to {workspaceName}</h2>
							<p className="text-gray-500 text-sm mt-1">
								Generate a link to share with your teammates
							</p>
						</div>
					</div>

					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
							{error}
						</div>
					)}

					{!inviteLink ? (
						<button
							type="button"
							onClick={handleGenerateLink}
							disabled={isLoading}
							className="w-full flex items-center justify-center gap-2 bg-[#0B6E4F] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#013220] transition-all disabled:opacity-50"
						>
							{isLoading ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<>
									<Link2 className="w-4 h-4" />
									Generate Invite Link
								</>
							)}
						</button>
					) : (
						<div className="space-y-4">
							<div className="flex items-center gap-2 p-3 bg-[#F8FCFA] border border-[#D1F2EB] rounded-xl">
								<input
									type="text"
									value={inviteLink}
									readOnly
									className="flex-1 bg-transparent text-sm text-[#013220] outline-none font-mono truncate"
								/>
								<button
									type="button"
									onClick={handleCopy}
									className={`shrink-0 p-2 rounded-lg transition-all ${
										copied
											? "bg-[#0B6E4F] text-white"
											: "bg-white border border-[#D1F2EB] text-gray-500 hover:text-[#0B6E4F] hover:border-[#50C878]"
									}`}
								>
									{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
								</button>
							</div>
							<p className="text-xs text-gray-400 text-center">
								This link expires in 7 days. Anyone with the link can join.
							</p>
						</div>
					)}
				</div>
			</motion.div>
		</div>
	);
}
