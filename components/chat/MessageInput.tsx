"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
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
import { useCallback, useEffect, useRef, useState } from "react";

interface MessageInputProps {
	onSendMessage: (content: string) => Promise<void>;
	disabled?: boolean;
	channelName?: string;
}

export function MessageInput({ onSendMessage, disabled, channelName }: MessageInputProps) {
	const [isSending, setIsSending] = useState(false);
	const [showEmoji, setShowEmoji] = useState(false);
	const [, forceUpdate] = useState({});
	const emojiRef = useRef<HTMLDivElement>(null);

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
		],
		editorProps: {
			attributes: {
				class:
					"prose prose-sm max-w-none focus:outline-none min-h-[40px] max-h-[160px] overflow-y-auto px-3 py-2 text-sm text-[#013220] [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1",
			},
			handleKeyDown: (_view, event) => {
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

	// Re-bind handleSend to the editor's keydown handler when dependencies change
	useEffect(() => {
		if (!editor) return;
		editor.setOptions({
			editorProps: {
				...editor.options.editorProps,
				handleKeyDown: (_view, event) => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();
						handleSend();
						return true;
					}
					return false;
				},
			},
		});
	}, [editor, handleSend]);

	// Close emoji picker when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
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
				<EditorContent editor={editor} />

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
							className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
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
