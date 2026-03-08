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
	WORKSPACE_INVITE_CREATE: (workspaceId: string) => `/workspaces/${workspaceId}/invite`,
	WORKSPACE_INVITE_GET: (token: string) => `/workspaces/invite/${token}`,
	WORKSPACE_INVITE_ACCEPT: (token: string) => `/workspaces/invite/${token}/accept`,

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
	INVITE_BY_EMAIL: (workspaceId: string) => `/workspaces/${workspaceId}/invite-email`,
	WORKSPACE_INVITATIONS: (workspaceId: string) => `/workspaces/${workspaceId}/invitations`,
	GET_INVITE: (token: string) => `/workspaces/invite/${token}`,
	ACCEPT_INVITE: (token: string) => `/workspaces/invite/${token}/accept`,

	// Spaces
	SPACES: "/spaces",
	SPACES_BY_WORKSPACE: (workspaceId: string) => `/spaces/workspace/${workspaceId}`,
	SPACE_BY_ID: (id: string) => `/spaces/${id}`,
	SPACE_STATUSES: (spaceId: string) => `/spaces/${spaceId}/statuses`,
	SPACE_STATUS: (spaceId: string, statusId: string) => `/spaces/${spaceId}/statuses/${statusId}`,

	// Tasks
	TASKS: "/tasks",
	TASKS_BULK: "/tasks/bulk",
	TASKS_BY_SPACE: (spaceId: string) => `/tasks/space/${spaceId}`,
	TASKS_ASSIGNED_TO_ME: "/tasks/assigned-to-me",
	TASKS_WORKED_ON: "/tasks/worked-on",
	TASK_BY_ID: (id: string) => `/tasks/${id}`,
	TASK_MOVE: (id: string) => `/tasks/${id}/move`,
	TASK_COMMENTS: (taskId: string) => `/tasks/${taskId}/comments`,
	TASK_COMMENT: (taskId: string, commentId: string) => `/tasks/${taskId}/comments/${commentId}`,
	TASK_ATTACHMENTS: (taskId: string) => `/tasks/${taskId}/attachments`,
	TASK_ATTACHMENT: (taskId: string, attachmentId: string) =>
		`/tasks/${taskId}/attachments/${attachmentId}`,

	// Teams
	TEAMS: "/teams",
	TEAMS_BY_WORKSPACE: (workspaceId: string) => `/teams/workspace/${workspaceId}`,
	TEAM_MEMBERS: (teamId: string) => `/teams/${teamId}/members`,

	// Messages
	MESSAGES: "/messages",
	MESSAGES_BY_CHANNEL: (channelId: string) => `/messages/channel/${channelId}`,
	MESSAGE_DELETE: (messageId: string) => `/messages/${messageId}`,

	// Meetings (proxied to meeting-service via Next.js rewrites)
	MEETINGS_CREATE: "/meetings/create",
	MEETINGS_JOIN: (meetingId: string) => `/meetings/${meetingId}/join`,
	MEETINGS_LEAVE: (meetingId: string) => `/meetings/${meetingId}/leave`,
	MEETINGS_END: (meetingId: string) => `/meetings/${meetingId}/end`,
	MEETINGS_ACTIVE: "/meetings/active",
	MEETINGS_HISTORY: "/meetings/history",
	MEETINGS_BY_ID: (meetingId: string) => `/meetings/${meetingId}`,
};
