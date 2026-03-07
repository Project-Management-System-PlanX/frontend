"use client";

import { CheckCircle2, ChevronDown, Circle, Clock, Loader2, Search, X } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InviteMembersDialog } from "@/components/workspaces/InviteMembersDialog";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { useWorkspaceStore } from "@/stores/workspace-store";

const getStatusIcon = (status?: string) => {
	switch (status) {
		case "verified":
			return <CheckCircle2 className="w-4 h-4 text-primary" />;
		case "online":
			return <Circle className="w-3 h-3 fill-emerald-500 text-emerald-500" />;
		case "away":
			return <Clock className="w-4 h-4 text-slate-400" />;
		case "offline":
			return <Circle className="w-3 h-3 text-slate-400" />;
		default:
			return null;
	}
};

export function PeopleDirectory() {
	const [searchQuery, setSearchQuery] = useState("");
	const [showBanner, setShowBanner] = useState(true);
	const [displayCount, setDisplayCount] = useState(10);
	const [inviteOpen, setInviteOpen] = useState(false);

	const { user } = useSupabaseAuth();
	const { members, currentUserProfile, isLoading } = useWorkspaceMembers();
	const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
	const activeWorkspaceName = useWorkspaceStore((state) => state.activeWorkspaceName);

	// Map members to display format
	const people = members.map((member) => {
		const name = member.profile
			? [member.profile.firstName, member.profile.lastName].filter(Boolean).join(" ") ||
				member.profile.email
			: member.userId.slice(0, 8);

		const isCurrentUser = member.userId === currentUserProfile?.supabaseId;

		return {
			id: member.id,
			name: isCurrentUser ? name : name,
			title: isCurrentUser ? "That's you!" : member.role || "Member",
			avatar: member.profile?.imageUrl || "",
			status: isCurrentUser
				? ("verified" as const)
				: member.online
					? ("online" as const)
					: ("offline" as const),
			isCurrentUser,
		};
	});

	// Sort: current user first, then alphabetically by name
	const sortedPeople = [...people].sort((a, b) => {
		if (a.isCurrentUser) return -1;
		if (b.isCurrentUser) return 1;
		return a.name.localeCompare(b.name);
	});

	const filteredPeople = sortedPeople.filter(
		(person) =>
			person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			person.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const displayedPeople = filteredPeople.slice(0, displayCount);

	return (
		<div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
			{/* Header */}
			<div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
				<h1 className="text-2xl font-semibold text-slate-900">People</h1>
				<Button
					onClick={() => setInviteOpen(true)}
					className="gap-2 bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white"
				>
					<span>+</span>
					Invite People
				</Button>
			</div>

			{/* Invite Banner */}
			{showBanner && (
				<div className="relative bg-slate-900 px-8 py-10 shrink-0">
					<button
						type="button"
						onClick={() => setShowBanner(false)}
						className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
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
			)}

			{/* Search Bar */}
			<div className="px-8 py-4 flex items-center gap-4 bg-white shrink-0 max-w-5xl mx-auto w-full">
				<div className="flex-1 relative">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
						<Input
							placeholder="Search for people"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 bg-white border-slate-200 rounded-md h-10 w-full"
						/>
					</div>
				</div>
			</div>

			{/* Filters and Sort */}
			<div className="px-8 py-2 flex items-center justify-between gap-4 bg-white shrink-0 max-w-5xl mx-auto w-full mb-2">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700 text-xs font-medium h-8"
					>
						All people <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700 text-xs font-medium h-8"
					>
						Title <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700 text-xs font-medium h-8"
					>
						Location <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
					</Button>
					<Button
						size="sm"
						className="text-[#0B6E4F] bg-transparent hover:bg-slate-50 text-xs font-medium flex items-center gap-1 h-8 px-2"
					>
						<Search className="w-3.5 h-3.5" />
						Filters
					</Button>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="bg-transparent border-slate-200 text-slate-700 text-xs font-medium h-8"
				>
					Most recommended <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
				</Button>
			</div>

			{/* People Grid */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-8 max-w-5xl mx-auto">
					{isLoading ? (
						<div className="flex items-center justify-center h-64">
							<Loader2 className="w-6 h-6 animate-spin text-[#0B6E4F]" />
							<span className="ml-3 text-sm text-slate-500">Loading people...</span>
						</div>
					) : displayedPeople.length === 0 ? (
						<div className="flex items-center justify-center h-64 text-slate-500">
							No people found
						</div>
					) : (
						<>
							<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 mb-8">
								{displayedPeople.map((person) => (
									<div
										key={person.id}
										className="bg-white rounded-md overflow-hidden border border-slate-200 hover:shadow-md transition-all group"
									>
										{/* Image Container */}
										<div className="relative aspect-square overflow-hidden bg-slate-100">
											<Avatar className="w-full h-full rounded-none">
												<AvatarImage src={person.avatar} className="w-full h-full object-cover" />
												<AvatarFallback className="w-full h-full bg-slate-100 text-slate-600 text-xs font-medium flex items-center justify-center">
													{person.name
														.split(" ")
														.map((n) => n[0])
														.join("")
														.slice(0, 2)
														.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											{person.isCurrentUser && (
												<Button
													size="sm"
													className="absolute top-2 right-2 bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
												>
													Edit
												</Button>
											)}
										</div>

										{/* Info Container */}
										<div className="p-2">
											<div className="flex items-center gap-1 mb-0.5">
												<h3 className="font-semibold text-slate-900 text-[10px] flex-1">
													{person.name}
												</h3>
												{getStatusIcon(person.status) && (
													<div className="flex-shrink-0">{getStatusIcon(person.status)}</div>
												)}
											</div>
											<p className="text-[9px] text-slate-500">{person.title}</p>
										</div>
									</div>
								))}
							</div>

							{/* Footer */}
							<div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-200 bg-slate-50 -mx-8 -mb-8 px-8 py-8">
								<p className="text-xs text-slate-500">
									Showing {displayedPeople.length} of {filteredPeople.length} people
								</p>
								{displayCount < filteredPeople.length && (
									<Button
										variant="outline"
										onClick={() => setDisplayCount(displayCount + 10)}
										className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 px-8"
									>
										Load more
									</Button>
								)}
							</div>
						</>
					)}
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
