"use client";

import { Node as TiptapNode } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	AtSign,
	Bold,
	Italic,
	Link2,
	List,
	ListOrdered,
	Mic,
	PlusCircle,
	Send,
	Smile,
	Strikethrough,
	Underline as UnderlineIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";

const EmojiPicker = dynamic(() => import("./EmojiPicker").then((mod) => mod.EmojiPicker), {
	ssr: false,
});

const MentionNode = TiptapNode.create({
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
			{ "data-mention": node.attrs.id, class: "mention font-semibold text-[#0B6E4F]" },
			`@${node.attrs.label}`,
		];
	},
});

interface MessageInputProps {
	onSendMessage: (content: string) => Promise<void>;
	disabled?: boolean;
	channelName?: string;
}

export function MessageInput({ onSendMessage, disabled, channelName }: MessageInputProps) {
	const [isSending, setIsSending] = useState(false);
	const [showEmoji, setShowEmoji] = useState(false);
	const [mentionQuery, setMentionQuery] = useState<string | null>(null);
	const [mentionIndex, setMentionIndex] = useState(0);
	const mentionRangeRef = useRef<{ from: number; to: number } | null>(null);
	const mentionRef = useRef<HTMLDivElement>(null);
	const [, forceUpdate] = useState({});
	const emojiRef = useRef<HTMLDivElement>(null);

	const { members } = useWorkspaceMembers();

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

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: false,
				codeBlock: false,
				horizontalRule: false,
				blockquote: false,
			}),
			Placeholder.configure({
				placeholder: channelName ? `Message #${channelName}` : "Type a message...",
			}),
			Underline,
			TextAlign.configure({ types: ["paragraph"] }),
			Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-500 underline" } }),
			MentionNode,
		],
		onUpdate: ({ editor: ed }) => {
			const { from } = ed.state.selection;
			const textBefore = ed.state.doc.textBetween(Math.max(0, from - 50), from, "\n");
			const mentionMatch = textBefore.match(/@([\w-]*)$/);
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
					"prose prose-sm max-w-none focus:outline-none min-h-[40px] max-h-[160px] overflow-y-auto px-3 py-2 text-sm text-[#013220] [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1",
			},
			handleKeyDown: (_view, event) => {
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
					if (event.key === "Enter" || event.key === "Tab") {
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
					handleSend();
					return true;
				}
				return false;
			},
		},
		editable: !disabled,
		onTransaction: () => forceUpdate({}),
	});

	const handleSend = useCallback(async () => {
		if (!editor || isSending || disabled) return;

		const html = editor.getHTML();
		// Check if editor has actual content (not just empty paragraphs)
		const text = editor.getText().trim();
		if (!text) return;

		try {
			setIsSending(true);
			await onSendMessage(html);
			editor.commands.clearContent();
		} catch (error) {
			console.error("Failed to send message", error);
		} finally {
			setIsSending(false);
		}
	}, [editor, isSending, disabled, onSendMessage]);

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

	// Re-bind handleSend to the editor's keydown handler when dependencies change
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
						if (event.key === "Enter" || event.key === "Tab") {
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
						handleSend();
						return true;
					}
					return false;
				},
			},
		});
	}, [editor, handleSend, mentionQuery, filteredMembers, mentionIndex, insertMention]);

	// Handle @ mention keyboard navigation tracking
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

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (mentionRef.current && !mentionRef.current.contains(e.target as globalThis.Node)) {
				setMentionQuery(null);
			}
		};
		if (mentionQuery !== null) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [mentionQuery]);

	// Close emoji picker when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (emojiRef.current && !emojiRef.current.contains(e.target as globalThis.Node)) {
				setShowEmoji(false);
			}
		};
		if (showEmoji) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showEmoji]);

	// biome-ignore lint/suspicious/noExplicitAny: emoji-mart types aren't exposed
	const handleEmojiSelect = (emoji: any) => {
		editor?.chain().focus().insertContent(emoji.native).run();
		setShowEmoji(false);
	};

	const handleLinkAdd = () => {
		if (!editor) return;
		const url = window.prompt("Enter URL:");
		if (url) {
			editor.chain().focus().setLink({ href: url }).run();
		}
	};

	if (!editor) return null;

	const ToolbarButton = ({
		onClick,
		isActive = false,
		children,
		title,
	}: {
		onClick: () => void;
		isActive?: boolean;
		children: React.ReactNode;
		title: string;
	}) => (
		<button
			type="button"
			onClick={onClick}
			title={title}
			className={`p-1 rounded transition-colors ${
				isActive
					? "bg-[#0B6E4F]/20 text-[#0B6E4F] shadow-sm"
					: "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
			}`}
		>
			{children}
		</button>
	);

	return (
		<div className="p-4 border-t border-gray-100 bg-white">
			<div className="max-w-4xl mx-auto bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-[#50C878]/30 focus-within:border-[#50C878] transition-all overflow-hidden">
				{/* Formatting Toolbar */}
				<div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-gray-200/60">
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleBold().run()}
						isActive={editor.isActive("bold")}
						title="Bold (Ctrl+B)"
					>
						<Bold className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleItalic().run()}
						isActive={editor.isActive("italic")}
						title="Italic (Ctrl+I)"
					>
						<Italic className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						isActive={editor.isActive("underline")}
						title="Underline (Ctrl+U)"
					>
						<UnderlineIcon className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleStrike().run()}
						isActive={editor.isActive("strike")}
						title="Strikethrough"
					>
						<Strikethrough className="w-4 h-4" />
					</ToolbarButton>

					<div className="w-px h-4 bg-gray-200 mx-1" />

					<ToolbarButton onClick={handleLinkAdd} isActive={editor.isActive("link")} title="Link">
						<Link2 className="w-4 h-4" />
					</ToolbarButton>

					<div className="w-px h-4 bg-gray-200 mx-1" />

					<ToolbarButton
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						isActive={editor.isActive("bulletList")}
						title="Bullet list"
					>
						<List className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						isActive={editor.isActive("orderedList")}
						title="Numbered list"
					>
						<ListOrdered className="w-4 h-4" />
					</ToolbarButton>

					<div className="w-px h-4 bg-gray-200 mx-1" />

					<ToolbarButton
						onClick={() => editor.chain().focus().setTextAlign("left").run()}
						isActive={editor.isActive({ textAlign: "left" })}
						title="Align left"
					>
						<AlignLeft className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().setTextAlign("center").run()}
						isActive={editor.isActive({ textAlign: "center" })}
						title="Align center"
					>
						<AlignCenter className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().setTextAlign("right").run()}
						isActive={editor.isActive({ textAlign: "right" })}
						title="Align right"
					>
						<AlignRight className="w-4 h-4" />
					</ToolbarButton>
				</div>

				{/* Editor Area */}
				<div className="relative flex-1 group" tabIndex={-1}>
					<EditorContent editor={editor} />
					{/* @ Mention Dropdown */}
					{mentionQuery !== null && filteredMembers.length > 0 && (
						<div
							ref={mentionRef}
							className="absolute bottom-full left-0 mb-2 w-64 max-h-40 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 z-[60] p-1"
						>
							{filteredMembers.map((member, i) => {
								const name =
									[member.profile?.firstName, member.profile?.lastName].filter(Boolean).join(" ") ||
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
										className={`w-full flex items-center gap-3 px-2 py-1.5 text-left rounded-lg transition-colors ${
											i === mentionIndex
												? "bg-[#0B6E4F] text-white"
												: "text-gray-900 hover:bg-gray-100"
										}`}
									>
										<div
											className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${
												i === mentionIndex ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
											}`}
										>
											{initials}
										</div>
										<div className="min-w-0">
											<div className="font-medium text-[13px] truncate">{name}</div>
										</div>
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* Bottom Bar */}
				<div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-200/60">
					<div className="flex items-center gap-1">
						<button
							type="button"
							className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
							title="Attach"
							disabled={disabled}
						>
							<PlusCircle className="w-4 h-4" />
						</button>
						<button
							type="button"
							onClick={() => editor?.chain().focus().insertContent("@").run()}
							className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
							title="Mention"
							disabled={disabled}
						>
							<AtSign className="w-4 h-4" />
						</button>
						<div className="relative" ref={emojiRef}>
							<button
								type="button"
								onClick={() => setShowEmoji((prev) => !prev)}
								className={`p-1.5 rounded-lg transition-colors ${
									showEmoji
										? "text-[#0B6E4F] bg-emerald-50"
										: "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
								}`}
								title="Emoji"
								disabled={disabled}
							>
								<Smile className="w-4 h-4" />
							</button>
							{showEmoji && (
								<div className="absolute bottom-10 left-0 z-50 shadow-xl rounded-xl overflow-hidden">
									<EmojiPicker onSelect={handleEmojiSelect} />
								</div>
							)}
						</div>
						<button
							type="button"
							className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
							title="Voice"
							disabled={disabled}
						>
							<Mic className="w-4 h-4" />
						</button>
					</div>

					<button
						type="button"
						onClick={handleSend}
						disabled={!editor.getText().trim() || isSending || disabled}
						className="p-2 bg-[#0B6E4F] text-white rounded-xl hover:bg-[#013220] transition-colors disabled:opacity-40 disabled:hover:bg-[#0B6E4F]"
						title="Send (Enter)"
					>
						<Send className="w-4 h-4" />
					</button>
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-2 mt-1.5">
				<p className="text-[11px] text-gray-400 text-right">
					<span className="font-semibold">Enter</span> to send,{" "}
					<span className="font-semibold">Shift + Enter</span> for new line
				</p>
			</div>
		</div>
	);
}
