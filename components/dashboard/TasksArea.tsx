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
import { AlertCircle, Calendar as CalendarIcon, Inbox as InboxIcon, Layout } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import { useCreateTaskStatus, useSpaces, useUpdateTaskStatus } from "@/hooks/api/use-spaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useBoardSync } from "@/lib/hooks/useBoardSync";
import { usePersonalTasks } from "@/lib/hooks/usePersonalTasks";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { BoardPanel } from "./tasks/BoardPanel";
// Modular Components
import { InboxPanel } from "./tasks/InboxPanel";
import { PlannerPanel } from "./tasks/PlannerPanel";
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
	const { token, user } = useSupabaseAuth();
	const { activeWorkspaceId } = useWorkspaceStore();
	const { data: spaces, isLoading: isLoadingSpaces } = useSpaces(activeWorkspaceId || "", token);

	const createStatus = useCreateTaskStatus(token);
	const updateStatus = useUpdateTaskStatus(token);

	// For the "Board" view, we need a space. We'll pick the first one by default.
	const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

	useEffect(() => {
		if (spaces && spaces.length > 0 && !selectedSpaceId) {
			setSelectedSpaceId(spaces[0].id);
		}
	}, [spaces, selectedSpaceId]);

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
	} = useBoardSync({
		spaceId: selectedSpaceId,
		statuses: selectedSpace?.statuses || [],
		token: token || undefined,
		enabled: !!selectedSpaceId && !!token,
	});

	// Handle default status creation if empty
	useEffect(() => {
		if (
			selectedSpaceId &&
			spaces &&
			selectedSpace &&
			(selectedSpace.statuses?.length || 0) === 0 &&
			!isLoadingTasks &&
			!createStatus.isPending
		) {
			const initDefaults = async () => {
				try {
					await createStatus.mutateAsync({
						spaceId: selectedSpaceId,
						data: { name: "Today", color: "#A16207", position: 0, isDone: false },
					});
					await createStatus.mutateAsync({
						spaceId: selectedSpaceId,
						data: { name: "This Week", color: "#166534", position: 1, isDone: false },
					});
					await createStatus.mutateAsync({
						spaceId: selectedSpaceId,
						data: { name: "Later", color: "#111111", position: 2, isDone: false },
					});
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
		createStatus.isPending,
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

	// Board vs Inbox Separation: Filter board data to exclude tasks already in Inbox
	const { liveColumnsFiltered, liveTasksMapFiltered } = useMemo(() => {
		// During drag, we might want to avoid heavy filtering if it causes lag
		const inboxIds = new Set(inboxTasks.map((t) => t.id));
		const filteredMap = { ...liveTasksMap };
		const filteredCols: Record<string, any> = {};

		for (const colId in liveColumns) {
			filteredCols[colId] = {
				...liveColumns[colId],
				taskIds: liveColumns[colId].taskIds.filter((tid) => !inboxIds.has(tid)),
			};
		}

		return { liveColumnsFiltered: filteredCols, liveTasksMapFiltered: filteredMap };
	}, [liveColumns, liveTasksMap, inboxTasks]);

	// Planner tasks should only be tasks with dates (scheduled)
	const plannerTasks = useMemo(() => {
		return allPlannerTasks.filter((t) => t.startDate || t.dueDate);
	}, [allPlannerTasks]);

	const [activeTabs, setActiveTabs] = useState<string[]>(["inbox", "planner", "board"]);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
						activeContainer === "inbox" ? inboxTasks.map((t) => t.id) : (overCol?.taskIds || []);

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
						parentId: null,
						position: newPosition,
					});
				} else if (overContainer === "planner") {
					// Dragging to planner is disabled as per user request
					setActiveId(null);
					return;
				} else if (liveColumnOrder.includes(overContainer)) {
					// Moving TO Board — also clear assigneeId so it leaves Inbox on reload
					removeOptimisticTask(id);
					// Use updateTaskApi (not moveTask) so we can clear assigneeId in the same call
					updateTaskApi(id, {
						statusId: overContainer,
						position: newPosition,
						parentId: null,
						assigneeId: null,
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
					<div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
					<p className="text-white/40 font-bold text-[15px] uppercase tracking-widest">
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
											tasks={inboxTasks}
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
				onUpdateTask={updateTaskApi}
				workspaceId={activeWorkspaceId}
				isInbox={inboxTasks.some((t) => t.id === selectedTask?.id)}
			/>

			{/* Floating Switcher */}

			{/* Floating Bottom Nav (Oldest Design) */}
			<div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-40">
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
				</div>
			</div>

			{/* Deletion Confirmation Modal */}
			<AnimatePresence>
				{showDeleteConfirm && taskToDelete && (
					<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="w-full max-w-md bg-[#1A1C1E] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
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
		</div>
	);
}

function PanelContainer({ id, children }: { id: string; children: React.ReactNode }) {
	const { setNodeRef } = useDroppable({ id, disabled: id === "planner" });
	return (
		<div
			ref={setNodeRef}
			className={cn(
				"flex-1 h-full overflow-hidden rounded-[24px] border border-white/5 shadow-2xl transition-colors",
				id === "planner" ? "bg-[#0D0D0D]" : "bg-transparent",
			)}
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
				"flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold transition-all",
				active ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white/60",
			)}
		>
			{icon}
			{label}
		</button>
	);
}
