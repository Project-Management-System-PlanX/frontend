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
};
