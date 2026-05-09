import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ForYouView } from "@/components/dashboard/ForYouView";
import { getQueryClient } from "@/lib/query-client";

export default async function ForYouPage() {
	const queryClient = getQueryClient();
	const dehydratedState = dehydrate(queryClient);

	return (
		<HydrationBoundary state={dehydratedState}>
			<ForYouView />
		</HydrationBoundary>
	);
}
