import type { Workspace, WorkspaceMember } from "../../types/models";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";

// Example payload interfaces based on docs
export interface CreateWorkspacePayload {
	name: string;
	slug: string;
	avatar?: string;
}

export interface UpdateWorkspacePayload {
	name?: string;
	avatar?: string;
}

export interface AddWorkspaceMemberPayload {
	userId: string;
	role?: "OWNER" | "ADMIN" | "MEMBER";
}

export const workspaceService = {
	create: async (data: CreateWorkspacePayload, token?: string) =>
		apiClient.post<Workspace>(API_ENDPOINTS.WORKSPACES, data, { token }),

	list: async (userId?: string, token?: string) =>
		apiClient.get<Workspace[]>(API_ENDPOINTS.WORKSPACES, {
			token,
			queryParams: userId ? { userId } : undefined,
		}),

	getById: async (id: string, token?: string) =>
		apiClient.get<Workspace>(API_ENDPOINTS.WORKSPACE_BY_ID(id), { token }),

	update: async (id: string, data: UpdateWorkspacePayload, token?: string) =>
		apiClient.patch<Workspace>(API_ENDPOINTS.WORKSPACE_BY_ID(id), data, { token }),

	delete: async (id: string, token?: string) =>
		apiClient.delete<Workspace>(API_ENDPOINTS.WORKSPACE_BY_ID(id), { token }),

	// Member Management
	addMember: async (workspaceId: string, data: AddWorkspaceMemberPayload, token?: string) =>
		apiClient.post<WorkspaceMember>(API_ENDPOINTS.WORKSPACE_MEMBERS(workspaceId), data, { token }),

	listMembers: async (workspaceId: string, token?: string) =>
		apiClient.get<WorkspaceMember[]>(API_ENDPOINTS.WORKSPACE_MEMBERS(workspaceId), { token }),

	updateMember: async (workspaceId: string, userId: string, role: string, token?: string) =>
		apiClient.patch<WorkspaceMember>(
			API_ENDPOINTS.WORKSPACE_MEMBER(workspaceId, userId),
			{ role },
			{ token },
		),

	removeMember: async (workspaceId: string, userId: string, token?: string) =>
		apiClient.delete<{ count: number }>(API_ENDPOINTS.WORKSPACE_MEMBER(workspaceId, userId), {
			token,
		}),
};
