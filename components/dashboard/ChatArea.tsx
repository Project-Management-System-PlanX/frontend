"use client";

import {
	AtSign,
	Bold,
	File as FileIcon,
	Image as ImageIcon,
	Info,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	Loader2,
	Mic,
	Phone,
	PlusCircle,
	Search,
	Send,
	Smile,
	Star,
	Strikethrough,
	Video,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type Message as SupabaseMessage, useMessages } from "@/hooks/chat/use-messages";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { createClient } from "@/lib/supabase/client";
import { useChannelStore } from "@/stores/channel-store";

interface ChatAreaProps {
	channelName: string;
	detailsOpen: boolean;
	onToggleDetails: () => void;
	isDM?: boolean;
	dmDisplayName?: string;
}

export function ChatArea({
	channelName,
	detailsOpen,
	onToggleDetails,
	isDM,
	dmDisplayName,
}: ChatAreaProps) {
	const [messageInput, setMessageInput] = useState("");
	const [attachment, setAttachment] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const scrollRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { user } = useSupabaseAuth();
	const { channels } = useChannelStore();
	const supabase = createClient();

	// Find the channel by ID (channelName is actually channelId from URL)
	const channel = channels.find((c) => c.id === channelName);
	const displayName = isDM && dmDisplayName ? dmDisplayName : channel ? channel.name : channelName;

	// Use real Supabase messages for this channel
	const { messages, isLoading, error, sendMessage } = useMessages(channelName);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Scroll to bottom when messages change
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: "instant" });
		}
	}, [messages]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			setAttachment(e.target.files[0]);
			// Reset input so the same file could be selected again if removed
			e.target.value = "";
		}
	};

	const handleSendMessage = async () => {
		if ((!messageInput.trim() && !attachment) || !user?.id || isUploading) return;

		try {
			setIsUploading(true);
			let fileDetails: { url: string; name: string; type: string; size: number } | undefined;

			if (attachment) {
				const fileExt = attachment.name.split(".").pop();
				const fileName = `${crypto.randomUUID()}.${fileExt}`;
				const filePath = `${channelName}/${fileName}`;

				const { error: uploadError } = await supabase.storage
					.from("chat_attachments")
					.upload(filePath, attachment);

				if (uploadError) throw uploadError;

				const { data } = supabase.storage.from("chat_attachments").getPublicUrl(filePath);

				fileDetails = {
					url: data.publicUrl,
					name: attachment.name,
					type: attachment.type,
					size: attachment.size,
				};
			}

			await sendMessage(messageInput, user.id, fileDetails);
			setMessageInput("");
			setAttachment(null);
		} catch (err) {
			console.error("Failed to send message:", err);
		} finally {
			setIsUploading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSendMessage();
		}
	};

	const formatMessageTime = (timestamp: string) => {
		try {
			// Supabase timestamp fields often miss the 'Z' UTC indicator.
			// Without it, JS parses the time as local, breaking the timezone offset.
			let tzString = timestamp;
			const timePart = tzString.split("T")[1];
			if (
				timePart &&
				!timePart.endsWith("Z") &&
				!timePart.includes("+") &&
				!timePart.includes("-")
			) {
				tzString += "Z";
			}
			return new Date(tzString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		} catch {
			return timestamp;
		}
	};

	const getNameFromEmail = (email: string) => {
		const local = email.split("@")[0] || "";
		return local
			.replace(/[._-]/g, " ")
			.split(" ")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");
	};

	const getDisplayName = (msg: SupabaseMessage) => {
		if (msg.users) {
			const name = [msg.users.firstName, msg.users.lastName].filter(Boolean).join(" ");
			let finalName = name;
			if (!finalName) finalName = msg.users.username || getNameFromEmail(msg.users.email);
			return msg.user_id === user?.id ? `${finalName} (you)` : finalName;
		}
		return msg.user_id === user?.id ? "You" : "Unknown User";
	};

	const getInitials = (msg: SupabaseMessage) => {
		const name = getDisplayName(msg).replace(" (you)", "");
		return name
			.split(" ")
			.filter((part) => !part.includes("("))
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div
			className="flex-1 flex flex-col bg-white min-w-0 h-full overflow-hidden"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* Channel Header */}
			<div className="h-14 px-4 flex items-center justify-between border-b border-[#e5e7eb] shrink-0">
				<div className="flex items-center gap-3">
					<span className="text-[#202020] font-medium text-lg flex items-center gap-2">
						<span className="text-[#9a9a9a]">{isDM ? "@" : "#"}</span> {displayName}
					</span>
					<Button variant="ghost" size="icon" className="w-6 h-6 text-amber-400">
						<Star className="w-4 h-4 fill-current" />
					</Button>
				</div>

				<div className="flex items-center gap-2">
					<TooltipProvider delayDuration={0}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="gap-2 text-[#404040] hover:text-[#202020] hover:bg-[#f5f5f5]"
								>
									<Phone className="w-4 h-4" />
									<span className="text-sm">Audio</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Start audio call</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="gap-2 text-[#404040] hover:text-[#202020] hover:bg-[#f5f5f5]"
								>
									<Video className="w-4 h-4" />
									<span className="text-sm">Video</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Start video call</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					{/* Member Count Badge */}
					{channel?.members != null && channel.members > 0 && (
						<div className="flex items-center gap-1.5 ml-4 px-2.5 py-1 bg-slate-100 rounded-full">
							<div className="w-2 h-2 rounded-full bg-[#22c55e]" />
							<span className="text-xs font-medium text-slate-600">{channel.members} members</span>
						</div>
					)}

					<div className="w-px h-6 bg-[#e5e7eb] mx-2" />

					<TooltipProvider delayDuration={0}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="w-8 h-8 text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"
								>
									<Search className="w-4 h-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Search</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={onToggleDetails}
									className={`w-8 h-8 hover:bg-[#f5f5f5] ${detailsOpen ? "text-[#0B6E4F]" : "text-[#9a9a9a] hover:text-[#202020]"}`}
								>
									<Info className="w-4 h-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{detailsOpen ? "Hide details" : "Show details"}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			{/* Messages Area */}
			<ScrollArea className="flex-1 h-0 overflow-y-auto w-full">
				<div className="p-4 space-y-6">
					{isLoading ? (
						<div className="flex items-center justify-center py-16">
							<Loader2 className="w-6 h-6 animate-spin text-[#0B6E4F]" />
							<span className="ml-3 text-sm text-slate-500">Loading messages...</span>
						</div>
					) : error ? (
						<div className="flex items-center justify-center py-16">
							<p className="text-sm text-red-500">Failed to load messages: {error}</p>
						</div>
					) : messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="w-16 h-16 rounded-2xl bg-[#0B6E4F]/10 flex items-center justify-center mb-4">
								<span className="text-2xl">💬</span>
							</div>
							<h3 className="font-semibold text-slate-900 mb-1">No messages yet</h3>
							<p className="text-sm text-slate-500 max-w-xs">
								Be the first to send a message in{" "}
								<span className="font-medium text-[#0B6E4F]">#{displayName}</span>
							</p>
						</div>
					) : (
						messages.map((message) => (
							<div key={message.id}>
								<div className="flex gap-3 group">
									<Avatar className="w-10 h-10 shrink-0">
										<AvatarImage src={message.users?.imageUrl || undefined} />
										<AvatarFallback className="bg-[#e5e7eb] text-[#404040]">
											{getInitials(message)}
										</AvatarFallback>
									</Avatar>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-medium text-[#202020]">{getDisplayName(message)}</span>
											<span className="text-xs text-[#9a9a9a]">
												{formatMessageTime(
													message.created_at || message.createdAt || new Date().toISOString(),
												)}
											</span>
										</div>

										{message.content && (
											<p className="text-[#404040] mt-1 leading-relaxed text-[15px]">
												{message.content}
											</p>
										)}

										{message.file_url && (
											<div className="mt-2">
												{message.file_type?.startsWith("image/") ? (
													<a href={message.file_url} target="_blank" rel="noreferrer">
														{/* biome-ignore lint/performance/noImgElement: user content image */}
														<img
															src={message.file_url}
															alt={message.file_name || "Attachment"}
															className="max-w-[300px] max-h-[300px] rounded-lg border border-slate-200 object-contain hover:opacity-90 transition-opacity"
														/>
													</a>
												) : (
													<a
														href={message.file_url}
														target="_blank"
														rel="noreferrer"
														className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 max-w-sm transition-colors"
													>
														<div className="w-10 h-10 rounded bg-[#0B6E4F]/10 flex items-center justify-center shrink-0">
															<FileIcon className="w-5 h-5 text-[#0B6E4F]" />
														</div>
														<div className="min-w-0 flex-1">
															<p className="text-sm font-medium text-slate-900 truncate">
																{message.file_name || "Attached File"}
															</p>
															{message.file_size && (
																<p className="text-xs text-slate-500">
																	{(message.file_size / 1024).toFixed(1)} KB
																</p>
															)}
														</div>
													</a>
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						))
					)}
					<div ref={scrollRef} />
				</div>
			</ScrollArea>

			{/* Message Input */}
			<div className="pt-2 pb-4 px-4 border-t border-[#e5e7eb] shrink-0">
				<div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm">
					{/* Formatting Toolbar */}
					<div className="flex items-center gap-1 px-3 py-2 border-b border-[#e5e7eb]">
						<TooltipProvider delayDuration={0}>
							{[
								{ icon: Bold, label: "Bold" },
								{ icon: Italic, label: "Italic" },
								{ icon: Strikethrough, label: "Strikethrough" },
							].map(({ icon: Icon, label }) => (
								<Tooltip key={label}>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="w-7 h-7 text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"
										>
											<Icon className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>{label}</TooltipContent>
								</Tooltip>
							))}

							<div className="w-px h-4 bg-[#e5e7eb] mx-1" />

							{[
								{ icon: LinkIcon, label: "Add link" },
								{ icon: List, label: "Bulleted list" },
								{ icon: ListOrdered, label: "Numbered list" },
							].map(({ icon: Icon, label }) => (
								<Tooltip key={label}>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="w-7 h-7 text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"
										>
											<Icon className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>{label}</TooltipContent>
								</Tooltip>
							))}
						</TooltipProvider>
					</div>

					{/* Input & Staging */}
					<div className="px-3 py-3 flex flex-col gap-2">
						{/* Hidden File Input */}
						<input
							type="file"
							ref={fileInputRef}
							hidden
							onChange={handleFileSelect}
							accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
						/>

						{/* Attachment Staging Area */}
						{attachment && (
							<div className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-slate-50 w-max pr-8 relative group">
								<div className="w-10 h-10 rounded bg-[#0B6E4F]/10 flex items-center justify-center">
									{attachment.type.startsWith("image/") ? (
										<ImageIcon className="w-5 h-5 text-[#0B6E4F]" />
									) : (
										<FileIcon className="w-5 h-5 text-[#0B6E4F]" />
									)}
								</div>
								<div className="flex flex-col">
									<span className="text-sm font-medium text-slate-700 max-w-[200px] truncate">
										{attachment.name}
									</span>
									<span className="text-xs text-slate-500">
										{(attachment.size / 1024).toFixed(1)} KB
									</span>
								</div>
								<button
									type="button"
									onClick={() => {
										setAttachment(null);
										if (fileInputRef.current) fileInputRef.current.value = "";
									}}
									className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<X className="w-3 h-3" />
								</button>
							</div>
						)}

						<input
							type="text"
							value={messageInput}
							onChange={(e) => setMessageInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={`Message ${isDM ? "@" : "#"}${displayName}`}
							className="w-full bg-transparent text-[#202020] placeholder-[#9a9a9a] outline-none text-[15px]"
							disabled={isUploading}
						/>
					</div>

					{/* Bottom Actions */}
					<div className="flex items-center justify-between px-3 py-2 border-t border-[#e5e7eb]">
						<div className="flex items-center gap-1">
							<TooltipProvider delayDuration={0}>
								{[
									{
										icon: PlusCircle,
										label: "Attach",
										onClick: () => fileInputRef.current?.click(),
									},
									{ icon: AtSign, label: "Mention" },
									{ icon: Smile, label: "Emoji" },
									{ icon: Mic, label: "Record audio" },
								].map(({ icon: Icon, label, onClick }) => (
									<Tooltip key={label}>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												onClick={onClick}
												className="w-8 h-8 text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"
											>
												<Icon className="w-4 h-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>{label}</TooltipContent>
									</Tooltip>
								))}
							</TooltipProvider>
						</div>

						<Button
							size="icon"
							className="w-9 h-9 rounded-lg bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white"
							disabled={(!messageInput.trim() && !attachment) || isUploading}
							onClick={handleSendMessage}
						>
							{isUploading ? (
								<Loader2 className="w-4 h-4 animate-spin text-white" />
							) : (
								<Send className="w-4 h-4" />
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
