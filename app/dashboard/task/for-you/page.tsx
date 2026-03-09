import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ForYouView } from "@/components/dashboard/ForYouView";
import { taskKeys } from "@/hooks/api/use-tasks";
import { tasksService } from "@/lib/api/services";
import { getQueryClient } from "@/lib/query-client";
import { createClient } from "@/lib/supabase/server";

export default async function ForYouPage() {
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	const token = session?.access_token;

	const queryClient = getQueryClient();

	if (token) {
		await queryClient.prefetchQuery({
			queryKey: taskKeys.assignedToMe(),
			queryFn: () => tasksService.listAssignedToMe(token),
		});
	}

	const dehydratedState = dehydrate(queryClient);

	return (
		<HydrationBoundary state={dehydratedState}>
			<ForYouView />
		</HydrationBoundary>
	);
}
