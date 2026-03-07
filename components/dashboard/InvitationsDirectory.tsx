"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InviteMembersDialog } from "@/components/workspaces/InviteMembersDialog";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function InvitationsDirectory() {
	const [inviteOpen, setInviteOpen] = useState(false);
	const { user } = useSupabaseAuth();
	const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
	const activeWorkspaceName = useWorkspaceStore((state) => state.activeWorkspaceName);

	return (
		<div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
			{/* Header */}
			<div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
				<h1 className="text-2xl font-semibold text-slate-900">Invitations</h1>
			</div>

			{/* Invite Banner */}
			<div className="relative bg-slate-900 px-8 py-10 shrink-0">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-2xl font-bold text-white mb-2">Invite your team to Team UP</h2>
					<p className="text-slate-400 text-sm mb-6 max-w-2xl">
						Bring your team members into Team UP to start working better together. Send invites
						via email, or get a handy link to share.
					</p>
					<Button
						onClick={() => setInviteOpen(true)}
						className="bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700"
					>
						Invite people
					</Button>
				</div>
			</div>

			{/* Centered Content */}
			<div className="flex-1 flex items-center justify-center">
				<div className="flex flex-col items-center text-center px-6">
					{/* Icon */}
					<div className="w-24 h-24 rounded-2xl bg-sky-400 flex items-center justify-center mb-6 shadow-lg">
						<Mail className="w-12 h-12 text-white" />
					</div>

					{/* Title */}
					<h2 className="text-xl font-bold text-slate-900 mb-2">
						Track your invitations
					</h2>

					{/* Subtitle */}
					<p className="text-slate-500 text-sm max-w-sm leading-relaxed">
						You&apos;ll see the status of invitations you&apos;ve sent and
						received here.
					</p>
				</div>
			</div>

			{/* Invite Members Dialog */}
			{activeWorkspaceId && (
				<InviteMembersDialog
					isOpen={inviteOpen}
					onClose={() => setInviteOpen(false)}
					workspaceId={activeWorkspaceId}
					workspaceName={activeWorkspaceName || "Team UP"}
					userId={user?.id ?? ""}
				/>
			)}
		</div>
	);
}
