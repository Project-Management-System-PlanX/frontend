"use client";

import { TeamSidebar } from "@/components/dashboard/TeamSidebar";
import { TasksArea } from "../../../components/dashboard/TasksArea";

export default function TaskPage() {
	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Left Sidebar - Shared across all dashboard pages */}
			<TeamSidebar activeChannel="" onChannelSelect={() => {}} onDirectorySelect={() => {}} />

			{/* Main Task Area */}
			<TasksArea />
		</div>
	);
}
