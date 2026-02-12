"use client";

import {
	AtSign,
	Bold,
	FileText,
	Info,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	Mic,
	Phone,
	PlusCircle,
	Search,
	Send,
	Smile,
	Star,
	Strikethrough,
	Video,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
	id: string;
	user: {
		name: string;
		avatar?: string;
		isBot?: boolean;
		appLabel?: string;
	};
	content: string;
	timestamp: string;
	reactions?: { emoji: string; count: number }[];
	attachment?: {
		name: string;
		type: string;
		size: string;
	};
	replies?: {
		count: number;
		lastReply: string;
		avatars: string[];
	};
	isNew?: boolean;
}

interface ChatAreaProps {
	channelName: string;
	detailsOpen: boolean;
	onToggleDetails: () => void;
	isDM?: boolean;
}

const messages: Message[] = [
	{
		id: "1",
		user: { name: "Alex Morgan", avatar: "/avatars/alex.png" },
		content:
			"Hey team! I've just updated the Figma board for the new Dashboard interface. Check out the dark mode variants in the 'V2-Final' page. The gradients now use the #0B6E4F to #50C878 range we discussed.",
		timestamp: "10:31 AM",
		reactions: [
			{ emoji: "🚀", count: 4 },
			{ emoji: "🔥", count: 2 },
		],
		attachment: {
			name: "TeamUP_Dashboard_v2.fig",
			type: "FIGMA DESIGN",
			size: "12.4 MB",
		},
	},
	{
		id: "2",
		user: { name: "Sarah Chen", avatar: "/avatars/sarah.png" },
		content:
			"Thanks Alex! The contrast ratios on the primary button look much better now. I'll take a look at the responsive grids this afternoon. Are we planning to use the sea blue for all interactive states?",
		timestamp: "10:45 AM",
		replies: {
			count: 3,
			lastReply: "Last reply 15 minutes ago",
			avatars: ["/avatars/alex.png", "/avatars/user.png"],
		},
	},
	{
		id: "3",
		user: {
			name: "TeamUP Bot",
			isBot: true,
			appLabel: "APP",
		},
		content: "",
		timestamp: "11:02 AM",
		isNew: true,
	},
];

export function ChatArea({ channelName, detailsOpen, onToggleDetails, isDM }: ChatAreaProps) {
	const [messageInput, setMessageInput] = useState("");

	return (
		<div
			className="flex-1 flex flex-col bg-white min-w-0"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* Channel Header */}
			<div className="h-14 px-4 flex items-center justify-between border-b border-[#e5e7eb] shrink-0">
				<div className="flex items-center gap-3">
					<span className="text-[#202020] font-medium text-lg flex items-center gap-2">
						<span className="text-[#9a9a9a]">{isDM ? "@" : "#"}</span> {channelName}
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

					{/* Member Avatars */}
					<div className="flex items-center -space-x-2 ml-4">
						{[1, 2, 3].map((i) => (
							<Avatar key={i} className="w-7 h-7 border-2 border-white">
								<AvatarFallback
									className="text-[10px] bg-[#F57799] text-black
								"
								>
									U{i}
								</AvatarFallback>
							</Avatar>
						))}
						<div className="w-7 h-7 rounded-full bg-[#FDC3A1] flex items-center justify-center text-[10px] text-black font-medium border-2 border-white">
							+12
						</div>
					</div>

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
			<ScrollArea className="flex-1">
				<div className="p-4 space-y-6">
					{messages.map((message) => (
						<div key={message.id}>
							{/* New Messages Divider */}
							{message.isNew && (
								<div className="flex items-center gap-4 my-6">
									<div className="flex-1 h-px bg-red-300" />
									<span className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
										New Messages
									</span>
									<div className="flex-1 h-px bg-red-300" />
								</div>
							)}

							<div className="flex gap-3 group">
								<Avatar className="w-10 h-10 shrink-0">
									<AvatarImage src={message.user.avatar} />
									<AvatarFallback
										className={
											message.user.isBot ? "bg-[#0B6E4F] text-white" : "bg-[#e5e7eb] text-[#404040]"
										}
									>
										{message.user.isBot
											? "🤖"
											: message.user.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
									</AvatarFallback>
								</Avatar>

								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="font-medium text-[#202020]">{message.user.name}</span>
										{message.user.appLabel && (
											<span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#0B6E4F] text-white rounded">
												{message.user.appLabel}
											</span>
										)}
										<span className="text-xs text-[#9a9a9a]">{message.timestamp}</span>
									</div>

									{message.content && (
										<p className="text-[#404040] mt-1 leading-relaxed text-[15px]">
											{message.content}
										</p>
									)}

									{message.user.isBot && (
										<p className="text-[#404040] mt-1 leading-relaxed text-[15px]">
											New task created in{" "}
											<span className="text-[#0B6E4F] hover:underline cursor-pointer">
												#product-roadmap
											</span>
											:{" "}
											<span className="italic text-[#202020]">
												"Finalize Dark Mode CSS variables"
											</span>
										</p>
									)}

									{/* Attachment */}
									{message.attachment && (
										<div className="mt-3 inline-flex items-center gap-3 bg-[#f8f9fa] rounded-lg px-4 py-3 border border-[#e5e7eb]">
											<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
												<FileText className="w-5 h-5 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-[#202020]">
													{message.attachment.name}
												</p>
												<p className="text-xs text-[#9a9a9a]">
													{message.attachment.type} • {message.attachment.size}
												</p>
											</div>
										</div>
									)}

									{/* Reactions */}
									{message.reactions && (
										<div className="flex items-center gap-2 mt-3">
											{message.reactions.map((reaction) => (
												<button
													type="button"
													key={reaction.emoji}
													className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5f5f5] hover:bg-[#e5e7eb] border border-[#e5e7eb] transition-colors"
												>
													<span>{reaction.emoji}</span>
													<span className="text-xs text-[#404040] font-medium">
														{reaction.count}
													</span>
												</button>
											))}
										</div>
									)}

									{/* Replies */}
									{message.replies && (
										<button type="button" className="flex items-center gap-2 mt-3 group/reply">
											<div className="flex -space-x-1.5">
												{message.replies.avatars.map((avatar) => (
													<Avatar
														key={`${message.id}-${avatar}`}
														className="w-5 h-5 border border-white"
													>
														<AvatarImage src={avatar} />
														<AvatarFallback className="text-[8px] bg-[#e5e7eb] text-[#404040]">
															U
														</AvatarFallback>
													</Avatar>
												))}
											</div>
											<span className="text-[#0B6E4F] text-sm font-medium group-hover/reply:underline">
												{message.replies.count} replies
											</span>
											<span className="text-xs text-[#9a9a9a]">{message.replies.lastReply}</span>
										</button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</ScrollArea>

			{/* Message Input */}
			<div className="p-4 border-t border-[#e5e7eb] shrink-0">
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

					{/* Input */}
					<div className="px-3 py-3">
						<input
							type="text"
							value={messageInput}
							onChange={(e) => setMessageInput(e.target.value)}
							placeholder={`Message #${channelName}`}
							className="w-full bg-transparent text-[#202020] placeholder-[#9a9a9a] outline-none text-[15px]"
						/>
					</div>

					{/* Bottom Actions */}
					<div className="flex items-center justify-between px-3 py-2 border-t border-[#e5e7eb]">
						<div className="flex items-center gap-1">
							<TooltipProvider delayDuration={0}>
								{[
									{ icon: PlusCircle, label: "Attach" },
									{ icon: AtSign, label: "Mention" },
									{ icon: Smile, label: "Emoji" },
									{ icon: Mic, label: "Record audio" },
								].map(({ icon: Icon, label }) => (
									<Tooltip key={label}>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
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
							disabled={!messageInput.trim()}
						>
							<Send className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
