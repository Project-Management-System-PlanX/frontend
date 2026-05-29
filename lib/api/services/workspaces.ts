import type { Workspace, WorkspaceMember } from "../../types/models";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";

export interface EmailInvitation {
	id: string;
	workspaceId: string;
	email: string;
	invitedBy: string;
	inviteToken: string;
	status: "PENDING" | "ACCEPTED" | "EXPIRED" | "FAILED";
	channelIds: string[];
	sentAt: string;
	acceptedAt: string | null;
	workspace: { name: string; slug: string };
}

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

	getAnalytics: async (id: string, token?: string) =>
		apiClient.get<{
			teamMembers: number;
			activeTasks: number;
			completedTasks: number;
			totalMessages: number;
			filesShared: number;
			weeklyActivity: { day: string; count: number }[];
			activeChannels: { id: string; name: string; _count: { messages: number } }[];
			upcomingDeadlines: {
				id: string;
				title: string;
				dueDate: string;
				space: { prefix: string };
			}[];
			recentActivity: {
				id: string;
				content: string;
				createdAt: string;
				user: { firstName: string | null; email: string };
				channel: { name: string; type: string };
			}[];
		}>(`${API_ENDPOINTS.WORKSPACE_BY_ID(id)}/analytics`, { token }),

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

	// Invite Management
	createInvite: async (workspaceId: string, spaceId?: string, token?: string) =>
		apiClient.post<{ token: string; expires_at: string }>(
			API_ENDPOINTS.CREATE_INVITE(workspaceId),
			{ spaceId },
			{ token },
		),

	getInvitations: async (workspaceId: string, token?: string) =>
		apiClient.get<{
			sent: EmailInvitation[];
			received: EmailInvitation[];
		}>(API_ENDPOINTS.WORKSPACE_INVITATIONS(workspaceId), { token }),

	getInvite: async (inviteToken: string) =>
		apiClient.get<{
			id: string;
			token: string;
			workspaceId: string;
			spaceId: string | null;
			expiresAt: string;
			workspace: { id: string; name: string; slug: string; avatar: string | null };
		}>(API_ENDPOINTS.GET_INVITE(inviteToken)),

	acceptInvite: async (inviteToken: string, token?: string) =>
		apiClient.post<{ success: boolean; workspaceId: string; spaceId: string | null }>(
			API_ENDPOINTS.ACCEPT_INVITE(inviteToken),
			undefined,
			{ token },
		),

	inviteByEmail: async (
		workspaceId: string,
		data: { emails: string[]; channelIds?: string[]; spaceId?: string },
		token?: string,
	) =>
		apiClient.post<{
			inviteToken: string;
			sent: string[];
			failed: string[];
			channelIds: string[];
		}>(API_ENDPOINTS.INVITE_BY_EMAIL(workspaceId), data, { token }),
};
