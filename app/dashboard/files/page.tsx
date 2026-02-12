"use client";

import { FilesArea } from "@/components/dashboard/FilesArea";
import { TeamSidebar } from "@/components/dashboard/TeamSidebar";

export default function FilesPage() {
	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Left Sidebar - Shared across all dashboard pages */}
			<TeamSidebar activeChannel="" onChannelSelect={() => {}} />

			{/* Main Files Area */}
			<FilesArea />
		</div>
	);
}
