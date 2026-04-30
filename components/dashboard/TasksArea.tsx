"use client";

import {
	closestCorners,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	type DropAnimation,
	defaultDropAnimationSideEffects,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import {
	Calendar as CalendarIcon,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Circle,
	Columns3,
	Inbox as InboxIcon,
	Layout,
	ListFilter,
	MoreHorizontal,
	Plus,
	Settings,
	Star,
	Users,
	Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Types
interface Task {
	id: string;
	title: string;
	description?: string;
	completed?: boolean;
}

interface Column {
	id: string;
	name: string;
	color: string;
	taskIds: string[];
}

interface TasksState {
	tasks: Record<string, Task>;
	inbox: string[];
	columns: Record<string, Column>;
	columnOrder: string[];
	planner: string[];
}

const UI = {
	inbox: {
		bg: "linear-gradient(135deg, #2F6F66 0%, #3F8A80 100%)",
		input: "#1F2933",
		text: "#FFFFFF",
		muted: "rgba(255,255,255,0.75)",
	},
	planner: {
		bg: "#1F2329",
		card: "#2A2F36",
		accent: "#3B82F6",
		text: "#FFFFFF",
		muted: "#94A3B8",
	},
	board: {
		bg: "linear-gradient(135deg, #7C4D7E 0%, #8B5E8C 100%)",
		cols: {
			today: "#A16207",
			week: "#166534",
			later: "#111111",
		},
		text: "#FFFFFF",
	},
	nav: {
		bg: "#0D0F12",
		border: "rgba(255,255,255,0.1)",
		primary: "#3B82F6",
	},
};

const INITIAL_STATE: TasksState = {
	tasks: {
		"task-1": { id: "task-1", title: "Refine teal contrast" },
		"task-2": { id: "task-2", title: "Fix purple saturation" },
		"task-3": { id: "task-3", title: "Connect planner view" },
		"task-4": { id: "task-4", title: "Final Polish" },
		"task-5": { id: "task-5", title: "Initial concept review" },
		"task-6": { id: "task-6", title: "Weekly sync preparation" },
	},
	inbox: ["task-5", "task-6"],
	columns: {
		"col-today": {
			id: "col-today",
			name: "Today",
			color: UI.board.cols.today,
			taskIds: ["task-1", "task-2"],
		},
		"col-week": {
			id: "col-week",
			name: "This Week",
			color: UI.board.cols.week,
			taskIds: ["task-3"],
		},
		"col-later": {
			id: "col-later",
			name: "Later",
			color: UI.board.cols.later,
			taskIds: ["task-4"],
		},
	},
	columnOrder: ["col-today", "col-week", "col-later"],
	planner: [],
};

const dropAnimation: DropAnimation = {
	sideEffects: defaultDropAnimationSideEffects({
		styles: {
			active: {
				opacity: "0.5",
			},
		},
	}),
};

export function TasksArea() {
	const [state, setState] = useState<TasksState>(INITIAL_STATE);
	const [activeTabs, setActiveTabs] = useState<string[]>(["inbox", "planner", "board"]);
	const [widths, setWidths] = useState<Record<string, number>>({});
	const [activeId, setActiveId] = useState<string | null>(null);

	const toggleTaskCompletion = (taskId: string) => {
		setState((prev) => ({
			...prev,
			tasks: {
				...prev.tasks,
				[taskId]: {
					...prev.tasks[taskId],
					completed: !prev.tasks[taskId].completed,
				},
			},
		}));
	};

	const renameColumn = (columnId: string, newName: string) => {
		setState((prev) => ({
			...prev,
			columns: {
				...prev.columns,
				[columnId]: {
					...prev.columns[columnId],
					name: newName,
				},
			},
		}));
	};
	const containerRef = useRef<HTMLDivElement>(null);
	const isResizing = useRef<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
	);

	useEffect(() => {
		const count = activeTabs.length;
		if (count === 0) return;

		const newWidths: Record<string, number> = {};
		if (activeTabs.includes("inbox") && count > 1) {
			const inboxWidth = 20;
			newWidths.inbox = inboxWidth;
			const remainingWidth = 100 - inboxWidth;
			const othersCount = count - 1;
			activeTabs
				.filter((t) => t !== "inbox")
				.forEach((tab) => {
					newWidths[tab] = remainingWidth / othersCount;
				});
		} else {
			const equalWidth = 100 / count;
			activeTabs.forEach((tab) => {
				newWidths[tab] = equalWidth;
			});
		}
		setWidths(newWidths);
	}, [activeTabs.length]);

	const toggleTab = (tabId: string) => {
		setActiveTabs((prev) =>
			prev.includes(tabId)
				? prev.filter((t) => t !== tabId)
				: [...prev, tabId].sort((a, b) => {
						const order = ["inbox", "planner", "board"];
						return order.indexOf(a) - order.indexOf(b);
					}),
		);
	};

	const startResizing = (leftTabId: string) => {
		isResizing.current = leftTabId;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	};

	const stopResizing = useCallback(() => {
		isResizing.current = null;
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	}, []);

	const onResize = useCallback(
		(e: MouseEvent) => {
			if (!isResizing.current || !containerRef.current) return;
			const containerRect = containerRef.current.getBoundingClientRect();
			const mouseX = e.clientX - containerRect.left;
			const totalWidth = containerRect.width;

			const activeTabList = activeTabs;
			const leftTabIndex = activeTabList.indexOf(isResizing.current);
			const rightTabId = activeTabList[leftTabIndex + 1];

			if (!rightTabId) return;

			const leftTabId = isResizing.current;
			const leftWidthPct = widths[leftTabId];
			const rightWidthPct = widths[rightTabId];

			let offsetPx = 0;
			for (let i = 0; i < leftTabIndex; i++) {
				offsetPx += (widths[activeTabList[i]] / 100) * totalWidth;
			}

			const newLeftWidthPx = mouseX - offsetPx;
			const newLeftWidthPct = (newLeftWidthPx / totalWidth) * 100;
			const delta = newLeftWidthPct - leftWidthPct;

			if (leftWidthPct + delta > 10 && rightWidthPct - delta > 10) {
				setWidths((prev) => ({
					...prev,
					[leftTabId]: leftWidthPct + delta,
					[rightTabId]: rightWidthPct - delta,
				}));
			}
		},
		[activeTabs, widths],
	);

	useEffect(() => {
		window.addEventListener("mousemove", onResize);
		window.addEventListener("mouseup", stopResizing);
		return () => {
			window.removeEventListener("mousemove", onResize);
			window.removeEventListener("mouseup", stopResizing);
		};
	}, [onResize, stopResizing]);

	const findContainer = (id: string) => {
		if (id in state.columns) return id;
		if (state.inbox.includes(id)) return "inbox";
		if (state.planner.includes(id)) return "planner";

		for (const key in state.columns) {
			if (state.columns[key].taskIds.includes(id)) return key;
		}

		return null;
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		const id = active.id as string;
		const overId = over?.id as string;

		if (!overId) return;

		const activeContainer = findContainer(id);
		const overContainer = findContainer(overId);

		if (!activeContainer || !overContainer || activeContainer === overContainer) return;

		setState((prev) => {
			const activeItems =
				activeContainer === "inbox"
					? prev.inbox
					: activeContainer === "planner"
						? prev.planner
						: prev.columns[activeContainer].taskIds;

			const overItems =
				overContainer === "inbox"
					? prev.inbox
					: overContainer === "planner"
						? prev.planner
						: prev.columns[overContainer].taskIds;

			const activeIndex = activeItems.indexOf(id);
			const overIndex = overItems.indexOf(overId);

			let newIndex: number;
			if (overId in prev.columns || overId === "inbox" || overId === "planner") {
				newIndex = overItems.length + 1;
			} else {
				const isBelowLastItem = over && activeIndex > overIndex;
				const modifier = isBelowLastItem ? 1 : 0;
				newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
			}

			const newState = { ...prev };

			// Remove from source
			if (activeContainer === "inbox") newState.inbox = prev.inbox.filter((i) => i !== id);
			else if (activeContainer === "planner")
				newState.planner = prev.planner.filter((i) => i !== id);
			else {
				newState.columns = {
					...prev.columns,
					[activeContainer]: {
						...prev.columns[activeContainer],
						taskIds: prev.columns[activeContainer].taskIds.filter((i) => i !== id),
					},
				};
			}

			// Add to dest
			if (overContainer === "inbox") {
				const newInbox = [...prev.inbox];
				newInbox.splice(newIndex, 0, id);
				newState.inbox = newInbox;
			} else if (overContainer === "planner") {
				const newPlanner = [...prev.planner];
				newPlanner.splice(newIndex, 0, id);
				newState.planner = newPlanner;
			} else {
				const newColTasks = [...prev.columns[overContainer].taskIds];
				newColTasks.splice(newIndex, 0, id);
				newState.columns = {
					...newState.columns,
					[overContainer]: {
						...prev.columns[overContainer],
						taskIds: newColTasks,
					},
				};
			}

			return newState;
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		const id = active.id as string;
		const overId = over?.id as string;

		if (overId) {
			// Handle Column Reordering
			if (state.columnOrder.includes(id) && state.columnOrder.includes(overId)) {
				const activeIndex = state.columnOrder.indexOf(id);
				const overIndex = state.columnOrder.indexOf(overId);
				if (activeIndex !== overIndex) {
					setState((prev) => ({
						...prev,
						columnOrder: arrayMove(prev.columnOrder, activeIndex, overIndex),
					}));
				}
				setActiveId(null);
				return;
			}

			// Handle Task Reordering
			const activeContainer = findContainer(id);
			const overContainer = findContainer(overId);

			if (activeContainer && overContainer && activeContainer === overContainer) {
				const activeItems =
					activeContainer === "inbox"
						? state.inbox
						: activeContainer === "planner"
							? state.planner
							: state.columns[activeContainer].taskIds;

				const activeIndex = activeItems.indexOf(id);
				const overIndex = activeItems.indexOf(overId);

				if (activeIndex !== overIndex) {
					setState((prev) => {
						const newState = { ...prev };
						if (activeContainer === "inbox")
							newState.inbox = arrayMove(prev.inbox, activeIndex, overIndex);
						else if (activeContainer === "planner")
							newState.planner = arrayMove(prev.planner, activeIndex, overIndex);
						else {
							newState.columns = {
								...prev.columns,
								[activeContainer]: {
									...prev.columns[activeContainer],
									taskIds: arrayMove(prev.columns[activeContainer].taskIds, activeIndex, overIndex),
								},
							};
						}
						return newState;
					});
				}
			}
		}

		setActiveId(null);
	};

	const activeTask = activeId ? state.tasks[activeId] : null;

	return (
		<div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden p-5 relative bg-[#111111]">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<div
					ref={containerRef}
					className="flex-1 flex gap-0 min-w-0 h-full overflow-hidden relative"
				>
					<AnimatePresence initial={false}>
						{activeTabs.map((tabId, index) => (
							<div key={tabId} className="flex h-full" style={{ width: `${widths[tabId]}%` }}>
								<PanelContainer id={tabId}>
									{tabId === "inbox" && (
										<InboxPanel
											tasks={state.inbox.map((id) => state.tasks[id]).filter(Boolean)}
											onToggleTask={toggleTaskCompletion}
										/>
									)}
									{tabId === "planner" && (
										<PlannerPanel
											tasks={state.planner.map((id) => state.tasks[id]).filter(Boolean)}
											onToggleTask={toggleTaskCompletion}
										/>
									)}
									{tabId === "board" && (
										<BoardPanel
											columnOrder={state.columnOrder}
											columns={state.columns}
											tasks={state.tasks}
											onToggleTask={toggleTaskCompletion}
											onRenameColumn={renameColumn}
										/>
									)}
								</PanelContainer>

								{index < activeTabs.length - 1 && (
									<div
										className="w-[1px] h-full cursor-col-resize group relative z-10 mx-1 bg-white/5"
										onMouseDown={() => startResizing(tabId)}
									>
										<div className="absolute inset-y-0 -left-2 -right-2 hover:bg-white/10 transition-colors" />
									</div>
								)}
							</div>
						))}
					</AnimatePresence>
				</div>

				<DragOverlay dropAnimation={dropAnimation}>
					{activeId ? (
						<div className="opacity-80 scale-105 pointer-events-none">
							{state.columnOrder.includes(activeId) && state.columns[activeId] ? (
								<BoardColumn
									column={state.columns[activeId]}
									tasks={state.columns[activeId].taskIds
										.map((id) => state.tasks[id])
										.filter(Boolean)}
									isOverlay
								/>
							) : state.tasks[activeId] ? (
								<TaskCard task={state.tasks[activeId]} isOverlay />
							) : null}
						</div>
					) : null}
				</DragOverlay>
			</DndContext>

			{/* Floating Bottom Nav */}
			<div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-50">
				<div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border shadow-2xl bg-[#0D0F12] border-white/10">
					<NavButton
						icon={<InboxIcon className="w-5 h-5" />}
						label="Inbox"
						active={activeTabs.includes("inbox")}
						onClick={() => toggleTab("inbox")}
					/>
					<NavButton
						icon={<CalendarIcon className="w-5 h-5" />}
						label="Planner"
						active={activeTabs.includes("planner")}
						onClick={() => toggleTab("planner")}
					/>
					<NavButton
						icon={<Layout className="w-5 h-5" />}
						label="Board"
						active={activeTabs.includes("board")}
						onClick={() => toggleTab("board")}
					/>
					<div className="w-[1px] h-6 mx-2 bg-white/10" />
					<button
						type="button"
						className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white/40 hover:text-white transition-colors"
					>
						<Columns3 className="w-4 h-4" />
						Views
					</button>
				</div>
			</div>
		</div>
	);
}

function PanelContainer({ children }: { id: string; children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, x: -10 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -10 }}
			className="flex-1 h-full overflow-hidden rounded-[24px] shadow-2xl border border-white/5 flex flex-col mx-1"
		>
			{children}
		</motion.div>
	);
}

function InboxPanel({
	tasks,
	onToggleTask,
}: {
	tasks: Task[];
	onToggleTask: (id: string) => void;
}) {
	return (
		<div className="h-full flex flex-col" style={{ background: UI.inbox.bg }}>
			<div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
				<div className="flex items-center gap-2">
					<InboxIcon className="w-5.5 h-5.5 text-white/90" />
					<span className="text-[18px] font-bold text-white">Inbox</span>
				</div>
				<div className="flex items-center gap-3">
					<ListFilter className="w-5.5 h-5.5 text-white/60 hover:text-white cursor-pointer transition-colors" />
					<MoreHorizontal className="w-5.5 h-5.5 text-white/60 hover:text-white cursor-pointer transition-colors" />
				</div>
			</div>
			<div className="p-4 space-y-3 flex-1 overflow-y-auto">
				<div className="rounded-xl py-2.5 px-4.5 shadow-2xl bg-black/20 transition-transform hover:scale-[1.01] cursor-text mb-4">
					<span className="text-[16px] text-white/40">Add new task</span>
				</div>
				<SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
					{tasks.map((task) => (
						<SortableTaskCard key={task.id} task={task} onToggle={onToggleTask} />
					))}
				</SortableContext>
				{tasks.length === 0 && (
					<div className="flex-1 flex items-center justify-center h-40 text-white/20 italic text-[14px]">
						Empty Inbox
					</div>
				)}
			</div>
			<div className="p-5 mt-auto">
				<div className="rounded-[18px] p-4 bg-black/20 flex items-center justify-between border border-white/5 hover:bg-black/30 transition-colors cursor-pointer">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
							<Settings className="w-4 h-4 text-white" />
						</div>
						<p className="text-[14px] font-bold text-white">Consolidate workflow</p>
					</div>
					<ChevronRight className="w-4 h-4 text-white/40" />
				</div>
			</div>
		</div>
	);
}

function PlannerPanel({
	tasks,
	onToggleTask,
}: {
	tasks: Task[];
	onToggleTask: (id: string) => void;
}) {
	return (
		<div className="h-full flex flex-col" style={{ backgroundColor: UI.planner.bg }}>
			<div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
				<div className="flex items-center gap-3">
					<CalendarIcon className="w-5.5 h-5.5 text-white/90" />
					<span className="text-[18px] font-bold text-white">Planner</span>
				</div>
				<div className="flex items-center gap-3">
					<ListFilter className="w-5.5 h-5.5 text-white/60 hover:text-white cursor-pointer transition-colors" />
					<MoreHorizontal className="w-5.5 h-5.5 text-white/60 hover:text-white cursor-pointer transition-colors" />
				</div>
			</div>
			<div className="flex-1 overflow-y-auto flex flex-col p-4 space-y-4">
				<SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
					{tasks.map((task) => (
						<SortableTaskCard key={task.id} task={task} onToggle={onToggleTask} />
					))}
				</SortableContext>

				{tasks.length === 0 && (
					<div className="flex flex-col items-center py-10 text-center opacity-40">
						<div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 shadow-inner">
							<CalendarIcon className="w-8 h-8" style={{ color: UI.planner.accent }} />
						</div>
						<h1 className="text-[20px] font-extrabold text-white mb-2 tracking-tight">
							Schedule Tasks
						</h1>
						<p
							className="text-[13px] max-w-[200px] leading-relaxed"
							style={{ color: UI.planner.muted }}
						>
							Drag tasks here to schedule them.
						</p>
					</div>
				)}

				<div className="w-full mt-auto space-y-6 pt-8 border-t border-white/5 text-left">
					{[9, 10, 11, 12, 1].map((h) => (
						<div key={h} className="flex gap-4 items-center">
							<span
								className="text-[11px] w-10 font-black uppercase tracking-widest"
								style={{ color: UI.planner.muted }}
							>
								{h}
								{h >= 9 && h < 12 ? "am" : "pm"}
							</span>
							<div className="h-[1.5px] flex-1 bg-white/5 rounded-full" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function BoardPanel({
	columnOrder,
	columns,
	tasks,
	onToggleTask,
	onRenameColumn,
}: {
	columnOrder: string[];
	columns: Record<string, Column>;
	tasks: Record<string, Task>;
	onToggleTask: (id: string) => void;
	onRenameColumn: (id: string, name: string) => void;
}) {
	return (
		<div className="h-full flex flex-col overflow-hidden" style={{ background: UI.board.bg }}>
			<div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
				<div className="flex items-center gap-4">
					<span className="text-[19px] font-bold text-white tracking-tight">My Board</span>
					<div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 cursor-pointer transition-colors text-white/80">
						<Columns3 className="w-5 h-5" />
						<ChevronDown className="w-4.5 h-4.5" />
					</div>
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
			<ScrollArea className="flex-1">
				<div className="p-5 flex gap-5 items-start">
					<SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
						{columnOrder.map((id) =>
							columns[id] ? (
								<BoardColumn
									key={id}
									column={columns[id]}
									tasks={columns[id].taskIds.map((tid) => tasks[tid]).filter(Boolean)}
									onToggleTask={onToggleTask}
									onRename={onRenameColumn}
								/>
							) : null,
						)}
					</SortableContext>
					<button
						type="button"
						className="w-[320px] min-w-[320px] p-5 rounded-2xl bg-white/10 text-white text-[14px] font-bold text-left border border-white/10 hover:bg-white/20 transition-colors shadow-xl"
					>
						<Plus className="w-4 h-4 inline mr-2" />
						Add list
					</button>
				</div>
			</ScrollArea>
		</div>
	);
}

function BoardColumn({
	column,
	tasks,
	onToggleTask,
	onRename,
	isOverlay,
}: {
	column: Column;
	tasks: Task[];
	onToggleTask?: (id: string) => void;
	onRename?: (id: string, name: string) => void;
	isOverlay?: boolean;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState(column.name);

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: column.id,
		data: { type: "Column" },
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
	};

	const handleRename = () => {
		if (editName.trim() && editName !== column.name) {
			onRename?.(column.id, editName);
		}
		setIsEditing(false);
	};

	return (
		<div
			ref={setNodeRef}
			style={{ ...style, backgroundColor: column.color }}
			className={cn(
				"w-[320px] min-w-[320px] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/5 transition-opacity",
				isDragging && !isOverlay && "opacity-30",
				isOverlay && "opacity-80 cursor-grabbing",
			)}
		>
			<div
				{...attributes}
				{...listeners}
				className="px-4 py-4 flex items-center justify-between text-white font-black text-[16px] tracking-tight cursor-grab active:cursor-grabbing"
			>
				{isEditing ? (
					<input
						autoFocus
						className="bg-black/20 border-none outline-none rounded px-2 py-0.5 w-full text-white font-black text-[16px] tracking-tight"
						value={editName}
						onChange={(e) => setEditName(e.target.value)}
						onBlur={handleRename}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleRename();
							if (e.key === "Escape") {
								setEditName(column.name);
								setIsEditing(false);
							}
						}}
					/>
				) : (
					<span onClick={() => setIsEditing(true)} className="cursor-text hover:text-white/80">
						{column.name}
					</span>
				)}
				<MoreHorizontal className="w-4 h-4 opacity-60" />
			</div>
			<div className="p-2.5 space-y-2.5 flex-1 min-h-[100px]">
				<SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
					{tasks.map((task) => (
						<SortableTaskCard key={task.id} task={task} onToggle={onToggleTask} />
					))}
				</SortableContext>

				<button
					type="button"
					className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/20 text-[12px] font-bold text-white w-full transition-colors mt-1"
				>
					<Plus className="w-4 h-4" /> Add card
				</button>
			</div>
		</div>
	);
}

function SortableTaskCard({ task, onToggle }: { task: Task; onToggle?: (id: string) => void }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: task.id,
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-30")}
		>
			<TaskCard task={task} onToggle={onToggle} />
		</div>
	);
}

function TaskCard({
	task,
	isOverlay,
	onToggle,
}: {
	task: Task;
	isOverlay?: boolean;
	onToggle?: (id: string) => void;
}) {
	return (
		<div
			className={cn(
				"rounded-xl py-2.5 px-4.5 shadow-xl border border-white/10 group transition-all flex items-center gap-3 relative",
				isOverlay ? "bg-[#1F2933]" : "bg-[#1F2933] hover:bg-white/[0.03]",
			)}
		>
			<div
				className={cn(
					"cursor-pointer transition-all duration-300 transform",
					task.completed
						? "opacity-100 scale-100"
						: "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100",
				)}
				onClick={(e) => {
					e.stopPropagation();
					onToggle?.(task.id);
				}}
			>
				{task.completed ? (
					<CheckCircle2 className="w-5 h-5 text-green-500" />
				) : (
					<Circle className="w-5 h-5 text-white/40 hover:text-white/80" />
				)}
			</div>
			<p
				className={cn(
					"text-[16px] font-bold text-white truncate flex-1 transition-all duration-300",
					!task.completed && "group-hover:translate-x-1",
					task.completed && "translate-x-1",
				)}
			>
				{task.title}
			</p>
		</div>
	);
}

function NavButton({
	icon,
	label,
	active,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-2.5 px-6 py-3 rounded-xl text-[14px] font-bold transition-all relative overflow-hidden",
				active ? "text-white" : "text-white/40 hover:text-white/60",
			)}
		>
			<AnimatePresence>
				{active && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="absolute inset-0 bg-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.4)] z-0"
					/>
				)}
			</AnimatePresence>
			<div
				className={cn("relative z-10 transition-colors", active ? "text-white" : "text-inherit")}
			>
				{icon}
			</div>
			<span className="relative z-10">{label}</span>
		</button>
	);
}
