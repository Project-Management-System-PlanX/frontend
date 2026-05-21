"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { addDays, isAfter, isBefore, subDays } from "date-fns";
import {
	ArrowUpDown,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Chrome,
	Clock,
	Inbox as InboxIcon,
	ListFilter,
	Mail,
	MessageSquare,
	MoreHorizontal,
	Palette,
	Plus,
	Settings,
	Slack,
	Sparkles,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import { SortableTaskCard } from "./TaskCard";
import { UI } from "./types";

export function InboxPanel({
	tasks,
	onToggleTask,
	onAddTask,
	onTaskClick,
	onDeleteTask,
}: {
	tasks: Task[];
	onToggleTask: (id: string) => void;
	onAddTask: (title: string) => void;
	onTaskClick: (task: Task) => void;
	onDeleteTask?: (id: string) => void;
}) {
	const [isAdding, setIsAdding] = useState(false);
	const [newTaskTitle, setNewTaskTitle] = useState("");
	const [showFilter, setShowFilter] = useState(false);
	const [inboxColor, setInboxColor] = useState(UI.inbox.bg);

	// Menu State
	const [menuView, setMenuView] = useState<
		"main" | "sort" | "add-from" | "settings" | "background"
	>("main");
	const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "alpha">("newest");
	const [aiEnabled, setAiEnabled] = useState(true);

	// Filter state
	const [keyword, setKeyword] = useState("");
	const [createdRange, setCreatedRange] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [dueRange, setDueRange] = useState<string | null>(null);

	const handleAdd = () => {
		if (newTaskTitle.trim()) {
			onAddTask(newTaskTitle.trim());
			setNewTaskTitle("");
			setIsAdding(false);
		}
	};

	const filteredAndSortedTasks = useMemo(() => {
		let result = tasks.filter((task) => {
			if (keyword && !task.title.toLowerCase().includes(keyword.toLowerCase())) return false;
			if (createdRange) {
				const createdAt = new Date(task.createdAt || Date.now());
				const now = new Date();
				if (createdRange === "last-week" && isBefore(createdAt, subDays(now, 7))) return false;
				if (createdRange === "last-2-weeks" && isBefore(createdAt, subDays(now, 14))) return false;
				if (createdRange === "last-month" && isBefore(createdAt, subDays(now, 30))) return false;
			}
			if (statusFilter === "complete" && task.resolution !== "RESOLVED") return false;
			if (statusFilter === "incomplete" && task.resolution === "RESOLVED") return false;
			if (dueRange) {
				const now = new Date();
				if (dueRange === "none" && task.dueDate) return false;
				if (!task.dueDate && dueRange !== "none") return false;
				if (task.dueDate) {
					const dueDate = new Date(task.dueDate);
					if (dueRange === "overdue" && isAfter(dueDate, now)) return false;
					if (
						dueRange === "next-day" &&
						(isBefore(dueDate, now) || isAfter(dueDate, addDays(now, 1)))
					)
						return false;
					if (
						dueRange === "next-week" &&
						(isBefore(dueDate, now) || isAfter(dueDate, addDays(now, 7)))
					)
						return false;
					if (
						dueRange === "next-month" &&
						(isBefore(dueDate, now) || isAfter(dueDate, addDays(now, 30)))
					)
						return false;
				}
			}
			return true;
		});

		// Sort
		result = [...result].sort((a, b) => {
			if (sortOrder === "newest")
				return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
			if (sortOrder === "oldest")
				return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
			if (sortOrder === "alpha") return a.title.localeCompare(b.title);
			return 0;
		});

		return result;
	}, [tasks, keyword, createdRange, statusFilter, dueRange, sortOrder]);

	const resetFilters = () => {
		setKeyword("");
		setCreatedRange(null);
		setStatusFilter(null);
		setDueRange(null);
	};

	const backgrounds = ["#1A1A1A", "#1E293B", "#1E1B4B", "#312E81", "#14532D", "#713F12", "#4C1D95"];

	return (
		<div className="h-full flex relative overflow-hidden" style={{ backgroundColor: inboxColor }}>
			{/* Main Inbox Content */}
			<div
				className={cn(
					"flex-1 flex flex-col transition-all duration-300",
					showFilter && "mr-[320px]",
				)}
			>
				<div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
					<div className="flex items-center gap-2">
						<InboxIcon className="w-5.5 h-5.5 text-white/90" />
						<span className="text-[18px] font-bold text-white">Inbox</span>
					</div>
					<div className="flex items-center gap-3">
						<ListFilter
							className={cn(
								"w-5.5 h-5.5 transition-colors cursor-pointer",
								showFilter ? "text-white" : "text-white/60 hover:text-white",
							)}
							onClick={() => setShowFilter(!showFilter)}
						/>
						<Popover onOpenChange={(open) => !open && setMenuView("main")}>
							<PopoverTrigger asChild>
								<MoreHorizontal className="w-5.5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
							</PopoverTrigger>
							<PopoverContent className="w-[320px] bg-[#222] border-white/10 p-0 overflow-hidden shadow-2xl rounded-xl">
								{menuView === "main" && (
									<div className="flex flex-col">
										<div className="p-3 border-b border-white/5 flex items-center justify-between">
											<span className="text-[13px] font-black text-white/40 uppercase tracking-widest ml-1">
												Menu
											</span>
											<X className="w-4 h-4 text-white/20 cursor-pointer hover:text-white" />
										</div>
										<MenuItem
											icon={<ArrowUpDown className="w-4 h-4" />}
											label="Sort"
											onClick={() => setMenuView("sort")}
										/>
										<div className="h-px bg-white/5 mx-3 my-1" />
										<MenuItem
											icon={<Plus className="w-4 h-4" />}
											label="Add from"
											onClick={() => setMenuView("add-from")}
										/>
										<div className="h-px bg-white/5 mx-3 my-1" />
										<MenuItem
											icon={<Palette className="w-4 h-4" />}
											label="Change background"
											onClick={() => setMenuView("background")}
										/>
										<MenuItem
											icon={<Settings className="w-4 h-4" />}
											label="Settings"
											onClick={() => setMenuView("settings")}
										/>
									</div>
								)}

								{menuView === "sort" && (
									<div className="flex flex-col min-h-[300px]">
										<MenuHeader title="Sort" onBack={() => setMenuView("main")} />
										<MenuItem
											label="Newest first"
											active={sortOrder === "newest"}
											onClick={() => setSortOrder("newest")}
										/>
										<MenuItem
											label="Oldest first"
											active={sortOrder === "oldest"}
											onClick={() => setSortOrder("oldest")}
										/>
										<MenuItem
											label="Alphabetically"
											active={sortOrder === "alpha"}
											onClick={() => setSortOrder("alpha")}
										/>
									</div>
								)}

								{menuView === "add-from" && (
									<div className="flex flex-col min-h-[300px]">
										<MenuHeader title="Add from" onBack={() => setMenuView("main")} />
										<MenuItem icon={<Mail className="w-4 h-4" />} label="Add from email" />
										<MenuItem icon={<Chrome className="w-4 h-4" />} label="Add from webpages" />
										<MenuItem icon={<Slack className="w-4 h-4" />} label="Add from Slack" />
										<MenuItem
											icon={<MessageSquare className="w-4 h-4" />}
											label="Add from Microsoft Teams"
										/>
									</div>
								)}

								{menuView === "settings" && (
									<div className="flex flex-col min-h-[300px]">
										<MenuHeader title="Settings" onBack={() => setMenuView("main")} />
										<div className="p-6 space-y-6">
											<div className="flex items-center gap-3">
												<Sparkles className="w-5 h-5 text-blue-400" />
												<span className="text-[16px] font-black text-white">AI</span>
												<span className="px-1.5 py-0.5 rounded border border-purple-500/50 text-[10px] font-black text-purple-400 uppercase">
													Premium
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-[14px] font-black text-white">AI is activated</span>
												<div
													onClick={() => setAiEnabled(!aiEnabled)}
													className={cn(
														"w-11 h-6 rounded-full transition-all cursor-pointer relative flex items-center px-1",
														aiEnabled ? "bg-green-500" : "bg-white/10",
													)}
												>
													<div
														className={cn(
															"w-4 h-4 rounded-full bg-white transition-all transform shadow-sm",
															aiEnabled ? "translate-x-5" : "translate-x-0",
														)}
													/>
												</div>
											</div>
											<p className="text-[13px] text-white/40 leading-relaxed font-bold">
												Use AI to summarize content sent to your Inbox, create checklists, add due
												dates, and more.
											</p>
										</div>
									</div>
								)}

								{menuView === "background" && (
									<div className="flex flex-col min-h-[300px]">
										<MenuHeader title="Background" onBack={() => setMenuView("main")} />
										<div className="p-6 grid grid-cols-4 gap-3">
											{backgrounds.map((bg) => (
												<div
													key={bg}
													onClick={() => setInboxColor(bg)}
													className={cn(
														"h-12 rounded-xl cursor-pointer border-2 transition-all hover:scale-110",
														inboxColor === bg ? "border-white shadow-lg" : "border-transparent",
													)}
													style={{ backgroundColor: bg }}
												/>
											))}
										</div>
									</div>
								)}
							</PopoverContent>
						</Popover>
					</div>
				</div>

				<div className="p-4 flex-1 overflow-auto custom-scrollbar">
					<div className="space-y-3 min-w-fit">
						{isAdding ? (
							<div className="rounded-xl py-2 px-3 shadow-2xl bg-black/40 border border-white/10 mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
								<input
									className="w-full bg-transparent border-none outline-none py-1.5 text-white font-bold text-[16px] placeholder:text-white/20"
									placeholder="What's on your mind?"
									value={newTaskTitle}
									onChange={(e) => setNewTaskTitle(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleAdd();
										if (e.key === "Escape") setIsAdding(false);
									}}
								/>
								<div className="flex items-center gap-2 mt-1 pb-1">
									<button
										onClick={handleAdd}
										className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-[12px] font-bold"
									>
										Add Task
									</button>
									<button
										onClick={() => setIsAdding(false)}
										className="text-white/40 hover:text-white"
									>
										<Plus className="w-4 h-4 rotate-45" />
									</button>
								</div>
							</div>
						) : (
							<div
								onClick={() => setIsAdding(true)}
								className="rounded-xl py-2.5 px-4.5 shadow-2xl bg-black/20 transition-all hover:bg-black/30 cursor-text mb-4 group border border-transparent hover:border-white/5"
							>
								<span className="text-[16px] text-white/40 flex items-center gap-2">
									<Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
									Add a card
								</span>
							</div>
						)}

						<SortableContext
							items={filteredAndSortedTasks.map((t) => `inbox-${t.id}`)}
							strategy={verticalListSortingStrategy}
						>
							{filteredAndSortedTasks.map((task) => (
								<SortableTaskCard
									key={task.id}
									task={task}
									idPrefix="inbox"
									onToggle={onToggleTask}
									onClick={() => onTaskClick(task)}
									onDelete={onDeleteTask}
								/>
							))}
						</SortableContext>
						{filteredAndSortedTasks.length === 0 && (
							<div className="flex-1 flex items-center justify-center h-40 text-white/20 italic text-[14px]">
								{tasks.length > 0 ? "No tasks match filters" : "Empty Inbox"}
							</div>
						)}
					</div>
				</div>

				<div className="p-5 mt-auto">
					<div className="rounded-[18px] p-4 bg-black/20 flex items-center justify-between border border-white/5 hover:bg-black/30 transition-colors cursor-pointer group">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
								<Settings className="w-4 h-4 text-white" />
							</div>
							<p className="text-[14px] font-bold text-white">Consolidate your to-dos</p>
						</div>
						<ChevronRight className="w-4 h-4 text-white/40" />
					</div>
				</div>
			</div>

			{/* Filter Panel */}
			<div
				className={cn(
					"absolute top-0 right-0 bottom-0 w-[320px] bg-[#1A1A1A] border-l border-white/10 shadow-2xl transition-transform duration-300 z-50 overflow-y-auto custom-scrollbar flex flex-col",
					showFilter ? "translate-x-0" : "translate-x-full",
				)}
			>
				<div className="p-6 flex items-center justify-between border-b border-white/5">
					<h3 className="text-[16px] font-bold text-white">Filter</h3>
					<button
						onClick={() => setShowFilter(false)}
						className="text-white/40 hover:text-white transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-6 space-y-8">
					{/* Keyword */}
					<div className="space-y-3">
						<label className="text-[12px] font-black text-white/40 uppercase tracking-widest">
							Keyword
						</label>
						<input
							className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white text-[14px] outline-none focus:border-blue-500/50 transition-colors"
							placeholder="Enter a keyword"
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
						/>
						<p className="text-[11px] text-white/20 font-bold">Search card names.</p>
					</div>

					{/* Card Created */}
					<div className="space-y-4">
						<label className="text-[12px] font-black text-white/40 uppercase tracking-widest">
							Card created
						</label>
						<div className="space-y-3">
							<FilterOption
								label="Created in the last week"
								checked={createdRange === "last-week"}
								onChange={() => setCreatedRange(createdRange === "last-week" ? null : "last-week")}
							/>
							<FilterOption
								label="Created in the last two weeks"
								checked={createdRange === "last-2-weeks"}
								onChange={() =>
									setCreatedRange(createdRange === "last-2-weeks" ? null : "last-2-weeks")
								}
							/>
							<FilterOption
								label="Created in the last month"
								checked={createdRange === "last-month"}
								onChange={() =>
									setCreatedRange(createdRange === "last-month" ? null : "last-month")
								}
							/>
						</div>
					</div>

					{/* Card Status */}
					<div className="space-y-4">
						<label className="text-[12px] font-black text-white/40 uppercase tracking-widest">
							Card status
						</label>
						<div className="space-y-3">
							<FilterOption
								label="Marked as complete"
								checked={statusFilter === "complete"}
								onChange={() => setStatusFilter(statusFilter === "complete" ? null : "complete")}
							/>
							<FilterOption
								label="Not marked as complete"
								checked={statusFilter === "incomplete"}
								onChange={() =>
									setStatusFilter(statusFilter === "incomplete" ? null : "incomplete")
								}
							/>
						</div>
					</div>

					{/* Due Date */}
					<div className="space-y-4">
						<label className="text-[12px] font-black text-white/40 uppercase tracking-widest">
							Due date
						</label>
						<div className="space-y-3">
							<FilterOption
								label="No dates"
								checked={dueRange === "none"}
								onChange={() => setDueRange(dueRange === "none" ? null : "none")}
								icon={<Calendar className="w-4 h-4 text-white/40" />}
							/>
							<FilterOption
								label="Overdue"
								checked={dueRange === "overdue"}
								onChange={() => setDueRange(dueRange === "overdue" ? null : "overdue")}
								icon={
									<div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
										<Clock className="w-3 h-3 text-red-500" />
									</div>
								}
							/>
							<FilterOption
								label="Due in the next day"
								checked={dueRange === "next-day"}
								onChange={() => setDueRange(dueRange === "next-day" ? null : "next-day")}
								icon={
									<div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
										<Clock className="w-3 h-3 text-yellow-500" />
									</div>
								}
							/>
							<FilterOption
								label="Due in the next week"
								checked={dueRange === "next-week"}
								onChange={() => setDueRange(dueRange === "next-week" ? null : "next-week")}
								icon={<Clock className="w-4 h-4 text-white/40" />}
							/>
							<FilterOption
								label="Due in the next month"
								checked={dueRange === "next-month"}
								onChange={() => setDueRange(dueRange === "next-month" ? null : "next-month")}
								icon={<Clock className="w-4 h-4 text-white/40" />}
							/>
						</div>
					</div>

					<button
						onClick={resetFilters}
						className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white text-[13px] font-bold transition-all border border-white/5"
					>
						Reset all filters
					</button>
				</div>
			</div>
		</div>
	);
}

function FilterOption({
	label,
	checked,
	onChange,
	icon,
}: {
	label: string;
	checked: boolean;
	onChange: () => void;
	icon?: React.ReactNode;
}) {
	return (
		<div className="flex items-center gap-3 group cursor-pointer" onClick={onChange}>
			<div
				className={cn(
					"w-4.5 h-4.5 rounded border transition-all flex items-center justify-center",
					checked
						? "bg-blue-500 border-blue-500"
						: "border-white/20 group-hover:border-white/40 bg-black/20",
				)}
			>
				{checked && <div className="w-2 h-2 bg-white rounded-full" />}
			</div>
			<div className="flex items-center gap-2">
				{icon}
				<span
					className={cn(
						"text-[14px] transition-colors",
						checked ? "text-white font-bold" : "text-white/60 group-hover:text-white",
					)}
				>
					{label}
				</span>
			</div>
		</div>
	);
}

function MenuItem({
	icon,
	label,
	onClick,
	active,
}: {
	icon?: React.ReactNode;
	label: string;
	onClick?: () => void;
	active?: boolean;
}) {
	return (
		<div
			onClick={onClick}
			className={cn(
				"flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer transition-all group",
				active && "bg-white/10",
			)}
		>
			<div className="flex items-center gap-3">
				{icon && (
					<div className="text-white/40 group-hover:text-white transition-colors">{icon}</div>
				)}
				<span
					className={cn(
						"text-[14px] font-bold",
						active ? "text-white" : "text-white/60 group-hover:text-white transition-colors",
					)}
				>
					{label}
				</span>
			</div>
			<ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all" />
		</div>
	);
}

function MenuHeader({ title, onBack }: { title: string; onBack: () => void }) {
	return (
		<div className="p-3 border-b border-white/5 flex items-center justify-between">
			<button
				onClick={onBack}
				className="p-1 hover:bg-white/5 rounded transition-colors text-white/40 hover:text-white"
			>
				<ChevronLeft className="w-4 h-4" />
			</button>
			<span className="text-[13px] font-black text-white uppercase tracking-widest">{title}</span>
			<div className="w-6" />
		</div>
	);
}
