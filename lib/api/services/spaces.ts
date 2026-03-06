import type { Space, TaskStatus } from "../../types/models";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";

export interface CreateSpacePayload {
	workspaceId: string;
	name: string;
	description?: string;
	color?: string;
	icon?: string;
	prefix?: string;
}

export interface UpdateSpacePayload {
	name?: string;
	description?: string;
	color?: string;
	icon?: string;
	prefix?: string;
}

export interface CreateTaskStatusPayload {
	name: string;
	color?: string;
	position?: number;
	isDone?: boolean;
}

export interface UpdateTaskStatusPayload {
	name?: string;
	color?: string;
	position?: number;
	isDone?: boolean;
}

export const spacesService = {
	create: async (data: CreateSpacePayload, token?: string) =>
		apiClient.post<Space>(API_ENDPOINTS.SPACES, data, { token }),

	listByWorkspace: async (workspaceId: string, token?: string) =>
		apiClient.get<Space[]>(API_ENDPOINTS.SPACES_BY_WORKSPACE(workspaceId), { token }),

	getById: async (id: string, token?: string) =>
		apiClient.get<Space>(API_ENDPOINTS.SPACE_BY_ID(id), { token }),

	update: async (id: string, data: UpdateSpacePayload, token?: string) =>
		apiClient.patch<Space>(API_ENDPOINTS.SPACE_BY_ID(id), data, { token }),

	delete: async (id: string, token?: string) =>
		apiClient.delete<Space>(API_ENDPOINTS.SPACE_BY_ID(id), { token }),

	// Statuses
	createStatus: async (spaceId: string, data: CreateTaskStatusPayload, token?: string) =>
		apiClient.post<TaskStatus>(API_ENDPOINTS.SPACE_STATUSES(spaceId), data, { token }),

	updateStatus: async (
		spaceId: string,
		statusId: string,
		data: UpdateTaskStatusPayload,
		token?: string,
	) => apiClient.patch<TaskStatus>(API_ENDPOINTS.SPACE_STATUS(spaceId, statusId), data, { token }),

	deleteStatus: async (spaceId: string, statusId: string, token?: string) =>
		apiClient.delete<TaskStatus>(API_ENDPOINTS.SPACE_STATUS(spaceId, statusId), { token }),
};
