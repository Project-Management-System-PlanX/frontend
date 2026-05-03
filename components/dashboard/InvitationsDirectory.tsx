"use client";

import { AlertCircle, CheckCircle2, Clock, Inbox, Mail, RefreshCw, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InviteMembersDialog } from "@/components/workspaces/InviteMembersDialog";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { EmailInvitation } from "@/lib/api/services/workspaces";
import { workspaceService } from "@/lib/api/services/workspaces";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";

type Tab = "sent" | "received";

function StatusBadge({ status }: { status: string }) {
	if (status === "ACCEPTED") {
		return (
			<span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
				<CheckCircle2 className="w-3 h-3" />
				Accepted
			</span>
		);
	}
	if (status === "FAILED") {
		return (
			<span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
				<AlertCircle className="w-3 h-3" />
				Failed
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
			<Clock className="w-3 h-3" />
			Pending
		</span>
	);
}

function InvitationRow({ invitation }: { invitation: EmailInvitation }) {
	return (
		<div className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0">
			<div className="flex items-center gap-3 min-w-0">
				<div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
					<Mail className="w-4 h-4 text-slate-500" />
				</div>
				<div className="min-w-0">
					<p className="text-sm font-medium text-slate-900 truncate">{invitation.email}</p>
					<p className="text-xs text-slate-400">
						{new Date(invitation.sentAt).toLocaleDateString(undefined, {
							month: "short",
							day: "numeric",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</p>
				</div>
			</div>
			<StatusBadge status={invitation.status} />
		</div>
	);
}

function EmptyState({ tab }: { tab: Tab }) {
	return (
		<div className="flex-1 flex items-center justify-center py-16">
			<div className="flex flex-col items-center text-center px-6">
				<div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mb-4">
					{tab === "sent" ? (
						<Send className="w-8 h-8 text-sky-500" />
					) : (
						<Inbox className="w-8 h-8 text-sky-500" />
					)}
				</div>
				<h3 className="text-base font-semibold text-slate-900 mb-1">
					{tab === "sent" ? "No invitations sent yet" : "No invitations received"}
				</h3>
				<p className="text-slate-500 text-sm max-w-xs">
					{tab === "sent"
						? "Invite team members via email and track their status here."
						: "Invitations sent to your email will appear here."}
				</p>
			</div>
		</div>
	);
}

export function InvitationsDirectory() {
	const [inviteOpen, setInviteOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>("sent");
	const [sent, setSent] = useState<EmailInvitation[]>([]);
	const [received, setReceived] = useState<EmailInvitation[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const { user, token } = useSupabaseAuth();
	const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
	const activeWorkspaceName = useWorkspaceStore((state) => state.activeWorkspaceName);

	const fetchInvitations = useCallback(async () => {
		if (!activeWorkspaceId || !token) return;
		setIsLoading(true);
		try {
			const data = await workspaceService.getInvitations(activeWorkspaceId, token);
			setSent(data.sent);
			setReceived(data.received);
		} catch (err) {
			console.error("[InvitationsDirectory] Failed to fetch invitations:", err);
		} finally {
			setIsLoading(false);
		}
	}, [activeWorkspaceId, token]);

	// Initial fetch
	useEffect(() => {
		fetchInvitations();
	}, [fetchInvitations]);

	// Supabase Realtime subscription for live sync
	useEffect(() => {
		if (!activeWorkspaceId) return;

		const supabase = createClient();
		const channel = supabase
			.channel(`invitations:${activeWorkspaceId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "email_invitations",
					filter: `workspace_id=eq.${activeWorkspaceId}`,
				},
				() => {
					// Re-fetch on any change to the email_invitations table for this workspace
					fetchInvitations();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [activeWorkspaceId, fetchInvitations]);

	const currentList = activeTab === "sent" ? sent : received;

	return (
		<div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
			{/* Header */}
			<div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
				<h1 className="text-2xl font-semibold text-slate-900">Invitations</h1>
				<button
					type="button"
					onClick={fetchInvitations}
					disabled={isLoading}
					className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-md hover:bg-slate-100 disabled:opacity-50"
					title="Refresh"
				>
					<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
				</button>
			</div>

			{/* Invite Banner */}
			<div className="relative bg-slate-900 px-8 py-10 shrink-0">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-2xl font-bold text-white mb-2">Invite your team to Team UP</h2>
					<p className="text-slate-400 text-sm mb-6 max-w-2xl">
						Bring your team members into Team UP to start working better together. Send invites via
						email, or get a handy link to share.
					</p>
					<Button
						onClick={() => setInviteOpen(true)}
						className="bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700"
					>
						Invite people
					</Button>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-slate-200 px-6 shrink-0">
				<button
					type="button"
					onClick={() => setActiveTab("sent")}
					className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
						activeTab === "sent"
							? "border-slate-900 text-slate-900"
							: "border-transparent text-slate-500 hover:text-slate-700"
					}`}
				>
					<Send className="w-4 h-4" />
					Sent
					{sent.length > 0 && (
						<span className="bg-slate-100 text-slate-600 text-xs px-1.5 py-0.5 rounded-full">
							{sent.length}
						</span>
					)}
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("received")}
					className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
						activeTab === "received"
							? "border-slate-900 text-slate-900"
							: "border-transparent text-slate-500 hover:text-slate-700"
					}`}
				>
					<Inbox className="w-4 h-4" />
					Received
					{received.length > 0 && (
						<span className="bg-slate-100 text-slate-600 text-xs px-1.5 py-0.5 rounded-full">
							{received.length}
						</span>
					)}
				</button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-16">
						<RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
					</div>
				) : currentList.length === 0 ? (
					<EmptyState tab={activeTab} />
				) : (
					<div>
						{currentList.map((inv) => (
							<InvitationRow key={inv.id} invitation={inv} />
						))}
					</div>
				)}
			</div>

			{/* Invite Members Dialog */}
			{activeWorkspaceId && (
				<InviteMembersDialog
					isOpen={inviteOpen}
					onClose={() => {
						setInviteOpen(false);
						fetchInvitations();
					}}
					workspaceId={activeWorkspaceId}
					workspaceName={activeWorkspaceName || "Team UP"}
					userId={user?.id ?? ""}
				/>
			)}
		</div>
	);
}
