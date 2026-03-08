"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Node } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const MentionNode = Node.create({
	name: "mention",
	group: "inline",
	inline: true,
	selectable: true,
	atom: true,

	addAttributes() {
		return {
			id: { default: null },
			label: { default: null },
		};
	},

	parseHTML() {
		return [
			{
				tag: "span[data-mention]",
				getAttrs: (dom) => {
					const el = dom as HTMLElement;
					return {
						id: el.getAttribute("data-mention"),
						label: (el.textContent || "").replace(/^@/, ""),
					};
				},
			},
		];
	},

	renderHTML({ node }) {
		return [
			"span",
			{ "data-mention": node.attrs.id, class: "mention" },
			`@${node.attrs.label}`,
		];
	},
});
import DOMPurify from "dompurify";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	AtSign,
	Bold,
	Check,
	File as FileIcon,
	Image as ImageIcon,
	Info,
	Italic,
	Link2,
	List,
	ListOrdered,
	Loader2,
	Mic,
	PlusCircle,
	Search,
	Send,
	Smile,
	Star,
	Strikethrough,
	Trash2,
	Underline as UnderlineIcon,
	X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const StartMeetingButton = dynamic(
	() => import("@/components/meeting/StartMeetingButton").then((m) => m.StartMeetingButton),
	{ ssr: false },
);
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type Message as SupabaseMessage, useMessages } from "@/hooks/chat/use-messages";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
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
	const [attachment, setAttachment] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [showEmoji, setShowEmoji] = useState(false);
	const [showLinkInput, setShowLinkInput] = useState(false);
	const [linkUrl, setLinkUrl] = useState("");
	const [mentionQuery, setMentionQuery] = useState<string | null>(null);
	const [mentionIndex, setMentionIndex] = useState(0);
	const mentionRangeRef = useRef<{ from: number; to: number } | null>(null);

	const scrollRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const emojiRef = useRef<HTMLDivElement>(null);
	const linkInputRef = useRef<HTMLInputElement>(null);
	const mentionRef = useRef<HTMLDivElement>(null);

	const { user } = useSupabaseAuth();
	const { members } = useWorkspaceMembers();
	const { channels } = useChannelStore();
	const supabase = createClient();
	const router = useRouter();

	// Find the channel by ID (channelName is actually channelId from URL)
	const channel = channels.find((c) => c.id === channelName);
	const displayName = isDM && dmDisplayName ? dmDisplayName : channel ? channel.name : channelName;

	// Use real Supabase messages for this channel
	const { messages, isLoading, error, sendMessage, deleteMessage } = useMessages(channelName);

	// Filtered member list for @ mentions
	const filteredMembers = useMemo(() => {
		if (mentionQuery === null) return [];
		const q = mentionQuery.toLowerCase();
		return members
			.filter((m) => {
				const name = [m.profile?.firstName, m.profile?.lastName].filter(Boolean).join(" ").toLowerCase();
				const email = m.profile?.email?.toLowerCase() || "";
				const username = m.profile?.username?.toLowerCase() || "";
				return name.includes(q) || email.includes(q) || username.includes(q);
			})
			.slice(0, 8);
	}, [members, mentionQuery]);

	// Tiptap rich-text editor
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				heading: false,
				codeBlock: false,
				horizontalRule: false,
				blockquote: false,
			}),
			Placeholder.configure({
				placeholder: `Message ${isDM ? "@" : "#"}${displayName}`,
			}),
			Underline,
			TextAlign.configure({ types: ["paragraph"] }),
			Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-500 underline" } }),
			MentionNode,
		],
		onUpdate: ({ editor: ed }) => {
			// Detect @ mention trigger
			const { from } = ed.state.selection;
			const textBefore = ed.state.doc.textBetween(Math.max(0, from - 50), from, "\n");
			const mentionMatch = textBefore.match(/@(\w*)$/);
			if (mentionMatch) {
				setMentionQuery(mentionMatch[1]);
				setMentionIndex(0);
				mentionRangeRef.current = { from: from - mentionMatch[0].length, to: from };
			} else {
				setMentionQuery(null);
				mentionRangeRef.current = null;
			}
		},
		editorProps: {
			attributes: {
				class:
					"prose prose-sm max-w-none focus:outline-none min-h-[40px] max-h-[160px] overflow-y-auto px-3 py-2 text-sm text-[#202020] [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1",
			},
			handleKeyDown: (_view, event) => {
				if (event.key === "Enter" && !event.shiftKey) {
					event.preventDefault();
					handleSendMessage();
					return true;
				}
				return false;
			},
		},
		editable: !isUploading,
	});

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

	const handleSendMessage = useCallback(async () => {
		if (!editor || !user?.id || isUploading) return;

		const html = editor.getHTML();
		const text = editor.getText().trim();
		if (!text && !attachment) return;

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

			await sendMessage(text ? html : "", user.id, fileDetails);
			editor.commands.clearContent();
			setAttachment(null);
		} catch (err) {
			console.error("Failed to send message:", err);
		} finally {
			setIsUploading(false);
		}
	}, [editor, user?.id, isUploading, attachment, channelName, supabase.storage, sendMessage]);

	// Re-bind handleSendMessage to the editor's keydown handler when dependencies change
	useEffect(() => {
		if (!editor) return;
		editor.setOptions({
			editorProps: {
				...editor.options.editorProps,
				handleKeyDown: (_view, event) => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();
						handleSendMessage();
						return true;
					}
					return false;
				},
			},
		});
	}, [editor, handleSendMessage]);

	// Close emoji picker on outside click
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (emojiRef.current && !emojiRef.current.contains(e.target as globalThis.Node)) {
				setShowEmoji(false);
			}
		};
		if (showEmoji) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showEmoji]);

	// biome-ignore lint/suspicious/noExplicitAny: emoji-mart types aren't exported
	const handleEmojiSelect = (emoji: any) => {
		editor?.chain().focus().insertContent(emoji.native).run();
		setShowEmoji(false);
	};

	const handleLinkAdd = () => {
		if (!editor) return;
		if (showLinkInput) {
			// Apply the link
			if (linkUrl.trim()) {
				editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
			}
			setShowLinkInput(false);
			setLinkUrl("");
		} else {
			// If there's already a link, remove it
			if (editor.isActive("link")) {
				editor.chain().focus().unsetLink().run();
				return;
			}
			setShowLinkInput(true);
			setTimeout(() => linkInputRef.current?.focus(), 50);
		}
	};

	const handleLinkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (linkUrl.trim() && editor) {
				editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
			}
			setShowLinkInput(false);
			setLinkUrl("");
		} else if (e.key === "Escape") {
			setShowLinkInput(false);
			setLinkUrl("");
			editor?.chain().focus().run();
		}
	};

	const insertMention = useCallback(
		(member: (typeof members)[0]) => {
			if (!editor) return;
			const name = [member.profile?.firstName, member.profile?.lastName].filter(Boolean).join(" ") || member.profile?.username || "user";
			const range = mentionRangeRef.current;
			if (!range) return;

			editor
				.chain()
				.focus()
				.deleteRange({ from: range.from, to: range.to })
				.insertContentAt(range.from, [
					{ type: "mention", attrs: { id: member.userId, label: name } },
					{ type: "text", text: " " },
				])
				.run();

			setMentionQuery(null);
			mentionRangeRef.current = null;
		},
		[editor],
	);

	// Handle @ mention keyboard navigation
	const handleMentionKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (mentionQuery === null || filteredMembers.length === 0) return;
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setMentionIndex((i) => (i + 1) % filteredMembers.length);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setMentionIndex((i) => (i - 1 + filteredMembers.length) % filteredMembers.length);
			} else if (e.key === "Enter" || e.key === "Tab") {
				e.preventDefault();
				insertMention(filteredMembers[mentionIndex]);
			} else if (e.key === "Escape") {
				setMentionQuery(null);
			}
		},
		[mentionQuery, filteredMembers, mentionIndex, insertMention],
	);

	useEffect(() => {
		if (mentionQuery !== null) {
			document.addEventListener("keydown", handleMentionKeyDown, true);
		}
		return () => document.removeEventListener("keydown", handleMentionKeyDown, true);
	}, [mentionQuery, handleMentionKeyDown]);

	// Close mention dropdown on outside click
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (mentionRef.current && !mentionRef.current.contains(e.target as globalThis.Node)) {
				setMentionQuery(null);
			}
		};
		if (mentionQuery !== null) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [mentionQuery]);

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

	const isHtmlContent = (content: string) => /<[a-z][\s\S]*>/i.test(content);

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
								<StartMeetingButton channelId={channelName} channelName={displayName} />
							</TooltipTrigger>
							<TooltipContent>Start a call</TooltipContent>
						</Tooltip>

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
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-6 h-6 text-[#0B6E4F]"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<title>Chat icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</div>
							<h3 className="font-semibold text-slate-900 mb-1">No messages yet</h3>
							<p className="text-sm text-slate-500 max-w-xs">
								Be the first to send a message in{" "}
								<span className="font-medium text-[#0B6E4F]">#{displayName}</span>
							</p>
						</div>
					) : (
						messages.map((message) => {
							const isDeleted = !!(message.deletedAt || message.deleted_at);
							const isOwnMessage = message.user_id === user?.id || message.userId === user?.id;
							return (
							<div key={message.id}>
								<div className="flex gap-3 group relative hover:bg-[#f9fafb] rounded-lg px-2 py-1 -mx-2 transition-colors">
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

										{isDeleted ? (
											<p className="text-[#9a9a9a] mt-1 italic text-sm">This message was deleted</p>
										) : (
											<>
										{message.content && (
											isHtmlContent(message.content) ? (
												// biome-ignore lint/a11y/noStaticElementInteractions: mention clicks navigate to DM
												// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
												<div
													className="text-[#404040] mt-1 leading-relaxed text-[15px] prose prose-sm max-w-none [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1 [&_a]:text-blue-500"
													onClick={(e) => {
														const target = e.target as HTMLElement;
														const mentionId = target.getAttribute("data-mention");
														if (mentionId) {
															const mentionedMember = members.find((m) => m.userId === mentionId);
															if (mentionedMember?.slug) {
																router.push(`/dashboard/chat/dm/${encodeURIComponent(mentionedMember.slug)}`);
															}
														}
													}}
													dangerouslySetInnerHTML={{
														__html: DOMPurify.sanitize(message.content, {
															ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li", "span"],
															ALLOWED_ATTR: ["href", "target", "rel", "style", "class", "data-mention"],
														}),
													}}
												/>
											) : (
												<p className="text-[#404040] mt-1 leading-relaxed text-[15px]">
													{message.content}
												</p>
											)
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
											</>
										)}
									</div>

									{/* Delete button — only for own messages, hidden when deleted */}
									{isOwnMessage && !isDeleted && (
										<button
											type="button"
											onClick={() => deleteMessage(message.id)}
											className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-red-50 text-[#9a9a9a] hover:text-red-500"
											title="Delete message"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									)}
								</div>
							</div>
							);
						})
					)}
					<div ref={scrollRef} />
				</div>
			</ScrollArea>

			{/* Message Input */}
			<div className="pt-2 pb-4 px-4 border-t border-[#e5e7eb] shrink-0">
				<div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm focus-within:ring-2 focus-within:ring-[#50C878]/30 focus-within:border-[#50C878] transition-all overflow-hidden">
					{/* Formatting Toolbar */}
					{editor && (
						<div className="flex items-center gap-1 px-3 py-2 border-b border-[#e5e7eb]">
							{/* Bold / Italic / Underline / Strikethrough */}
							{([
								{ cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), icon: Bold, label: "Bold" },
								{ cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), icon: Italic, label: "Italic" },
								{ cmd: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline"), icon: UnderlineIcon, label: "Underline" },
								{ cmd: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike"), icon: Strikethrough, label: "Strikethrough" },
							] as const).map(({ cmd, active, icon: Icon, label }) => (
								<button
									key={label}
									type="button"
									onClick={cmd}
									title={label}
									className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${active ? "text-[#0B6E4F] bg-emerald-50" : "text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"}`}
								>
									<Icon className="w-4 h-4" />
								</button>
							))}

							<div className="w-px h-4 bg-[#e5e7eb] mx-1" />

							{/* Link */}
							<button
								type="button"
								onClick={handleLinkAdd}
								title="Add link"
								className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${editor.isActive("link") ? "text-[#0B6E4F] bg-emerald-50" : "text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"}`}
							>
								<Link2 className="w-4 h-4" />
							</button>

							{/* Lists */}
							<button
								type="button"
								onClick={() => editor.chain().focus().toggleBulletList().run()}
								title="Bulleted list"
								className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${editor.isActive("bulletList") ? "text-[#0B6E4F] bg-emerald-50" : "text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"}`}
							>
								<List className="w-4 h-4" />
							</button>
							<button
								type="button"
								onClick={() => editor.chain().focus().toggleOrderedList().run()}
								title="Numbered list"
								className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${editor.isActive("orderedList") ? "text-[#0B6E4F] bg-emerald-50" : "text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"}`}
							>
								<ListOrdered className="w-4 h-4" />
							</button>

							<div className="w-px h-4 bg-[#e5e7eb] mx-1" />

							{/* Text Alignment */}
							{([
								{ align: "left" as const, icon: AlignLeft, label: "Align left" },
								{ align: "center" as const, icon: AlignCenter, label: "Align center" },
								{ align: "right" as const, icon: AlignRight, label: "Align right" },
							]).map(({ align, icon: Icon, label }) => (
								<button
									key={align}
									type="button"
									onClick={() => editor.chain().focus().setTextAlign(align).run()}
									title={label}
									className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${editor.isActive({ textAlign: align }) ? "text-[#0B6E4F] bg-emerald-50" : "text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"}`}
								>
									<Icon className="w-4 h-4" />
								</button>
							))}
						</div>
					)}

					{/* Editor & Staging */}
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

						{/* Tiptap Editor */}
						{editor && (
							<div className="relative">
								<EditorContent editor={editor} />

								{/* Inline Link Input */}
								{showLinkInput && (
									<div className="absolute bottom-full left-0 mb-1 flex items-center gap-2 bg-white border border-[#e5e7eb] rounded-lg shadow-lg px-3 py-2 z-50">
										<Link2 className="w-4 h-4 text-[#9a9a9a] shrink-0" />
										<input
											ref={linkInputRef}
											type="url"
											value={linkUrl}
											onChange={(e) => setLinkUrl(e.target.value)}
											onKeyDown={handleLinkKeyDown}
											placeholder="https://example.com"
											className="w-64 text-sm text-[#202020] placeholder-[#9a9a9a] outline-none bg-transparent"
										/>
										<button
											type="button"
											onClick={handleLinkAdd}
											className="p-1 text-[#0B6E4F] hover:bg-emerald-50 rounded transition-colors"
											title="Apply link"
										>
											<Check className="w-4 h-4" />
										</button>
										<button
											type="button"
											onClick={() => { setShowLinkInput(false); setLinkUrl(""); editor?.chain().focus().run(); }}
											className="p-1 text-[#9a9a9a] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
											title="Cancel"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								)}

								{/* @ Mention Dropdown */}
								{mentionQuery !== null && filteredMembers.length > 0 && (
									<div
										ref={mentionRef}
										className="absolute bottom-full left-0 mb-1 w-72 max-h-48 overflow-y-auto bg-white border border-[#e5e7eb] rounded-lg shadow-lg z-50"
									>
										{filteredMembers.map((member, i) => {
											const name = [member.profile?.firstName, member.profile?.lastName].filter(Boolean).join(" ") || member.profile?.username || "Unknown";
											const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
											return (
												<button
													key={member.id}
													type="button"
													onMouseDown={(e) => {
														e.preventDefault();
														insertMention(member);
													}}
													className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${i === mentionIndex ? "bg-[#0B6E4F]/10 text-[#0B6E4F]" : "text-[#202020] hover:bg-[#f5f5f5]"}`}
												>
													<div className="w-7 h-7 rounded-full bg-[#e5e7eb] flex items-center justify-center text-xs font-medium text-[#404040] shrink-0">
														{initials}
													</div>
													<div className="min-w-0">
														<div className="font-medium truncate">{name}</div>
														{member.profile?.email && (
															<div className="text-xs text-[#9a9a9a] truncate">{member.profile.email}</div>
														)}
													</div>
												</button>
											);
										})}
									</div>
								)}
							</div>
						)}
					</div>

					{/* Bottom Actions */}
					<div className="flex items-center justify-between px-3 py-2 border-t border-[#e5e7eb]">
						<div className="flex items-center gap-1">
							<TooltipProvider delayDuration={0}>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => fileInputRef.current?.click()}
											className="w-8 h-8 text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"
										>
											<PlusCircle className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Attach</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => {
												editor?.chain().focus().insertContent("@").run();
											}}
											className="w-8 h-8 text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"
										>
											<AtSign className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Mention</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="relative" ref={emojiRef}>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setShowEmoji((prev) => !prev)}
												className={`w-8 h-8 ${showEmoji ? "text-[#0B6E4F] bg-emerald-50" : "text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"}`}
											>
												<Smile className="w-4 h-4" />
											</Button>
											{showEmoji && (
												<div className="absolute bottom-10 left-0 z-50 shadow-xl rounded-xl overflow-hidden">
													<Picker
														data={data}
														onEmojiSelect={handleEmojiSelect}
														theme="light"
														previewPosition="none"
														skinTonePosition="none"
														maxFrequentRows={2}
													/>
												</div>
											)}
										</div>
									</TooltipTrigger>
									<TooltipContent>Emoji</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="w-8 h-8 text-[#9a9a9a] hover:text-[#202020] hover:bg-[#f5f5f5]"
										>
											<Mic className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Record audio</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						<Button
							size="icon"
							className="w-9 h-9 rounded-lg bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white"
							disabled={(!editor?.getText().trim() && !attachment) || isUploading}
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
