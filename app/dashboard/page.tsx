"use client";

import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { SynapseSidebar } from "@/components/dashboard/SynapseSidebar";

export default function DashboardPage() {
	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Synapse Sidebar */}
			<SynapseSidebar />

			{/* Main Dashboard Home */}
			<DashboardHome />
		</div>
	);
}
