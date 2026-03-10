"use client";

import { FilesArea } from "@/components/dashboard/FilesArea";
import { SynapseSidebar } from "@/components/dashboard/SynapseSidebar";

export default function FilesPage() {
	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Synapse Sidebar */}
			<SynapseSidebar />

			{/* Main Files Area */}
			<FilesArea />
		</div>
	);
}
