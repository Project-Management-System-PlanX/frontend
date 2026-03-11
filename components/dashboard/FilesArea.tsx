"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { type FileMessage, useDeleteFile, useFilesByWorkspace } from "@/hooks/api/use-files";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceStore } from "@/stores/workspace-store";

function formatFileSize(bytes: number): string {
	if (!bytes) return "0 B";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString("en-US", {
		weekday: "short",
		day: "2-digit",
		month: "short",
		year: "numeric",
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

function getRandomGradient(char: string) {
	const gradients = [
		"linear-gradient(135deg,#f59e0b,#ef4444)",
		"linear-gradient(135deg,#6366f1,#8b5cf6)",
		"linear-gradient(135deg,#ec4899,#ef4444)",
		"linear-gradient(135deg,#3b82f6,#6366f1)",
		"linear-gradient(135deg,#f472b6,#a855f7)",
		"linear-gradient(135deg,#0ea5e9,#6366f1)",
		"linear-gradient(135deg,#06b6d4,#0ea5e9)",
		"linear-gradient(135deg,#fb923c,#f43f5e)",
	];
	const index = char.charCodeAt(0) % gradients.length;
	return gradients[index];
}

export function FilesArea() {
	const [viewMode, setViewMode] = useState<"list" | "grid">("list");
	const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState("");

	const { token, user } = useSupabaseAuth();
	const { activeWorkspaceId } = useWorkspaceStore();
	const {
		data: files = [],
		isLoading,
		error,
	} = useFilesByWorkspace(activeWorkspaceId || "", token);
	const deleteFileMutation = useDeleteFile();

	const filteredFiles = useMemo(() => {
		if (!files) return [];
		if (!searchQuery.trim()) return files;
		return files.filter((file) => file.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
	}, [files, searchQuery]);

	const toggleSelection = (fileId: string) => {
		const newSelected = new Set(selectedFiles);
		if (newSelected.has(fileId)) {
			newSelected.delete(fileId);
		} else {
			newSelected.add(fileId);
		}
		setSelectedFiles(newSelected);
	};

	const toggleAll = () => {
		if (selectedFiles.size === files.length) {
			setSelectedFiles(new Set());
		} else {
			setSelectedFiles(new Set(files.map((f) => f.id)));
		}
	};

	const handleOpenFile = (fileUrl: string) => {
		window.open(fileUrl, "_blank", "noopener,noreferrer");
	};

	const handleDeleteSelected = async () => {
		if (selectedFiles.size === 0) return;

		const confirmed = window.confirm(
			`Are you sure you want to delete ${selectedFiles.size} file(s)?`,
		);
		if (!confirmed) return;

		try {
			// Delete all selected files in parallel
			const deletePromises = Array.from(selectedFiles).map((fileId) =>
				deleteFileMutation.mutateAsync({ messageId: fileId, token }),
			);

			await Promise.all(deletePromises);
			setSelectedFiles(new Set()); // clear selection
		} catch (error) {
			console.error("Failed to delete files", error);
			alert("Failed to delete some files");
		}
	};

	const handleDownload = (e: React.MouseEvent, fileUrl: string, fileName: string) => {
		e.stopPropagation();
		const link = document.createElement("a");
		link.href = fileUrl;
		link.download = fileName;
		link.target = "_blank";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center bg-white rounded-[24px]">
				<Loader2 className="w-8 h-8 text-[#0B6E4F] animate-spin" />
			</div>
		);
	}

	return (
		<div
			className="flex-1 flex flex-col bg-white overflow-hidden rounded-[24px]"
			style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
		>
			{/* TOP BAR */}
			<div className="h-[52px] px-[22px] flex items-center justify-between shrink-0 border-b border-[#e8e8e8] bg-white">
				<div className="flex items-center gap-[5px] text-[13px] text-[#999] tracking-[-0.01em]">
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
						<path
							d="M2 3.5h4.5l1.2 1.5H12v6H2z"
							stroke="#bbb"
							strokeWidth="1.3"
							fill="none"
							strokeLinejoin="round"
						/>
					</svg>
					<span>Docs</span>
					<span className="text-[#ccc] text-[12px]">›</span>
					<span className="text-[#1a1a1a] font-medium">Documents</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-[6px] bg-[#efefef] border border-[#e2e2e2] rounded-[8px] px-[4px] py-[3px] text-[12.5px] text-[#999] min-w-[170px] tracking-[-0.01em] transition-colors focus-within:bg-white focus-within:border-[#ccc]">
						<div className="flex items-center justify-center pl-[7px]">
							<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
								<circle cx="5.5" cy="5.5" r="4" stroke="#bbb" strokeWidth="1.4" />
								<line
									x1="8.5"
									y1="8.5"
									x2="11.5"
									y2="11.5"
									stroke="#bbb"
									strokeWidth="1.4"
									strokeLinecap="round"
								/>
							</svg>
						</div>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search"
							className="bg-transparent border-none outline-none text-[#555] w-full text-[12px] placeholder:text-[#bbb]"
						/>
						<kbd className="ml-auto flex shrink-0 text-[10px] bg-[#e3e3e3] rounded-[4px] px-[5px] py-[1px] text-[#bbb] font-inherit mr-[2px]">
							⌘F
						</kbd>
					</div>
				</div>
			</div>

			{/* CONTENT */}
			<div className="flex-1 px-[22px] py-[20px] pb-[80px] overflow-y-auto relative bg-white">
				<div className="flex items-center justify-between mb-[18px]">
					<div className="flex items-center gap-[12px]">
						<span className="text-[16px] font-bold text-[#111] tracking-[-0.02em]">Documents</span>
						<div className="w-[1px] h-[16px] bg-[#ddd]" />
						<div className="flex bg-[#ececec] rounded-[7px] p-[2px] gap-[1px]">
							<button
								onClick={() => setViewMode("list")}
								className={`flex items-center gap-[4px] px-[10px] py-[4px] rounded-[5px] text-[12px] font-medium tracking-[-0.01em] border-none transition-all cursor-pointer ${
									viewMode === "list"
										? "bg-white text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
										: "bg-transparent text-[#888]"
								}`}
							>
								<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
									<line
										x1="1"
										y1="2.5"
										x2="11"
										y2="2.5"
										stroke="currentColor"
										strokeWidth="1.3"
										strokeLinecap="round"
									/>
									<line
										x1="1"
										y1="6"
										x2="11"
										y2="6"
										stroke="currentColor"
										strokeWidth="1.3"
										strokeLinecap="round"
									/>
									<line
										x1="1"
										y1="9.5"
										x2="11"
										y2="9.5"
										stroke="currentColor"
										strokeWidth="1.3"
										strokeLinecap="round"
									/>
								</svg>
								List View
							</button>
							<button
								onClick={() => setViewMode("grid")}
								className={`flex items-center gap-[4px] px-[10px] py-[4px] rounded-[5px] text-[12px] font-medium tracking-[-0.01em] border-none transition-all cursor-pointer ${
									viewMode === "grid"
										? "bg-white text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
										: "bg-transparent text-[#888]"
								}`}
							>
								<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
									<rect
										x="1"
										y="1"
										width="4"
										height="4"
										rx="1"
										stroke="currentColor"
										strokeWidth="1.2"
									/>
									<rect
										x="7"
										y="1"
										width="4"
										height="4"
										rx="1"
										stroke="currentColor"
										strokeWidth="1.2"
									/>
									<rect
										x="1"
										y="7"
										width="4"
										height="4"
										rx="1"
										stroke="currentColor"
										strokeWidth="1.2"
									/>
									<rect
										x="7"
										y="7"
										width="4"
										height="4"
										rx="1"
										stroke="currentColor"
										strokeWidth="1.2"
									/>
								</svg>
								Grid
							</button>
						</div>
					</div>
				</div>

				{/* CONTENT AREA (LIST/GRID) */}
				{viewMode === "list" ? (
					<table className="w-full border-collapse">
						<thead>
							<tr>
								<th className="text-left text-[10.5px] font-semibold text-[#b0b0b0] tracking-[0.04em] uppercase py-[6px] px-[10px] border-b border-[#ebebeb] bg-[#f7f7f7] whitespace-nowrap pl-[12px] w-[38px]">
									<button
										onClick={toggleAll}
										className={`w-[15px] h-[15px] border-[1.5px] rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
											selectedFiles.size > 0 &&
											selectedFiles.size === filteredFiles.length &&
											filteredFiles.length > 0
												? "bg-[#333] border-[#333]"
												: selectedFiles.size > 0
													? "bg-[#333] border-[#333]"
													: "bg-white border-[#d0d0d0]"
										}`}
									>
										{selectedFiles.size > 0 && selectedFiles.size < filteredFiles.length && (
											<svg width="9" height="2" viewBox="0 0 9 2">
												<line
													x1=".5"
													y1="1"
													x2="8.5"
													y2="1"
													stroke="white"
													strokeWidth="1.8"
													strokeLinecap="round"
												/>
											</svg>
										)}
										{selectedFiles.size > 0 &&
											selectedFiles.size === filteredFiles.length &&
											filteredFiles.length > 0 && (
												<svg width="9" height="7" viewBox="0 0 9 7" fill="none">
													<path
														d="M1 3.5L3.5 6L8 1"
														stroke="white"
														strokeWidth="1.6"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											)}
									</button>
								</th>
								<th className="text-left text-[10.5px] font-semibold text-[#b0b0b0] tracking-[0.04em] uppercase py-[6px] px-[10px] border-b border-[#ebebeb] bg-[#f7f7f7] whitespace-nowrap">
									File name <span className="text-[9px] text-[#d5d5d5] ml-[2px]">↕</span>
								</th>
								<th className="text-left text-[10.5px] font-semibold text-[#b0b0b0] tracking-[0.04em] uppercase py-[6px] px-[10px] border-b border-[#ebebeb] bg-[#f7f7f7] whitespace-nowrap">
									Date added <span className="text-[9px] text-[#d5d5d5] ml-[2px]">↕</span>
								</th>
								<th className="text-left text-[10.5px] font-semibold text-[#b0b0b0] tracking-[0.04em] uppercase py-[6px] px-[10px] border-b border-[#ebebeb] bg-[#f7f7f7] whitespace-nowrap">
									Added by <span className="text-[9px] text-[#d5d5d5] ml-[2px]">↕</span>
								</th>
								<th className="text-left text-[10.5px] font-semibold text-[#b0b0b0] tracking-[0.04em] uppercase py-[6px] px-[10px] border-b border-[#ebebeb] bg-[#f7f7f7] whitespace-nowrap">
									Size <span className="text-[9px] text-[#d5d5d5] ml-[2px]">↕</span>
								</th>
								<th className="text-left text-[10.5px] font-semibold text-[#b0b0b0] tracking-[0.04em] uppercase py-[6px] px-[10px] border-b border-[#ebebeb] bg-[#f7f7f7] whitespace-nowrap">
									Last update <span className="text-[9px] text-[#d5d5d5] ml-[2px]">↕</span>
								</th>
								<th className="text-left text-[10.5px] font-semibold text-[#b0b0b0] tracking-[0.04em] uppercase py-[6px] px-[10px] border-b border-[#ebebeb] bg-[#f7f7f7] whitespace-nowrap">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredFiles.length === 0 ? (
								<tr>
									<td colSpan={7} className="text-center py-8 text-[13px] text-[#888]">
										{searchQuery.trim() ? "No files match your search." : "No files uploaded yet."}
									</td>
								</tr>
							) : (
								filteredFiles.map((file, _i) => {
									const isSelected = selectedFiles.has(file.id);
									const displayName = getUserDisplayName(file.user);
									const initial = getUserInitial(file.user);

									// Determine color styling based on file type roughly matching the screenshot colors
									const isImg = file.fileType?.includes("image");
									const isPdf = file.fileType?.includes("pdf");
									const isDoc =
										file.fileType?.includes("document") || file.fileType?.includes("word");

									let iconStyle = { bg: "rgba(59,130,246,.1)", stroke: "#3b82f6" }; // blue
									if (isImg)
										iconStyle = { bg: "rgba(34,197,94,.1)", stroke: "#22c55e" }; // green
									else if (isPdf)
										iconStyle = { bg: "rgba(245,158,11,.1)", stroke: "#f59e0b" }; // orange
									else if (isDoc) iconStyle = { bg: "rgba(99,102,241,.1)", stroke: "#6366f1" }; // indigo

									return (
										<tr
											key={file.id}
											onClick={() => handleOpenFile(file.fileUrl)}
											className={`border-b border-[#f2f2f2] cursor-pointer transition-colors group hover:bg-[#f5f5f5] ${
												isSelected ? "bg-[#eff6ff]" : ""
											}`}
										>
											<td
												className="py-[9px] px-[10px] align-middle whitespace-nowrap pl-[12px]"
												onClick={(e) => {
													e.stopPropagation();
													toggleSelection(file.id);
												}}
											>
												<div
													className={`w-[15px] h-[15px] shrink-0 border-[1.5px] rounded-[4px] flex items-center justify-center transition-colors ${
														isSelected
															? "bg-[#2563eb] border-[#2563eb]"
															: "bg-white border-[#d0d0d0]"
													}`}
												>
													{isSelected && (
														<svg width="9" height="7" viewBox="0 0 9 7" fill="none">
															<path
																d="M1 3.5L3.5 6L8 1"
																stroke="white"
																strokeWidth="1.6"
																strokeLinecap="round"
																strokeLinejoin="round"
															/>
														</svg>
													)}
												</div>
											</td>
											<td className="py-[9px] px-[10px] align-middle whitespace-nowrap">
												<div className="flex items-center gap-[9px]">
													<svg width="16" height="20" viewBox="0 0 16 20" fill="none">
														<path
															d="M2 2h7.5L14 6.5V18q0 1-1 1H3q-1 0-1-1V2z"
															fill={iconStyle.bg}
															stroke={iconStyle.stroke}
															strokeWidth="1.2"
														/>
														<path
															d="M9.5 2v4.5H14"
															stroke={iconStyle.stroke}
															strokeWidth="1.2"
															fill="none"
														/>
													</svg>
													<span className="text-[12.5px] font-medium text-[#111] tracking-[-0.01em]">
														{file.fileName}
													</span>
												</div>
											</td>
											<td className="py-[9px] px-[10px] align-middle whitespace-nowrap text-[12px] text-[#888]">
												{formatDate(file.createdAt)}
											</td>
											<td className="py-[9px] px-[10px] align-middle whitespace-nowrap">
												<div className="flex items-center text-[12.5px] text-[#555] tracking-[-0.01em]">
													{file.user.imageUrl ? (
														<Image
															src={file.user.imageUrl}
															alt={displayName}
															width={22}
															height={22}
															className="w-[22px] h-[22px] rounded-full object-cover shrink-0 mr-[7px]"
														/>
													) : (
														<div
															className="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center text-[8.5px] font-bold text-white shrink-0 mr-[7px]"
															style={{ background: getRandomGradient(initial) }}
														>
															{initial}
														</div>
													)}
													{displayName}
												</div>
											</td>
											<td className="py-[9px] px-[10px] align-middle whitespace-nowrap text-[12px] text-[#888]">
												{formatFileSize(file.fileSize || 0)}
											</td>
											<td className="py-[9px] px-[10px] align-middle whitespace-nowrap text-[12px] text-[#888]">
												{formatDate(file.updatedAt || file.createdAt)}
											</td>
											<td className="py-[9px] px-[10px] align-middle whitespace-nowrap">
												<div
													className={`flex items-center gap-[2px] transition-opacity ${
														isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
													}`}
												>
													<button
														className="w-[26px] h-[26px] rounded-[6px] border-none bg-transparent cursor-pointer flex items-center justify-center text-[#bbb] transition-colors hover:bg-[#ebebeb] hover:text-[#555]"
														onClick={(e) => handleDownload(e, file.fileUrl, file.fileName)}
													>
														<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
															<path
																d="M3 10h7M6.5 3v6M4 7l2.5 3 2.5-3"
																stroke="currentColor"
																strokeWidth="1.3"
																strokeLinecap="round"
															/>
														</svg>
													</button>
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[12px]">
						{filteredFiles.length === 0 ? (
							<div className="col-span-full text-center py-8 text-[13px] text-[#888]">
								{searchQuery.trim() ? "No files match your search." : "No files uploaded yet."}
							</div>
						) : (
							filteredFiles.map((file, _i) => {
								const isSelected = selectedFiles.has(file.id);
								const displayName = getUserDisplayName(file.user);

								const isImg = file.fileType?.includes("image");
								const isPdf = file.fileType?.includes("pdf");
								const isDoc =
									file.fileType?.includes("document") || file.fileType?.includes("word");

								let iconStyle = { bg: "rgba(59,130,246,.1)", stroke: "#3b82f6" };
								if (isImg) iconStyle = { bg: "rgba(34,197,94,.1)", stroke: "#22c55e" };
								else if (isPdf) iconStyle = { bg: "rgba(245,158,11,.1)", stroke: "#f59e0b" };
								else if (isDoc) iconStyle = { bg: "rgba(99,102,241,.1)", stroke: "#6366f1" };

								return (
									<div
										key={file.id}
										onClick={() => handleOpenFile(file.fileUrl)}
										className={`p-[14px] border rounded-[10px] cursor-pointer transition-all group relative hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] ${
											isSelected ? "border-[#2563eb] bg-[#eff6ff]" : "border-[#ebebeb] bg-white"
										}`}
									>
										<div
											className="absolute top-[10px] left-[10px] w-[20px] h-[20px] flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10"
											onClick={(e) => {
												e.stopPropagation();
												toggleSelection(file.id);
											}}
										>
											<div
												className={`w-[15px] h-[15px] shrink-0 border-[1.5px] rounded-[4px] flex items-center justify-center transition-colors ${
													isSelected
														? "bg-[#2563eb] border-[#2563eb] opacity-100"
														: "bg-white border-[#d0d0d0]"
												} ${isSelected ? "opacity-100" : ""}`}
											>
												{isSelected && (
													<svg width="9" height="7" viewBox="0 0 9 7" fill="none">
														<path
															d="M1 3.5L3.5 6L8 1"
															stroke="white"
															strokeWidth="1.6"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												)}
											</div>
										</div>

										<div
											className={`absolute top-[10px] right-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 ${isSelected ? "opacity-100" : ""}`}
										>
											<button
												className="w-[26px] h-[26px] rounded-[6px] border-none bg-white/80 backdrop-blur-sm cursor-pointer flex items-center justify-center text-[#555] transition-colors hover:bg-white shadow-sm"
												onClick={(e) => handleDownload(e, file.fileUrl, file.fileName)}
											>
												<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
													<path
														d="M3 10h7M6.5 3v6M4 7l2.5 3 2.5-3"
														stroke="currentColor"
														strokeWidth="1.3"
														strokeLinecap="round"
													/>
												</svg>
											</button>
										</div>

										<div className="flex flex-col items-center justify-center pt-[15px] pb-[10px]">
											<svg width="40" height="48" viewBox="0 0 16 20" fill="none">
												<path
													d="M2 2h7.5L14 6.5V18q0 1-1 1H3q-1 0-1-1V2z"
													fill={iconStyle.bg}
													stroke={iconStyle.stroke}
													strokeWidth="1.2"
												/>
												<path
													d="M9.5 2v4.5H14"
													stroke={iconStyle.stroke}
													strokeWidth="1.2"
													fill="none"
												/>
											</svg>
										</div>
										<div className="text-[12px] font-medium text-[#111] text-center tracking-[-0.01em] mb-[4px] truncate w-full px-2">
											{file.fileName}
										</div>
										<div className="text-[10.5px] text-[#bbb] text-center tracking-[-0.01em]">
											{formatFileSize(file.fileSize || 0)} • {displayName}
										</div>
									</div>
								);
							})
						)}
					</div>
				)}
			</div>

			{/* ACTION BAR (Floating) */}
			{selectedFiles.size > 0 && (
				<div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 bg-[#222] rounded-[11px] p-[8px_14px] flex items-center gap-[3px] shadow-[0_8px_28px_rgba(0,0,0,0.22),_0_0_0_1px_rgba(255,255,255,0.06)] z-[100] whitespace-nowrap">
					<span className="text-[12.5px] font-semibold text-white px-[8px] tracking-[-0.01em]">
						{selectedFiles.size} Files Selected
					</span>
					<div className="w-[1px] h-[16px] bg-white/10 mx-[4px]" />
					<button className="flex items-center gap-[5px] px-[9px] py-[5px] rounded-[7px] border-none text-[12px] font-medium text-[#ccc] cursor-pointer bg-transparent tracking-[-0.01em] transition-colors hover:bg-white/10 hover:text-white">
						<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
							<path
								d="M2 6.5H11M8 3.5L11 6.5 8 9.5"
								stroke="currentColor"
								strokeWidth="1.3"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						Move
					</button>
					<button className="flex items-center gap-[5px] px-[9px] py-[5px] rounded-[7px] border-none text-[12px] font-medium text-white cursor-pointer bg-white/10 tracking-[-0.01em] transition-colors hover:bg-white/10 hover:text-white">
						<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
							<rect
								x="1.5"
								y="3.5"
								width="7.5"
								height="7.5"
								rx="1.3"
								stroke="currentColor"
								strokeWidth="1.3"
							/>
							<path
								d="M4 1.5H11.5V9"
								stroke="currentColor"
								strokeWidth="1.3"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						Duplicate
					</button>
					<button className="flex items-center gap-[5px] px-[9px] py-[5px] rounded-[7px] border-none text-[12px] font-medium text-[#ccc] cursor-pointer bg-transparent tracking-[-0.01em] transition-colors hover:bg-white/10 hover:text-white">
						<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
							<path
								d="M2 4.5H11V10.5Q11 11.5 10 11.5H3Q2 11.5 2 10.5z"
								stroke="currentColor"
								strokeWidth="1.3"
								fill="none"
							/>
							<line x1="1" y1="4.5" x2="12" y2="4.5" stroke="currentColor" strokeWidth="1.2" />
							<path d="M5 1.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
						</svg>
						Archive
					</button>
					<button
						onClick={handleDeleteSelected}
						disabled={deleteFileMutation.isPending}
						className="flex items-center gap-[5px] px-[9px] py-[5px] rounded-[7px] border-none text-[12px] font-medium text-[#f87171] cursor-pointer bg-transparent tracking-[-0.01em] transition-colors hover:bg-[#f87171]/10 hover:text-[#fca5a5] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{deleteFileMutation.isPending ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : (
							<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
								<path
									d="M2 4.5H11V10.5Q11 11.5 10 11.5H3Q2 11.5 2 10.5z"
									stroke="currentColor"
									strokeWidth="1.3"
									fill="none"
								/>
								<line x1="1" y1="4.5" x2="12" y2="4.5" stroke="currentColor" strokeWidth="1.2" />
								<path d="M5 1.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
								<line
									x1="5.5"
									y1="6.5"
									x2="5.5"
									y2="9.5"
									stroke="currentColor"
									strokeWidth="1.2"
									strokeLinecap="round"
								/>
								<line
									x1="7.5"
									y1="6.5"
									x2="7.5"
									y2="9.5"
									stroke="currentColor"
									strokeWidth="1.2"
									strokeLinecap="round"
								/>
							</svg>
						)}
						{deleteFileMutation.isPending ? "Deleting..." : "Delete"}
					</button>
				</div>
			)}
		</div>
	);
}
