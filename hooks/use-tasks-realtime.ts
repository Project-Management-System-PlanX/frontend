"use client";

import { createClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { taskKeys } from "@/hooks/api/use-tasks";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Subscribes to Supabase Realtime for task changes in a space (or globally).
 * When a change is detected, it invalidates the React Query cache so the UI
 * refreshes near-instantly without a full page reload.
 */
export function useTasksRealtime(spaceId?: string) {
	const queryClient = useQueryClient();

	useEffect(() => {
		const filter = spaceId ? `spaceId=eq.${spaceId}` : undefined;

		const channel = supabase
			.channel(`tasks-realtime-${spaceId || "global"}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "tasks",
					...(filter ? { filter } : {}),
				},
				() => {
					// Invalidate the specific space query if we have a spaceId
					if (spaceId) {
						queryClient.invalidateQueries({ queryKey: taskKeys.bySpace(spaceId) });
					}
					// Also invalidate global task queries (assigned-to-me, worked-on, etc.)
					queryClient.invalidateQueries({ queryKey: taskKeys.all });
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [spaceId, queryClient]);
}
