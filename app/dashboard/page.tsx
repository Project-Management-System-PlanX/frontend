"use client";

import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { TeamSidebar } from "@/components/dashboard/TeamSidebar";

export default function DashboardPage() {
	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Left Sidebar - Shared across all dashboard pages */}
			<TeamSidebar activeChannel="" onChannelSelect={() => {}} />

			{/* Main Dashboard Home */}
			<DashboardHome />
		</div>
	);
}
