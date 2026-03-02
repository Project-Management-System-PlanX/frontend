"use client";

import { use, useEffect, useState } from "react";
import { ChatArea } from "@/components/dashboard/ChatArea";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { channelService } from "@/lib/api/services";
import { useChannelStore } from "@/stores/channel-store";
import { Loader2 } from "lucide-react";

export default function DMPage({ params }: { params: Promise<{ name: string }> }) {
	const { name } = use(params);
	const dmSlug = decodeURIComponent(name);
	const { token, user } = useSupabaseAuth();
	const { members } = useWorkspaceMembers();
	const { activeWorkspaceId } = useWorkspaceStore();
	const { channels, addChannel } = useChannelStore();
	const [dmChannelId, setDmChannelId] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Find the target member by slug
	const targetMember = members.find((m) => m.slug === dmSlug);

	// Find or create a DIRECT_MESSAGE channel between current user and target member
	useEffect(() => {
		if (!token || !activeWorkspaceId || !targetMember || !user?.id) return;

		const findOrCreateDMChannel = async () => {
			setIsCreating(true);
			setError(null);

			try {
				// Check if a DM channel already exists in local store
				const existingDM = channels.find(
					(c) =>
						c.type === "DIRECT_MESSAGE" &&
						c.name === `dm-${[user.id, targetMember.userId].sort().join("-")}`
				);

				if (existingDM) {
					setDmChannelId(existingDM.id);
					setIsCreating(false);
					return;
				}

				// Generate a deterministic DM channel name (sorted user IDs so both sides match)
				const dmName = `dm-${[user.id, targetMember.userId].sort().join("-")}`;

				// Try creating a new DM channel via backend
				const newChannel = await channelService.create(
					{
						workspaceId: activeWorkspaceId,
						name: dmName,
						type: "DIRECT_MESSAGE",
					},
					token
				);

				// Add the other user as a member of this DM channel
				await channelService.addMember(newChannel.id, targetMember.userId, "MEMBER", token);

				// Add to local store
				addChannel({
					id: newChannel.id,
					name: newChannel.name,
					workspaceId: newChannel.workspaceId,
					type: "DIRECT_MESSAGE",
					members: 2,
					isJoined: true,
					createdAt: newChannel.createdAt,
					updatedAt: newChannel.updatedAt,
				});

				setDmChannelId(newChannel.id);
			} catch (err: unknown) {
				// If channel already exists (409 conflict or similar), try fetching channels
				try {
					const allChannels = await channelService.listByWorkspace(activeWorkspaceId, token);
					const dmName = `dm-${[user.id, targetMember.userId].sort().join("-")}`;
					const existing = allChannels.find((c) => c.name === dmName);
					if (existing) {
						setDmChannelId(existing.id);
					} else {
						const msg = err instanceof Error ? err.message : "Failed to create DM channel";
						setError(msg);
					}
				} catch {
					const msg = err instanceof Error ? err.message : "Failed to create DM channel";
					setError(msg);
				}
			} finally {
				setIsCreating(false);
			}
		};

		findOrCreateDMChannel();
	}, [token, activeWorkspaceId, targetMember, user?.id, channels, addChannel]);

	// Display name for the DM header
	const displayName = targetMember?.profile
		? [targetMember.profile.firstName, targetMember.profile.lastName].filter(Boolean).join(" ") || targetMember.profile.email
		: dmSlug;

	if (isCreating || !dmChannelId) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center h-full bg-white">
				{error ? (
					<div className="text-center">
						<p className="text-red-500 font-medium mb-2">Failed to start conversation</p>
						<p className="text-sm text-gray-500">{error}</p>
					</div>
				) : (
					<>
						<Loader2 className="w-6 h-6 animate-spin text-[#0B6E4F] mb-3" />
						<p className="text-sm text-gray-500">Starting conversation with {displayName}...</p>
					</>
				)}
			</div>
		);
	}

	return (
		<ChatArea
			channelName={dmChannelId}
			detailsOpen={false}
			onToggleDetails={() => { }}
			isDM
		/>
	);
}
