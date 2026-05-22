"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type React from "react";
import { TopNav } from "@/components/dashboard/TopNav";
import { MeetingProvider } from "@/components/meeting/MeetingProvider";
import { useAppStore } from "@/stores/app-store";

const SynapseSidebar = dynamic(
	() => import("@/components/dashboard/SynapseSidebar").then((mod) => mod.SynapseSidebar),
	{
		ssr: false,
	},
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { sidebarOpen } = useAppStore();

	// Tiered visibility logic
	const isChat = pathname.startsWith("/dashboard/chat");
	const _isTask = pathname.startsWith("/dashboard/task");
	const isFiles = pathname.startsWith("/dashboard/files");
	const isDashboardHome = pathname === "/dashboard";

	// Show the secondary sidebar when on Chat or Files routing pages
	const hasSecondary = (isChat || isFiles) && sidebarOpen;

	return (
		<MeetingProvider>
			<div
				className="h-screen w-full flex flex-col overflow-hidden"
				style={{ backgroundColor: isDashboardHome ? "#F2F4F7" : "#0f2318" }}
			>
				<TopNav />

				<div className="flex-1 flex min-h-0">
					{/* Tier 2 Contextual Sidebar Card with Spring Animation */}
					<AnimatePresence initial={false}>
						{hasSecondary && (
							<motion.div
								key="secondary-sidebar"
								initial={{ width: 0, opacity: 0 }}
								animate={{
									width: 400,
									opacity: 1,
								}}
								exit={{ width: 0, opacity: 0 }}
								transition={{
									type: "spring",
									stiffness: 260,
									damping: 32,
									opacity: { duration: 0.2 },
								}}
								className="h-full shrink-0 overflow-hidden border-r border-white/5"
							>
								<aside className="h-full w-[400px] bg-transparent backdrop-blur-xl overflow-hidden flex flex-col">
									<SynapseSidebar />
								</aside>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Main Stage */}
					<main className="flex-1 flex flex-col min-w-0 min-h-0">
						<AnimatePresence mode="wait">
							<motion.div
								key={pathname}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2, ease: "easeOut" }}
								className="flex-1 w-full flex flex-col min-h-0 overflow-hidden"
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
