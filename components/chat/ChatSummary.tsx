"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export interface UnreadItem {
	id: string;
	name: string;
	time: string;
	text: string;
}

export interface SummaryPayload {
	channelName: string;
	requestedAt: string;
	items: UnreadItem[];
}

export interface SummaryResult {
	summary: string;
	lines: string[];
	keyPoints: string[];
	actionItems: string[];
	payload: SummaryPayload;
}

interface ChatSummaryProps {
	unreadCount: number;
	channelName: string;
	unreadItems?: UnreadItem[];
	forceShow?: boolean;
	onClose?: () => void;
	onSummarize?: (result: SummaryResult) => void;
	onSummarizeUnread?: () => Promise<SummaryResult>;
	onSave?: (lines: string[]) => void;
}

export function ChatSummary({
	unreadCount,
	channelName,
	unreadItems = [],
	forceShow,
	onClose,
	onSummarize,
	onSummarizeUnread,
	onSave,
}: ChatSummaryProps) {
	const { user } = useSupabaseAuth();
	const [showSummary, setShowSummary] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [summaryLines, setSummaryLines] = useState<string[]>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [storedSummary, setStoredSummary] = useState<SummaryResult | null>(null);
	const [dismissed, setDismissed] = useState(false);

	// Capture the initial unread count so the banner doesn't vanish instantly when the store resets it on load
	const [initialUnreadCount, setInitialUnreadCount] = useState(unreadCount);

	// Sync unreadCount changes
	useEffect(() => {
		if (unreadCount > initialUnreadCount) {
			setInitialUnreadCount(unreadCount);
		}
	}, [unreadCount, initialUnreadCount]);

	// Load stored summary from localStorage on mount/channel change
	useEffect(() => {
		setDismissed(false);
		setErrorMessage(null);
		if (user?.id) {
			const key = `ai-summary:${user.id}:${channelName}`;
			const cached = localStorage.getItem(key);
			if (cached) {
				try {
					const parsed: SummaryResult = JSON.parse(cached);
					setStoredSummary(parsed);
					setSummaryLines(parsed.lines || []);
					setShowSummary(true);
				} catch {
					setStoredSummary(null);
					setSummaryLines([]);
					setShowSummary(false);
				}
			} else {
				setStoredSummary(null);
				setSummaryLines([]);
				setShowSummary(false);
			}
		}
	}, [channelName, user?.id]);

	const handleTriggerSummarize = useCallback(async () => {
		if (!onSummarizeUnread || !user?.id) return;
		setIsLoading(true);
		setErrorMessage(null);
		try {
			const result = await onSummarizeUnread();
			setSummaryLines(result.lines);
			setStoredSummary(result);
			setShowSummary(true);

			// Persist in localStorage
			const key = `ai-summary:${user.id}:${channelName}`;
			localStorage.setItem(key, JSON.stringify(result));

			// Call parent callbacks if present
			onSummarize?.(result);
		} catch (error) {
			console.error("Failed to summarize:", error);
			setErrorMessage("Unable to generate summary right now.");
		} finally {
			setIsLoading(false);
		}
	}, [onSummarizeUnread, onSummarize, user?.id, channelName]);

	const handleClearSummary = useCallback(() => {
		setStoredSummary(null);
		setSummaryLines([]);
		setShowSummary(false);
		setDismissed(true);
		if (user?.id) {
			const key = `ai-summary:${user.id}:${channelName}`;
			localStorage.removeItem(key);
		}
		onClose?.();
	}, [user?.id, channelName, onClose]);

	const showPromptBanner = (initialUnreadCount > 0 || forceShow) && !dismissed && !showSummary;

	return (
		<div className="px-4 pb-2">
			<motion.div
				initial={{ opacity: 0, y: -8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ type: "spring", stiffness: 300, damping: 28 }}
				className="max-w-4xl mx-auto w-full"
			>
				{/* Unread Message Prompt Banner */}
				{showPromptBanner && (
					<div
						className="rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-lg shadow-black/[0.03] p-4 mb-4"
						style={{
							fontFamily:
								"'-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', sans-serif",
						}}
					>
						<div className="flex items-center justify-between mb-3">
							<p className="text-[13px] text-gray-500">
								You have <span className="font-bold text-gray-900">{initialUnreadCount}</span>{" "}
								unread message{initialUnreadCount !== 1 ? "s" : ""} in{" "}
								<span className="font-semibold text-gray-700">#{channelName}</span>. Would you like
								an AI summary?
							</p>
							<button
								type="button"
								onClick={() => setDismissed(true)}
								className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-2">
							<button
								type="button"
								onClick={handleTriggerSummarize}
								disabled={isLoading}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#007AFF] to-[#5856D6] text-white text-[13px] font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-60"
							>
								{isLoading ? (
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								) : (
									<Sparkles className="w-4 h-4" />
								)}
								{isLoading ? "Generating summary..." : "Summarize"}
							</button>
							<button
								type="button"
								onClick={() => setDismissed(true)}
								className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 text-[13px] font-semibold transition-all focus:outline-none"
							>
								Not Now
							</button>
						</div>

						{errorMessage && <p className="mt-2 text-[12px] text-red-500">{errorMessage}</p>}
					</div>
				)}

				{/* Summary Result Panel */}
				<AnimatePresence>
					{showSummary && (
						<motion.div
							initial={{ opacity: 0, y: -12, scale: 0.96 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -12, scale: 0.96 }}
							transition={{ type: "spring", stiffness: 320, damping: 28 }}
							className="rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200/60 shadow-xl shadow-black/[0.06] p-5 relative"
							style={{
								fontFamily:
									"'-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', sans-serif",
							}}
						>
							{/* Close/Clear button */}
							<button
								type="button"
								onClick={handleClearSummary}
								className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
								title="Clear Summary"
							>
								<X className="w-4 h-4" />
							</button>

							{/* Header */}
							<div className="flex items-center gap-2 mb-3">
								<div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#AF52DE] to-[#5856D6] flex items-center justify-center">
									<Sparkles className="w-3.5 h-3.5 text-white" />
								</div>
								<div>
									<h4 className="text-[13px] font-bold text-gray-900">Unread Messages Summary</h4>
									<p className="text-[10px] text-gray-400">AI-powered summary</p>
								</div>
							</div>

							{/* Summary Items */}
							<ul className="space-y-2">
								{summaryLines.map((item, index) => (
									<motion.li
										// biome-ignore lint/correctness/useJsxKeyInIterable: index is safe here
										key={index}
										initial={{ opacity: 0, x: -8 }}
										animate={{ opacity: 1, x: 0 }}
										className="flex items-start gap-2.5 text-[13px] text-gray-600 leading-relaxed"
									>
										<span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-[7px] shrink-0" />
										{item}
									</motion.li>
								))}
							</ul>

							{/* Actions */}
							<div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
								<button
									type="button"
									onClick={() => {
										if (onSave) onSave(summaryLines);
										handleClearSummary();
									}}
									className="flex-1 px-4 py-2 bg-gradient-to-r from-[#007AFF] to-[#5856D6] hover:opacity-90 text-white rounded-xl text-[13px] font-semibold transition-all shadow-sm"
								>
									Save to Chat
								</button>
								<button
									type="button"
									onClick={handleClearSummary}
									className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[13px] font-semibold transition-all"
								>
									Cancel
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}
