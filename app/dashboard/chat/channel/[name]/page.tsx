import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ChannelView } from "@/components/dashboard/ChannelView";
import { messageKeys, normalizeMessage } from "@/hooks/chat/message-utils";
import { fetchClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
import { getQueryClient } from "@/lib/query-client";
import { createClient } from "@/lib/supabase/server";

export default async function ChannelPage({ params }: { params: Promise<{ name: string }> }) {
	const { name } = await params;
	const channelName = decodeURIComponent(name);

	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	const token = session?.access_token;

	const queryClient = getQueryClient();

	if (token && channelName) {
		await queryClient.prefetchQuery({
			queryKey: messageKeys.byChannel(channelName),
			queryFn: async () => {
				const data = await fetchClient<any[]>(API_ENDPOINTS.MESSAGES_BY_CHANNEL(channelName), {
					token,
					method: "GET",
				});
				return (data || []).map(normalizeMessage);
			},
		});
	}

	const dehydratedState = dehydrate(queryClient);

	return (
		<HydrationBoundary state={dehydratedState}>
			<ChannelView channelName={channelName} />
		</HydrationBoundary>
	);
}
