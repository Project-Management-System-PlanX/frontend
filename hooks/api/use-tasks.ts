import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateTaskPayload,
	MoveTaskPayload,
	UpdateTaskPayload,
} from "@/lib/api/services/tasks";
import { taskService } from "@/lib/api/services/tasks";
import type { Task } from "@/lib/types/models";

// ─── Query Keys ───

export const taskKeys = {
	all: ["tasks"] as const,
	bySpace: (spaceId: string) => ["tasks", "space", spaceId] as const,
	byId: (id: string) => ["tasks", "detail", id] as const,
	assignedToMe: (workspaceId: string) => ["tasks", "assigned", workspaceId] as const,
	workedOn: (workspaceId: string) => ["tasks", "workedOn", workspaceId] as const,
};

// ─── Queries ───

export const useTasks = (spaceId?: string | null, _unused?: unknown, token?: string) =>
	useQuery({
		queryKey: taskKeys.bySpace(spaceId!),
		queryFn: () => taskService.getBySpace(spaceId!, token),
		enabled: !!spaceId && !!token,
		staleTime: 30_000,
	});

export const useTask = (id?: string | null, token?: string) =>
	useQuery({
		queryKey: taskKeys.byId(id!),
		queryFn: () => taskService.getById(id!, token),
		enabled: !!id && !!token,
	});

export const useTasksAssignedToMe = (workspaceId?: string, token?: string) =>
	useQuery({
		queryKey: taskKeys.assignedToMe(workspaceId!),
		queryFn: () => taskService.getAssignedToMe(workspaceId!, token),
		enabled: !!workspaceId && !!token,
	});

export const useTasksWorkedOn = (token?: string) => {
	// We need a workspaceId — pull from localStorage or context
	// For now, use a generic key
	return useQuery({
		queryKey: ["tasks", "workedOn"],
		queryFn: async () => {
			const workspaceId =
				typeof window !== "undefined" ? localStorage.getItem("activeWorkspaceId") || "" : "";
			if (!workspaceId) return [];
			return taskService.getWorkedOn(workspaceId, token);
		},
		enabled: !!token,
	});
};

// ─── Mutations ───

export const useCreateTask = (token?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTaskPayload): Promise<Task> => taskService.create(data, token),

		onMutate: async (newTaskData) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: taskKeys.bySpace(newTaskData.spaceId) });

			// Snapshot previous
			const previous = queryClient.getQueryData<Task[]>(taskKeys.bySpace(newTaskData.spaceId));

			// Optimistic add
			const tempTask: Task = {
				id: `temp-${Date.now()}`,
				spaceId: newTaskData.spaceId,
				statusId: newTaskData.statusId,
				title: newTaskData.title,
				description: newTaskData.description || null,
				priority: newTaskData.priority || "NONE",
				workType: newTaskData.workType || "TASK",
				taskNumber: 0,
				reporterId: "",
				resolution: "UNRESOLVED",
				position: newTaskData.position || 0,
				flagged: newTaskData.flagged || false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			} as Task;

			queryClient.setQueryData<Task[]>(taskKeys.bySpace(newTaskData.spaceId), (old) => [
				...(old || []),
				tempTask,
			]);

			return { previous, spaceId: newTaskData.spaceId };
		},

		onError: (_err, _data, context) => {
			// Rollback
			if (context?.previous !== undefined) {
				queryClient.setQueryData(taskKeys.bySpace(context.spaceId), context.previous);
			}
		},

		onSettled: (_data, _err, variables) => {
			// Refetch to get real server data
			queryClient.invalidateQueries({ queryKey: taskKeys.bySpace(variables.spaceId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.all });
		},
	});
};

export const useUpdateTask = (token?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }): Promise<Task> =>
			taskService.update(id, data, token),

		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({ queryKey: taskKeys.all });

			// Find all space queries and optimistically update matching tasks
			const queryCache = queryClient.getQueryCache();
			const taskQueries = queryCache.findAll({ queryKey: ["tasks", "space"] });

			const snapshots: Array<{ key: readonly unknown[]; data: Task[] | undefined }> = [];

			for (const query of taskQueries) {
				const oldData = query.state.data as Task[] | undefined;
				if (oldData?.some((t) => t.id === id)) {
					snapshots.push({ key: query.queryKey, data: oldData });
					queryClient.setQueryData<Task[]>(
						query.queryKey,
						oldData.map((t) => (t.id === id ? { ...t, ...data } : t)),
					);
				}
			}

			return { snapshots };
		},

		onError: (_err, _data, context) => {
			// Rollback all modified queries
			if (context?.snapshots) {
				for (const { key, data } of context.snapshots) {
					queryClient.setQueryData(key, data);
				}
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: taskKeys.all });
		},
	});
};

export const useMoveTask = (token?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: MoveTaskPayload }): Promise<Task> =>
			taskService.move(id, data, token),

		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({ queryKey: taskKeys.all });

			const queryCache = queryClient.getQueryCache();
			const taskQueries = queryCache.findAll({ queryKey: ["tasks", "space"] });

			const snapshots: Array<{ key: readonly unknown[]; data: Task[] | undefined }> = [];

			for (const query of taskQueries) {
				const oldData = query.state.data as Task[] | undefined;
				if (oldData?.some((t) => t.id === id)) {
					snapshots.push({ key: query.queryKey, data: oldData });
					queryClient.setQueryData<Task[]>(
						query.queryKey,
						oldData.map((t) =>
							t.id === id ? { ...t, statusId: data.statusId, position: data.position } : t,
						),
					);
				}
			}

			return { snapshots };
		},

		onError: (_err, _data, context) => {
			if (context?.snapshots) {
				for (const { key, data } of context.snapshots) {
					queryClient.setQueryData(key, data);
				}
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: taskKeys.all });
		},
	});
};

export const useDeleteTask = (token?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => taskService.delete(id, token),

		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: taskKeys.all });

			const queryCache = queryClient.getQueryCache();
			const taskQueries = queryCache.findAll({ queryKey: ["tasks", "space"] });

			const snapshots: Array<{ key: readonly unknown[]; data: Task[] | undefined }> = [];

			for (const query of taskQueries) {
				const oldData = query.state.data as Task[] | undefined;
				if (oldData?.some((t) => t.id === id)) {
					snapshots.push({ key: query.queryKey, data: oldData });
					queryClient.setQueryData<Task[]>(
						query.queryKey,
						oldData.filter((t) => t.id !== id),
					);
				}
			}

			return { snapshots };
		},

		onError: (_err, _data, context) => {
			if (context?.snapshots) {
				for (const { key, data } of context.snapshots) {
					queryClient.setQueryData(key, data);
				}
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: taskKeys.all });
		},
	});
};
export const useBulkCreateTasks = (token?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { tasks: CreateTaskPayload[] }): Promise<Task[]> =>
			taskService.createBulk(data, token),
		onSuccess: (_, variables) => {
			if (variables.tasks.length > 0) {
				queryClient.invalidateQueries({ queryKey: taskKeys.bySpace(variables.tasks[0].spaceId) });
			}
			queryClient.invalidateQueries({ queryKey: taskKeys.all });
		},
	});
};
