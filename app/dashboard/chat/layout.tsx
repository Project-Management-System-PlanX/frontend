"use client";

import { usePathname } from "next/navigation";
import { TeamSidebar } from "@/components/dashboard/TeamSidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	// Extract the active channel from the URL
	const getActiveChannel = () => {
		const channelMatch = pathname.match(/\/dashboard\/chat\/channel\/(.+)/);
		if (channelMatch) return channelMatch[1];
		return "";
	};

	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Left Sidebar - Icon Rail + Channel List */}
			<TeamSidebar activeChannel={getActiveChannel()} onChannelSelect={() => {}} />

			{/* Main Area - Rendered by sub-routes */}
			{children}
		</div>
	);
}
