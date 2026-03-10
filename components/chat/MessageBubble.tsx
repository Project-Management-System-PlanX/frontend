import { format } from "date-fns";
import DOMPurify from "dompurify";
import { Pin } from "lucide-react";
import type { Message } from "@/hooks/chat/use-messages";

interface MessageBubbleProps {
	message: Message;
	isOwnMessage: boolean;
	showAvatar?: boolean;
}

function isHtmlContent(content: string): boolean {
	return /<[a-z][\s\S]*>/i.test(content);
}

export function MessageBubble({ message, isOwnMessage, showAvatar = true }: MessageBubbleProps) {
	const senderInitial = message.users?.firstName?.[0] || message.users?.email?.[0] || "?";
	const senderName = message.users?.firstName
		? `${message.users.firstName} ${message.users.lastName || ""}`
		: message.users?.email?.split("@")[0] || "Unknown User";

	const timeString = format(
		new Date(message.created_at || message.createdAt || Date.now()),
		"h:mm a",
	);

	const content = message.content || "";
	const hasHtml = isHtmlContent(content);

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
						{hasHtml ? (
							<div
								className={`prose prose-sm max-w-none [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 ${
									isOwnMessage
										? "[&_a]:text-emerald-200 [&_strong]:text-white [&_em]:text-white/90"
										: "[&_a]:text-blue-500"
								}`}
								suppressHydrationWarning
								// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
								dangerouslySetInnerHTML={{
									__html:
										typeof DOMPurify.sanitize === "function"
											? DOMPurify.sanitize(content, {
													ALLOWED_TAGS: [
														"p",
														"br",
														"strong",
														"em",
														"u",
														"s",
														"a",
														"ul",
														"ol",
														"li",
													],
													ALLOWED_ATTR: ["href", "target", "rel", "style", "class"],
												})
											: "",
								}}
							/>
						) : (
							content.split("\n").map((line, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: Safe for simple text lines
								<span key={i}>
									{line}
									{i !== content.split("\n").length - 1 && <br />}
								</span>
							))
						)}
					</div>

					{/* Time footer */}
					<div
						className={`text-[10px] text-gray-400 mt-1 flex items-center gap-1 ${isOwnMessage ? "justify-end mr-1" : "justify-start ml-1"}`}
					>
						{timeString}
						{(message.is_edited || message.isEdited) && (
							<span className="italic opacity-70">(edited)</span>
						)}
						{(message.is_pinned || message.isPinned) && (
							<Pin className="w-2.5 h-2.5 ml-1 inline text-amber-500 fill-amber-500" />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
