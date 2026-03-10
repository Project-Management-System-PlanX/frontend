"use client";

import { SynapseSidebar } from "@/components/dashboard/SynapseSidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Synapse Sidebar */}
			<SynapseSidebar />

			{/* Main Area - Rendered by sub-routes */}
			{children}
		</div>
	);
}
