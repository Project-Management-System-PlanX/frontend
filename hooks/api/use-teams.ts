import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const useCreateTeam = (token?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { workspaceId: string; name: string; description?: string }) =>
			teamsService.create(data, token),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: teamKeys.list(variables.workspaceId),
			});
		},
	});
};

export const useAddTeamMember = (token?: string) => {
	return useMutation({
		mutationFn: ({ teamId, data }: { teamId: string; data: { userId: string; role: string } }) =>
			teamsService.addMember(teamId, data, token),
	});
};
