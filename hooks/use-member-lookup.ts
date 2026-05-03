import { useMemo } from "react";
import { useWorkspaceMembers } from "./use-workspace-members";

export interface MemberInfo {
	name: string;
	initials: string;
	imageUrl?: string;
}

const UNKNOWN_MEMBER: MemberInfo = { name: "Unknown", initials: "?", imageUrl: undefined };

export function useMemberLookup() {
	const { members, currentUserProfile, isLoading } = useWorkspaceMembers();

	const lookup = useMemo(() => {
		const map = new Map<string, MemberInfo>();

		// Add current user (keyed by supabaseId since tasks store supabaseId)
		if (currentUserProfile) {
			const name =
				[currentUserProfile.firstName, currentUserProfile.lastName].filter(Boolean).join(" ") ||
				currentUserProfile.username ||
				currentUserProfile.email;
			const initials =
				currentUserProfile.firstName && currentUserProfile.lastName
					? `${currentUserProfile.firstName[0]}${currentUserProfile.lastName[0]}`
					: name.substring(0, 2);
			map.set(currentUserProfile.supabaseId, {
				name,
				initials: initials.toUpperCase(),
				imageUrl: currentUserProfile.imageUrl,
			});
		}

		// Add other workspace members (member.userId is already the supabaseId)
		for (const member of members) {
			if (member.profile) {
				const name =
					[member.profile.firstName, member.profile.lastName].filter(Boolean).join(" ") ||
					member.profile.username ||
					member.profile.email;
				const initials =
					member.profile.firstName && member.profile.lastName
						? `${member.profile.firstName[0]}${member.profile.lastName[0]}`
						: name.substring(0, 2);
				map.set(member.userId, {
					name,
					initials: initials.toUpperCase(),
					imageUrl: member.profile.imageUrl,
				});
			}
		}

		return map;
	}, [members, currentUserProfile]);

	const getMember = (userId: string | undefined): MemberInfo => {
		if (!userId) return { name: "Unassigned", initials: "?", imageUrl: undefined };
		return lookup.get(userId) || UNKNOWN_MEMBER;
	};

	return { getMember, isLoading };
}
