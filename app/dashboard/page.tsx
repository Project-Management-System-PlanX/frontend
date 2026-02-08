"use client";

import { useState } from "react";
import { ChannelDetails } from "@/components/dashboard/ChannelDetails";
import { ChannelsDirectory } from "@/components/dashboard/ChannelsDirectory";
import { ChatArea } from "@/components/dashboard/ChatArea";
import { PeopleDirectory } from "@/components/dashboard/PeopleDirectory";
import { TeamSidebar } from "@/components/dashboard/TeamSidebar";

export default function DashboardPage() {
	const [activeChannel, setActiveChannel] = useState("product-design");
	const [detailsOpen, setDetailsOpen] = useState(true);
	const [activeDirectory, setActiveDirectory] = useState<string | null>(null);

	const handleDirectorySelect = (directory: string) => {
		setActiveDirectory(directory);
	};

	return (
		<div className="h-screen flex overflow-hidden bg-[#f8f9fa]">
			{/* Left Sidebar - Icon Rail + Channel List */}
			<TeamSidebar
				activeChannel={activeChannel}
				onChannelSelect={setActiveChannel}
				onDirectorySelect={handleDirectorySelect}
			/>

			{/* Main Area - Shows either Chat or Directory */}
			{activeDirectory === "channels" ? (
				<ChannelsDirectory />
			) : activeDirectory === "people" ? (
				<PeopleDirectory />
			) : (
				<ChatArea
					channelName={activeChannel}
					detailsOpen={detailsOpen}
					onToggleDetails={() => setDetailsOpen(!detailsOpen)}
				/>
			)}

			{/* Right Panel - Channel Details (Collapsible) */}
			{!activeDirectory && (
				<ChannelDetails
					channelName={activeChannel}
					isOpen={detailsOpen}
					onClose={() => setDetailsOpen(false)}
				/>
			)}
		</div>
	);
}
