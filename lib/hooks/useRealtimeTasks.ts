"use client";

import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { taskService } from "@/lib/api/services/tasks";
import type { Task } from "@/lib/types/models";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

interface UseRealtimeTasksOptions {
	spaceId: string | null;
	token?: string;
	enabled?: boolean;
}

interface UseRealtimeTasksReturn {
	tasks: Task[];
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	createTask: (data: Parameters<typeof taskService.create>[0]) => Promise<Task | null>;
	updateTask: (id: string, data: Parameters<typeof taskService.update>[1]) => Promise<Task | null>;
	moveTask: (id: string, statusId: string, position: number) => Promise<Task | null>;
	deleteTask: (id: string) => Promise<boolean>;
}

export function useRealtimeTasks({
	spaceId,
	token,
	enabled = true,
}: UseRealtimeTasksOptions): UseRealtimeTasksReturn {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const previousStateRef = useRef<Task[]>([]);

	// ─── Fetch all tasks for a space ───

	const fetchTasks = useCallback(async () => {
		if (!spaceId || !token) return;
		setIsLoading(true);
		setError(null);
		try {
			const data = await taskService.getBySpace(spaceId, token);
			setTasks(data);
		} catch (err) {
			// Handle 403/404 errors gracefully (space may have been deleted)
			const errorMessage = err instanceof Error ? err.message : String(err);
			if (errorMessage.includes('403') || errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('access')) {
				// Space doesn't exist or user doesn't have access - clear tasks but don't show error
				setTasks([]);
				setError(null);
			} else {
				setError(err instanceof Error ? err : new Error("Failed to fetch tasks"));
			}
		} finally {
			setIsLoading(false);
		}
	}, [spaceId, token]);

	// ─── Initial fetch ───

	useEffect(() => {
		// Clear tasks immediately when spaceId changes
		setTasks([]);
		setError(null);
		setIsLoading(Boolean(spaceId));
	}, [spaceId]);

	useEffect(() => {
		if (enabled && spaceId && token) {
			fetchTasks();
		}
	}, [enabled, spaceId, token, fetchTasks]);

	// ─── Supabase Realtime subscription ───

	useEffect(() => {
		if (!enabled || !spaceId) {
			// Clear realtime listeners when disabled or no spaceId
			return;
		}

		const channel = supabase
			.channel(`space-tasks-${spaceId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "tasks",
					filter: `spaceId=eq.${spaceId}`,
				},
				(payload) => {
					const newTask = payload.new as Task;
					setTasks((prev) => {
						// Avoid duplicates from optimistic updates and ensure spaceId matches
						if (prev.some((t) => t.id === newTask.id) || newTask.spaceId !== spaceId) return prev;
						return [...prev, newTask];
					});
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "tasks",
					filter: `spaceId=eq.${spaceId}`,
				},
				(payload) => {
					const updated = payload.new as Task;
					setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
				},
			)
			.on(
				"postgres_changes",
				{
					event: "DELETE",
					schema: "public",
					table: "tasks",
					filter: `spaceId=eq.${spaceId}`,
				},
				(payload) => {
					const deleted = payload.old as { id: string };
					setTasks((prev) => prev.filter((t) => t.id !== deleted.id));
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [enabled, spaceId]);

	// ─── Optimistic Mutations ───

	const createTask = useCallback(
		async (data: Parameters<typeof taskService.create>[0]) => {
			if (!token) return null;

			const tempId = `temp-${Date.now()}`;
			const tempTask: Task = {
				id: tempId,
				...data,
				taskNumber: 0,
				priority: data.priority || "NONE",
				workType: data.workType || "TASK",
				resolution: "UNRESOLVED",
				flagged: data.flagged || false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				reporterId: "", // Will be set by backend
				status: {
					id: data.statusId,
					name: "...",
					color: "#ccc",
					position: 0,
					isDone: false,
					spaceId: data.spaceId,
				},
			} as unknown as Task;

			// Optimistic add
			setTasks((prev) => [...prev, tempTask]);

			try {
				const task = await taskService.create(data, token);
				// Replace temp task with real task, but only if real-time event hasn't added it yet
				setTasks((prev) => {
					const alreadyAddedByRealtime = prev.some((t) => t.id === task.id);
					if (alreadyAddedByRealtime) {
						return prev.filter((t) => t.id !== tempId);
					}
					return prev.map((t) => (t.id === tempId ? task : t));
				});
				return task;
			} catch (err) {
				// Rollback
				setTasks((prev) => prev.filter((t) => t.id !== tempId));
				setError(err instanceof Error ? err : new Error("Failed to create task"));
				return null;
			}
		},
		[token],
	);

	const updateTask = useCallback(
		async (id: string, data: Parameters<typeof taskService.update>[1]) => {
			if (!token) return null;

			// Save previous state for rollback
			previousStateRef.current = [...tasks];

			// Optimistic update
			setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));

			try {
				// Strip fields the backend doesn't accept in the update DTO
				const {
					labels,
					assignees,
					comments,
					attachments,
					startDate,
					workType,
					parentId,
					teamId,
					flagged,
					restrictTo,
					...rest
				} = data as Record<string, unknown>;

				const allowed: Record<string, unknown> = {};
				for (const key of [
					"title",
					"description",
					"statusId",
					"priority",
					"assigneeId",
					"dueDate",
					"resolution",
					"position",
					"coverColor",
				]) {
					if (rest[key] !== undefined) {
						allowed[key] = rest[key];
					}
				}

				if (Array.isArray(labels)) {
					const labelNames = labels
						.map((label) => (typeof label === "string" ? label : label?.name))
						.filter((name) => typeof name === "string" && name.length > 0);
					allowed.labels = labelNames;
				}

				if (Object.keys(allowed).length > 0) {
					const updated = await taskService.update(id, allowed, token);
					// Merge backend response with our optimistically added relational fields
					setTasks((prev) =>
						prev.map((t) =>
							t.id === id
								? { ...updated, labels: t.labels, assignees: t.assignees, comments: t.comments }
								: t,
						),
					);
					return updated;
				}

				// If only relational fields were updated, just return the optimistic task
				const optimisticTask = tasks.find((t) => t.id === id) || null;
				if (optimisticTask) {
					return { ...optimisticTask, ...data } as Task;
				}
				return null;
			} catch (err) {
				// Rollback
				setTasks(previousStateRef.current);
				setError(err instanceof Error ? err : new Error("Failed to update task"));
				return null;
			}
		},
		[token, tasks],
	);

	const moveTask = useCallback(
		async (id: string, statusId: string, position: number, _parentId?: string | null) => {
			if (!token) return null;

			// Save previous state for rollback
			previousStateRef.current = [...tasks];

			// Optimistic move
			setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, statusId, position } : t)));

			try {
				const moved = await taskService.move(id, { statusId, position }, token);
				setTasks((prev) => prev.map((t) => (t.id === id ? moved : t)));
				return moved;
			} catch (err) {
				// Rollback
				setTasks(previousStateRef.current);
				setError(err instanceof Error ? err : new Error("Failed to move task"));
				return null;
			}
		},
		[token, tasks],
	);

	const deleteTask = useCallback(
		async (id: string) => {
			if (!token) return false;

			previousStateRef.current = [...tasks];

			// Optimistic delete
			setTasks((prev) => prev.filter((t) => t.id !== id));

			try {
				await taskService.delete(id, token);
				return true;
			} catch (err) {
				setTasks(previousStateRef.current);
				setError(err instanceof Error ? err : new Error("Failed to delete task"));
				return false;
			}
		},
		[token, tasks],
	);

	return {
		tasks,
		isLoading,
		error,
		refetch: fetchTasks,
		createTask,
		updateTask,
		moveTask,
		deleteTask,
	};
}
