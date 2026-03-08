"use client";

import {
	ChevronDown,
	Download,
	ExternalLink,
	File,
	FileAudio,
	FileImage,
	FileSpreadsheet,
	FileText,
	FileVideo,
	Filter,
	Loader2,
	Plus,
	Search,
	SlidersHorizontal,
	X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { type FileMessage, useFilesByWorkspace } from "@/hooks/api/use-files";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceStore } from "@/stores/workspace-store";

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */

const FILE_TYPE_CATEGORIES = {
	Images: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"],
	Documents: [
		"application/pdf",
		"text/plain",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	],
	Spreadsheets: [
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"text/csv",
	],
	Audio: ["audio/webm", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4"],
	Video: ["video/mp4", "video/webm", "video/ogg"],
} as const;

function getFileCategory(mimeType: string): string {
	for (const [category, types] of Object.entries(FILE_TYPE_CATEGORIES)) {
		if ((types as readonly string[]).includes(mimeType)) return category;
	}
	return "Other";
}

function getFileIcon(mimeType: string) {
	const category = getFileCategory(mimeType);
	switch (category) {
		case "Images":
			return { icon: FileImage, color: "text-emerald-600", bg: "bg-emerald-100" };
		case "Documents":
			return { icon: FileText, color: "text-blue-600", bg: "bg-blue-100" };
		case "Spreadsheets":
			return { icon: FileSpreadsheet, color: "text-green-600", bg: "bg-green-100" };
		case "Audio":
			return { icon: FileAudio, color: "text-purple-600", bg: "bg-purple-100" };
		case "Video":
			return { icon: FileVideo, color: "text-red-600", bg: "bg-red-100" };
		default:
			return { icon: File, color: "text-slate-600", bg: "bg-slate-100" };
	}
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays}d ago`;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
	});
}

function getUserDisplayName(user: FileMessage["user"]): string {
	if (user.firstName || user.lastName) {
		return [user.firstName, user.lastName].filter(Boolean).join(" ");
	}
	return user.username || user.email.split("@")[0];
}

function getUserInitial(user: FileMessage["user"]): string {
	if (user.firstName) return user.firstName[0].toUpperCase();
	if (user.username) return user.username[0].toUpperCase();
	return user.email[0].toUpperCase();
}

const FILTER_TABS = ["All", "Created by you", "Shared with you"];
const TYPE_FILTERS = [
	"All types",
	"Images",
	"Documents",
	"Spreadsheets",
	"Audio",
	"Video",
	"Other",
];

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

export function FilesArea() {
	const [activeFilter, setActiveFilter] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState("All types");
	const [showTypeDropdown, setShowTypeDropdown] = useState(false);
	const [showBanner, setShowBanner] = useState(true);

	const { token, user } = useSupabaseAuth();
	const { activeWorkspaceId } = useWorkspaceStore();
	const { data: files, isLoading, error } = useFilesByWorkspace(activeWorkspaceId || "", token);

	const currentUserId = user?.id;

	const filteredFiles = useMemo(() => {
		if (!files) return [];
		return files.filter((file) => {
			// Search filter
			if (searchQuery && !file.fileName.toLowerCase().includes(searchQuery.toLowerCase())) {
				return false;
			}
			// Tab filter
			if (activeFilter === "Created by you" && file.user.supabaseId !== currentUserId) {
				return false;
			}
			if (activeFilter === "Shared with you" && file.user.supabaseId === currentUserId) {
				return false;
			}
			// Type filter
			if (typeFilter !== "All types" && getFileCategory(file.fileType) !== typeFilter) {
				return false;
			}
			return true;
		});
	}, [files, searchQuery, activeFilter, typeFilter, currentUserId]);

	const typeCount = useMemo(() => {
		if (!files) return 0;
		const categories = new Set(files.map((f) => getFileCategory(f.fileType)));
		return categories.size;
	}, [files]);

	const handleOpenFile = (fileUrl: string) => {
		window.open(fileUrl, "_blank", "noopener,noreferrer");
	};

	const handleDownload = async (fileUrl: string, fileName: string) => {
		try {
			const response = await fetch(fileUrl);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch {
			// Fallback: open in new tab
			window.open(fileUrl, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<div
			className="flex-1 flex flex-col bg-white min-w-0 min-h-0 overflow-hidden"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* ──── Header ──── */}
			<div className="border-b border-slate-200 shrink-0">
				<div className="max-w-5xl mx-auto w-full px-6 pt-5 pb-4">
					<div className="flex items-center justify-between mb-5">
						<h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
							<FileText className="w-5 h-5 text-[#0B6E4F]" />
							Files
							{files && (
								<span className="text-sm font-normal text-slate-400">({files.length})</span>
							)}
						</h1>
					</div>

					{/* Filter Tabs + Controls */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{FILTER_TABS.map((tab) => (
								<button
									key={tab}
									type="button"
									onClick={() => setActiveFilter(tab)}
									className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-full border transition-all ${
										activeFilter === tab
											? "bg-[#0B6E4F] text-white border-[#0B6E4F]"
											: "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
									}`}
								>
									{tab}
								</button>
							))}
						</div>

						<div className="flex items-center gap-2.5">
							{/* Search */}
							<div className="relative">
								<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search files..."
									className="w-52 pl-8 pr-3 py-1.5 text-[13px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]/20 focus:border-[#0B6E4F] placeholder:text-slate-400 transition-all"
								/>
							</div>

							{/* Types Filter */}
							<div className="relative">
								<button
									type="button"
									onClick={() => setShowTypeDropdown(!showTypeDropdown)}
									className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold bg-[#0B6E4F] text-white rounded-lg hover:bg-[#095C42] transition-colors"
								>
									<Filter className="w-3.5 h-3.5" />
									{typeFilter === "All types" ? `${typeCount} Types` : typeFilter}
									<ChevronDown className="w-3 h-3" />
								</button>
								{showTypeDropdown && (
									<div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
										{TYPE_FILTERS.map((type) => (
											<button
												key={type}
												type="button"
												onClick={() => {
													setTypeFilter(type);
													setShowTypeDropdown(false);
												}}
												className={`w-full text-left px-3 py-2 text-[13px] hover:bg-slate-50 transition-colors ${
													typeFilter === type
														? "text-[#0B6E4F] font-semibold bg-slate-50"
														: "text-slate-600"
												}`}
											>
												{type}
											</button>
										))}
									</div>
								)}
							</div>

							{/* Settings */}
							<button
								type="button"
								className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
							>
								<SlidersHorizontal className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* ──── File List ──── */}
			<div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/30">
				<div className="max-w-5xl mx-auto w-full px-6 py-6">
					{/* Banner */}
					{showBanner && (
						<div className="mb-6 rounded-2xl p-6 relative overflow-hidden border border-slate-200 bg-white shadow-sm animate-[fadeInUp_0.35s_ease-out]">
							<button
								type="button"
								onClick={() => setShowBanner(false)}
								className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
							>
								<X className="w-4 h-4" />
							</button>

							<div className="flex items-start justify-between relative z-10">
								<div className="max-w-lg">
									<h2 className="text-xl font-bold text-slate-900 mb-2">
										All your shared files in one place
									</h2>
									<p className="text-[13px] text-slate-500 mb-6 leading-relaxed font-medium">
										Every file shared across your channels and DMs appears here. Click any file to
										view or download it.
									</p>
									<div className="flex items-center gap-3">
										<button
											type="button"
											className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[13px] font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
										>
											<Plus className="w-4 h-4" /> New Canvas
										</button>
										<button
											type="button"
											className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[13px] font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
										>
											<Plus className="w-4 h-4" /> New List
										</button>
									</div>
								</div>

								<div className="hidden md:block relative w-64 h-40 -my-6 mr-4 opacity-100 select-none pointer-events-none">
									<div className="absolute top-5 right-0 w-60 h-48 bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-4 overflow-hidden">
										<div className="flex items-center gap-3 mb-4">
											<div className="w-8 h-8 bg-white rounded-lg border border-slate-200 shadow-sm" />
											<div className="h-2.5 w-24 bg-slate-200 rounded-full" />
										</div>
										<div className="space-y-3">
											<div className="w-full h-2 bg-slate-200 rounded-full" />
											<div className="w-3/4 h-2 bg-slate-200 rounded-full" />
											<div className="w-full h-8 mt-2 bg-white rounded-lg border border-slate-200" />
											<div className="w-full h-8 bg-white rounded-lg border border-slate-200" />
										</div>
									</div>
									<div className="absolute top-12 -left-4 w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-md flex items-center justify-center text-[#ffb020]">
										<FileText className="w-6 h-6" />
									</div>
									<div className="absolute bottom-4 right-8 w-10 h-10 bg-white rounded-lg border border-slate-200 shadow-md flex items-center justify-center text-[#e01e5a]">
										<FileText className="w-5 h-5" />
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Loading */}
					{isLoading && (
						<div className="flex flex-col items-center justify-center py-20 text-center">
							<Loader2 className="w-8 h-8 text-[#0B6E4F] animate-spin mb-4" />
							<p className="text-sm font-semibold text-slate-600">Loading files...</p>
						</div>
					)}

					{/* Error */}
					{error && !isLoading && (
						<div className="flex flex-col items-center justify-center py-20 text-center">
							<div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
								<FileText className="w-7 h-7 text-red-400" />
							</div>
							<p className="text-sm font-semibold text-slate-600 mb-1">Failed to load files</p>
							<p className="text-xs text-slate-400">Please try refreshing the page</p>
						</div>
					)}

					{/* File rows */}
					{!isLoading && !error && (
						<div className="divide-y divide-slate-100">
							{filteredFiles.map((file) => {
								const { icon: FileIcon, color, bg } = getFileIcon(file.fileType);
								const isImage = getFileCategory(file.fileType) === "Images";
								const displayName = getUserDisplayName(file.user);
								const initial = getUserInitial(file.user);
								const isOwn = file.user.supabaseId === currentUserId;

								return (
									<div
										key={file.id}
										role="button"
										tabIndex={0}
										className="flex items-center px-6 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group"
										onClick={() => handleOpenFile(file.fileUrl)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") handleOpenFile(file.fileUrl);
										}}
									>
										{/* File Icon / Thumbnail */}
										<div className="shrink-0 mr-4">
											{isImage ? (
												<div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 relative">
													<Image
														src={file.fileUrl}
														alt={file.fileName}
														fill
														className="object-cover"
														sizes="36px"
													/>
												</div>
											) : (
												<div
													className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}
												>
													<FileIcon className={`w-[18px] h-[18px] ${color}`} />
												</div>
											)}
										</div>

										{/* Title + Meta */}
										<div className="flex-1 min-w-0 mr-4">
											<div className="flex items-center gap-2 mb-0.5">
												<span className="text-[14px] font-semibold text-slate-900 truncate">
													{file.fileName}
												</span>
												{file.duration && file.duration > 0 && (
													<span className="shrink-0 px-2 py-[1px] text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700 rounded">
														Voice
													</span>
												)}
											</div>
											<p className="text-[12px] text-slate-400 truncate">
												{isOwn ? "You" : displayName}
												{" · "}
												<span className="text-slate-400">in #{file.channel.name}</span>
												{" · "}
												{formatDate(file.createdAt)}
												{" · "}
												{formatFileSize(file.fileSize)}
											</p>
										</div>

										{/* Right side: Avatar + Actions */}
										<div className="flex items-center gap-3 shrink-0">
											{/* Uploader avatar */}
											<div className="flex items-center -space-x-1.5">
												{file.user.imageUrl ? (
													<Image
														src={file.user.imageUrl}
														alt={displayName}
														width={28}
														height={28}
														className="w-7 h-7 rounded-full ring-2 ring-white object-cover"
													/>
												) : (
													<div className="w-7 h-7 rounded-full bg-[#0B6E4F] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
														{initial}
													</div>
												)}
											</div>

											{/* Download */}
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													handleDownload(file.fileUrl, file.fileName);
												}}
												className="p-1 rounded text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-600 transition-all"
												title="Download"
											>
												<Download className="w-[18px] h-[18px]" />
											</button>

											{/* Open in new tab */}
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													handleOpenFile(file.fileUrl);
												}}
												className="p-1 rounded text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-600 transition-all"
												title="Open in new tab"
											>
												<ExternalLink className="w-[18px] h-[18px]" />
											</button>
										</div>
									</div>
								);
							})}

							{filteredFiles.length === 0 && !isLoading && (
								<div className="flex flex-col items-center justify-center py-20 text-center">
									<div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
										<FileText className="w-7 h-7 text-slate-400" />
									</div>
									<p className="text-sm font-semibold text-slate-600 mb-1">
										{files && files.length > 0
											? "No files match your filters"
											: "No files shared yet"}
									</p>
									<p className="text-xs text-slate-400">
										{files && files.length > 0
											? "Try adjusting your search or filters"
											: "Files shared in channels and DMs will appear here"}
									</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
