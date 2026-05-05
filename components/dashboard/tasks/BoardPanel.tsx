"use client";

import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import {
	Calendar as CalendarIcon,
	ChevronDown,
	Columns3,
	Gauge,
	LayoutGrid,
	ListFilter,
	MapPin,
	MoreHorizontal,
	Plus,
	Rows3,
	Star,
	Users,
	X,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import { BoardColumn } from "./BoardColumn";
import { CalendarView } from "./CalendarView";
import { TableView } from "./TableView";
import { TimelineView } from "./TimelineView";
import { type Column, UI } from "./types";

function ViewItem({
	icon,
	label,
	active,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	active?: boolean;
	onClick?: () => void;
}) {
	return (
		<div
			onClick={onClick}
			className={cn(
				"flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group",
				active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5",
			)}
		>
			<div
				className={cn(
					"w-5 h-5 flex items-center justify-center transition-colors",
					active ? "text-white" : "text-white/40 group-hover:text-white",
				)}
			>
				{icon}
			</div>
			<span className="text-[15px] font-medium">{label}</span>
		</div>
	);
}

export function BoardPanel({
	columnOrder,
	columns,
	tasks,
	onToggleTask,
	onRenameColumn,
	onAddColumn,
	onAddTask,
	onTaskClick,
	onDeleteTask,
}: {
	columnOrder: string[];
	columns: Record<string, Column>;
	tasks: Record<string, Task>;
	onToggleTask: (id: string) => void;
	onRenameColumn: (id: string, name: string) => void;
	onAddColumn: (name: string) => void;
	onAddTask: (columnId: string, title: string) => void;
	onTaskClick: (task: Task) => void;
	onDeleteTask?: (id: string) => void;
}) {
	const [isAdding, setIsAdding] = useState(false);
	const [newListName, setNewListName] = useState("");
	const [currentView, setCurrentView] = useState<"board" | "table" | "calendar" | "timeline">(
		"board",
	);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleAdd = () => {
		if (newListName.trim()) {
			onAddColumn(newListName.trim());
			setNewListName("");
			setIsAdding(false);
		}
	};

	return (
		<div className="h-full flex flex-col overflow-hidden" style={{ background: UI.board.bg }}>
			<div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
				<div className="flex items-center gap-4">
					<span className="text-[19px] font-bold text-white tracking-tight">My Board</span>
					{mounted && (
						<Popover>
							<PopoverTrigger asChild>
								<div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 cursor-pointer transition-colors text-white/80">
									{currentView === "board" && <Columns3 className="w-5 h-5" />}
									{currentView === "table" && <LayoutGrid className="w-5 h-5" />}
									{currentView === "calendar" && <CalendarIcon className="w-5 h-5" />}
									{currentView === "timeline" && <Rows3 className="w-5 h-5" />}
									<ChevronDown className="w-4.5 h-4.5" />
								</div>
							</PopoverTrigger>
							<PopoverContent
								className="w-64 p-2 bg-[#1E1E1E] border-white/10 text-white shadow-2xl rounded-xl"
								align="start"
							>
								<div className="flex items-center justify-between px-3 py-2 mb-2">
									<span className="text-[14px] font-bold text-white/60 uppercase tracking-wider">
										Views
									</span>
									<X className="w-4 h-4 text-white/40 cursor-pointer hover:text-white" />
								</div>

								<div className="space-y-1">
									<ViewItem
										icon={<Columns3 className="w-4 h-4" />}
										label="Board"
										active={currentView === "board"}
										onClick={() => setCurrentView("board")}
									/>
									<ViewItem
										icon={<LayoutGrid className="w-4 h-4" />}
										label="Table"
										active={currentView === "table"}
										onClick={() => setCurrentView("table")}
									/>
									<ViewItem
										icon={<CalendarIcon className="w-4 h-4" />}
										label="Calendar"
										active={currentView === "calendar"}
										onClick={() => setCurrentView("calendar")}
									/>
									<ViewItem
										icon={<Rows3 className="w-4 h-4" />}
										label="Timeline"
										active={currentView === "timeline"}
										onClick={() => setCurrentView("timeline")}
									/>
									<ViewItem icon={<Gauge className="w-4 h-4" />} label="Dashboard" />
									<ViewItem icon={<MapPin className="w-4 h-4" />} label="Map" />
								</div>
							</PopoverContent>
						</Popover>
					)}
				</div>
				<div className="flex items-center gap-3">
					<div className="flex items-center -space-x-2 mr-2">
						{[1, 2].map((i) => (
							<div
								key={i}
								className="w-8 h-8 rounded-full border-2 border-purple-600 bg-orange-400 flex items-center justify-center text-[10px] font-bold text-white"
							>
								R
							</div>
						))}
					</div>
					<div className="flex items-center gap-4 text-white/60 mr-2">
						<Zap className="w-5.5 h-5.5 hover:text-white cursor-pointer" />
						<ListFilter className="w-5.5 h-5.5 hover:text-white cursor-pointer" />
						<Star className="w-5.5 h-5.5 hover:text-white cursor-pointer" />
						<Users className="w-5.5 h-5.5 hover:text-white cursor-pointer" />
					</div>
					<button
						type="button"
						className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/10 text-white text-[14px] font-medium hover:bg-white/20 transition-colors"
					>
						<Users className="w-5 h-5" />
						Share
					</button>
					<MoreHorizontal className="w-5.5 h-5 text-white/60 hover:text-white cursor-pointer" />
				</div>
			</div>

			{currentView === "board" ? (
				<div className="flex-1 overflow-auto custom-scrollbar">
					<div className="p-5 flex gap-5 items-start min-w-max">
						<SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
							{columnOrder.map((id) =>
								columns[id] ? (
									<BoardColumn
										key={id}
										column={columns[id]}
										tasks={columns[id].taskIds.map((tid) => tasks[tid]).filter(Boolean)}
										onToggleTask={onToggleTask}
										onRename={onRenameColumn}
										onAddTask={onAddTask}
										onTaskClick={onTaskClick}
										onDeleteTask={onDeleteTask}
									/>
								) : null,
							)}
						</SortableContext>
						<div className="shrink-0">
							{isAdding ? (
								<div className="w-[320px] bg-black/20 rounded-2xl p-4 border border-white/10 shadow-2xl">
									<input
										className="w-full bg-black/20 border-none outline-none rounded-xl px-4 py-3 text-white font-bold text-[15px] placeholder:text-white/20 mb-4"
										placeholder="List name"
										value={newListName}
										onChange={(e) => setNewListName(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleAdd()}
									/>
									<div className="flex items-center gap-3">
										<button
											type="button"
											onClick={handleAdd}
											className="px-6 py-2.5 bg-white text-black rounded-xl text-[14px] font-black transition-all hover:bg-white/90 active:scale-95"
										>
											Add list
										</button>
										<button
											type="button"
											onClick={() => setIsAdding(false)}
											className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white"
										>
											<Plus className="w-5 h-5 rotate-45" />
										</button>
									</div>
								</div>
							) : (
								<button
									type="button"
									onClick={() => setIsAdding(true)}
									className="w-[300px] h-[58px] flex items-center gap-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all duration-300 font-bold text-[15px] group border border-white/5 hover:border-white/10 shadow-lg"
								>
									<Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
									Add another list
								</button>
							)}
						</div>
					</div>
				</div>
			) : currentView === "table" ? (
				<TableView
					columns={columns}
					columnOrder={columnOrder}
					tasks={tasks}
					onToggleTask={onToggleTask}
					onTaskClick={onTaskClick}
				/>
			) : currentView === "calendar" ? (
				<CalendarView tasks={tasks} onTaskClick={onTaskClick} />
			) : (
				<TimelineView
					columns={columns}
					columnOrder={columnOrder}
					tasks={tasks}
					onTaskClick={onTaskClick}
				/>
			)}
		</div>
	);
}
