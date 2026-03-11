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
		return ["span", { "data-mention": node.attrs.id, class: "mention" }, `@${node.attrs.label}`];
	},
});

import DOMPurify from "dompurify";
import {
	Bold,
	Edit2,
	File as FileIcon,
	Image as ImageIcon,
	Italic,
	List,
	Loader2,
	Mic,
	Pin,
	PlusCircle,
	Reply,
	Smile,
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

import { VoicePlayer } from "@/components/chat/VoicePlayer";
import { VoiceRecorder } from "@/components/chat/VoiceRecorder";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type Message as SupabaseMessage, useMessages } from "@/hooks/chat/use-messages";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { fetchClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
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
	detailsOpen: _detailsOpen,
	onToggleDetails: _onToggleDetails,
	isDM,
	dmDisplayName,
}: ChatAreaProps) {
	const [attachment, setAttachment] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [showEmoji, setShowEmoji] = useState(false);
	const [showLinkInput, setShowLinkInput] = useState(false);
	const [linkUrl, setLinkUrl] = useState("");
	const [replyTo, setReplyTo] = useState<SupabaseMessage | null>(null);
	const [mentionQuery, setMentionQuery] = useState<string | null>(null);
	const [mentionIndex, setMentionIndex] = useState(0);
	const mentionRangeRef = useRef<{ from: number; to: number } | null>(null);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
	const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [, forceUpdate] = useState({});

	const scrollRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const emojiRef = useRef<HTMLDivElement>(null);
	const linkInputRef = useRef<HTMLInputElement>(null);
	const mentionRef = useRef<HTMLDivElement>(null);

	const { user, token } = useSupabaseAuth();
	const { members } = useWorkspaceMembers();
	const { channels, updateChannel } = useChannelStore();
	const supabase = createClient();
	const router = useRouter();

	// Find the channel by ID (channelName is actually channelId from URL)
	const channel = channels.find((c) => c.id === channelName);
	const displayName = isDM && dmDisplayName ? dmDisplayName : channel ? channel.name : channelName;

	// Use real Supabase messages for this channel
	const { messages, isLoading, error, sendMessage, deleteMessage, editMessage, togglePinMessage } =
		useMessages(channelName);

	const _handleToggleStar = async () => {
		if (!channel || !token) return;
		const newStarredStatus = !channel.isStarred;
		// Optimistically update
		updateChannel(channel.id, { isStarred: newStarredStatus });

		try {
			await fetchClient(API_ENDPOINTS.CHANNEL_STAR(channel.id), {
				token,
				method: "PATCH",
				body: JSON.stringify({ isStarred: newStarredStatus }),
			});
		} catch (error) {
			console.error("Failed to toggle star:", error);
			// Revert on error
			updateChannel(channel.id, { isStarred: !newStarredStatus });
		}
	};

	const pinnedMessages = useMemo(
		() => messages.filter((m) => !m.deleted_at && !m.deletedAt && (m.isPinned || m.is_pinned)),
		[messages],
	);

	const updateMentionState = useCallback((editorInstance: NonNullable<typeof editor>) => {
		const { from } = editorInstance.state.selection;
		const textBefore = editorInstance.state.doc.textBetween(
			Math.max(0, from - 80),
			from,
			"\n",
			"\0",
		);
		const mentionMatch = textBefore.match(/(?:^|\s)@([^\s@]*)$/);

		if (!mentionMatch) {
			setMentionQuery(null);
			mentionRangeRef.current = null;
			return;
		}

		const fullMatch = mentionMatch[0];
		const query = mentionMatch[1] ?? "";
		const triggerOffset = fullMatch.lastIndexOf("@");
		const mentionLength = fullMatch.length - triggerOffset;

		setMentionQuery(query);
		setMentionIndex(0);
		mentionRangeRef.current = { from: from - mentionLength, to: from };
	}, []);

	// Filtered member list for @ mentions
	const filteredMembers = useMemo(() => {
		if (mentionQuery === null) return [];
		const q = mentionQuery.toLowerCase();
		return members
			.filter((m) => {
				const name = [m.profile?.firstName, m.profile?.lastName]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();
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
			updateMentionState(ed);
		},
		editorProps: {
			attributes: {
				class:
					"prose prose-sm max-w-none focus:outline-none min-h-[40px] max-h-[160px] overflow-y-auto pl-3 pr-[90px] py-[9px] text-[15px] text-[#000] [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1 leading-normal",
			},
			handleKeyDown: (_view, event) => {
				// Handle mention navigation explicitly first
				if (mentionQuery !== null && filteredMembers.length > 0) {
					if (event.key === "ArrowDown") {
						event.preventDefault();
						setMentionIndex((prev) => (prev + 1) % filteredMembers.length);
						return true;
					}
					if (event.key === "ArrowUp") {
						event.preventDefault();
						setMentionIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
						return true;
					}
					if (event.key === "Enter") {
						event.preventDefault();
						insertMention(filteredMembers[mentionIndex]);
						return true;
					}
					if (event.key === "Escape") {
						setMentionQuery(null);
						return true;
					}
				}

				if (event.key === "Enter" && !event.shiftKey) {
					event.preventDefault();
					handleSendMessage();
					return true;
				}
				return false;
			},
		},
		editable: !isUploading,
		onTransaction: () => forceUpdate({}),
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

			if (editingMessageId) {
				await editMessage(editingMessageId, html);
				setEditingMessageId(null);
			} else {
				await sendMessage(text ? html : "", user.id, fileDetails, replyTo?.id);
			}

			editor.commands.clearContent();
			setAttachment(null);
			setReplyTo(null);
		} catch (err) {
			console.error("Failed to send message:", err);
		} finally {
			setIsUploading(false);
		}
	}, [
		editor,
		user?.id,
		isUploading,
		attachment,
		channelName,
		supabase.storage,
		sendMessage,
		replyTo,
		editingMessageId,
		editMessage,
	]);

	// Handle sending a voice message after recording
	const handleVoiceSend = useCallback(
		async (audioBlob: Blob, durationSeconds: number) => {
			if (!user?.id) return;

			try {
				setIsUploading(true);
				const fileName = `voice-${crypto.randomUUID()}.webm`;
				const filePath = `${channelName}/${fileName}`;

				const { error: uploadError } = await supabase.storage
					.from("voice-messages")
					.upload(filePath, audioBlob);

				if (uploadError) throw uploadError;

				const { data } = supabase.storage.from("voice-messages").getPublicUrl(filePath);

				await sendMessage("", user.id, {
					url: data.publicUrl,
					name: fileName,
					type: "audio/webm",
					size: audioBlob.size,
					duration: durationSeconds,
				});

				setIsRecording(false);
			} catch (err) {
				console.error("Failed to send voice message:", err);
			} finally {
				setIsUploading(false);
			}
		},
		[user?.id, channelName, supabase.storage, sendMessage],
	);

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

	const _handleLinkAdd = () => {
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

	const _handleLinkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
			const name =
				[member.profile?.firstName, member.profile?.lastName].filter(Boolean).join(" ") ||
				member.profile?.username ||
				"user";
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

	// Re-bind handleSendMessage to the editor's keydown handler when dependencies change
	useEffect(() => {
		if (!editor) return;
		editor.setOptions({
			editorProps: {
				...editor.options.editorProps,
				handleKeyDown: (_view, event) => {
					if (mentionQuery !== null && filteredMembers.length > 0) {
						if (event.key === "ArrowDown") {
							event.preventDefault();
							setMentionIndex((prev) => (prev + 1) % filteredMembers.length);
							return true;
						}
						if (event.key === "ArrowUp") {
							event.preventDefault();
							setMentionIndex(
								(prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length,
							);
							return true;
						}
						if (event.key === "Enter") {
							event.preventDefault();
							insertMention(filteredMembers[mentionIndex]);
							return true;
						}
						if (event.key === "Escape") {
							setMentionQuery(null);
							return true;
						}
					}

					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();
						handleSendMessage();
						return true;
					}
					return false;
				},
			},
		});
		updateMentionState(editor);
	}, [
		editor,
		filteredMembers,
		handleSendMessage,
		insertMention,
		mentionIndex,
		mentionQuery,
		updateMentionState,
	]);

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
			className="flex-1 flex flex-col bg-transparent min-w-0 h-full overflow-hidden"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* Channel Header */}
			<div className="h-14 px-4 flex items-center justify-between border-b border-[#e5e5ea]/50 bg-transparent shrink-0 z-10 sticky top-0">
				<div className="flex items-center gap-2">
					<span className="text-[#8e8e93] text-[15px]">To:</span>
					<span className="text-[#000] font-medium text-[15px]">{displayName}</span>
				</div>

				<div className="flex items-center gap-1">
					<StartMeetingButton
						channelId={isDM ? undefined : channelName}
						channelName={displayName}
					/>
				</div>
			</div>

			{/* Pinned Messages Bar */}
			{pinnedMessages.length > 0 && (
				<div className="bg-amber-50/50 border-b border-amber-100 px-4 py-2 flex items-start gap-3 flex-shrink-0">
					<Pin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
					<div className="flex-1 min-w-0">
						<p className="text-xs font-medium text-amber-800 mb-0.5">
							{pinnedMessages.length} Pinned Messages
						</p>
						<div className="text-xs text-amber-700/80 truncate">
							{pinnedMessages[pinnedMessages.length - 1].content?.replace(/<[^>]*>/g, "") ||
								"Attachment"}
						</div>
					</div>
					<button
						type="button"
						onClick={() => {
							const msgEl = document.getElementById(
								`msg-${pinnedMessages[pinnedMessages.length - 1].id}`,
							);
							if (msgEl) {
								msgEl.scrollIntoView({ behavior: "smooth", block: "center" });
								msgEl.classList.add("bg-amber-50");
								setTimeout(() => msgEl.classList.remove("bg-amber-50"), 2000);
							}
						}}
						className="text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-100/50 hover:bg-amber-100 px-2 py-1 rounded"
					>
						Jump
					</button>
				</div>
			)}

			{/* Messages Area */}
			<ScrollArea className="flex-1 h-0 overflow-y-auto w-full bg-white">
				<div className="p-4 space-y-1">
					{isLoading ? (
						<div className="flex items-center justify-center py-16">
							<Loader2 className="w-[20px] h-[20px] animate-spin text-[#8e8e93]" />
						</div>
					) : error ? (
						<div className="flex items-center justify-center py-16">
							<p className="text-[13px] text-[#ff3b30]">{error}</p>
						</div>
					) : messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center select-none">
							<p className="text-[12px] font-semibold text-[#8e8e93] tracking-wide">iMessage</p>
							<p className="text-[11px] text-[#8e8e93] font-medium mt-1">
								Today {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
							</p>
						</div>
					) : (
						messages.map((message) => {
							const isDeleted = !!(message.deletedAt || message.deleted_at);
							const isOwnMessage = message.user_id === user?.id || message.userId === user?.id;
							const createdTime = new Date(message.created_at || message.createdAt || Date.now());
							const diffInMinutes = (Date.now() - createdTime.getTime()) / (1000 * 60);
							const canEdit =
								isOwnMessage && !isDeleted && diffInMinutes <= 15 && !message.file_url;
							return (
								<div key={message.id} id={`msg-${message.id}`} className="mb-4">
									<div
										className={`flex w-full group ${isOwnMessage ? "justify-end" : "justify-start"}`}
									>
										{/* Avatar for others */}
										{!isOwnMessage && (
											<div className="flex flex-col justify-end pb-1 mr-2 shrink-0">
												<Avatar className="w-8 h-8 select-none">
													<AvatarImage src={message.users?.imageUrl || undefined} />
													<AvatarFallback className="bg-[#e5e7eb] text-[#8e8e93] text-xs font-medium">
														{getInitials(message)}
													</AvatarFallback>
												</Avatar>
											</div>
										)}

										<div
											className={`flex flex-col max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}
										>
											{/* Name above bubble for others */}
											{!isOwnMessage && (
												<span className="text-[11px] text-[#8e8e93] px-2 mb-[2px] font-medium tracking-wide">
													{getDisplayName(message)}
												</span>
											)}

											{/* Pinned Indicator on top if pinned */}
											{(message.isPinned || message.is_pinned) && (
												<div
													className={`flex items-center gap-1 mb-1 px-1 ${isOwnMessage ? "text-amber-500" : "text-amber-500"}`}
												>
													<Pin className="w-3 h-3 fill-current" />
													<span className="text-[10px] uppercase font-bold tracking-wider">
														Pinned
													</span>
												</div>
											)}

											<div
												className={`flex items-end gap-2 relative ${isOwnMessage ? "justify-end" : "justify-start"}`}
											>
												{/* Left Side Actions (if isOwnMessage) */}
												{isOwnMessage && !isDeleted && (
													<div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0 mb-[2px]">
														<button
															type="button"
															onClick={() => setDeleteConfirmId(message.id)}
															className="p-1.5 rounded-full hover:bg-[#f2f2f7]/80 text-[#8e8e93] hover:text-[#ff3b30] transition-colors focus:outline-none"
															title="Delete message"
														>
															<Trash2 className="w-[15px] h-[15px]" strokeWidth={2} />
														</button>
														{canEdit && (
															<button
																type="button"
																onClick={() => {
																	setEditingMessageId(message.id);
																	editor?.commands.setContent(message.content || "");
																	editor?.commands.focus();
																}}
																className="p-1.5 rounded-full hover:bg-[#f2f2f7]/80 text-[#8e8e93] hover:text-[#007aff] transition-colors focus:outline-none"
																title="Edit message"
															>
																<Edit2 className="w-[15px] h-[15px]" strokeWidth={2} />
															</button>
														)}
														{togglePinMessage && (
															<button
																type="button"
																onClick={() =>
																	togglePinMessage(
																		message.id,
																		!(message.isPinned || message.is_pinned),
																	)
																}
																className={`p-1.5 rounded-full hover:bg-[#f2f2f7]/80 transition-colors focus:outline-none ${message.isPinned || message.is_pinned ? "text-[#ff9f0a]" : "text-[#8e8e93] hover:text-[#ff9f0a]"}`}
																title={
																	message.isPinned || message.is_pinned
																		? "Unpin message"
																		: "Pin message"
																}
															>
																<Pin className="w-[15px] h-[15px]" strokeWidth={2} />
															</button>
														)}
														<button
															type="button"
															onClick={() => setReplyTo(message)}
															className="p-1.5 rounded-full hover:bg-[#f2f2f7]/80 text-[#8e8e93] hover:text-[#007aff] transition-colors focus:outline-none"
															title="Reply"
														>
															<Reply className="w-[15px] h-[15px]" strokeWidth={2} />
														</button>
													</div>
												)}

												<div
													className={`relative px-[16px] py-[8px] text-[15px] break-words leading-[1.4] transition-opacity hover:opacity-[0.95] max-w-full ${
														isDeleted
															? "bg-transparent text-[#8e8e93] italic border border-[#e5e5ea] rounded-2xl"
															: isOwnMessage
																? "bg-[#007aff] text-white rounded-[18px] rounded-br-[4px]"
																: "bg-[#e5e5ea] text-black rounded-[18px] rounded-bl-[4px]"
													}`}
													title={formatMessageTime(
														message.created_at || message.createdAt || new Date().toISOString(),
													)}
												>
													{isDeleted ? (
														<p className="text-[#8e8e93] italic text-[14px] m-0">
															This message was deleted
														</p>
													) : (
														<>
															{/* Quoted parent message */}
															{message.parent && (
																<div
																	className={`mt-1 mb-2 flex items-start gap-2 pl-2 border-l-[3px] rounded-r py-1 pr-2 max-w-sm cursor-pointer transition-colors ${
																		isOwnMessage
																			? "border-white/40 bg-white/10 hover:bg-white/20"
																			: "border-black/20 bg-black/5 hover:bg-black/10"
																	}`}
																	onClick={(e) => {
																		e.stopPropagation();
																		const parentEl = document.getElementById(
																			`msg-${message.parent?.id}`,
																		);
																		if (parentEl) {
																			parentEl.scrollIntoView({
																				behavior: "smooth",
																				block: "center",
																			});
																			parentEl.classList.add(
																				"ring-2",
																				"ring-[#007aff]",
																				"ring-offset-2",
																			);
																			setTimeout(
																				() =>
																					parentEl.classList.remove(
																						"ring-2",
																						"ring-[#007aff]",
																						"ring-offset-2",
																					),
																				2000,
																			);
																		}
																	}}
																	onKeyDown={() => {}}
																	role="button"
																	tabIndex={0}
																>
																	<div className="min-w-0 flex-1">
																		<p
																			className={`text-[11px] font-semibold mb-0.5 ${isOwnMessage ? "text-white/90" : "text-black/60"}`}
																		>
																			{message.parent.user
																				? [
																						message.parent.user.firstName,
																						message.parent.user.lastName,
																					]
																						.filter(Boolean)
																						.join(" ") ||
																					message.parent.user.username ||
																					message.parent.user.email?.split("@")[0]
																				: "Unknown"}
																		</p>
																		{message.parent.content ? (
																			<p
																				className={`text-[12px] line-clamp-2 ${isOwnMessage ? "text-white/80" : "text-black/60"}`}
																			>
																				{message.parent.content
																					.replace(/<[^>]*>/g, "")
																					.slice(0, 150)}
																			</p>
																		) : message.parent.fileName || message.parent.file_name ? (
																			<p
																				className={`text-[12px] flex items-center gap-1 ${isOwnMessage ? "text-white/80" : "text-black/60"}`}
																			>
																				<FileIcon className="w-3 h-3" />
																				{message.parent.fileName || message.parent.file_name}
																			</p>
																		) : null}
																	</div>
																</div>
															)}

															{message.content &&
																(isHtmlContent(message.content) ? (
																	<div
																		className={`mt-1 leading-relaxed text-[15px] prose prose-sm max-w-none [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1 ${
																			isOwnMessage
																				? "[&_a]:text-white [&_a]:underline text-white"
																				: "[&_a]:text-[#007aff] text-black"
																		}`}
																		onClick={(e) => {
																			e.stopPropagation();
																			const target = e.target as HTMLElement;
																			const mentionId = target.getAttribute("data-mention");
																			if (mentionId) {
																				const mentionedMember = members.find(
																					(m) => m.userId === mentionId,
																				);
																				if (mentionedMember?.slug) {
																					router.push(
																						`/dashboard/chat/dm/${encodeURIComponent(mentionedMember.slug)}`,
																					);
																				}
																			}
																		}}
																		onKeyDown={(e) => e.stopPropagation()}
																		onPointerDown={(e) => {
																			// only stop propagation if we are clicking an interactive element like a link
																			if (
																				(e.target as HTMLElement).tagName.toLowerCase() === "a" ||
																				(e.target as HTMLElement).closest("a")
																			) {
																				e.stopPropagation();
																			}
																		}}
																		suppressHydrationWarning
																		// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized with DOMPurify
																		dangerouslySetInnerHTML={{
																			__html:
																				typeof DOMPurify.sanitize === "function"
																					? DOMPurify.sanitize(message.content, {
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
																								"span",
																							],
																							ALLOWED_ATTR: [
																								"href",
																								"target",
																								"rel",
																								"style",
																								"class",
																								"data-mention",
																							],
																						})
																					: "",
																		}}
																	/>
																) : (
																	<p
																		className={`mt-1 leading-relaxed text-[15px] m-0 ${isOwnMessage ? "text-white" : "text-black"}`}
																	>
																		{message.content}
																	</p>
																))}

															{/* Attachments */}
															{message.file_url && (
																<div
																	className="mt-2"
																	onClick={(e) => e.stopPropagation()}
																	onKeyDown={(e) => e.stopPropagation()}
																	onPointerDown={(e) => e.stopPropagation()}
																>
																	{message.file_type?.startsWith("audio/") ? (
																		<VoicePlayer
																			src={message.file_url}
																			duration={message.duration}
																		/>
																	) : message.file_type?.startsWith("image/") ? (
																		<a href={message.file_url} target="_blank" rel="noreferrer">
																			<img
																				src={message.file_url}
																				alt={message.file_name || "Attachment"}
																				className="max-w-[260px] max-h-[260px] rounded-lg border border-black/10 object-contain hover:opacity-90 transition-opacity"
																			/>
																		</a>
																	) : (
																		<a
																			href={message.file_url}
																			target="_blank"
																			rel="noreferrer"
																			className={`flex items-center gap-3 p-3 rounded-lg border max-w-sm transition-colors ${
																				isOwnMessage
																					? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
																					: "bg-black/5 border-black/10 hover:bg-black/10 text-black"
																			}`}
																		>
																			<div
																				className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${isOwnMessage ? "bg-white/20" : "bg-black/10"}`}
																			>
																				<FileIcon className="w-5 h-5" />
																			</div>
																			<div className="min-w-0 flex-1">
																				<p className="text-sm font-medium truncate">
																					{message.file_name || "Attached File"}
																				</p>
																				{message.file_size && (
																					<p
																						className={`text-xs ${isOwnMessage ? "text-white/70" : "text-black/60"}`}
																					>
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

													{/* Edit indicator */}
													{(message.isEdited || message.is_edited) && (
														<span
															className={`block text-[10px] mt-1 text-right italic font-medium ${isOwnMessage ? "text-white/60" : "text-black/40"}`}
														>
															Edited
														</span>
													)}
												</div>

												{/* Right Side Actions (if !isOwnMessage) */}
												{!isOwnMessage && !isDeleted && (
													<div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0 mb-[2px]">
														<button
															type="button"
															onClick={() => setReplyTo(message)}
															className="p-1.5 rounded-full hover:bg-[#f2f2f7]/80 text-[#8e8e93] hover:text-[#007aff] transition-colors focus:outline-none"
															title="Reply"
														>
															<Reply className="w-[15px] h-[15px]" strokeWidth={2} />
														</button>
														{togglePinMessage && (
															<button
																type="button"
																onClick={() =>
																	togglePinMessage(
																		message.id,
																		!(message.isPinned || message.is_pinned),
																	)
																}
																className={`p-1.5 rounded-full hover:bg-[#f2f2f7]/80 transition-colors focus:outline-none ${message.isPinned || message.is_pinned ? "text-[#ff9f0a]" : "text-[#8e8e93] hover:text-[#ff9f0a]"}`}
																title={
																	message.isPinned || message.is_pinned
																		? "Unpin message"
																		: "Pin message"
																}
															>
																<Pin className="w-[15px] h-[15px]" strokeWidth={2} />
															</button>
														)}
													</div>
												)}
											</div>

											{/* Delete Confirmation explicitly placed out of the bubble */}
											{deleteConfirmId === message.id && (
												<div
													className={`mt-2 flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 ${isOwnMessage && "self-end"}`}
												>
													<span className="text-sm text-red-700">Delete this message?</span>
													<button
														type="button"
														onClick={() => {
															deleteMessage(message.id);
															setDeleteConfirmId(null);
														}}
														className="px-2.5 py-1 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
													>
														Delete
													</button>
													<button
														type="button"
														onClick={() => setDeleteConfirmId(null)}
														className="px-2.5 py-1 text-xs font-medium rounded bg-white border border-[#e5e7eb] text-[#404040] hover:bg-[#f5f5f5] transition-colors"
													>
														Cancel
													</button>
												</div>
											)}
										</div>
									</div>
								</div>
							);
						})
					)}
					<div ref={scrollRef} />
				</div>
			</ScrollArea>

			{/* Message Input */}
			<div className="pt-2 pb-4 md:pb-6 px-4 shrink-0 pb-safe z-10 w-full bg-transparent">
				<div className="max-w-4xl mx-auto flex flex-col gap-2">
					{/* Reply Preview Banner */}
					{replyTo && (
						<div className="mb-1 flex items-center gap-2 px-3 py-2 bg-[#f2f2f7] rounded-xl relative">
							<div className="flex-1 min-w-0">
								<p className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wider mb-[2px]">
									Replying to {getDisplayName(replyTo)}
								</p>
								<p className="text-[13px] text-black/80 truncate">
									{replyTo.content
										? replyTo.content.replace(/<[^>]*>/g, "").slice(0, 100)
										: replyTo.file_name || replyTo.fileName || "Attachment"}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setReplyTo(null)}
								className="w-6 h-6 rounded-full bg-[#e5e5ea] flex items-center justify-center text-[#8e8e93] hover:text-[#000] transition-colors shrink-0"
							>
								<X className="w-[14px] h-[14px]" strokeWidth={2.5} />
							</button>
						</div>
					)}
					{editingMessageId && (
						<div className="mb-1 flex items-center justify-between px-3 py-2 bg-[#f2f2f7] rounded-xl relative">
							<div className="flex items-center gap-2">
								<Edit2 className="w-4 h-4 text-[#8e8e93]" />
								<p className="text-[13px] font-medium text-black">Editing message</p>
							</div>
							<button
								type="button"
								onClick={() => {
									setEditingMessageId(null);
									editor?.commands.clearContent();
								}}
								className="w-6 h-6 rounded-full bg-[#e5e5ea] flex items-center justify-center text-[#8e8e93] hover:text-[#000] transition-colors shrink-0"
							>
								<X className="w-[14px] h-[14px]" strokeWidth={2.5} />
							</button>
						</div>
					)}

					<div className="flex items-end gap-[10px] w-full pl-0">
						{/* Attach Button (Left) */}
						<div className="pb-[4px] shrink-0">
							<TooltipProvider delayDuration={0}>
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											onClick={() => fileInputRef.current?.click()}
											className="w-[32px] h-[32px] rounded-full text-[#8e8e93] hover:text-[#000] flex items-center justify-center transition-colors focus:outline-none"
										>
											<PlusCircle className="w-[26px] h-[26px]" strokeWidth={1.5} />
										</button>
									</TooltipTrigger>
									<TooltipContent>Attach Payload</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						{/* Input Pill Container */}
						<div className="group flex-1 bg-white border border-[#c6c6c8] rounded-[22px] focus-within:border-[#8e8e93] transition-colors relative flex flex-col min-h-[40px]">
							{/* Formatting Toolbar (Absolutely positioned above pill, only shown when input has focus) */}
							{editor && !isDM && (
								<div className="absolute bottom-[calc(100%+4px)] left-0 flex items-center gap-0.5 px-3 py-1.5 bg-white border border-[#d1d5db] rounded-full shadow-sm opacity-0 pointer-events-none group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-all translate-y-2 group-focus-within:translate-y-0 z-20">
									{(
										[
											{
												cmd: () => editor.chain().focus().toggleBold().run(),
												active: editor.isActive("bold"),
												icon: Bold,
												label: "Bold",
											},
											{
												cmd: () => editor.chain().focus().toggleItalic().run(),
												active: editor.isActive("italic"),
												icon: Italic,
												label: "Italic",
											},
											{
												cmd: () => editor.chain().focus().toggleUnderline().run(),
												active: editor.isActive("underline"),
												icon: UnderlineIcon,
												label: "Underline",
											},
											{
												cmd: () => editor.chain().focus().toggleBulletList().run(),
												active: editor.isActive("bulletList"),
												icon: List,
												label: "List",
											},
										] as const
									).map(({ cmd, active, icon: Icon, label }) => (
										<button
											key={label}
											type="button"
											onClick={(e) => {
												e.preventDefault();
												cmd();
											}}
											className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${active ? "bg-[#007aff] text-white" : "text-[#8e8e93] hover:bg-[#f2f2f7] hover:text-[#000]"}`}
											title={label}
										>
											<Icon className="w-4 h-4" />
										</button>
									))}
								</div>
							)}

							{/* Editing/Attachment content */}
							<div className="flex flex-col">
								{/* Hidden file input */}
								<input
									type="file"
									ref={fileInputRef}
									hidden
									onChange={handleFileSelect}
									accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
								/>

								{/* Attachment Staging Area */}
								{attachment && (
									<div className="flex items-center gap-3 p-2 m-2 rounded-xl border border-[#e5e5ea] bg-[#f9f9f9] w-max pr-8 relative group">
										<div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
											{attachment.type.startsWith("image/") ? (
												<ImageIcon className="w-[18px] h-[18px] text-[#007aff]" />
											) : (
												<FileIcon className="w-[18px] h-[18px] text-[#007aff]" />
											)}
										</div>
										<div className="flex flex-col">
											<span className="text-[13px] font-medium text-black max-w-[200px] truncate">
												{attachment.name}
											</span>
											<span className="text-[11px] text-[#8e8e93]">
												{(attachment.size / 1024).toFixed(1)} KB
											</span>
										</div>
										<button
											type="button"
											onClick={() => {
												setAttachment(null);
												if (fileInputRef.current) fileInputRef.current.value = "";
											}}
											className="absolute -top-[6px] -right-[6px] w-[20px] h-[20px] bg-white border border-[#e5e5ea] rounded-full flex items-center justify-center text-[#8e8e93] hover:text-[#ff3b30] shadow-sm transition-colors"
										>
											<X className="w-3 h-3" strokeWidth={2.5} />
										</button>
									</div>
								)}

								{/* Tiptap Editor */}
								{editor && (
									<div className="relative flex-1 group" tabIndex={-1}>
										<EditorContent editor={editor} />

										{/* @ Mention Dropdown */}
										{mentionQuery !== null && (
											<div
												ref={mentionRef}
												className="absolute bottom-full left-0 mb-2 w-64 max-h-40 overflow-y-auto bg-white/95 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#e5e5ea] z-50 p-1"
											>
												{filteredMembers.length > 0 ? (
													filteredMembers.map((member, i) => {
														const name =
															[member.profile?.firstName, member.profile?.lastName]
																.filter(Boolean)
																.join(" ") ||
															member.profile?.username ||
															"Unknown";
														const initials = name
															.split(" ")
															.map((n) => n[0])
															.join("")
															.toUpperCase()
															.slice(0, 2);
														return (
															<button
																key={member.id}
																type="button"
																onMouseDown={(e) => {
																	e.preventDefault();
																	insertMention(member);
																}}
																className={`w-full flex items-center gap-3 px-2 py-1.5 text-left rounded-lg transition-colors ${i === mentionIndex ? "bg-[#007aff] text-white" : "text-black hover:bg-[#f2f2f7]"}`}
															>
																<div
																	className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${i === mentionIndex ? "bg-white/20 text-white" : "bg-[#e5e5ea] text-[#8e8e93]"}`}
																>
																	{initials}
																</div>
																<div className="min-w-0">
																	<div className="font-medium text-[13px] truncate">{name}</div>
																</div>
															</button>
														);
													})
												) : (
													<div className="px-3 py-2 text-[13px] text-gray-500 text-center">
														No members found
													</div>
												)}
											</div>
										)}
									</div>
								)}
							</div>

							{/* Right Actions inside the Pill */}
							<div className="absolute right-[5px] bottom-[5px] flex items-center gap-[2px]">
								{isRecording ? (
									<div className="flex items-center gap-2 pr-2">
										<VoiceRecorder
											onSend={handleVoiceSend}
											onCancel={() => setIsRecording(false)}
										/>
									</div>
								) : (
									<>
										{/* Microphone Button (visible when input is empty) */}
										{!editor?.getText().trim() && !attachment && !isUploading && (
											<button
												type="button"
												onClick={() => setIsRecording(true)}
												className="w-[28px] h-[28px] rounded-full text-[#8e8e93] hover:text-[#000] flex items-center justify-center transition-colors focus:outline-none"
											>
												<Mic className="w-[18px] h-[18px]" strokeWidth={1.5} />
											</button>
										)}

										{/* Emoji Picker */}
										<div className="relative" ref={emojiRef}>
											<button
												type="button"
												onClick={() => setShowEmoji((prev) => !prev)}
												className={`w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors focus:outline-none ${showEmoji ? "text-[#007aff]" : "text-[#8e8e93] hover:text-[#000]"}`}
											>
												<Smile className="w-[18px] h-[18px]" strokeWidth={1.5} />
											</button>
											{showEmoji && (
												<div className="absolute bottom-[120%] right-[-10px] z-50 shadow-xl rounded-xl overflow-hidden border border-[#e5e5ea]">
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

										{/* Send Button (visible when not empty) */}
										{(editor?.getText().trim() || attachment) && !isUploading ? (
											<button
												type="button"
												onClick={handleSendMessage}
												className="w-[28px] h-[28px] rounded-full bg-[#007aff] hover:bg-[#0062cc] text-white flex items-center justify-center shadow-sm transition-transform active:scale-95 focus:outline-none ml-[2px]"
											>
												{/* Simple up-arrow style for sending */}
												<svg
													width="15"
													height="15"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2.5"
													strokeLinecap="round"
													strokeLinejoin="round"
													aria-hidden="true"
												>
													<path d="M12 19V5M5 12l7-7 7 7" />
												</svg>
											</button>
										) : isUploading ? (
											<div className="w-[28px] h-[28px] rounded-full bg-[#007aff]/70 text-white flex items-center justify-center ml-[2px]">
												<Loader2 className="w-3.5 h-3.5 animate-spin" />
											</div>
										) : null}
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
