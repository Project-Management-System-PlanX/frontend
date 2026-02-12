"use client";

import { use } from "react";
import { ChatArea } from "@/components/dashboard/ChatArea";

export default function DMPage({ params }: { params: Promise<{ name: string }> }) {
	const { name } = use(params);
	const dmName = decodeURIComponent(name);

	return <ChatArea channelName={dmName} detailsOpen={false} onToggleDetails={() => {}} isDM />;
}
