"use client";

import type React from "react";
import { MeetingProvider } from "@/components/meeting/MeetingProvider";
import { SynapseSidebar } from "@/components/dashboard/SynapseSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<MeetingProvider>
			<div className="h-screen w-full flex overflow-hidden bg-[#f2f2f4]">
				{/* Synapse Sidebar */}
				<SynapseSidebar />

				{/* Main Content Area */}
				<main className="flex-1 flex flex-col h-full bg-[#f2f2f4] p-3 pl-2">
					<div className="w-full h-full bg-white rounded-[24px] shadow-sm overflow-hidden flex flex-col relative">
						{children}
					</div>
				</main>
			</div>
		</MeetingProvider>
	);
}
