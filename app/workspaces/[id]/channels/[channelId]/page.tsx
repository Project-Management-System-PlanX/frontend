"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { ChatArea } from "@/components/chat/ChatArea";
import { useChannel } from "@/hooks/api/use-channels";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export default function ChannelChatPage() {
	const params = useParams();
	const channelId = params.channelId as string;
	const { token } = useSupabaseAuth();

	const { data: channel, isLoading, error } = useChannel(channelId, token);

	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center bg-white">
				<Loader2 className="w-8 h-8 animate-spin text-[#0B6E4F]" />
			</div>
		);
	}

	if (error || !channel) {
		return (
			<div className="flex h-full w-full items-center justify-center bg-white">
				<div className="text-center">
					<h3 className="text-xl font-bold text-gray-800">Channel not found</h3>
					<p className="text-gray-500 mt-2">You might not have access to this channel.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full w-full bg-white relative">
			<ChatArea channelId={channel.id} channelName={channel.name} />
		</div>
	);
}
