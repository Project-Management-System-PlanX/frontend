"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type React from "react";
import { PrimarySidebar } from "@/components/dashboard/PrimarySidebar";
import { SynapseSidebar } from "@/components/dashboard/SynapseSidebar";
import { MeetingProvider } from "@/components/meeting/MeetingProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	// Tiered visibility logic
	const isChat = pathname.startsWith("/dashboard/chat");
	const isTask = pathname.startsWith("/dashboard/task");
	const isDocuments = pathname.startsWith("/dashboard/files");
	const hasSecondary = isChat || isTask || isDocuments;

	return (
		<MeetingProvider>
			{/* High-end Apple-inspired layout with floating rounded cards */}
			<div className="h-screen w-full flex overflow-hidden bg-[#eff1f4] relative p-3.5 font-figtree">
				{/* Ambient depth gradients */}
				<div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-[120px] pointer-events-none" />
				<div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

				<div className="flex h-full w-full relative z-10 gap-0">
					{/* Tier 1 Rail Card */}
					<div className="h-full shrink-0 pr-3.5">
						<aside className="h-full bg-white/80 backdrop-blur-3xl rounded-[30px] border border-white shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
							<PrimarySidebar defaultCollapsed={hasSecondary} />
						</aside>
					</div>

					{/* Tier 2 Contextual Sidebar Card with Spring Animation */}
					<AnimatePresence initial={false}>
						{hasSecondary && (
							<motion.div
								key="secondary-sidebar"
								initial={{ width: 0, opacity: 0, marginRight: 0 }}
								animate={{
									width: 290,
									opacity: 1,
									marginRight: 14, // Equivalent to 3.5 gap
								}}
								exit={{ width: 0, opacity: 0, marginRight: 0 }}
								transition={{
									type: "spring",
									stiffness: 260,
									damping: 32,
									opacity: { duration: 0.2 },
								}}
								className="h-full shrink-0 overflow-hidden"
							>
								<aside className="h-full w-[290px] bg-white/70 backdrop-blur-3xl rounded-[30px] border border-white shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
									<SynapseSidebar />
								</aside>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Tier 3 Main Stage Card */}
					<main className="flex-1 h-full min-w-0">
						<div className="w-full h-full bg-white rounded-[30px] border border-white shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col relative">
							<AnimatePresence mode="wait">
								<motion.div
									key={pathname}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.2, ease: "easeOut" }}
									className="w-full h-full flex flex-col"
								>
									{children}
								</motion.div>
							</AnimatePresence>
						</div>
					</main>
				</div>
			</div>
		</MeetingProvider>
	);
}
