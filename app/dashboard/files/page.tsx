"use client";

import { FilesArea } from "@/components/dashboard/FilesArea";
import { FilesSidebar } from "@/components/dashboard/FilesSidebar";

export default function FilesPage() {
	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Left Sidebar - Shared across all dashboard pages */}
			<FilesSidebar />

			{/* Main Files Area */}
			<FilesArea />
		</div>
	);
}
