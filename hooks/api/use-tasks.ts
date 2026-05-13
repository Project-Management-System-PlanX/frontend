import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type BulkPositionPayload,
	type CreateTaskPayload,
	type MoveTaskPayload,
	taskService,
	type UpdateTaskPayload,
} from "../../lib/api/services";

export const taskKeys = {
	all: ["tasks"] as const,
	lists: () => [...taskKeys.all, "list"] as const,
	bySpace: (spaceId: string) => [...taskKeys.lists(), { spaceId }] as const,
	details: () => [...taskKeys.all, "detail"] as const,
	detail: (id: string) => [...taskKeys.details(), id] as const,
	assigned: () => [...taskKeys.all, "assigned"] as const,
	workedOn: () => [...taskKeys.all, "worked-on"] as const,
	comments: (taskId: string) => [...taskKeys.all, "comments", taskId] as const,
	activities: (taskId: string) => [...taskKeys.all, "activities", taskId] as const,
};

export const useTasks = (spaceId: string, token?: string) => {
	return useQuery({
		queryKey: taskKeys.bySpace(spaceId),
		queryFn: () => taskService.getBySpace(spaceId, token),
		enabled: !!spaceId && !!token,
	});
};

export const useTask = (id: string, token?: string) => {
	return useQuery({
		queryKey: taskKeys.detail(id),
		queryFn: () => taskService.getById(id, token),
		enabled: !!id && !!token,
	});
};

export const useCreateTask = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateTaskPayload) => taskService.create(data, token),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.bySpace(data.spaceId) });
		},
	});
};

export const useBulkCreateTasks = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (tasks: CreateTaskPayload[]) =>
			Promise.all(tasks.map((task) => taskService.create(task, token))),
		onSuccess: (tasks) => {
			if (tasks.length > 0) {
				queryClient.invalidateQueries({ queryKey: taskKeys.bySpace(tasks[0].spaceId) });
			}
		},
	});
};

export const useUpdateTask = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) =>
			taskService.update(id, data, token),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) });
			queryClient.invalidateQueries({ queryKey: taskKeys.bySpace(data.spaceId) });
		},
	});
};

export const useDeleteTask = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => taskService.delete(id, token),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
		},
	});
};

export const useMoveTask = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: MoveTaskPayload }) =>
			taskService.move(id, data, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
		},
	});
};

export const useBulkUpdatePositions = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: BulkPositionPayload) => taskService.bulkUpdatePositions(data, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
		},
	});
};

export const useTasksAssignedToMe = (workspaceId: string, token?: string) => {
	return useQuery({
		queryKey: [...taskKeys.assigned(), { workspaceId }],
		queryFn: () => taskService.getAssignedToMe(workspaceId, token),
		enabled: !!workspaceId && !!token,
	});
};

export const useTasksWorkedOn = (workspaceId: string, token?: string) => {
	return useQuery({
		queryKey: [...taskKeys.workedOn(), { workspaceId }],
		queryFn: () => taskService.getWorkedOn(workspaceId, token),
		enabled: !!workspaceId && !!token,
	});
};

export const useTaskComments = (taskId: string, token?: string) => {
	return useQuery({
		queryKey: taskKeys.comments(taskId),
		queryFn: () => taskService.getComments(taskId, token),
		enabled: !!taskId && !!token,
	});
};

export const useAddTaskComment = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
			taskService.addComment(taskId, content, token),
		onSuccess: (_, { taskId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
		},
	});
};

export const useDeleteTaskComment = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
			taskService.deleteComment(taskId, commentId, token),
		onSuccess: (_, { taskId }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
		},
	});
};

export const useTaskActivities = (taskId: string, token?: string) => {
	return useQuery({
		queryKey: taskKeys.activities(taskId),
		queryFn: () => taskService.getActivities(taskId, token),
		enabled: !!taskId && !!token,
	});
};
