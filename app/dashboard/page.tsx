"use client";

import { useState } from "react";
import { ChannelDetails } from "@/components/dashboard/ChannelDetails";
import { ChatArea } from "@/components/dashboard/ChatArea";
import { TeamSidebar } from "@/components/dashboard/TeamSidebar";

export default function DashboardPage() {
	const [activeChannel, setActiveChannel] = useState("product-design");
	const [detailsOpen, setDetailsOpen] = useState(true);

	return (
		<div className="h-screen flex overflow-hidden bg-[#f8f9fa]">
			{/* Left Sidebar - Icon Rail + Channel List */}
			<TeamSidebar activeChannel={activeChannel} onChannelSelect={setActiveChannel} />

			{/* Main Chat Area */}
			<ChatArea
				channelName={activeChannel}
				detailsOpen={detailsOpen}
				onToggleDetails={() => setDetailsOpen(!detailsOpen)}
			/>

			{/* Right Panel - Channel Details (Collapsible) */}
			<ChannelDetails
				channelName={activeChannel}
				isOpen={detailsOpen}
				onClose={() => setDetailsOpen(false)}
			/>
		</div>
	);
}
