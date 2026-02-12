"use client";

import { ChevronDown, Hash, Plus, Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateChannelDialog } from "./CreateChannelDialog";

interface Channel {
	id: string;
	name: string;
	type: "PUBLIC" | "PRIVATE" | "COMPANY-WIDE";
	members: number;
	description: string;
	isJoined: boolean;
	avatars?: string[];
}

const channels: Channel[] = [
	{
		id: "1",
		name: "social",
		type: "PUBLIC",
		members: 48,
		description: "Other channels are for work. This one's just for fun.",
		isJoined: true,
		avatars: ["/avatars/1.png", "/avatars/2.png", "/avatars/3.png"],
	},
	{
		id: "2",
		name: "all-teamup",
		type: "COMPANY-WIDE",
		members: 256,
		description:
			"Share announcements and updates about company news, upcoming events, or teammates. 📍",
		isJoined: true,
	},
	{
		id: "3",
		name: "product-roadmap",
		type: "PRIVATE",
		members: 12,
		description: "Planning and tracking upcoming features and platform stability fixes.",
		isJoined: false,
	},
	{
		id: "4",
		name: "marketing-dev",
		type: "PRIVATE",
		members: 24,
		description: "Coordination between marketing requests and technical implementation.",
		isJoined: false,
	},
	{
		id: "5",
		name: "design-system",
		type: "PUBLIC",
		members: 18,
		description: "Discussion about UI/UX standards, components, and design guidelines.",
		isJoined: true,
		avatars: ["/avatars/4.png", "/avatars/5.png"],
	},
];

interface ChannelsDirectoryProps {
	onBack?: () => void;
}

export function ChannelsDirectory(_props: ChannelsDirectoryProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [showBanner, setShowBanner] = useState(true);
	const [hoveredChannelId, setHoveredChannelId] = useState<string | null>(null);
	const [createChannelOpen, setCreateChannelOpen] = useState(false);

	const filteredChannels = channels.filter((channel) =>
		channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
			{/* Header */}
			<div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
				<h1 className="text-2xl font-semibold text-slate-900">Channels</h1>
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
				<div className="relative bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-12 shrink-0">
					<button
						type="button"
						onClick={() => setShowBanner(false)}
						className="absolute top-4 right-4 text-white hover:text-slate-300"
					>
						<X className="w-6 h-6" />
					</button>
					<h2 className="text-2xl font-semibold text-white mb-2">
						Organize your team's conversations
					</h2>
					<p className="text-slate-300 text-sm mb-6">
						Channels are spaces for gathering all the right people, messages, files and tools.
						Organize them by any project, group, initiative or topic of your choosing.
					</p>
					<Button
						onClick={() => setCreateChannelOpen(true)}
						className="bg-slate-700 hover:bg-slate-600 text-white font-semibold"
					>
						Create a channel
					</Button>
				</div>
			)}

			{/* Search Bar */}
			<div className="px-8 py-4 flex items-center gap-4 bg-slate-50 border-b border-slate-200 shrink-0">
				<div className="flex-1 max-w-2xl relative">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
						<Input
							placeholder="Search by name or keyword"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 bg-white border-slate-300 rounded-lg"
						/>
					</div>
				</div>
			</div>

			{/* Filters and Sort */}
			<div className="px-8 py-4 flex items-center justify-between gap-4 border-b border-slate-200 bg-white shrink-0">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="bg-white border-slate-200 text-slate-600 text-xs hover:bg-slate-50"
					>
						All channels <ChevronDown className="w-3 h-3 ml-1" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="bg-white border-slate-200 text-slate-600 text-xs hover:bg-slate-50"
					>
						Any channel type <ChevronDown className="w-3 h-3 ml-1" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="bg-white border-slate-200 text-slate-600 text-xs hover:bg-slate-50"
					>
						Workspaces <ChevronDown className="w-3 h-3 ml-1" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="bg-white border-slate-200 text-slate-600 text-xs hover:bg-slate-50"
					>
						Organizations <ChevronDown className="w-3 h-3 ml-1" />
					</Button>
					<div className="w-px h-6 bg-slate-200 mx-2" />
					<Button
						size="sm"
						className="text-[#0B6E4F] bg-transparent hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 px-3 py-1.5"
					>
						<Search className="w-4 h-4" />
						Filters
					</Button>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="bg-white border-slate-200 text-slate-600 text-xs hover:bg-slate-50"
				>
					Most recommended <ChevronDown className="w-3 h-3 ml-1" />
				</Button>
			</div>
			{/* Channels List */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-8">
					{filteredChannels.length === 0 ? (
						<div className="flex items-center justify-center h-64 text-slate-500">
							No channels found
						</div>
					) : (
						<div className="space-y-3">
							{filteredChannels.map((channel) => (
								<ChannelCard
									key={channel.id}
									channel={channel}
									isHovered={hoveredChannelId === channel.id}
									onMouseEnter={() => setHoveredChannelId(channel.id)}
									onMouseLeave={() => setHoveredChannelId(null)}
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
				onChannelCreated={(channel) => {
					console.log("Channel created:", channel);
				}}
			/>
		</div>
	);
}

function ChannelCard({
	channel,
	isHovered,
	onMouseEnter,
	onMouseLeave,
}: {
	channel: Channel;
	isHovered: boolean;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}) {
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: div uses onMouseEnter/Leave for hover highlight only
		<div
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			className={`w-full text-left px-4 py-3 border border-slate-200 rounded-lg transition-colors cursor-pointer ${
				isHovered ? "bg-slate-50 border-slate-300" : "bg-white"
			}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<Hash className="w-4 h-4 text-slate-400 shrink-0" />
						<h3 className="font-medium text-slate-900 text-sm truncate">{channel.name}</h3>
					</div>
					<p className="text-xs text-slate-600 ml-6">{channel.description}</p>
				</div>
				{isHovered && channel.isJoined && (
					<Button
						size="sm"
						className="bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white text-xs shrink-0"
					>
						Leave
					</Button>
				)}
			</div>
		</div>
	);
}
