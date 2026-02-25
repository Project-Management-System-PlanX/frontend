import type { Channel, ChannelMember, ChannelType } from "../../types/models";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";

export interface CreateChannelPayload {
	workspaceId: string;
	name: string;
	type?: ChannelType;
	description?: string;
}

export interface UpdateChannelPayload {
	name?: string;
	type?: ChannelType;
	description?: string;
}

export const channelService = {
	create: async (data: CreateChannelPayload, token?: string) =>
		apiClient.post<Channel>(API_ENDPOINTS.CHANNELS, data, { token }),

	listByWorkspace: async (workspaceId: string, token?: string) =>
		apiClient.get<Channel[]>(API_ENDPOINTS.CHANNELS_BY_WORKSPACE(workspaceId), { token }),

	getById: async (id: string, token?: string) =>
		apiClient.get<Channel>(API_ENDPOINTS.CHANNEL_BY_ID(id), { token }),

	update: async (id: string, data: UpdateChannelPayload, token?: string) =>
		apiClient.patch<Channel>(API_ENDPOINTS.CHANNEL_BY_ID(id), data, { token }),

	delete: async (id: string, token?: string) =>
		apiClient.delete<Channel>(API_ENDPOINTS.CHANNEL_BY_ID(id), { token }),

	// Member Management
	addMember: async (channelId: string, userId: string, role?: string, token?: string) =>
		apiClient.post<ChannelMember>(
			API_ENDPOINTS.CHANNEL_MEMBERS(channelId),
			{ userId, role },
			{ token },
		),

	removeMember: async (channelId: string, userId: string, token?: string) =>
		apiClient.delete<{ count: number }>(API_ENDPOINTS.CHANNEL_MEMBER(channelId, userId), { token }),
};
