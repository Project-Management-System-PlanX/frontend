"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export interface FileMessage {
	id: string;
	channelId: string;
	userId: string;
	content: string;
	fileUrl: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	duration: number | null;
	createdAt: string;
	updatedAt: string;
	user: {
		supabaseId: string;
		firstName: string | null;
		lastName: string | null;
		username: string | null;
		imageUrl: string | null;
		email: string;
	};
	channel: {
		id: string;
		name: string;
		type: string;
	};
}

export const fileKeys = {
	all: ["files"] as const,
	byWorkspace: (workspaceId: string) => [...fileKeys.all, "workspace", workspaceId] as const,
};

export const useFilesByWorkspace = (workspaceId: string, token?: string) => {
	return useQuery({
		queryKey: fileKeys.byWorkspace(workspaceId),
		queryFn: () =>
			apiClient.get<FileMessage[]>(API_ENDPOINTS.MESSAGES_FILES_BY_WORKSPACE(workspaceId), {
				token,
			}),
		enabled: !!workspaceId && !!token,
	});
};

export const useDeleteFile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ messageId, token }: { messageId: string; token?: string }) => {
			return apiClient.delete(API_ENDPOINTS.MESSAGE_DELETE(messageId), { token });
		},
		onSuccess: (_, variables) => {
			// Invalidate file lists so it refetches immediately
			queryClient.invalidateQueries({ queryKey: fileKeys.all });
		},
	});
};
