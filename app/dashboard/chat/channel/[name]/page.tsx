"use client";

import { use, useState } from "react";
import { ChannelDetails } from "@/components/dashboard/ChannelDetails";
import { ChatArea } from "@/components/dashboard/ChatArea";

export default function ChannelPage({ params }: { params: Promise<{ name: string }> }) {
	const { name } = use(params);
	const channelName = decodeURIComponent(name);
	const [detailsOpen, setDetailsOpen] = useState(true);

	return (
		<>
			<ChatArea
				channelName={channelName}
				detailsOpen={detailsOpen}
				onToggleDetails={() => setDetailsOpen(!detailsOpen)}
			/>

			{/* Right Panel - Channel Details (Collapsible) */}
			<ChannelDetails
				channelName={channelName}
				isOpen={detailsOpen}
				onClose={() => setDetailsOpen(false)}
			/>
		</>
	);
}
