import { ChevronDown, Hash, Lock, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useChannelsByWorkspace } from "@/hooks/api/use-channels";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Workspace } from "@/lib/types/models";
import { CreateChannelDialog } from "./CreateChannelDialog";

export function WorkspaceSidebar({ workspace }: { workspace: Workspace }) {
	const params = useParams();
	const { token } = useSupabaseAuth();

	const workspaceId = params.id as string;
	const activeChannelId = params.channelId as string;

	const { data: channels = [], isLoading } = useChannelsByWorkspace(workspaceId, token);
	const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);

	// Determine if user is owner/admin (for showing the Create Channel + button for public channels)
	// Simplified here: ideally we'd look up the user's role from workspace.members.
	// For now, let's allow everyone to open the modal (the backend rejects unauthorized requests).

	const publicChannels = channels.filter((c) => c.type === "PUBLIC");
	const privateChannels = channels.filter((c) => c.type === "PRIVATE");
	const directMessages = channels.filter((c) => c.type === "DIRECT_MESSAGE");

	return (
		<>
			<aside className="w-64 bg-[#013220] text-gray-300 flex flex-col h-full flex-shrink-0">
				{/* Header */}
				<div className="h-14 border-b border-white/10 flex items-center px-4 hover:bg-white/5 cursor-pointer transition-colors">
					<div className="font-bold text-white flex items-center gap-2 truncate flex-1 shadow-sm">
						<div className="w-6 h-6 rounded bg-[#50C878] text-[#013220] flex items-center justify-center text-xs">
							{workspace.name.charAt(0).toUpperCase()}
						</div>
						<span className="truncate">{workspace.name}</span>
					</div>
					<ChevronDown className="w-4 h-4 opacity-50" />
				</div>

				{/* Sidebar Content */}
				<div className="flex-1 overflow-y-auto py-4 space-y-6">
					{/* Public Channels */}
					<div>
						<div className="px-4 flex items-center justify-between group">
							<span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-300 transition-colors">
								Channels
							</span>
							<button
								type="button"
								onClick={() => setIsCreateChannelOpen(true)}
								className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
							>
								<Plus className="w-3.5 h-3.5" />
							</button>
						</div>
						<div className="mt-2 space-y-0.5 px-2">
							{isLoading ? (
								<div className="px-3 py-1 text-sm text-gray-500 animate-pulse">Loading...</div>
							) : (
								publicChannels.map((channel) => (
									<Link
										key={channel.id}
										href={`/workspaces/${workspaceId}/channels/${channel.id}`}
										className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
											activeChannelId === channel.id
												? "bg-[#0B6E4F] text-white font-medium"
												: "hover:bg-white/10 text-gray-300"
										}`}
									>
										<Hash className="w-4 h-4 opacity-70" />
										<span className="truncate">{channel.name}</span>
									</Link>
								))
							)}
						</div>
					</div>

					{/* Private Channels */}
					{privateChannels.length > 0 && (
						<div>
							<div className="px-4 flex items-center justify-between group">
								<span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-300 transition-colors">
									Private Channels
								</span>
							</div>
							<div className="mt-2 space-y-0.5 px-2">
								{privateChannels.map((channel) => (
									<Link
										key={channel.id}
										href={`/workspaces/${workspaceId}/channels/${channel.id}`}
										className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
											activeChannelId === channel.id
												? "bg-[#0B6E4F] text-white font-medium"
												: "hover:bg-white/10 text-gray-300"
										}`}
									>
										<Lock className="w-3.5 h-3.5 opacity-70" />
										<span className="truncate">{channel.name}</span>
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Direct Messages */}
					<div>
						<div className="px-4 flex items-center justify-between group">
							<span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-300 transition-colors">
								Direct Messages
							</span>
							<button
								type="button"
								onClick={() => setIsCreateChannelOpen(true)}
								className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
							>
								<Plus className="w-3.5 h-3.5" />
							</button>
						</div>
						<div className="mt-2 space-y-0.5 px-2">
							{directMessages.map((channel) => (
								<Link
									key={channel.id}
									href={`/workspaces/${workspaceId}/channels/${channel.id}`}
									className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
										activeChannelId === channel.id
											? "bg-[#0B6E4F] text-white font-medium"
											: "hover:bg-white/10 text-gray-300"
									}`}
								>
									{/* Temporary logic: if DM, show generic icon or initials. Real app parses channel.members */}
									<div className="w-4 h-4 rounded bg-[#50C878]/20 flex items-center justify-center shrink-0">
										<MessageCircle className="w-3 h-3 text-[#50C878]" />
									</div>
									<span className="truncate">{channel.name || "Conversation"}</span>
								</Link>
							))}
						</div>
					</div>
				</div>
			</aside>

			<CreateChannelDialog
				isOpen={isCreateChannelOpen}
				onClose={() => setIsCreateChannelOpen(false)}
				workspaceId={workspaceId}
			/>
		</>
	);
}
