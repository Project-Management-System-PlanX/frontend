"use client";

import {
	ChevronDown,
	FileText,
	Filter,
	MoreVertical,
	Plus,
	Search,
	SlidersHorizontal,
	Star,
	Upload,
	X,
} from "lucide-react";
import { useState } from "react";

/* ═══════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════ */

interface DocItem {
	id: string;
	name: string;
	type: "document" | "spreadsheet" | "presentation" | "template";
	creator: string;
	creatorInitial: string;
	creatorColor: string;
	collaborators?: { initial: string; color: string }[];
	lastViewed: string;
	readTime: string;
	isTemplate?: boolean;
	isStarred?: boolean;
}

const DOCS: DocItem[] = [
	{
		id: "1",
		name: "Q1 Sprint Planning Notes",
		type: "document",
		creator: "Shashanth K (you)",
		creatorInitial: "S",
		creatorColor: "bg-[#0B6E4F]",
		collaborators: [{ initial: "T", color: "bg-blue-600" }],
		lastViewed: "Last viewed today",
		readTime: "3 min read",
		isStarred: true,
	},
	{
		id: "2",
		name: "Deal tracker",
		type: "spreadsheet",
		creator: "Shashanth K (you)",
		creatorInitial: "S",
		creatorColor: "bg-[#0B6E4F]",
		lastViewed: "Last viewed today",
		readTime: "2 min read",
	},
	{
		id: "3",
		name: "Project tracker",
		type: "spreadsheet",
		creator: "Shashanth K (you)",
		creatorInitial: "S",
		creatorColor: "bg-[#0B6E4F]",
		lastViewed: "Last viewed on February 4th",
		readTime: "5 min read",
	},
	{
		id: "4",
		name: "Product roadmap 2026",
		type: "document",
		creator: "Ravikrishna J",
		creatorInitial: "R",
		creatorColor: "bg-orange-500",
		collaborators: [
			{ initial: "S", color: "bg-[#0B6E4F]" },
			{ initial: "P", color: "bg-violet-500" },
		],
		lastViewed: "Last viewed on February 10th",
		readTime: "8 min read",
	},
	{
		id: "5",
		name: "Project overview",
		type: "document",
		creator: "Slackbot",
		creatorInitial: "S",
		creatorColor: "bg-blue-600",
		lastViewed: "Last viewed on February 4th",
		readTime: "1 min read",
		isTemplate: true,
	},
	{
		id: "6",
		name: "Weekly 1:1",
		type: "document",
		creator: "Slackbot",
		creatorInitial: "S",
		creatorColor: "bg-blue-600",
		lastViewed: "Last viewed on February 3rd",
		readTime: "1 min read",
		isTemplate: true,
	},
	{
		id: "7",
		name: "To-do list",
		type: "document",
		creator: "Slackbot",
		creatorInitial: "S",
		creatorColor: "bg-blue-600",
		lastViewed: "Last viewed on February 3rd",
		readTime: "1 min read",
		isTemplate: true,
	},
	{
		id: "8",
		name: "API Documentation v2",
		type: "document",
		creator: "Alex Morgan",
		creatorInitial: "A",
		creatorColor: "bg-pink-500",
		collaborators: [{ initial: "J", color: "bg-teal-500" }],
		lastViewed: "Last viewed on January 28th",
		readTime: "12 min read",
	},
	{
		id: "9",
		name: "Sales pipeline analysis",
		type: "spreadsheet",
		creator: "Priya Patel",
		creatorInitial: "P",
		creatorColor: "bg-violet-500",
		lastViewed: "Last viewed on January 25th",
		readTime: "4 min read",
	},
	{
		id: "10",
		name: "Team onboarding guide",
		type: "document",
		creator: "Sarah Chen",
		creatorInitial: "SC",
		creatorColor: "bg-amber-500",
		lastViewed: "Last viewed on January 20th",
		readTime: "6 min read",
		isTemplate: true,
		isStarred: true,
	},
	{
		id: "11",
		name: "Design system components",
		type: "presentation",
		creator: "Shashanth K (you)",
		creatorInitial: "S",
		creatorColor: "bg-[#0B6E4F]",
		lastViewed: "Last viewed on January 18th",
		readTime: "15 min read",
	},
];

const FILTER_TABS = ["All", "Created by you", "Shared with you"];

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

export function FilesArea() {
	const [activeFilter, setActiveFilter] = useState("All");
	const [showBanner, setShowBanner] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [starredIds, setStarredIds] = useState<Set<string>>(
		new Set(DOCS.filter((d) => d.isStarred).map((d) => d.id)),
	);

	const toggleStar = (id: string) => {
		setStarredIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const filteredDocs = DOCS.filter((doc) => {
		if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
		if (activeFilter === "Created by you" && !doc.creator.includes("(you)")) return false;
		if (activeFilter === "Shared with you" && doc.creator.includes("(you)")) return false;
		return true;
	});

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
						</h1>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 bg-[#0B6E4F] text-white text-sm font-semibold rounded-lg hover:bg-[#095C42] transition-colors shadow-sm"
						>
							<Upload className="w-4 h-4" />
							Upload
						</button>
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
							<button
								type="button"
								className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold bg-[#0B6E4F] text-white rounded-lg hover:bg-[#095C42] transition-colors"
							>
								<Filter className="w-3.5 h-3.5" />5 Types
								<ChevronDown className="w-3 h-3" />
							</button>

							{/* Sort */}
							<button
								type="button"
								className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
							>
								Recently viewed
								<ChevronDown className="w-3 h-3 text-slate-400" />
							</button>

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
							{/* Close Button */}
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
										Get your work done in TeamUp
									</h2>
									<p className="text-[13px] text-slate-500 mb-6 leading-relaxed font-medium">
										Collect and share information with a canvas, or track your next project in a
										list.
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

								{/* Mock UI Illustration */}
								<div className="hidden md:block relative w-64 h-40 -my-6 mr-4 opacity-100 select-none pointer-events-none">
									<div className="absolute top-5 right-0 w-60 h-48 bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-4 overflow-hidden">
										{/* Skeleton UI */}
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
									{/* Floating Elements */}
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
					<div className="divide-y divide-slate-100">
						{filteredDocs.map((doc) => {
							const starred = starredIds.has(doc.id);

							return (
								<div
									key={doc.id}
									className="flex items-center px-6 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group"
								>
									{/* Doc Icon */}
									<div className="shrink-0 mr-4">
										<div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
											<FileText className="w-4.5 h-4.5 text-amber-700" />
										</div>
									</div>

									{/* Title + Meta */}
									<div className="flex-1 min-w-0 mr-4">
										<div className="flex items-center gap-2 mb-0.5">
											<span className="text-[14px] font-semibold text-slate-900 truncate">
												{doc.name}
											</span>
											{doc.isTemplate && (
												<span className="shrink-0 px-2 py-[1px] text-[10px] font-bold uppercase tracking-wide bg-[#0B6E4F] text-white rounded">
													Template
												</span>
											)}
										</div>
										<p className="text-[12px] text-slate-400">
											{doc.creator} · {doc.lastViewed} · {doc.readTime}
										</p>
									</div>

									{/* Right side: Collaborators + Star + Menu */}
									<div className="flex items-center gap-3 shrink-0">
										{/* Collaborator Avatars */}
										<div className="flex items-center -space-x-1.5">
											{/* Creator avatar */}
											<div
												className={`w-7 h-7 rounded-full ${doc.creatorColor} text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white`}
											>
												{doc.creatorInitial}
											</div>
											{doc.collaborators?.map((c) => (
												<div
													key={c.initial}
													className={`w-7 h-7 rounded-full ${c.color} text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white`}
												>
													{c.initial}
												</div>
											))}
										</div>

										{/* Star */}
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												toggleStar(doc.id);
											}}
											className={`p-1 rounded transition-all ${
												starred
													? "text-amber-400"
													: "text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-400"
											}`}
										>
											<Star className="w-4.5 h-4.5" fill={starred ? "currentColor" : "none"} />
										</button>

										{/* Kebab Menu */}
										<button
											type="button"
											className="p-1 rounded text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-600 transition-all"
										>
											<MoreVertical className="w-4.5 h-4.5" />
										</button>
									</div>
								</div>
							);
						})}

						{filteredDocs.length === 0 && (
							<div className="flex flex-col items-center justify-center py-20 text-center">
								<div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
									<FileText className="w-7 h-7 text-slate-400" />
								</div>
								<p className="text-sm font-semibold text-slate-600 mb-1">No files found</p>
								<p className="text-xs text-slate-400">Try adjusting your search or filters</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
