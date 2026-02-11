"use client";

import {
	File,
	FileText,
	Folder,
	FolderOpen,
	Image,
	MoreHorizontal,
	Search,
	Upload,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FileItem {
	id: string;
	name: string;
	type: "folder" | "image" | "document" | "file";
	size?: string;
	modified: string;
	uploadedBy: {
		name: string;
		avatar?: string;
	};
}

const files: FileItem[] = [
	{
		id: "1",
		name: "Project Assets",
		type: "folder",
		modified: "Today, 10:30 AM",
		uploadedBy: { name: "Alex Morgan", avatar: "/avatars/alex.png" },
	},
	{
		id: "2",
		name: "Dashboard_V3_Draft.fig",
		type: "file",
		size: "4.2 MB",
		modified: "Today, 11:15 AM",
		uploadedBy: { name: "Sarah Chen", avatar: "/avatars/sarah.png" },
	},
	{
		id: "3",
		name: "TeamUP_Logo.png",
		type: "image",
		size: "256 KB",
		modified: "Yesterday, 3:45 PM",
		uploadedBy: { name: "Alex Morgan", avatar: "/avatars/alex.png" },
	},
	{
		id: "4",
		name: "Product_Requirements.pdf",
		type: "document",
		size: "1.8 MB",
		modified: "Feb 10, 2:30 PM",
		uploadedBy: { name: "Sarah Chen", avatar: "/avatars/sarah.png" },
	},
];

export function FilesArea() {
	const [searchQuery, setSearchQuery] = useState("");

	const getFileIcon = (type: FileItem["type"]) => {
		switch (type) {
			case "folder":
				return <FolderOpen className="w-5 h-5 text-amber-500" />;
			case "image":
				return <Image className="w-5 h-5 text-blue-500" />;
			case "document":
				return <FileText className="w-5 h-5 text-red-500" />;
			default:
				return <File className="w-5 h-5 text-slate-500" />;
		}
	};

	return (
		<div
			className="flex-1 flex flex-col bg-white min-w-0"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* Files Header */}
			<div className="h-14 px-4 flex items-center justify-between border-b border-[#e5e7eb] shrink-0">
				<div className="flex items-center gap-3">
					<span className="text-[#202020] font-medium text-lg flex items-center gap-2">
						<Folder className="w-5 h-5 text-[#0B6E4F]" />
						Files
					</span>
				</div>

				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search files..."
							className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]/20 focus:border-[#0B6E4F]"
						/>
					</div>

					<TooltipProvider delayDuration={0}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button size="sm" className="gap-2 bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white">
									<Upload className="w-4 h-4" />
									Upload
								</Button>
							</TooltipTrigger>
							<TooltipContent>Upload files</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			{/* Files List */}
			<ScrollArea className="flex-1">
				<div className="p-4">
					{/* Table Header */}
					<div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
						<div className="col-span-5">Name</div>
						<div className="col-span-2">Size</div>
						<div className="col-span-3">Modified</div>
						<div className="col-span-2">Uploaded by</div>
					</div>

					{/* File Items */}
					<div className="mt-2 space-y-1">
						{files.map((file) => (
							<div
								key={file.id}
								className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
							>
								<div className="col-span-5 flex items-center gap-3 min-w-0">
									<div className="shrink-0">{getFileIcon(file.type)}</div>
									<span className="text-sm font-medium text-slate-900 truncate">{file.name}</span>
								</div>
								<div className="col-span-2 flex items-center text-sm text-slate-500">
									{file.size || "—"}
								</div>
								<div className="col-span-3 flex items-center text-sm text-slate-500">
									{file.modified}
								</div>
								<div className="col-span-2 flex items-center justify-between gap-2">
									<div className="flex items-center gap-2 min-w-0">
										<Avatar className="w-5 h-5">
											<AvatarImage src={file.uploadedBy.avatar} />
											<AvatarFallback className="text-[8px] bg-slate-100">
												{file.uploadedBy.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<span className="text-sm text-slate-600 truncate">{file.uploadedBy.name}</span>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<MoreHorizontal className="w-4 h-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
