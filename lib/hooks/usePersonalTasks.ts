"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { taskService } from "@/lib/api/services/tasks";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types/models";

const supabase = createClient();

export function usePersonalTasks(workspaceId: string | null, token: string | undefined) {
	const [inboxTasks, setInboxTasks] = useState<Task[]>([]);
	const [plannerTasks, setPlannerTasks] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Tracks task IDs being moved OUT so realtime refetch doesn't ghost them back
	const pendingRemovals = useRef<Set<string>>(new Set());

	const fetchTasks = useCallback(async () => {
		if (!workspaceId || !token) return;
		setIsLoading(true);
		try {
			const [assigned, workedOn] = await Promise.all([
				taskService.getAssignedToMe(workspaceId, token),
				taskService.getWorkedOn(workspaceId, token),
			]);
			// Filter out any tasks that are pending removal (mid-drag to board)
			const blocked = pendingRemovals.current;
			setInboxTasks(assigned.filter((t) => !blocked.has(t.id)));
			setPlannerTasks(workedOn.filter((t) => !blocked.has(t.id)));
		} catch {
			// Silently handle transient errors from rapid realtime refetches.
			// The next successful fetch will correct the state.
		} finally {
			setIsLoading(false);
		}
	}, [workspaceId, token]);

	useEffect(() => {
		fetchTasks();
	}, [fetchTasks]);

	// Debounced refetch to avoid hammering the backend on rapid realtime events
	const realtimeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const debouncedFetchTasks = useCallback(() => {
		if (realtimeTimeoutRef.current) clearTimeout(realtimeTimeoutRef.current);
		realtimeTimeoutRef.current = setTimeout(() => {
			fetchTasks();
		}, 300);
	}, [fetchTasks]);

	// Supabase Realtime for personal tasks
	useEffect(() => {
		if (!workspaceId || !token) return;

		const channel = supabase
			.channel(`personal-tasks-${workspaceId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "tasks",
				},
				() => {
					debouncedFetchTasks();
				},
			)
			.subscribe();

		return () => {
			if (realtimeTimeoutRef.current) clearTimeout(realtimeTimeoutRef.current);
			supabase.removeChannel(channel);
		};
	}, [workspaceId, token, debouncedFetchTasks]);

	const addOptimisticTask = useCallback((task: Task, category: "inbox" | "planner") => {
		// If a task is coming back (e.g. Board → Inbox), clear it from pending suppressions
		pendingRemovals.current.delete(task.id);
		if (category === "inbox") {
			setInboxTasks((prev) => {
				if (prev.some((t) => t.id === task.id)) return prev;
				return [...prev, task];
			});
		} else {
			setPlannerTasks((prev) => {
				if (prev.some((t) => t.id === task.id)) return prev;
				return [...prev, task];
			});
		}
	}, []);

	const removeOptimisticTask = useCallback((taskId: string) => {
		// Suppress this task ID in future realtime refetches so it doesn't ghost back
		pendingRemovals.current.add(taskId);
		setInboxTasks((prev) => prev.filter((t) => t.id !== taskId));
		setPlannerTasks((prev) => prev.filter((t) => t.id !== taskId));
		// Allow normal sync again after 3 seconds (backend has settled by then)
		setTimeout(() => {
			pendingRemovals.current.delete(taskId);
		}, 3000);
	}, []);

	const updateOptimisticTask = useCallback((taskId: string, updates: Partial<Task>) => {
		setInboxTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
		setPlannerTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
	}, []);

	return {
		inboxTasks,
		plannerTasks,
		isLoading,
		refetch: fetchTasks,
		addOptimisticTask,
		removeOptimisticTask,
		updateOptimisticTask,
	};
}
