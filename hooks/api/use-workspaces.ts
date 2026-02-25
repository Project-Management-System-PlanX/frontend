import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateWorkspacePayload,
	type UpdateWorkspacePayload,
	workspaceService,
} from "../../lib/api/services";

export const workspaceKeys = {
	all: ["workspaces"] as const,
	lists: () => [...workspaceKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...workspaceKeys.lists(), { filters }] as const,
	details: () => [...workspaceKeys.all, "detail"] as const,
	detail: (id: string) => [...workspaceKeys.details(), id] as const,
	members: (id: string) => [...workspaceKeys.detail(id), "members"] as const,
};

export const useWorkspaces = (userId?: string, token?: string) => {
	return useQuery({
		queryKey: workspaceKeys.list({ userId }),
		queryFn: () => workspaceService.list(userId, token),
	});
};

export const useWorkspace = (id: string, token?: string) => {
	return useQuery({
		queryKey: workspaceKeys.detail(id),
		queryFn: () => workspaceService.getById(id, token),
		enabled: !!id,
	});
};

export const useCreateWorkspace = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateWorkspacePayload) => workspaceService.create(data, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
		},
	});
};

export const useUpdateWorkspace = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateWorkspacePayload }) =>
			workspaceService.update(id, data, token),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(data.id) });
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
		},
	});
};

export const useDeleteWorkspace = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => workspaceService.delete(id, token),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			queryClient.removeQueries({ queryKey: workspaceKeys.detail(id) });
		},
	});
};

export const useWorkspaceMembers = (workspaceId: string, token?: string) => {
	return useQuery({
		queryKey: workspaceKeys.members(workspaceId),
		queryFn: () => workspaceService.listMembers(workspaceId, token),
		enabled: !!workspaceId,
	});
};
