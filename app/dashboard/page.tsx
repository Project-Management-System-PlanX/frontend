"use client";

import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { IconRail } from "@/components/dashboard/IconRail";

export default function DashboardPage() {
	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Left Sidebar - IconRail only for home */}
			<IconRail />

			{/* Main Dashboard Home */}
			<DashboardHome />
		</div>
	);
}
