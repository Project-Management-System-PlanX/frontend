import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateChannelPayload,
	channelService,
	type UpdateChannelPayload,
} from "../../lib/api/services";

export const channelKeys = {
	all: ["channels"] as const,
	lists: () => [...channelKeys.all, "list"] as const,
	listByWorkspace: (workspaceId: string) => [...channelKeys.lists(), { workspaceId }] as const,
	details: () => [...channelKeys.all, "detail"] as const,
	detail: (id: string) => [...channelKeys.details(), id] as const,
};

export const useChannelsByWorkspace = (workspaceId: string, token?: string) => {
	return useQuery({
		queryKey: channelKeys.listByWorkspace(workspaceId),
		queryFn: () => channelService.listByWorkspace(workspaceId, token),
		enabled: !!workspaceId,
	});
};

export const useChannel = (id: string, token?: string) => {
	return useQuery({
		queryKey: channelKeys.detail(id),
		queryFn: () => channelService.getById(id, token),
		enabled: !!id,
	});
};

export const useCreateChannel = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateChannelPayload) => channelService.create(data, token),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: channelKeys.listByWorkspace(data.workspaceId) });
		},
	});
};

export const useUpdateChannel = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateChannelPayload }) =>
			channelService.update(id, data, token),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: channelKeys.detail(data.id) });
			queryClient.invalidateQueries({ queryKey: channelKeys.listByWorkspace(data.workspaceId) });
		},
	});
};

export const useDeleteChannel = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => channelService.delete(id, token),
		onSuccess: (_data, id) => {
			queryClient.removeQueries({ queryKey: channelKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: channelKeys.lists() });
		},
	});
};
