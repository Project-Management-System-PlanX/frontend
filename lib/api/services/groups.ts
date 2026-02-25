import type { Group, GroupMember } from "../../types/models";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";

export interface CreateGroupPayload {
	channelId: string;
	name: string;
	description?: string;
}

export interface UpdateGroupPayload {
	name?: string;
	description?: string;
}

export const groupService = {
	create: async (data: CreateGroupPayload, token?: string) =>
		apiClient.post<Group>(API_ENDPOINTS.GROUPS, data, { token }),

	listByChannel: async (channelId: string, token?: string) =>
		apiClient.get<Group[]>(API_ENDPOINTS.GROUPS_BY_CHANNEL(channelId), { token }),

	getById: async (id: string, token?: string) =>
		apiClient.get<Group>(API_ENDPOINTS.GROUP_BY_ID(id), { token }),

	update: async (id: string, data: UpdateGroupPayload, token?: string) =>
		apiClient.patch<Group>(API_ENDPOINTS.GROUP_BY_ID(id), data, { token }),

	delete: async (id: string, token?: string) =>
		apiClient.delete<Group>(API_ENDPOINTS.GROUP_BY_ID(id), { token }),

	// Member Management
	addMember: async (groupId: string, userId: string, token?: string) =>
		apiClient.post<GroupMember>(API_ENDPOINTS.GROUP_MEMBERS(groupId), { userId }, { token }),

	removeMember: async (groupId: string, userId: string, token?: string) =>
		apiClient.delete<{ count: number }>(API_ENDPOINTS.GROUP_MEMBER(groupId, userId), { token }),
};
