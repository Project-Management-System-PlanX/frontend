import { useEffect, useState } from "react";
import type { Task } from "@/lib/types/models";

/**
 * Hook for real-time task updates using Supabase Realtime
 * Monitors a space for task changes and updates local state
 */
export const useTasksRealtime = (spaceId: string, initialTasks: Task[] = []) => {
	const [tasks, setTasks] = useState<Task[]>(initialTasks);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		setTasks(initialTasks);
	}, [initialTasks]);

	const addTask = (task: Task) => {
		setTasks((prev) => {
			const exists = prev.some((t) => t.id === task.id);
			return exists ? prev : [...prev, task];
		});
	};

	const updateTask = (id: string, updates: Partial<Task>) => {
		setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)));
	};

	const deleteTask = (id: string) => {
		setTasks((prev) => prev.filter((task) => task.id !== id));
	};

	const moveTask = (
		taskId: string,
		statusId: string,
		position: number,
		destinationSpaceId?: string,
	) => {
		if (destinationSpaceId && destinationSpaceId !== spaceId) {
			deleteTask(taskId);
		} else {
			updateTask(taskId, { statusId, position });
		}
	};

	return {
		tasks,
		isLoading,
		error,
		addTask,
		updateTask,
		deleteTask,
		moveTask,
		setTasks,
	};
};
