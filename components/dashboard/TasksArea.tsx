"use client";

import {
	closestCorners,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	defaultDropAnimationSideEffects,
	KeyboardSensor,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	Calendar as CalendarIcon,
	Inbox as InboxIcon,
	Layout,
	LayoutDashboard,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import {
	useCreateSpace,
	useCreateTaskStatus,
	useDeleteSpace,
	useSpaces,
	useUpdateSpace,
	useUpdateTaskStatus,
} from "@/hooks/api/use-spaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useBoardSync } from "@/lib/hooks/useBoardSync";
import { usePersonalTasks } from "@/lib/hooks/usePersonalTasks";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { AskAIPanel } from "./space/AskAIPanel";
import { BoardPanel } from "./tasks/BoardPanel";
// Modular Components
import { InboxPanel } from "./tasks/InboxPanel";
import { PlannerPanel } from "./tasks/PlannerPanel";
import { SwitchBoardPanel } from "./tasks/SwitchBoardPanel";
import { TaskCard } from "./tasks/TaskCard";

const dropAnimation: any = {
	sideEffects: defaultDropAnimationSideEffects({
		styles: {
			active: {
				opacity: "0.5",
			},
		},
	}),
};

export function TasksArea() {
	const { token, user, isLoading: isAuthLoading } = useSupabaseAuth();
	const { activeWorkspaceId } = useWorkspaceStore();
	const { data: spaces, isLoading: isLoadingSpaces } = useSpaces(activeWorkspaceId || "", token);

	const createStatus = useCreateTaskStatus(token);
	const updateStatus = useUpdateTaskStatus(token);
	const createSpace = useCreateSpace(token);
	const updateSpace = useUpdateSpace(token);
	const deleteSpace = useDeleteSpace(token);

	// For the "Board" view, we need a space. We'll pick the first one by default.
	const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

	useEffect(() => {
		if (spaces && spaces.length > 0 && !selectedSpaceId) {
			setSelectedSpaceId(spaces[0].id);
		} else if (
			spaces &&
			spaces.length === 0 &&
			!isLoadingSpaces &&
			activeWorkspaceId &&
			!createSpace.isPending
		) {
			// Auto-create a default space if none exist
			createSpace.mutate({
				workspaceId: activeWorkspaceId,
				name: "My Board",
				prefix: "WS",
			});
		}
	}, [spaces, selectedSpaceId, isLoadingSpaces, activeWorkspaceId, createSpace]);

	const selectedSpace = useMemo(() => {
		return spaces?.find((s) => s.id === selectedSpaceId);
	}, [spaces, selectedSpaceId]);

	const {
		columns: liveColumns,
		columnOrder: liveColumnOrder,
		tasks: liveTasksMap,
		isLoading: isLoadingTasks,
		error,
		createTask: createTaskApi,
		moveTask,
		updateTask: updateTaskApi,
		deleteTask: deleteTaskApi,
		refetch,
	} = useBoardSync({
		spaceId: selectedSpaceId,
		statuses: selectedSpace?.statuses || [],
		token: token || undefined,
		enabled: !!selectedSpaceId && !!token,
	});

	// Handle default status creation if empty
	const initializedSpaceRef = useRef<string | null>(null);
	useEffect(() => {
		if (
			selectedSpaceId &&
			token &&
			!isAuthLoading &&
			spaces &&
			selectedSpace &&
			(selectedSpace.statuses?.length || 0) === 0 &&
			!isLoadingTasks &&
			initializedSpaceRef.current !== selectedSpaceId
		) {
			initializedSpaceRef.current = selectedSpaceId;
			const initDefaults = async () => {
				try {
					// Create default statuses sequentially, continuing even if one fails
					try {
						await createStatus.mutateAsync({
							spaceId: selectedSpaceId,
							data: { name: "Today", color: "#A16207", position: 0, isDone: false },
						});
					} catch (err) {
						console.warn("Today status already exists or failed to create", err);
					}

					try {
						await createStatus.mutateAsync({
							spaceId: selectedSpaceId,
							data: { name: "This Week", color: "#166534", position: 1, isDone: false },
						});
					} catch (err) {
						console.warn("This Week status already exists or failed to create", err);
					}

					try {
						await createStatus.mutateAsync({
							spaceId: selectedSpaceId,
							data: { name: "Later", color: "#111111", position: 2, isDone: false },
						});
					} catch (err) {
						console.warn("Later status already exists or failed to create", err);
					}
				} catch (err) {
					console.error("Failed to create default statuses", err);
				}
			};
			initDefaults();
		}
	}, [
		selectedSpaceId,
		selectedSpace,
		spaces,
		isLoadingTasks,
		token,
		isAuthLoading,
		createStatus.mutateAsync,
	]);

	const {
		inboxTasks,
		plannerTasks: allPlannerTasks,
		refetch: refetchPersonalTasks,
		addOptimisticTask: addOptimisticPersonalTask,
		removeOptimisticTask,
		updateOptimisticTask,
	} = usePersonalTasks(activeWorkspaceId, token || undefined);

	const { liveColumnsFiltered, liveTasksMapFiltered } = useMemo(() => {
		// Return all tasks for the board without filtering out assigned (inbox) tasks,
		// so that a user who gets assigned a task on a board can still see it on that board.
		return { liveColumnsFiltered: liveColumns, liveTasksMapFiltered: liveTasksMap };
	}, [liveColumns, liveTasksMap]);

	// Planner tasks should only be tasks with dates (scheduled)
	const plannerTasks = useMemo(() => {
		return allPlannerTasks.filter((t) => t.startDate || t.dueDate);
	}, [allPlannerTasks]);

	const [activeTabs, setActiveTabs] = useState<string[]>(["inbox", "board"]);
	const [isSwitchBoardModalOpen, setIsSwitchBoardModalOpen] = useState(false);
	const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	const filteredInboxTasks = useMemo(() => {
		// Only show tasks in the Inbox if they are NOT already present on the currently selected board.
		// This follows the user's requirement to avoid duplication while ensuring visibility.
		return inboxTasks.filter((t) => !liveTasksMap[t.id]);
	}, [inboxTasks, liveTasksMap]);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
	const [showBoardDeleteConfirm, setShowBoardDeleteConfirm] = useState(false);
	const [widths, setWidths] = useState<Record<string, number>>({});
	const [activeId, setActiveId] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const selectedTask = useMemo(() => {
		if (!selectedTaskId) return null;
		return (
			liveTasksMap[selectedTaskId] ||
			inboxTasks.find((t) => t.id === selectedTaskId) ||
			allPlannerTasks.find((t) => t.id === selectedTaskId)
		);
	}, [selectedTaskId, liveTasksMap, inboxTasks, allPlannerTasks]);

	const handleTaskClick = (task: Task) => {
		setSelectedTaskId(task.id);
		setIsModalOpen(true);
	};

	const toggleTaskCompletion = async (taskId: string) => {
		const task =
			liveTasksMap[taskId] ||
			inboxTasks.find((t) => t.id === taskId) ||
			allPlannerTasks.find((t) => t.id === taskId);

		if (!task) return;

		const isCurrentlyCompleted = task.resolution === "DONE" || (task.status?.isDone ?? false);
		const newResolution = isCurrentlyCompleted ? "UNRESOLVED" : "DONE";

		updateOptimisticTask(taskId, { resolution: newResolution });
		updateTaskApi(taskId, { resolution: newResolution });
		refetchPersonalTasks();
	};

	const renameColumn = async (columnId: string, newName: string) => {
		if (!selectedSpaceId) return;
		try {
			await updateStatus.mutateAsync({
				spaceId: selectedSpaceId,
				statusId: columnId,
				data: { name: newName },
			});
			refetchPersonalTasks();
		} catch (_err) {
			// Silent error
		}
	};

	const addColumn = async (name: string) => {
		if (!selectedSpaceId) return;
		try {
			await createStatus.mutateAsync({
				spaceId: selectedSpaceId,
				data: {
					name,
					color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
					position: liveColumnOrder.length,
				},
			});
			refetchPersonalTasks();
		} catch (_err) {
			// Silent error
		}
	};

	const addTask = async (containerId: string, title: string) => {
		if (
			!selectedSpaceId ||
			!selectedSpace ||
			!selectedSpace.statuses ||
			selectedSpace.statuses.length === 0
		) {
			toast.error("No active space or status found to create task");
			return;
		}

		const defaultStatusId = selectedSpace.statuses[0].id;

		// Create a temporary task for immediate UI feedback in personal panels
		const tempId = `temp-${Date.now()}`;
		const tempTask: Task = {
			id: tempId,
			title,
			statusId: defaultStatusId,
			spaceId: selectedSpaceId,
			assigneeId: containerId === "inbox" ? user?.id : undefined,
			reporterId: user?.id || "",
			priority: "NONE",
			workType: "TASK",
			taskNumber: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			status: selectedSpace.statuses[0],
		} as unknown as Task;

		try {
			let newTask: Task | null = null;
			if (containerId === "inbox") {
				addOptimisticPersonalTask(tempTask, "inbox");
				newTask = await createTaskApi(defaultStatusId, title, { assigneeId: user?.id });
			} else if (containerId === "planner") {
				const today = new Date();
				today.setHours(12, 0, 0, 0);
				const taskWithDate = { ...tempTask, dueDate: today.toISOString() };
				addOptimisticPersonalTask(taskWithDate, "planner");
				newTask = await createTaskApi(defaultStatusId, title, { dueDate: today.toISOString() });
			} else if (liveColumns[containerId]) {
				// Board creation is already optimistic via useRealtimeTasks
				newTask = await createTaskApi(containerId, title);
			}

			if (selectedTaskId === tempId && newTask) {
				setSelectedTaskId(newTask.id);
			}

			// Background refetch to ensure everything is in sync
			refetchPersonalTasks();
		} catch (_err) {
			refetchPersonalTasks(); // Rollback/Sync
		}
	};

	const containerRef = useRef<HTMLDivElement>(null);
	const isResizing = useRef<string | null>(null);

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
	}, [activeTabs]);

	const toggleTab = (tabId: string) => {
		if (tabId === "switch-board") {
			setIsSwitchBoardModalOpen(true);
			return;
		}
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

	const findContainer = (fullId: string) => {
		const id = fullId.replace(/^(inbox-|board-|planner-)/, "");
		if (id === "inbox" || id === "planner" || id in liveColumns) return id;
		if (fullId.startsWith("inbox-")) return "inbox";
		if (fullId.startsWith("planner-")) return "planner";

		for (const key in liveColumns) {
			if (liveColumns[key].taskIds.includes(id)) return key;
		}

		return null;
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		const fullOverId = over?.id as string;
		if (!fullOverId) return;

		const activeContainer = findContainer(active.id as string);
		const overContainer = findContainer(fullOverId);

		if (!activeContainer || !overContainer || activeContainer === overContainer) return;

		// Here we could update local state for smooth card jumping
		// For now, dnd-kit handles sorting within the same container automatically via SortableContext
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		const fullId = active.id as string;
		const fullOverId = over?.id as string;

		if (!fullOverId) {
			setActiveId(null);
			return;
		}

		const id = fullId.replace(/^(inbox-|board-|planner-)/, "");
		const overId = fullOverId.replace(/^(inbox-|board-|planner-)/, "");

		const activeContainer = findContainer(fullId);
		const overContainer = findContainer(fullOverId);

		if (activeContainer && overContainer) {
			if (
				activeContainer === overContainer &&
				(activeContainer === "inbox" || liveColumnOrder.includes(activeContainer))
			) {
				// Reordering within the same container
				const containerTasks =
					activeContainer === "inbox"
						? inboxTasks.map((t) => t.id)
						: liveColumns[activeContainer].taskIds;

				const oldIndex = containerTasks.indexOf(id);
				const newIndex = (
					activeContainer === "inbox"
						? inboxTasks.map((t) => t.id)
						: liveColumns[activeContainer].taskIds
				).indexOf(overId);

				if (oldIndex !== newIndex) {
					// Calculate new position
					const overCol = activeContainer === "inbox" ? null : liveColumns[activeContainer];
					const taskIds =
						activeContainer === "inbox" ? inboxTasks.map((t) => t.id) : overCol?.taskIds || [];

					let newPosition: number;
					if (newIndex === 0) newPosition = (liveTasksMap[taskIds[0]]?.position ?? 0) / 2;
					else if (newIndex === taskIds.length - 1)
						newPosition = (liveTasksMap[taskIds[newIndex]]?.position ?? 0) + 65536;
					else {
						const prevPos = liveTasksMap[taskIds[newIndex - 1]]?.position ?? 0;
						const nextPos = liveTasksMap[taskIds[newIndex]]?.position ?? 0;
						newPosition = (prevPos + nextPos) / 2;
					}

					// Optimistic update for same-container move
					if (activeContainer === "inbox") {
						// For inbox, we just let the API handle it or could add optimistic reorder if we had a dedicated hook
						moveTask(id, liveTasksMap[id]?.statusId || "", newPosition);
					} else {
						moveTask(id, activeContainer, newPosition);
					}
				}
			} else if (
				liveColumnOrder.includes(overContainer) ||
				overContainer === "inbox" ||
				overContainer === "planner"
			) {
				// Cross-container movement
				let newPosition: number;
				let targetStatusId = overContainer;

				if (liveColumnOrder.includes(overContainer)) {
					const overCol = liveColumns[overContainer];
					const lastTaskId = overCol.taskIds[overCol.taskIds.length - 1];
					newPosition = lastTaskId ? (liveTasksMap[lastTaskId]?.position ?? 0) + 65536 : 65536;
				} else {
					targetStatusId = selectedSpace?.statuses?.[0]?.id || "";
					newPosition = 65536;
				}

				const task =
					liveTasksMap[id] ||
					inboxTasks.find((t) => t.id === id) ||
					plannerTasks.find((t) => t.id === id);
				if (!task) return;

				if (overContainer === "inbox" && user?.id) {
					// Moving TO Inbox
					addOptimisticPersonalTask(task, "inbox");
					updateTaskApi(id, {
						assigneeId: user.id,
						statusId: targetStatusId,
						position: newPosition,
					});
				} else if (overContainer === "planner") {
					// Dragging to planner is disabled as per user request
					setActiveId(null);
					return;
				} else if (liveColumnOrder.includes(overContainer)) {
					// Moving TO Board
					removeOptimisticTask(id);
					updateTaskApi(id, {
						statusId: overContainer,
						position: newPosition,
					});
				}
			}
		}

		setActiveId(null);
	};

	const activeTask = activeId
		? (() => {
				const id = activeId.replace(/^(inbox-|board-|planner-)/, "");
				return (
					liveTasksMap[id] ||
					inboxTasks.find((t) => t.id === id) ||
					plannerTasks.find((t) => t.id === id)
				);
			})()
		: null;

	// ─── Error State ─────────────────────────────────────────────
	if (!isLoadingSpaces && !isLoadingTasks && error) {
		return (
			<div className="flex-1 flex items-center justify-center bg-[#111111]">
				<div className="flex flex-col items-center gap-5 max-w-md text-center px-6">
					<div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
						<AlertCircle className="w-7 h-7 text-red-400" />
					</div>
					<div>
						<p className="text-white font-bold text-[17px] mb-1">Something went wrong</p>
						<p className="text-white/40 text-[14px]">
							{error.message || "Failed to load tasks. Check your connection and try again."}
						</p>
					</div>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-[14px] rounded-xl border border-white/10 transition-colors"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	if (isLoadingSpaces || (isLoadingTasks && Object.keys(liveTasksMap).length === 0)) {
		return (
			<div className="flex-1 flex items-center justify-center bg-[#111111]">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-4 border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin" />
					<p className="text-white/50 font-semibold text-[14px] uppercase tracking-[0.2em]">
						Synchronizing...
					</p>
				</div>
			</div>
		);
	}

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
											tasks={filteredInboxTasks}
											onToggleTask={toggleTaskCompletion}
											onAddTask={(title) => addTask("inbox", title)}
											onTaskClick={handleTaskClick}
											onDeleteTask={(id) => {
												const task = liveTasksMap[id] || inboxTasks.find((t) => t.id === id);
												if (task) {
													setTaskToDelete(task);
													setShowDeleteConfirm(true);
												}
											}}
										/>
									)}
									{tabId === "planner" && <PlannerPanel />}
									{tabId === "board" && (
										<BoardPanel
											key={selectedSpaceId}
											columnOrder={liveColumnOrder}
											columns={liveColumnsFiltered}
											tasks={liveTasksMapFiltered}
											onToggleTask={toggleTaskCompletion}
											onRenameColumn={renameColumn}
											onAddColumn={addColumn}
											onAddTask={addTask}
											onTaskClick={handleTaskClick}
											onDeleteTask={(id) => {
												const task = liveTasksMap[id];
												if (task) {
													setTaskToDelete(task);
													setShowDeleteConfirm(true);
												}
											}}
											onUpdateTask={updateTaskApi}
											boardName={selectedSpace?.name}
											onRenameBoard={(newName) => {
												if (selectedSpaceId) {
													updateSpace.mutate({
														id: selectedSpaceId,
														data: { name: newName },
													});
												}
											}}
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
					{activeId && activeTask ? (
						<div className="w-[300px]">
							<TaskCard task={activeTask} isOverlay />
						</div>
					) : null}
				</DragOverlay>
			</DndContext>

			<TaskDetailModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				task={selectedTask}
				onUpdateTask={(id, data) => {
					if (inboxTasks.some((t) => t.id === id) || plannerTasks.some((t) => t.id === id)) {
						updateOptimisticTask(id, data);
					}
					updateTaskApi(id, data);
				}}
				workspaceId={activeWorkspaceId}
				isInbox={inboxTasks.some((t) => t.id === selectedTask?.id)}
			/>

			{/* Floating Switcher */}

			{/* Floating Bottom Nav (Oldest Design) */}
			<div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-40">
				<div
					className="flex items-center gap-1 px-2 py-1.5 rounded-2xl border shadow-2xl shadow-black/40"
					style={{
						background: "rgba(18,14,32,0.92)",
						borderColor: "rgba(139,92,246,0.2)",
						backdropFilter: "blur(20px)",
					}}
				>
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
					<NavButton
						icon={<LayoutDashboard className="w-5 h-5" />}
						label="Switch Board"
						active={isSwitchBoardModalOpen}
						onClick={() => setIsSwitchBoardModalOpen(true)}
					/>
					<NavButton
						icon={<Sparkles className="w-5 h-5" />}
						label="Ask AI"
						active={isAIPanelOpen}
						onClick={() => setIsAIPanelOpen(true)}
					/>
				</div>
			</div>

			<AskAIPanel
				open={isAIPanelOpen}
				onClose={() => setIsAIPanelOpen(false)}
				spaceId={selectedSpaceId || ""}
				onTasksCreated={() => {
					refetch();
				}}
			/>

			{/* Switch Board Modal */}
			<AnimatePresence>
				{isSwitchBoardModalOpen && (
					<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsSwitchBoardModalOpen(false)}
							className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							className="relative w-full max-w-4xl h-[80vh] flex flex-col"
						>
							<SwitchBoardPanel
								spaces={spaces || []}
								selectedSpaceId={selectedSpaceId}
								onSelect={(id) => {
									setSelectedSpaceId(id);
									setIsSwitchBoardModalOpen(false);
								}}
								onClose={() => setIsSwitchBoardModalOpen(false)}
								onDelete={(id) => {
									setBoardToDelete(id);
									setShowBoardDeleteConfirm(true);
								}}
								onCreateNew={() => {
									if (activeWorkspaceId && spaces) {
										const myBoardSpaces = spaces.filter((s) => s.name.startsWith("My Board"));
										let nextNum = 1;
										if (myBoardSpaces.length > 0) {
											const nums = myBoardSpaces.map((s) => {
												const match = s.name.match(/My Board (\d+)/);
												return match ? parseInt(match[1], 10) : 0;
											});
											nextNum = Math.max(...nums, 0) + 1;
										}

										createSpace.mutate({
											workspaceId: activeWorkspaceId,
											name: `My Board ${nextNum}`,
											prefix: `MB${nextNum}`,
										});
									}
								}}
							/>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Task Deletion Confirmation Modal */}
			<AnimatePresence>
				{showDeleteConfirm && taskToDelete && (
					<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="w-full max-w-md border border-purple-500/20 rounded-[32px] overflow-hidden shadow-2xl"
							style={{ background: "linear-gradient(160deg, #1E1535 0%, #2D1B5E 100%)" }}
						>
							<div className="p-8">
								<div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
									<AlertCircle className="w-8 h-8 text-red-500" />
								</div>
								<h2 className="text-[24px] font-black text-white mb-3 tracking-tight">
									Delete Task?
								</h2>
								<p className="text-white/40 leading-relaxed mb-8">
									You're about to delete{" "}
									<span className="text-white font-bold">"{taskToDelete.title}"</span>. This action
									cannot be undone and will remove the task for everyone.
								</p>
								<div className="flex items-center gap-4">
									<button
										onClick={() => setShowDeleteConfirm(false)}
										className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all active:scale-95"
									>
										Cancel
									</button>
									<button
										onClick={async () => {
											if (taskToDelete) {
												await deleteTaskApi(taskToDelete.id);
												toast.success("Task deleted");
												setShowDeleteConfirm(false);
												setTaskToDelete(null);
												refetchPersonalTasks();
											}
										}}
										className="flex-1 px-6 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
									>
										Delete Now
									</button>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Board Deletion Confirmation Modal */}
			<AnimatePresence>
				{showBoardDeleteConfirm && boardToDelete && (
					<div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="w-full max-w-md border border-purple-500/20 rounded-[32px] overflow-hidden shadow-2xl"
							style={{ background: "linear-gradient(160deg, #1E1535 0%, #2D1B5E 100%)" }}
						>
							<div className="p-8">
								<div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
									<Trash2 className="w-8 h-8 text-red-500" />
								</div>
								<h2 className="text-[24px] font-black text-white mb-3 tracking-tight">
									Delete Board?
								</h2>
								<p className="text-white/40 leading-relaxed mb-8">
									Are you sure you want to delete this board? This will remove all tasks and
									statuses associated with it. This action cannot be undone.
								</p>
								<div className="flex items-center gap-4">
									<button
										onClick={() => setShowBoardDeleteConfirm(false)}
										className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all active:scale-95"
									>
										Cancel
									</button>
									<button
										onClick={async () => {
											if (boardToDelete) {
												try {
													// Clear selected space immediately to prevent further fetches
													if (selectedSpaceId === boardToDelete) {
														setSelectedSpaceId(null);
													}
													// Then delete the space
													await deleteSpace.mutateAsync(boardToDelete);
													toast.success("Board deleted successfully");
												} catch (error) {
													console.error("Failed to delete board:", error);
													toast.error("Failed to delete board");
												} finally {
													setShowBoardDeleteConfirm(false);
													setBoardToDelete(null);
												}
											}
										}}
										className="flex-1 px-6 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
									>
										Delete Board
									</button>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
}

function PanelContainer({ id, children }: { id: string; children: React.ReactNode }) {
	const { setNodeRef } = useDroppable({ id, disabled: id === "planner" });
	return (
		<div
			ref={setNodeRef}
			className={cn(
				"flex-1 h-full overflow-hidden rounded-[24px] border shadow-2xl transition-colors",
				id === "planner" ? "bg-[#1A1625]" : "bg-transparent",
			)}
			style={{ borderColor: "rgba(255,255,255,0.06)" }}
		>
			{children}
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
				"flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold tracking-tight transition-all duration-200",
				active
					? "bg-[#8B5CF6] text-white shadow-lg shadow-purple-500/30"
					: "text-white/50 hover:text-white/80 hover:bg-white/5",
			)}
		>
			{icon}
			{label}
		</button>
	);
}
