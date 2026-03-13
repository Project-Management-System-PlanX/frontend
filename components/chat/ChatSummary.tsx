"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const DUMMY_SUMMARIES = {
	unread: [
		"Deployment failed on production — team investigating",
		"DevOps restarted the server successfully",
		"Payment module bug identified in checkout flow",
		"Ravi assigned to fix the critical issue",
		"Design team shared new mockups for review",
	],
	"10min": [
		"Quick sync on API design decisions",
		"Backend rate limit configuration updated",
		"Frontend hotfix deployed to staging",
	],
	"1hour": [
		"Team discussed new API architecture design",
		"Backend rate limit issue found and resolved",
		"Frontend fix deployed to production",
		"Sprint retrospective action items shared",
	],
	today: [
		"Morning standup — all blockers cleared",
		"New feature branch created for auth module",
		"Database migration completed successfully",
		"QA team reported 3 new issues",
		"Design review meeting scheduled for tomorrow",
		"Performance optimization PR merged",
	],
};

interface ChatSummaryProps {
	unreadCount: number;
	channelName: string;
	forceShow?: boolean;
	onClose?: () => void;
}

export function ChatSummary({ unreadCount, channelName, forceShow, onClose }: ChatSummaryProps) {
	const [showSummary, setShowSummary] = useState(false);
	const [summaryType, setSummaryType] = useState<keyof typeof DUMMY_SUMMARIES | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Capture the initial unread count so the banner doesn't vanish instantly when the store resets it on load
	const [initialUnreadCount, setInitialUnreadCount] = useState(unreadCount);

	// Instead of depending completely on the parent's unreadCount dropping to 0, if the parent's count is higher, we update it.
	useEffect(() => {
		if (unreadCount > initialUnreadCount) {
			setInitialUnreadCount(unreadCount);
		}
	}, [unreadCount, initialUnreadCount]);

	const handleSummarize = useCallback((type: keyof typeof DUMMY_SUMMARIES) => {
		setIsLoading(true);
		setSummaryType(type);

		// Simulate AI processing delay
		setTimeout(() => {
			setShowSummary(true);
			setIsLoading(false);
		}, 800);
	}, []);

	const getSummaryTitle = () => {
		switch (summaryType) {
			case "unread":
				return "Unread Messages Summary";
			case "10min":
				return "Last 10 Minutes";
			case "1hour":
				return "Last 1 Hour";
			case "today":
				return "Today's Summary";
			default:
				return "Summary";
		}
	};

	if (initialUnreadCount === 0 && !showSummary && !forceShow) return null;

	return (
		<div className="px-4 pb-2">
			<motion.div
				initial={{ opacity: 0, y: -8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ type: "spring", stiffness: 300, damping: 28 }}
				className="max-w-4xl mx-auto w-full"
			>
				{/* Unread Count Banner or Forced Toggle */}
				{(initialUnreadCount > 0 || forceShow) && !showSummary && (
					<div
						className="rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-lg shadow-black/[0.03] p-4"
						style={{
							fontFamily:
								"'-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', sans-serif",
						}}
					>
						<div className="flex items-center justify-between mb-3">
							<p className="text-[13px] text-gray-500">
								{initialUnreadCount > 0 ? (
									<>
										You have <span className="font-bold text-gray-900">{initialUnreadCount}</span>{" "}
										unread message{initialUnreadCount !== 1 ? "s" : ""} in{" "}
									</>
								) : (
									<>Get an AI summary of </>
								)}
								<span className="font-semibold text-gray-700">#{channelName}</span>
							</p>
							{forceShow && (
								<button
									type="button"
									onClick={onClose}
									className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
								>
									<X className="w-4 h-4" />
								</button>
							)}
						</div>

						{/* Summarize Unread Button */}
						<button
							type="button"
							onClick={() => handleSummarize("unread")}
							disabled={isLoading}
							className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#007AFF] to-[#5856D6] text-white text-[13px] font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-60"
						>
							{isLoading ? (
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<Sparkles className="w-4 h-4" />
							)}
							{isLoading
								? "Summarizing..."
								: initialUnreadCount > 0
									? "Summarize Unread"
									: "Summarize Recent Messages"}
						</button>

						{/* Time-based Summary Options */}
						<div className="flex items-center gap-2 mt-3">
							<Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
							<div className="flex gap-1.5 flex-1">
								{[
									{ key: "10min" as const, label: "Last 10 min" },
									{ key: "1hour" as const, label: "Last 1 hour" },
									{ key: "today" as const, label: "Today" },
								].map((option) => (
									<button
										type="button"
										key={option.key}
										onClick={() => handleSummarize(option.key)}
										disabled={isLoading}
										className="flex-1 px-2.5 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all active:scale-[0.97] disabled:opacity-50"
									>
										{option.label}
									</button>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Summary Result Panel */}
				<AnimatePresence>
					{showSummary && summaryType && (
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
							{/* Close button */}
							<button
								type="button"
								onClick={() => {
									setShowSummary(false);
									setSummaryType(null);
									onClose?.();
								}}
								className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>

							{/* Header */}
							<div className="flex items-center gap-2 mb-3">
								<div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#AF52DE] to-[#5856D6] flex items-center justify-center">
									<Sparkles className="w-3.5 h-3.5 text-white" />
								</div>
								<div>
									<h4 className="text-[13px] font-bold text-gray-900">{getSummaryTitle()}</h4>
									<p className="text-[10px] text-gray-400">AI-powered summary</p>
								</div>
							</div>

							{/* Summary Items */}
							<ul className="space-y-2">
								{DUMMY_SUMMARIES[summaryType].map((item) => (
									<motion.li
										key={item}
										initial={{ opacity: 0, x: -8 }}
										animate={{ opacity: 1, x: 0 }}
										className="flex items-start gap-2.5 text-[13px] text-gray-600 leading-relaxed"
									>
										<span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-[7px] shrink-0" />
										{item}
									</motion.li>
								))}
							</ul>

							{/* Footer */}
							<div className="mt-4 pt-3 border-t border-gray-100">
								<p className="text-[10px] text-gray-400 italic">
									This is a placeholder summary — AI integration coming soon
								</p>
							</div>

							{/* Try other time ranges */}
							<div className="flex items-center gap-2 mt-3">
								<span className="text-[11px] text-gray-400">Try:</span>
								{(["10min", "1hour", "today"] as const)
									.filter((k) => k !== summaryType)
									.map((key) => (
										<button
											type="button"
											key={key}
											onClick={() => handleSummarize(key)}
											className="px-2 py-1 text-[10px] font-medium text-[#007AFF] hover:bg-[#007AFF]/10 rounded-md transition-colors"
										>
											{key === "10min" ? "Last 10 min" : key === "1hour" ? "Last 1 hour" : "Today"}
										</button>
									))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}
