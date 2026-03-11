"use client";

import type React from "react";
import { SynapseSidebar } from "@/components/dashboard/SynapseSidebar";
import { MeetingProvider } from "@/components/meeting/MeetingProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<MeetingProvider>
			{/* Apple visionOS / macOS Sonoma inspired background */}
			<div className="h-screen w-full flex overflow-hidden bg-[#e8ebe9] relative">
				{/* Subtle background ambient gradients to make glassmorphism pop */}
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/40 mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none" />

				{/* Floating Synapse Sidebar */}
				<div className="py-3 pl-3 h-full z-10 flex shrink-0">
					<SynapseSidebar />
				</div>

				{/* Main Content Area */}
				<main className="flex-1 flex flex-col h-full p-3 z-10 relative">
					<div className="w-full h-full bg-white/95 backdrop-blur-md rounded-[24px] shadow-sm border border-white/40 overflow-hidden flex flex-col relative inner-glow">
						{children}
					</div>
				</main>
			</div>
		</MeetingProvider>
	);
}
