"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type React from "react";
import { PrimarySidebar } from "@/components/dashboard/PrimarySidebar";
import { useAppStore } from "@/stores/app-store";
import { MeetingProvider } from "@/components/meeting/MeetingProvider";

const SynapseSidebar = dynamic(
	() =>
		import("@/components/dashboard/SynapseSidebar").then(
			(mod) => mod.SynapseSidebar,
		),
		{
			ssr: false,
		},
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { sidebarOpen } = useAppStore();

	// Tiered visibility logic
	const isChat = pathname.startsWith("/dashboard/chat");
	const isTask = pathname.startsWith("/dashboard/task");

	// Check if the user is deep inside a specific chat or task space
	const isDeepLink =
		pathname.includes("/channel/") || pathname.includes("/dm/") || pathname.includes("/space/");

	// Only show the secondary sidebar if they are on the root Chat or Task routing pages
	const hasSecondary = (isChat || isTask) && !isDeepLink && sidebarOpen;

	return (
		<MeetingProvider>
			{/* High-end Apple-inspired layout with floating rounded cards */}
			<div
				className="h-screen w-full flex overflow-hidden bg-[#eff1f4] relative p-3.5"
				style={{
					fontFamily:
						"'-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', sans-serif",
				}}
			>
				{/* Ambient depth gradients */}
				<div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-[120px] pointer-events-none" />
				<div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

				<div className="flex h-full w-full relative z-10 gap-0">
					<div className="h-full shrink-0 pr-3.5">
						<aside className="h-full bg-white/60 backdrop-blur-3xl rounded-[30px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col transition-all duration-300">
							<PrimarySidebar defaultCollapsed={false} />
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
								<aside className="h-full w-[290px] bg-white/60 backdrop-blur-3xl rounded-[30px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col transition-all duration-300">
									<SynapseSidebar />
								</aside>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Tier 3 Main Stage Card */}
					<main className="flex-1 flex flex-col min-w-0 min-h-0 relative transition-all duration-300">
						<AnimatePresence mode="wait">
							<motion.div
								key={pathname}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2, ease: "easeOut" }}
								className="flex-1 w-full flex flex-col min-h-0 rounded-[30px] bg-white border border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden"
							>
								{children}
							</motion.div>
						</AnimatePresence>
					</main>
				</div>
			</div>
		</MeetingProvider>
	);
}
