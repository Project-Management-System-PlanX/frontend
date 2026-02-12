"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
	const router = useRouter();

	// Redirect to the default channel
	useEffect(() => {
		router.replace("/dashboard/chat/channel/all-teamup");
	}, [router]);

	return null;
}
