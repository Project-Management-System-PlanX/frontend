"use client";

import { Check, ChevronDown, Hash, Loader2, Plus, Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceChannels } from "@/hooks/use-workspace-channels";
import { channelService } from "@/lib/api/services";
import { type Channel, useChannelStore } from "@/stores/channel-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { CreateChannelDialog } from "./CreateChannelDialog";

interface ChannelsDirectoryProps {
	onBack?: () => void;
}

export function ChannelsDirectory(_props: ChannelsDirectoryProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [showBanner, setShowBanner] = useState(true);
	const [hoveredChannelId, setHoveredChannelId] = useState<string | null>(null);
	const [createChannelOpen, setCreateChannelOpen] = useState(false);

	const { token } = useSupabaseAuth();
	const { channels, isLoaded, activeWorkspaceId } = useWorkspaceChannels();
	const { addChannel, removeChannel } = useChannelStore();
	const { activeWorkspaceName } = useWorkspaceStore();

	const filteredChannels = channels
		.filter((channel) => channel.type !== "DIRECT_MESSAGE")
		.filter((channel) => channel.name.toLowerCase().includes(searchQuery.toLowerCase()));

	// Sort channels: alphabetically by name
	const sortedChannels = [...filteredChannels].sort((a, b) => a.name.localeCompare(b.name));

	const handleCreateChannel = async (channel: {
		name: string;
		visibility: "public" | "private";
	}) => {
		if (!activeWorkspaceId || !token) return;

		try {
			const newChannel = await channelService.create(
				{
					workspaceId: activeWorkspaceId,
					name: channel.name,
					type: channel.visibility === "public" ? "PUBLIC" : "PRIVATE",
				},
				token,
			);

			addChannel({
				id: newChannel.id,
				name: newChannel.name,
				workspaceId: newChannel.workspaceId,
				type: newChannel.type as Channel["type"],
				description: newChannel.description,
				members: 1,
				isJoined: true,
				createdAt: newChannel.createdAt,
				updatedAt: newChannel.updatedAt,
			});
		} catch (error) {
			console.error("Failed to create channel:", error);
			alert("Failed to create channel. Please try again.");
		}
	};

	const handleLeaveChannel = async (channelId: string) => {
		removeChannel(channelId);
		// Optionally call API to leave
		// try { await channelService.removeMember(channelId, userId, token); } catch {}
	};

	return (
		<div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
			{/* Header */}
			<div className="h-16 px-6 flex items-center justify-between border-b border-[#d8f3dc] bg-white shrink-0">
				<h1 className="text-2xl font-semibold text-[#0f2318]">Channels</h1>
				<Button
					onClick={() => setCreateChannelOpen(true)}
					className="gap-2 bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white"
				>
					<Plus className="w-4 h-4" />
					Create Channel
				</Button>
			</div>
			{/* Banner */}
			{showBanner && (
				<div className="relative bg-[#f0f4ee] px-8 py-10 shrink-0">
					<button
						type="button"
						onClick={() => setShowBanner(false)}
						className="absolute top-4 right-4 text-[#4a6552] hover:text-[#0f2318] hover:bg-[#d8f3dc] p-1 rounded-lg transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
					<div className="max-w-5xl mx-auto">
						<h2 className="text-2xl font-bold text-[#0f2318] mb-2">
							Organize your team&apos;s conversations
						</h2>
						<p className="text-[#4a6552] text-sm mb-6 max-w-2xl">
							Channels are spaces for gathering all the right people, messages, files and tools.
							Organize them by any project, group, initiative or topic of your choosing.
						</p>
						<Button
							onClick={() => setCreateChannelOpen(true)}
							className="bg-[#2d6a4f] hover:bg-[#1a3d2b] text-white font-medium border border-[#2d6a4f]"
						>
							Create a channel
						</Button>
					</div>
				</div>
			)}{" "}
			{/* Search Bar */}
			<div className="px-8 py-4 flex items-center gap-4 bg-white shrink-0 max-w-5xl mx-auto w-full">
				<div className="flex-1 relative">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
						<Input
							placeholder="Search by name or keyword"
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
						All channels <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700 text-xs font-medium h-8"
					>
						Any channel type <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700 text-xs font-medium h-8"
					>
						Workspaces <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700 text-xs font-medium h-8"
					>
						Organizations <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
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
			{/* Channels List */}
			<div className="flex-1 overflow-y-auto">
				<div className="px-8 pb-8 max-w-5xl mx-auto">
					{!isLoaded ? (
						<div className="flex items-center justify-center h-64">
							<Loader2 className="w-6 h-6 animate-spin text-[#0B6E4F]" />
							<span className="ml-3 text-sm text-slate-500">Loading channels...</span>
						</div>
					) : sortedChannels.length === 0 ? (
						<div className="flex items-center justify-center h-64 text-slate-500 text-sm">
							No channels found
						</div>
					) : (
						<div className="bg-white border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 shadow-sm">
							{sortedChannels.map((channel, index) => (
								<ChannelCard
									key={channel.id}
									channel={channel}
									index={index}
									isHovered={hoveredChannelId === channel.id}
									onMouseEnter={() => setHoveredChannelId(channel.id)}
									onMouseLeave={() => setHoveredChannelId(null)}
									onLeave={() => handleLeaveChannel(channel.id)}
								/>
							))}
						</div>
					)}
				</div>
			</div>
			{/* Create Channel Dialog */}
			<CreateChannelDialog
				open={createChannelOpen}
				onOpenChange={setCreateChannelOpen}
				onChannelCreated={handleCreateChannel}
				workspaceName={activeWorkspaceName || "Team UP"}
			/>
			<style jsx global>{`
				@keyframes fadeInUp {
					from { opacity: 0; transform: translateY(10px); }
					to { opacity: 1; transform: translateY(0); }
				}
			`}</style>
		</div>
	);
}

function ChannelCard({
	channel,
	isHovered,
	index,
	onMouseEnter,
	onMouseLeave,
	onLeave,
}: {
	channel: Channel;
	isHovered: boolean;
	index: number;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	onLeave: () => void;
}) {
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: div uses onMouseEnter/Leave for hover highlight only
		<div
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			style={{ animationDelay: `${index * 0.05}s` }}
			className={`w-full text-left px-5 py-3.5 bg-white hover:bg-slate-50 transition-colors cursor-pointer group animate-[fadeInUp_0.35s_ease-out_both]`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 min-w-0 flex flex-col gap-1">
					<div className="flex items-center gap-1.5">
						<Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<h3 className="font-bold text-slate-900 text-[15px] leading-none">{channel.name}</h3>
						{channel.type && (
							<span className="ml-1 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-500 rounded">
								{channel.type}
							</span>
						)}
					</div>

					<div className="flex items-center gap-2 text-xs text-slate-500 leading-normal">
						{channel.isJoined !== false && (
							<span className="flex items-center gap-1 text-[#0B6E4F] font-medium shrink-0">
								<Check className="w-3 h-3" />
								Joined
							</span>
						)}
						{channel.isJoined !== false && <span className="text-slate-300">·</span>}

						<span className="shrink-0">
							{channel.members || 0} {channel.members === 1 ? "member" : "members"}
						</span>

						{channel.description && (
							<>
								<span className="text-slate-300">·</span>
								<p className="truncate text-slate-500 max-w-[500px]">{channel.description}</p>
							</>
						)}
					</div>
				</div>

				{/* Action Area */}
				<div className="h-8 flex items-center">
					{isHovered && channel.isJoined !== false && (
						<Button
							size="sm"
							variant="destructive"
							className="h-7 text-xs px-3 opacity-0 group-hover:opacity-100 transition-opacity"
							onClick={(e) => {
								e.stopPropagation();
								onLeave();
							}}
						>
							Leave
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
