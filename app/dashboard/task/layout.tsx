"use client";

import { SynapseSidebar } from "@/components/dashboard/SynapseSidebar";

export default function TaskLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Synapse Sidebar */}
			<SynapseSidebar />

			{/* Main Content Area */}
			{children}
		</div>
	);
}
