"use client";

import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { userService, workspaceService } from "@/lib/api/services";
import type { UserProfile } from "@/lib/types/models";
import { useWorkspaceStore } from "@/stores/workspace-store";

export interface WorkspaceMemberWithProfile {
	id: string;
	userId: string;
	role: string;
	joinedAt: string;
	profile?: UserProfile;
	slug: string;
	online?: boolean;
}

/**
 * Hook that fetches workspace members and their user profiles.
 * Used for the DMs sidebar and People directory.
 * - Filters out the current user (you don't DM yourself)
 * - Generates readable slugs from user profile names
 */
export function useWorkspaceMembers() {
	const { token, user, isAuthenticated } = useSupabaseAuth();
	const { activeWorkspaceId } = useWorkspaceStore();
	const [members, setMembers] = useState<WorkspaceMemberWithProfile[]>([]);
	const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch current user profile
	useEffect(() => {
		if (!token || !isAuthenticated) return;

		const fetchProfile = async () => {
			try {
				const profile = await userService.getMe(token);
				setCurrentUserProfile(profile);
			} catch (error) {
				console.error("Failed to fetch user profile:", error);
			}
		};

		fetchProfile();
	}, [token, isAuthenticated]);

	// Fetch workspace members (backend now returns user profiles inline)
	useEffect(() => {
		if (!token || !activeWorkspaceId) return;

		const fetchMembers = async () => {
			setIsLoading(true);
			try {
				const membersList = await workspaceService.listMembers(activeWorkspaceId, token);

				// biome-ignore lint/suspicious/noExplicitAny: backend returns extended shape with user relation
				const mappedMembers: WorkspaceMemberWithProfile[] = (membersList as any[]).map((m) => {
					// Backend now includes `user` object with profile fields
					const userProfile: UserProfile | undefined = m.user
						? {
								id: m.user.id,
								supabaseId: m.user.supabaseId,
								email: m.user.email,
								firstName: m.user.firstName || "",
								lastName: m.user.lastName || "",
								username: m.user.username || "",
								imageUrl: m.user.imageUrl,
								createdAt: "",
								updatedAt: "",
							}
						: undefined;

					// Generate readable slug from profile
					const slugName = userProfile
						? [userProfile.firstName, userProfile.lastName]
								.filter(Boolean)
								.join("-")
								.toLowerCase() ||
							userProfile.username ||
							m.userId
						: m.userId;

					return {
						id: m.id,
						userId: m.userId,
						role: m.role,
						joinedAt: m.joinedAt,
						profile: userProfile,
						slug: slugName,
						online: false,
					};
				});

				// Filter OUT the current user — you should not see yourself in DMs
				const filtered = mappedMembers.filter((m) => m.userId !== user?.id);

				// Sort alphabetically by display name
				filtered.sort((a, b) => {
					const nameA = a.profile?.firstName || a.slug;
					const nameB = b.profile?.firstName || b.slug;
					return nameA.localeCompare(nameB);
				});

				setMembers(filtered);
			} catch (error) {
				console.error("Failed to fetch workspace members:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMembers();
	}, [token, activeWorkspaceId, user?.id]);

	return {
		members,
		currentUserProfile,
		isLoading,
	};
}
