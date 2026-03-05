export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export const API_ENDPOINTS = {
	// Users
	USER_ME: "/users/me",

	// Workspaces
	WORKSPACES: "/workspaces",
	WORKSPACE_BY_ID: (id: string) => `/workspaces/${id}`,
	WORKSPACE_MEMBERS: (workspaceId: string) => `/workspaces/${workspaceId}/members`,
	WORKSPACE_MEMBER: (workspaceId: string, userId: string) =>
		`/workspaces/${workspaceId}/members/${userId}`,

	// Channels
	CHANNELS: "/channels",
	CHANNELS_BY_WORKSPACE: (workspaceId: string) => `/channels/workspace/${workspaceId}`,
	CHANNEL_BY_ID: (id: string) => `/channels/${id}`,
	CHANNEL_MEMBERS: (channelId: string) => `/channels/${channelId}/members`,
	CHANNEL_MEMBER: (channelId: string, userId: string) => `/channels/${channelId}/members/${userId}`,

	// Groups
	GROUPS: "/groups",
	GROUPS_BY_CHANNEL: (channelId: string) => `/groups/channel/${channelId}`,
	GROUP_BY_ID: (id: string) => `/groups/${id}`,
	GROUP_MEMBERS: (groupId: string) => `/groups/${groupId}/members`,
	GROUP_MEMBER: (groupId: string, userId: string) => `/groups/${groupId}/members/${userId}`,

	// Invites
	CREATE_INVITE: (workspaceId: string) => `/workspaces/${workspaceId}/invite`,
	GET_INVITE: (token: string) => `/workspaces/invite/${token}`,
	ACCEPT_INVITE: (token: string) => `/workspaces/invite/${token}/accept`,
};
