import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    type CreateSpacePayload,
    type UpdateSpacePayload,
    type CreateTaskStatusPayload,
    type UpdateTaskStatusPayload,
    spacesService,
} from "../../lib/api/services";

export const spaceKeys = {
    all: ["spaces"] as const,
    lists: () => [...spaceKeys.all, "list"] as const,
    list: (workspaceId: string) => [...spaceKeys.lists(), { workspaceId }] as const,
    details: () => [...spaceKeys.all, "detail"] as const,
    detail: (id: string) => [...spaceKeys.details(), id] as const,
};

export const useSpaces = (workspaceId: string, token?: string) => {
    return useQuery({
        queryKey: spaceKeys.list(workspaceId),
        queryFn: () => spacesService.listByWorkspace(workspaceId, token),
        enabled: !!workspaceId && !!token,
    });
};

export const useSpace = (id: string, token?: string) => {
    return useQuery({
        queryKey: spaceKeys.detail(id),
        queryFn: () => spacesService.getById(id, token),
        enabled: !!id && !!token,
    });
};

export const useCreateSpace = (token?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateSpacePayload) => spacesService.create(data, token),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
        },
    });
};

export const useUpdateSpace = (token?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSpacePayload }) =>
            spacesService.update(id, data, token),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: spaceKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
        },
    });
};

export const useDeleteSpace = (token?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => spacesService.delete(id, token),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
            queryClient.removeQueries({ queryKey: spaceKeys.detail(id) });
        },
    });
};

export const useCreateTaskStatus = (token?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ spaceId, data }: { spaceId: string; data: CreateTaskStatusPayload }) =>
            spacesService.createStatus(spaceId, data, token),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: spaceKeys.detail(variables.spaceId) });
        },
    });
};

export const useUpdateTaskStatus = (token?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ spaceId, statusId, data }: { spaceId: string; statusId: string; data: UpdateTaskStatusPayload }) =>
            spacesService.updateStatus(spaceId, statusId, data, token),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: spaceKeys.detail(variables.spaceId) });
        },
    });
};

export const useDeleteTaskStatus = (token?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ spaceId, statusId }: { spaceId: string; statusId: string; }) =>
            spacesService.deleteStatus(spaceId, statusId, token),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: spaceKeys.detail(variables.spaceId) });
        },
    });
};
