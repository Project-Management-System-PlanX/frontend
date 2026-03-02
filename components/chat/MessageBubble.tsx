import { format } from "date-fns";
import type { Message } from "@/hooks/chat/use-messages";

interface MessageBubbleProps {
	message: Message;
	isOwnMessage: boolean;
	showAvatar?: boolean;
}

export function MessageBubble({ message, isOwnMessage, showAvatar = true }: MessageBubbleProps) {
	const senderInitial = message.users?.firstName?.[0] || message.users?.email?.[0] || "?";
	const senderName = message.users?.firstName
		? `${message.users.firstName} ${message.users.lastName || ""}`
		: message.users?.email?.split("@")[0] || "Unknown User";

	const timeString = format(new Date(message.created_at), "h:mm a");

	return (
		<div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"} mb-4 px-4`}>
			<div
				className={`flex max-w-[75%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"} gap-3 items-end`}
			>
				{/* Avatar */}
				{showAvatar && (
					<div
						className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
							isOwnMessage
								? "bg-gradient-to-tr from-[#50C878] to-[#0B6E4F]"
								: "bg-gradient-to-tr from-gray-400 to-gray-600"
						}`}
						title={senderName}
					>
						{senderInitial.toUpperCase()}
					</div>
				)}
				{!showAvatar && <div className="w-8" /> /* align spacer */}

				{/* Message Bubble Container */}
				<div className={`group flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
					{/* Name above message (only if not own) */}
					{!isOwnMessage && showAvatar && (
						<span className="text-xs text-gray-500 font-medium ml-1 mb-1">{senderName}</span>
					)}

					{/* Bubble body */}
					<div
						className={`relative px-4 py-3 text-sm rounded-2xl shadow-sm ${
							isOwnMessage
								? "bg-[#0B6E4F] text-white rounded-br-none"
								: "bg-white border border-gray-100 text-[#013220] rounded-bl-none"
						}`}
						style={{ wordBreak: "break-word" }}
					>
						{message.content.split("\n").map((line, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: Safe for simple text lines
							<span key={i}>
								{line}
								<br />
							</span>
						))}
					</div>

					{/* Time footer */}
					<div
						className={`text-[10px] text-gray-400 mt-1 flex items-center gap-1 ${isOwnMessage ? "justify-end mr-1" : "justify-start ml-1"}`}
					>
						{timeString}
						{message.is_edited && <span className="italic opacity-70">(edited)</span>}
					</div>
				</div>
			</div>
		</div>
	);
}
