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
	list: (spaceId: string, filters?: Record<string, unknown>) =>
		[...taskKeys.all, "list", { spaceId, filters }] as const,
	assignedToMe: () => [...taskKeys.all, "assignedToMe"] as const,
	workedOn: () => [...taskKeys.all, "workedOn"] as const,
	details: () => [...taskKeys.all, "detail"] as const,
	detail: (id: string) => [...taskKeys.details(), id] as const,
	comments: (id: string) => [...taskKeys.detail(id), "comments"] as const,
};

export const useTasks = (spaceId: string, filters?: Record<string, unknown>, token?: string) => {
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

export const useTasksWorkedOn = (token?: string) => {
	return useQuery({
		queryKey: taskKeys.workedOn(),
		queryFn: () => tasksService.listWorkedOn(token),
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
			queryClient.invalidateQueries({ queryKey: taskKeys.workedOn() });
			queryClient.invalidateQueries({ queryKey: spaceKeys.detail(data.spaceId) });
		},
	});
};

export const useBulkCreateTasks = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (tasks: CreateTaskPayload[]) => tasksService.bulkCreate(tasks, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.assignedToMe() });
			queryClient.invalidateQueries({ queryKey: taskKeys.workedOn() });
		},
	});
};

export const useUpdateTask = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) =>
			tasksService.update(id, data, token),
		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({ queryKey: taskKeys.details() });
			await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

			const previousDetail = queryClient.getQueryData(taskKeys.detail(id));
			const previousAssigned = queryClient.getQueryData(taskKeys.assignedToMe());

			// Optimistically update the detail view
			if (previousDetail) {
				queryClient.setQueryData(taskKeys.detail(id), (old: any) => ({
					...old,
					...data,
				}));
			}

			// Optimistically update the list view
			if (previousAssigned) {
				queryClient.setQueryData(taskKeys.assignedToMe(), (old: any) =>
					old?.map((t: any) => (t.id === id ? { ...t, ...data } : t)),
				);
			}

			return { previousDetail, previousAssigned };
		},
		onError: (_err, { id }, context) => {
			if (context?.previousDetail) {
				queryClient.setQueryData(taskKeys.detail(id), context.previousDetail);
			}
			if (context?.previousAssigned) {
				queryClient.setQueryData(taskKeys.assignedToMe(), context.previousAssigned);
			}
		},
		onSettled: (data) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) });
			}
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
		onMutate: async (id) => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({ queryKey: taskKeys.all });

			// Snapshot the previous value
			const previousAssigned = queryClient.getQueryData(taskKeys.assignedToMe());

			// Optimistically update to the new value
			queryClient.setQueryData(taskKeys.assignedToMe(), (old: any) =>
				old?.filter((t: any) => t.id !== id),
			);

			// Return a context object with the snapshotted value
			return { previousAssigned };
		},
		onError: (_err, _id, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			queryClient.setQueryData(taskKeys.assignedToMe(), context?.previousAssigned);
		},
		onSettled: () => {
			// Always refetch after error or success to synchronize with the server
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.assignedToMe() });
			queryClient.invalidateQueries({ queryKey: taskKeys.workedOn() });
		},
	});
};

export const useTaskComments = (taskId: string, token?: string) => {
	return useQuery({
		queryKey: taskKeys.comments(taskId),
		queryFn: () => tasksService.listComments(taskId, token),
		enabled: !!taskId && !!token,
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
		mutationFn: ({ taskId, data }: { taskId: string; data: CreateTaskAttachmentPayload }) =>
			tasksService.createAttachment(taskId, data, token),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
		},
	});
};

export const useDeleteAttachment = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ taskId, attachmentId }: { taskId: string; attachmentId: string }) =>
			tasksService.deleteAttachment(taskId, attachmentId, token),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
		},
	});
};
