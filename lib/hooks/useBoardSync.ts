"use client";

import { useCallback, useMemo } from "react";
import type { taskService } from "@/lib/api/services/tasks";
import type { Task, TaskStatus } from "@/lib/types/models";
import { useRealtimeTasks } from "./useRealtimeTasks";

interface BoardColumn {
	id: string;
	name: string;
	color: string;
	position: number;
	isDone: boolean;
	taskIds: string[];
}

interface UseBoardSyncOptions {
	spaceId: string | null;
	statuses: TaskStatus[];
	token?: string;
	enabled?: boolean;
}

interface UseBoardSyncReturn {
	// Board data
	columns: Record<string, BoardColumn>;
	columnOrder: string[];
	tasks: Record<string, Task>;
	tasksList: Task[];

	// State
	isLoading: boolean;
	error: Error | null;

	// Mutations
	createTask: (
		statusId: string,
		title: string,
		extraData?: Partial<Parameters<typeof taskService.create>[0]>,
	) => Promise<Task | null>;
	updateTask: (id: string, data: Parameters<typeof taskService.update>[1]) => Promise<Task | null>;
	moveTask: (taskId: string, newStatusId: string, newPosition: number) => Promise<Task | null>;
	deleteTask: (id: string) => Promise<boolean>;
	refetch: () => Promise<void>;
}

export function useBoardSync({
	spaceId,
	statuses,
	token,
	enabled = true,
}: UseBoardSyncOptions): UseBoardSyncReturn {
	const {
		tasks: tasksList,
		isLoading,
		error,
		refetch,
		createTask: createTaskRaw,
		updateTask: updateTaskRaw,
		moveTask: moveTaskRaw,
		deleteTask: deleteTaskRaw,
	} = useRealtimeTasks({ spaceId, token, enabled });

	// ─── Derive board structure from tasks + statuses ───

	const { columns, columnOrder, tasksMap } = useMemo(() => {
		// Build column order from statuses
		const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);
		const order = sortedStatuses.map((s) => s.id);

		// Build columns with task IDs
		const cols: Record<string, BoardColumn> = {};
		for (const status of sortedStatuses) {
			cols[status.id] = {
				id: status.id,
				name: status.name,
				color: status.color,
				position: status.position,
				isDone: status.isDone,
				taskIds: [],
			};
		}

		// Build tasks map and assign to columns
		const tMap: Record<string, Task> = {};
		const sortedTasks = [...tasksList].sort((a, b) => a.position - b.position);

		for (const task of sortedTasks) {
			tMap[task.id] = task;
			// If a task belongs to a status we don't have yet (e.g., just created "Done"), dynamically add it.
			if (!cols[task.statusId] && task.status) {
				cols[task.statusId] = {
					id: task.status.id,
					name: task.status.name,
					color: task.status.color,
					position: task.status.position,
					isDone: task.status.isDone,
					taskIds: [],
				};
				order.push(task.statusId);
				order.sort((a, b) => (cols[a]?.position ?? 0) - (cols[b]?.position ?? 0));
			}

			if (cols[task.statusId]) {
				cols[task.statusId].taskIds.push(task.id);
			}
		}

		return { columns: cols, columnOrder: order, tasksMap: tMap };
	}, [statuses, tasksList]);

	// ─── Board-specific mutations ───

	const createTask = useCallback(
		async (
			statusId: string,
			title: string,
			extraData?: Partial<Parameters<typeof taskService.create>[0]>,
		) => {
			if (!spaceId) return null;

			// Calculate position for end of column
			const column = columns[statusId];
			const lastTaskId = column?.taskIds[column.taskIds.length - 1];
			const lastPosition = lastTaskId ? (tasksMap[lastTaskId]?.position ?? 0) : 0;
			const position = lastPosition + 65536;

			return createTaskRaw({
				spaceId,
				statusId,
				title,
				position,
				...extraData,
			});
		},
		[spaceId, columns, tasksMap, createTaskRaw],
	);

	const moveTask = useCallback(
		async (taskId: string, newStatusId: string, newPosition: number, parentId?: string | null) => {
			return moveTaskRaw(taskId, newStatusId, newPosition, parentId);
		},
		[moveTaskRaw],
	);

	return {
		columns,
		columnOrder,
		tasks: tasksMap,
		tasksList,
		isLoading,
		error,
		createTask,
		updateTask: updateTaskRaw,
		moveTask,
		deleteTask: deleteTaskRaw,
		refetch,
	};
}
