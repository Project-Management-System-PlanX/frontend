"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { taskKeys } from "./api/use-tasks";

/**
 * Subscribes to Supabase Realtime for the `tasks` table.
 * On any INSERT / UPDATE / DELETE, invalidates the relevant React Query caches
 * so all task views (List, Board, Calendar, Timeline) stay in sync across users.
 *
 * @param spaceId - optional: scope the subscription to a single space
 */
export function useTasksRealtime(spaceId?: string) {
	const queryClient = useQueryClient();
	const supabaseRef = useRef(createClient());

	useEffect(() => {
		const supabase = supabaseRef.current;

		const channelName = spaceId ? `tasks:space:${spaceId}` : "tasks:all";
		const filter = spaceId ? `space_id=eq.${spaceId}` : undefined;

		const channel = supabase
			.channel(channelName)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "tasks",
					...(filter ? { filter } : {}),
				},
				() => {
					// Invalidate all task list queries so views refetch
					queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
					queryClient.invalidateQueries({ queryKey: taskKeys.assignedToMe() });
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [spaceId, queryClient]);
}
