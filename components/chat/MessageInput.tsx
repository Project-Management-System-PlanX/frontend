"use client";

import { Send, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MessageInputProps {
	onSendMessage: (content: string) => Promise<void>;
	disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
	const [content, setContent] = useState("");
	const [isSending, setIsSending] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea logic
	// biome-ignore lint/correctness/useExhaustiveDependencies: must trigger when content changes
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
		}
	}, [content]);

	const handleSend = async () => {
		if (!content.trim() || isSending || disabled) return;

		try {
			setIsSending(true);
			await onSendMessage(content);
			setContent("");
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
		} catch (error) {
			console.error("Failed to send message", error);
		} finally {
			setIsSending(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="p-4 border-t border-gray-100 bg-white">
			<div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#50C878]/30 focus-within:border-[#50C878] transition-all">
				<button
					type="button"
					className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white transition-colors flex-shrink-0"
					disabled={disabled}
				>
					<Smile className="w-5 h-5" />
				</button>

				<textarea
					ref={textareaRef}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={disabled || isSending}
					placeholder={disabled ? "Connecting to chat..." : "Type a message..."}
					className="flex-1 max-h-[120px] min-h-[44px] bg-transparent resize-none outline-none py-3 text-sm text-[#013220] placeholder:text-gray-400 disabled:opacity-50"
					rows={1}
				/>

				<button
					type="button"
					onClick={handleSend}
					disabled={!content.trim() || isSending || disabled}
					className="p-3 bg-[#0B6E4F] text-white rounded-xl hover:bg-[#013220] transition-colors disabled:opacity-50 disabled:hover:bg-[#0B6E4F] flex-shrink-0"
				>
					<Send className="w-4 h-4" />
				</button>
			</div>
			<div className="max-w-4xl mx-auto px-2 mt-2">
				<p className="text-[11px] text-gray-400 text-right">
					<span className="font-semibold">Enter</span> to send,{" "}
					<span className="font-semibold">Shift + Enter</span> for new line
				</p>
			</div>
		</div>
	);
}
