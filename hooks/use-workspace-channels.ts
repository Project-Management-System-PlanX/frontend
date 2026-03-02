"use client";

import { useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { channelService } from "@/lib/api/services";
import { workspaceService } from "@/lib/api/services";
import { useChannelStore } from "@/stores/channel-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

/**
 * Hook that auto-selects the first workspace and fetches its channels.
 * Should be used once at the chat layout level.
 */
export function useWorkspaceChannels() {
    const { token, isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
    const { activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
    const { channels, setChannels, isLoaded } = useChannelStore();

    // 1. Auto-select workspace if none is set
    useEffect(() => {
        if (!token || !isAuthenticated || authLoading) return;
        if (activeWorkspaceId) return; // Already have one

        const fetchWorkspaces = async () => {
            try {
                const workspaces = await workspaceService.list(undefined, token);
                if (workspaces.length > 0) {
                    setActiveWorkspace(workspaces[0].id, workspaces[0].name);
                }
            } catch (error) {
                console.error("Failed to fetch workspaces:", error);
            }
        };

        fetchWorkspaces();
    }, [token, isAuthenticated, authLoading, activeWorkspaceId, setActiveWorkspace]);

    // 2. Fetch channels for the active workspace
    useEffect(() => {
        if (!token || !activeWorkspaceId) return;

        const fetchChannels = async () => {
            try {
                const apiChannels = await channelService.listByWorkspace(activeWorkspaceId, token);
                const mappedChannels = apiChannels.map((ch) => ({
                    id: ch.id,
                    name: ch.name,
                    workspaceId: ch.workspaceId,
                    type: ch.type as "PUBLIC" | "PRIVATE" | "COMPANY-WIDE" | "DIRECT_MESSAGE",
                    description: ch.description,
                    members: ch.members?.length ?? 0,
                    isJoined: true,
                    createdAt: ch.createdAt,
                    updatedAt: ch.updatedAt,
                }));

                // Sort channels alphabetically by name
                mappedChannels.sort((a, b) => a.name.localeCompare(b.name));
                setChannels(mappedChannels);
            } catch (error) {
                console.error("Failed to fetch channels:", error);
            }
        };

        fetchChannels();
    }, [token, activeWorkspaceId, setChannels]);

    return {
        channels,
        isLoaded,
        activeWorkspaceId,
        token,
        isAuthenticated,
        authLoading,
    };
}
