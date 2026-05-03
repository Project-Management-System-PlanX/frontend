"use client";

import { Loader2, MessageSquareOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { useMessages } from "@/hooks/chat/use-messages";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

interface ChatAreaProps {
	channelId: string;
	channelName: string;
}

export function ChatArea({ channelId, channelName }: ChatAreaProps) {
	const { messages, isLoading, error, sendMessage } = useMessages(channelId);
	const { user } = useSupabaseAuth();

	const bottomRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new messages arrive
	// biome-ignore lint/correctness/useExhaustiveDependencies: we want to trigger specifically on message length change
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]); // trigger whenever new message count changes

	return (
		<div className="flex flex-col h-full bg-[#fcfdfd] relative rounded-xl overflow-hidden shadow-sm border border-gray-100">
			{/* Chat Header */}
			<div className="h-14 border-b border-gray-100 bg-white flex items-center px-6 shrink-0 z-10 sticky top-0">
				<div className="font-semibold flex items-center gap-2">
					<span className="text-gray-400">#</span>
					<span className="text-[#013220]">{channelName}</span>
				</div>
			</div>

			{/* Chat Messages */}
			<div className="flex-1 overflow-y-auto w-full pt-6 pb-2 relative z-0">
				{/* Empty / Loading States */}
				{isLoading ? (
					<div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
						<Loader2 className="w-8 h-8 animate-spin text-[#0B6E4F]" />
						<p className="text-sm">Loading messages...</p>
					</div>
				) : error ? (
					<div className="flex flex-col items-center justify-center h-full text-red-500 space-y-2">
						<MessageSquareOff className="w-8 h-8 opacity-50" />
						<p className="text-sm font-medium">Failed to load messages.</p>
						<p className="text-xs opacity-70 px-8 text-center">{error}</p>
					</div>
				) : messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 pt-10">
						<div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
							<MessageSquareOff className="w-8 h-8 text-gray-300" />
						</div>
						<div>
							<p className="text-sm font-medium text-center text-gray-500 mb-1">
								It's quiet in here
							</p>
							<p className="text-xs text-center">
								Be the first to say hello in <span className="font-semibold">#{channelName}</span>!
							</p>
						</div>
					</div>
				) : (
					/* Message List */
					<div className="flex flex-col justify-end min-h-full max-w-4xl mx-auto w-full">
						{messages.map((msg, index) => {
							const isOwn = msg.user_id === user?.id;
							// Only show avatar if previous message was from a different user
							const prevMsg = index > 0 ? messages[index - 1] : null;
							const showAvatar = !isOwn && (!prevMsg || prevMsg.user_id !== msg.user_id);

							return (
								<MessageBubble
									key={msg.id}
									message={msg}
									isOwnMessage={isOwn}
									showAvatar={showAvatar}
								/>
							);
						})}
						{/* Invisible anchor to scroll to */}
						<div ref={bottomRef} className="h-4" />
					</div>
				)}
			</div>

			{/* Input Area */}
			<div className="shrink-0 z-10 relative bg-white">
				<MessageInput
					onSendMessage={async (content) => {
						if (user?.id) await sendMessage(content, user.id);
					}}
					disabled={isLoading || !!error}
					channelName={channelName}
				/>
			</div>
		</div>
	);
}
