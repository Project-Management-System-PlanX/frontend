import { AnimatePresence, motion } from "framer-motion";
import { Hash, Loader2, Lock, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateChannel } from "@/hooks/api/use-channels";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { ChannelType } from "@/lib/types/models";

interface CreateChannelDialogProps {
	isOpen: boolean;
	onClose: () => void;
	workspaceId: string;
}

export function CreateChannelDialog({ isOpen, onClose, workspaceId }: CreateChannelDialogProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [type, setType] = useState<ChannelType>("PUBLIC");
	const [error, setError] = useState<string | null>(null);

	const { token } = useSupabaseAuth();
	const createChannel = useCreateChannel(token);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!name.trim()) {
			setError("Channel name cannot be empty");
			return;
		}

		try {
			const sanitizedName = name.toLowerCase().replace(/\s+/g, "-").trim();

			const channel = await createChannel.mutateAsync({
				workspaceId,
				name: sanitizedName,
				description,
				type,
			});

			// Close and reset
			onClose();
			setName("");
			setDescription("");
			setType("PUBLIC");

			// Auto redirect to new channel
			router.push(`/workspaces/${workspaceId}/channels/${channel.id}`);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to create channel";
			setError(message);
		}
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
				/>

				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					transition={{ duration: 0.25, ease: "easeOut" }}
					className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
				>
					{/* Header */}
					<div className="flex items-center justify-between p-6 border-b border-gray-100">
						<div>
							<h2 className="text-xl font-bold text-[#013220]">Create a channel</h2>
							<p className="text-sm text-gray-500 mt-1">
								Channels are where your team communicates.
							</p>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					<form onSubmit={handleSubmit} className="p-6 space-y-6">
						{error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
								{error}
							</div>
						)}

						{/* Type Selection */}
						<div className="space-y-3">
							<div className="text-sm font-semibold text-gray-700">Channel Type</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								<button
									type="button"
									onClick={() => setType("PUBLIC")}
									className={`p-3 rounded-xl border text-left transition-all ${
										type === "PUBLIC"
											? "border-[#50C878] bg-[#F8FCFA] ring-1 ring-[#50C878]"
											: "border-gray-200 hover:border-gray-300 bg-white"
									}`}
								>
									<Hash
										className={`w-5 h-5 mb-2 ${type === "PUBLIC" ? "text-[#0B6E4F]" : "text-gray-400"}`}
									/>
									<div
										className={`font-semibold text-sm ${type === "PUBLIC" ? "text-[#013220]" : "text-gray-700"}`}
									>
										Public
									</div>
									<div className="text-[10px] text-gray-500 mt-1 leading-tight">
										Anyone in the workspace can join
									</div>
								</button>

								<button
									type="button"
									onClick={() => setType("PRIVATE")}
									className={`p-3 rounded-xl border text-left transition-all ${
										type === "PRIVATE"
											? "border-[#50C878] bg-[#F8FCFA] ring-1 ring-[#50C878]"
											: "border-gray-200 hover:border-gray-300 bg-white"
									}`}
								>
									<Lock
										className={`w-5 h-5 mb-2 ${type === "PRIVATE" ? "text-[#0B6E4F]" : "text-gray-400"}`}
									/>
									<div
										className={`font-semibold text-sm ${type === "PRIVATE" ? "text-[#013220]" : "text-gray-700"}`}
									>
										Private
									</div>
									<div className="text-[10px] text-gray-500 mt-1 leading-tight">
										Only invited members can join
									</div>
								</button>

								{/* To do: Check backend roles here. Currently only Owner uses this so it's fine */}
								<button
									type="button"
									onClick={() => setType("DIRECT_MESSAGE")}
									className={`p-3 rounded-xl border text-left transition-all ${
										type === "DIRECT_MESSAGE"
											? "border-[#50C878] bg-[#F8FCFA] ring-1 ring-[#50C878]"
											: "border-gray-200 hover:border-gray-300 bg-white"
									}`}
								>
									<MessageCircle
										className={`w-5 h-5 mb-2 ${type === "DIRECT_MESSAGE" ? "text-[#0B6E4F]" : "text-gray-400"}`}
									/>
									<div
										className={`font-semibold text-sm ${type === "DIRECT_MESSAGE" ? "text-[#013220]" : "text-gray-700"}`}
									>
										Direct Message
									</div>
									<div className="text-[10px] text-gray-500 mt-1 leading-tight">
										Private chat with a teammate
									</div>
								</button>
							</div>
						</div>

						{/* Details Section */}
						<div className="space-y-4">
							<div className="space-y-1.5">
								<label htmlFor="channel-name" className="text-sm font-semibold text-gray-700">
									Name
								</label>
								<div className="relative">
									<Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
									<input
										id="channel-name"
										// biome-ignore lint/a11y/noAutofocus: intentional fast UX
										autoFocus
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="e.g. marketing-updates"
										className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#50C878]/50 focus:border-[#50C878] transition-all"
										required
										// Forbid spaces natively
										pattern="^\S+$"
										title="Channel names cannot contain spaces (use hyphens)"
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="channel-desc" className="text-sm font-semibold text-gray-700">
									Description <span className="text-gray-400 font-normal">(optional)</span>
								</label>
								<input
									id="channel-desc"
									type="text"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="What's this channel about?"
									className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#50C878]/50 focus:border-[#50C878] transition-all"
								/>
							</div>
						</div>

						{/* Footer */}
						<div className="pt-2 flex gap-3 justify-end items-center">
							<button
								type="button"
								onClick={onClose}
								className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
								disabled={createChannel.isPending}
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={createChannel.isPending || !name.trim()}
								className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0B6E4F] hover:bg-[#013220] rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
							>
								{createChannel.isPending ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									"Create Channel"
								)}
							</button>
						</div>
					</form>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
