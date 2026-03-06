import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateTaskAttachmentPayload,
	type CreateTaskCommentPayload,
	type CreateTaskPayload,
	type MoveTaskPayload,
	tasksService,
	type UpdateTaskPayload,
} from "../../lib/api/services";
import { spaceKeys } from "./use-spaces";

export const taskKeys = {
	all: ["tasks"] as const,
	lists: () => [...taskKeys.all, "list"] as const,
	list: (spaceId: string, filters?: any) => [...taskKeys.lists(), { spaceId, filters }] as const,
	assignedToMe: () => [...taskKeys.all, "assignedToMe"] as const,
	details: () => [...taskKeys.all, "detail"] as const,
	detail: (id: string) => [...taskKeys.details(), id] as const,
	comments: (id: string) => [...taskKeys.detail(id), "comments"] as const,
};

export const useTasks = (spaceId: string, filters?: any, token?: string) => {
	return useQuery({
		queryKey: taskKeys.list(spaceId, filters),
		queryFn: () => tasksService.listBySpace(spaceId, filters, token),
		enabled: !!spaceId && !!token,
	});
};

export const useTasksAssignedToMe = (token?: string) => {
	return useQuery({
		queryKey: taskKeys.assignedToMe(),
		queryFn: () => tasksService.listAssignedToMe(token),
		enabled: !!token,
	});
};

export const useTask = (id: string, token?: string) => {
	return useQuery({
		queryKey: taskKeys.detail(id),
		queryFn: () => tasksService.getById(id, token),
		enabled: !!id && !!token,
	});
};

export const useCreateTask = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateTaskPayload) => tasksService.create(data, token),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.assignedToMe() });
			queryClient.invalidateQueries({ queryKey: spaceKeys.detail(data.spaceId) });
		},
	});
};

export const useUpdateTask = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) =>
			tasksService.update(id, data, token),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) });
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.assignedToMe() });
		},
	});
};

export const useMoveTask = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: MoveTaskPayload }) =>
			tasksService.move(id, data, token),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) });
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.assignedToMe() });
		},
	});
};

export const useDeleteTask = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => tasksService.delete(id, token),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.assignedToMe() });
			queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
		},
	});
};

export const useCreateComment = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ taskId, data }: { taskId: string; data: CreateTaskCommentPayload }) =>
			tasksService.createComment(taskId, data, token),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.comments(variables.taskId) });
		},
	});
};

export const useDeleteComment = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
			tasksService.deleteComment(taskId, commentId, token),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
			queryClient.invalidateQueries({ queryKey: taskKeys.comments(variables.taskId) });
		},
	});
};

// Attachments

export const useCreateAttachment = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			taskId,
			data,
		}: { taskId: string; data: CreateTaskAttachmentPayload }) =>
			tasksService.createAttachment(taskId, data, token),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
		},
	});
};

export const useDeleteAttachment = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			taskId,
			attachmentId,
		}: { taskId: string; attachmentId: string }) =>
			tasksService.deleteAttachment(taskId, attachmentId, token),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
		},
	});
};
