"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
	Activity,
	AlignLeft,
	Bold,
	Calendar as CalendarIcon,
	CheckCircle2,
	CheckSquare,
	ChevronDown,
	Eye,
	HelpCircle,
	Image as ImageIcon,
	Italic,
	Link2,
	List,
	MessageSquare,
	MoreHorizontal,
	Paperclip,
	Plus,
	Smile,
	Tag,
	Type,
	Users,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";

interface TaskDetailModalProps {
	task: Task | null;
	isOpen: boolean;
	onClose: () => void;
	columnName?: string;
}

export default function TaskDetailModal({
	task,
	isOpen,
	onClose,
	columnName = "Today",
}: TaskDetailModalProps) {
	const [comment, setComment] = useState("");

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit,
			Underline,
			Link.configure({
				openOnClick: false,
			}),
			Placeholder.configure({
				placeholder:
					"Use Markdown shortcuts to format your page as you type, like * for lists, # for headers, and --- for a horizontal rule.",
			}),
		],
		content: task?.description || "",
		editorProps: {
			attributes: {
				class:
					"prose prose-invert max-w-none focus:outline-none min-h-[280px] p-6 text-[15px] text-white/80 leading-relaxed",
			},
		},
	});

	useEffect(() => {
		if (editor && task?.description) {
			editor.commands.setContent(task.description);
		}
	}, [task, editor]);

	if (!isOpen || !task) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
				{/* Overlay */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				/>

				{/* Modal Content */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					className="relative w-full max-w-[1000px] h-[85vh] bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col text-white"
				>
					{/* Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
						<div className="flex items-center gap-2">
							<button className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2A1212] hover:bg-[#3A1818] transition-colors border border-white/5 text-[#FF6B6B] text-[13px] font-bold">
								{columnName}
								<ChevronDown className="w-4 h-4" />
							</button>
						</div>
						<div className="flex items-center gap-4 text-white/40">
							<button className="hover:text-white transition-colors p-1">
								<ImageIcon className="w-5 h-5" />
							</button>
							<button className="hover:text-white transition-colors p-1">
								<Eye className="w-5 h-5" />
							</button>
							<button className="hover:text-white transition-colors p-1">
								<MoreHorizontal className="w-5 h-5" />
							</button>
							<button onClick={onClose} className="hover:text-white transition-colors p-1 ml-2">
								<X className="w-6 h-6" />
							</button>
						</div>
					</div>

					{/* Main Body */}
					<div className="flex flex-1 min-h-0 overflow-hidden">
						{/* Left Content */}
						<div className="flex-1 overflow-y-auto custom-scrollbar p-8 pr-4">
							<div className="flex items-start gap-4 mb-8">
								<CheckCircle2 className="w-7 h-7 text-emerald-500 mt-1" />
								<h1 className="text-3xl font-black tracking-tight">{task.title}</h1>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-wrap gap-2 mb-10">
								<ActionButton icon={<Plus className="w-4 h-4" />} label="Add" />
								<ActionButton icon={<Tag className="w-4 h-4" />} label="Labels" />
								<ActionButton icon={<CalendarIcon className="w-4 h-4" />} label="Dates" />
								<ActionButton icon={<CheckSquare className="w-4 h-4" />} label="Checklist" />
								<ActionButton icon={<Users className="w-4 h-4" />} label="Members" />
							</div>

							{/* Description Section */}
							<div className="mb-10">
								<div className="flex items-center gap-3 mb-4 text-white/60">
									<AlignLeft className="w-5 h-5" />
									<h2 className="text-[16px] font-bold">Description</h2>
								</div>

								<div className="bg-[#1A1A1A] border border-white/10 rounded-lg overflow-hidden">
									{/* Editor Toolbar */}
									<div className="flex items-center gap-1 px-4 py-2.5 border-b border-white/5 bg-white/5">
										<ToolbarBtn
											icon={<Type className="w-4 h-4" />}
											hasArrow
											active={editor?.isActive("heading")}
										/>
										<div className="w-px h-4 bg-white/10 mx-1" />
										<ToolbarBtn
											icon={<Bold className="w-4 h-4" />}
											active={editor?.isActive("bold")}
											onClick={() => editor?.chain().focus().toggleBold().run()}
										/>
										<ToolbarBtn
											icon={<Italic className="w-4 h-4" />}
											active={editor?.isActive("italic")}
											onClick={() => editor?.chain().focus().toggleItalic().run()}
										/>
										<ToolbarBtn icon={<MoreHorizontal className="w-4 h-4" />} />
										<div className="w-px h-4 bg-white/10 mx-1" />
										<ToolbarBtn
											icon={<List className="w-4 h-4" />}
											hasArrow
											active={editor?.isActive("bulletList")}
											onClick={() => editor?.chain().focus().toggleBulletList().run()}
										/>
										<div className="w-px h-4 bg-white/10 mx-1" />
										<ToolbarBtn icon={<Link2 className="w-4 h-4" />} />
										<ToolbarBtn icon={<ImageIcon className="w-4 h-4" />} />
										<ToolbarBtn icon={<Plus className="w-4 h-4" />} hasArrow />
										<div className="w-px h-4 bg-white/10 mx-1" />
										<ToolbarBtn
											icon={
												<div className="w-4 h-4 rounded-full border border-white/40 bg-gradient-to-br from-blue-400 via-purple-400 to-orange-400" />
											}
										/>
										<div className="ml-auto flex items-center gap-2">
											<ToolbarBtn icon={<Paperclip className="w-4 h-4" />} />
											<ToolbarBtn icon={<span className="text-[10px] font-bold">M↓</span>} />
											<ToolbarBtn icon={<HelpCircle className="w-4 h-4" />} />
										</div>
									</div>

									{/* Editor Content */}
									<EditorContent editor={editor} />
								</div>

								<div className="flex items-center justify-between mt-4">
									<div className="flex items-center gap-3">
										<button className="px-5 py-2 bg-[#5294E2] hover:bg-[#4A85CC] text-white rounded font-bold text-[14px] transition-colors">
											Save
										</button>
										<button className="text-white/40 hover:text-white font-bold text-[14px] transition-colors">
											Cancel
										</button>
									</div>
									<button className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-[12px] font-bold text-white/60 transition-colors border border-white/5">
										Formatting help
									</button>
								</div>
							</div>
						</div>

						{/* Right Sidebar */}
						<div className="w-[380px] border-l border-white/5 bg-[#0D0D0D] overflow-y-auto custom-scrollbar p-6">
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-3 text-white/80">
									<MessageSquare className="w-5 h-5" />
									<h2 className="text-[15px] font-bold">Comments and activity</h2>
								</div>
								<button className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-[12px] font-bold text-white/80 transition-colors border border-white/5">
									Show details
								</button>
							</div>

							{/* Comment Input */}
							<div className="mb-8">
								<input
									type="text"
									placeholder="Write a comment..."
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-white/20 transition-colors"
								/>
							</div>

							{/* Activity Feed */}
							<div className="space-y-8">
								{/* Comment Item */}
								<div className="flex gap-4">
									<div className="w-9 h-9 rounded-full bg-[#E67E22] flex items-center justify-center text-[14px] font-black shrink-0">
										R
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-bold text-[14px]">ravikrishnaj25</span>
											<span className="text-blue-400 text-[12px] underline cursor-pointer">
												just now
											</span>
										</div>
										<div className="bg-[#1A1A1A] rounded-lg p-3 text-[14px] text-white/80 border border-white/5 shadow-sm">
											HI
										</div>
										<div className="flex items-center gap-3 mt-2 text-white/40 text-[12px]">
											<button className="hover:text-white flex items-center gap-1.5">
												<Smile className="w-3.5 h-3.5" />
											</button>
											<span>•</span>
											<button className="hover:text-white">Edit</button>
											<span>•</span>
											<button className="hover:text-white">Delete</button>
										</div>
									</div>
								</div>

								{/* System Activity */}
								<div className="flex gap-4">
									<div className="w-9 h-9 rounded-full bg-[#E67E22] flex items-center justify-center text-[14px] font-black shrink-0">
										R
									</div>
									<div className="flex-1 pt-1">
										<p className="text-[14px]">
											<span className="font-bold">ravikrishnaj25</span> added this card to{" "}
											<span className="underline cursor-pointer">{columnName}</span>
										</p>
										<p className="text-blue-400 text-[12px] underline cursor-pointer mt-1">
											Apr 30, 2026, 1:04 PM
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
	return (
		<button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[14px] font-bold text-white/80 transition-colors">
			{icon}
			{label}
		</button>
	);
}

function ToolbarBtn({
	icon,
	hasArrow,
	active,
	onClick,
}: {
	icon: React.ReactNode;
	hasArrow?: boolean;
	active?: boolean;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-1 p-1.5 rounded transition-colors",
				active ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/60",
			)}
		>
			{icon}
			{hasArrow && <ChevronDown className="w-3 h-3" />}
		</button>
	);
}
