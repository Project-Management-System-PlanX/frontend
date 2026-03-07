import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";

export interface Team {
	id: string;
	workspaceId: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

export const teamsService = {
	listByWorkspace: async (workspaceId: string, token?: string) =>
		apiClient.get<Team[]>(API_ENDPOINTS.TEAMS_BY_WORKSPACE(workspaceId), { token }),

	create: async (
		data: { workspaceId: string; name: string; description?: string },
		token?: string,
	) => apiClient.post<Team>(API_ENDPOINTS.TEAMS, data, { token }),

	addMember: async (teamId: string, data: { userId: string; role: string }, token?: string) =>
		apiClient.post(API_ENDPOINTS.TEAM_MEMBERS(teamId), data, { token }),
};
