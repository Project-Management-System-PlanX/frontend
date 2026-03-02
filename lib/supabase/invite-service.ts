"use client";

import { createClient } from "@/lib/supabase/client";

export interface WorkspaceInvite {
	id: string;
	workspace_id: string;
	token: string;
	created_by: string;
	expires_at: string;
	max_uses: number;
	use_count: number;
	created_at: string;
}

const supabase = createClient();

export const inviteService = {
	/** Create an invite link for a workspace */
	create: async (workspaceId: string, createdBy: string) => {
		const { data, error } = await supabase
			.from("workspace_invites")
			.insert({
				workspace_id: workspaceId,
				created_by: createdBy,
			})
			.select()
			.single();

		if (error) throw error;
		return data as WorkspaceInvite;
	},

	/** Get invite details by token */
	getByToken: async (token: string) => {
		const { data, error } = await supabase
			.from("workspace_invites")
			.select("*, workspaces(id, name, slug, avatar)")
			.eq("token", token)
			.single();

		if (error) throw error;
		return data;
	},

	/** Increment use count */
	incrementUseCount: async (inviteId: string) => {
		const { error } = await supabase.rpc("increment_invite_use_count", {
			invite_id: inviteId,
		});
		// If RPC doesn't exist, silently fail — it's optional
		if (error) console.warn("Could not increment invite use count:", error.message);
	},
};
