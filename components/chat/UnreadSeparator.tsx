"use client";

import { motion } from "framer-motion";

export function UnreadSeparator() {
	return (
		<motion.div
			initial={{ opacity: 0, scaleX: 0.3 }}
			animate={{ opacity: 1, scaleX: 1 }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			className="flex items-center gap-3 my-4 px-4 max-w-4xl mx-auto w-full"
		>
			<div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#FF3B30]/40" />
			<span
				className="text-[11px] font-semibold text-[#FF3B30] uppercase tracking-wider whitespace-nowrap px-3 py-1 rounded-full bg-[#FF3B30]/8 border border-[#FF3B30]/15"
				style={{
					fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', sans-serif",
				}}
			>
				Unread Messages
			</span>
			<div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#FF3B30]/40" />
		</motion.div>
	);
}
