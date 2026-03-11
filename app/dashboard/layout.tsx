"use client";

import type React from "react";
import { SynapseSidebar } from "@/components/dashboard/SynapseSidebar";
import { MeetingProvider } from "@/components/meeting/MeetingProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<MeetingProvider>
			{/* Apple visionOS / macOS Sonoma inspired background */}
			<div className="flex h-screen w-full overflow-hidden bg-[#e8ebe9] relative p-3 md:p-4 gap-3 md:gap-4">
				{/* Subtle background ambient gradients to make glassmorphism pop */}
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/40 mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none" />

				{/* Floating Synapse Sidebar */}
				<div className="z-20 flex shrink-0 transition-all duration-300 h-full">
					<SynapseSidebar />
				</div>

				{/* Main Content Area */}
				<main className="flex-1 h-full z-10 relative overflow-hidden flex flex-col">
					<div className="w-full h-full bg-white/95 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden flex flex-col rounded-[24px] relative">
						{children}
					</div>
				</main>
			</div>
		</MeetingProvider>
	);
}
