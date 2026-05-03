"use client";

import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { taskService } from "@/lib/api/services/tasks";
import type { Task } from "@/lib/types/models";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
		} catch (error) {
			console.error("Failed to fetch personal tasks", error);
		} finally {
			setIsLoading(false);
		}
	}, [workspaceId, token]);

	useEffect(() => {
		fetchTasks();
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
					fetchTasks();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [workspaceId, token, fetchTasks]);

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

	return {
		inboxTasks,
		plannerTasks,
		isLoading,
		refetch: fetchTasks,
		addOptimisticTask,
		removeOptimisticTask,
	};
}
