import { useQuery } from "@tanstack/react-query";
import { teamsService } from "../../lib/api/services";

export const teamKeys = {
	all: ["teams"] as const,
	lists: () => [...teamKeys.all, "list"] as const,
	list: (workspaceId: string) => [...teamKeys.lists(), { workspaceId }] as const,
};

export const useTeams = (workspaceId: string, token?: string) => {
	return useQuery({
		queryKey: teamKeys.list(workspaceId),
		queryFn: () => teamsService.listByWorkspace(workspaceId, token),
		enabled: !!workspaceId && !!token,
	});
};
