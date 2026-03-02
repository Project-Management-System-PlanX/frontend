"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWorkspaceChannels } from "@/hooks/use-workspace-channels";

export default function ChatPage() {
	const router = useRouter();
	const { channels, isLoaded } = useWorkspaceChannels();

	// Redirect to the first channel when loaded
	useEffect(() => {
		if (isLoaded && channels.length > 0) {
			router.replace(`/dashboard/chat/channel/${channels[0].id}`);
		}
	}, [isLoaded, channels, router]);

	return null;
}
