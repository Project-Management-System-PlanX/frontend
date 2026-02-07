"use client";

import { Edit3, FileText, Github, LogOut, Pin, Plus, Slack, Users, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChannelDetailsProps {
	channelName: string;
	isOpen: boolean;
	onClose: () => void;
}

interface DetailItem {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	count: number;
}

const detailItems: DetailItem[] = [
	{ icon: Users, label: "Members", count: 15 },
	{ icon: Pin, label: "Pinned Items", count: 4 },
	{ icon: FileText, label: "Files", count: 28 },
];

const integrations = [
	{ name: "Slack", icon: Slack, color: "bg-[#4A154B]" },
	{ name: "GitHub", icon: Github, color: "bg-[#24292e]" },
	{
		name: "Figma",
		icon: null,
		color: "bg-[#1e1e1e]",
		letter: "F",
	},
];

export function ChannelDetails({ channelName, isOpen, onClose }: ChannelDetailsProps) {
	if (!isOpen) return null;

	return (
		<div
			className="w-72 bg-white border-l border-[#e5e7eb] flex flex-col shrink-0"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* Header */}
			<div className="p-4 border-b border-[#e5e7eb] shrink-0 flex items-center justify-between">
				<h2 className="text-[11px] font-semibold text-[#9a9a9a] uppercase tracking-wider">
					Channel Details
				</h2>
				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					className="w-6 h-6 text-[#9a9a9a] hover:text-[#202020]"
				>
					<X className="w-4 h-4" />
				</Button>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-4 space-y-6">
					{/* Channel Avatar */}
					<div className="flex flex-col items-center text-center">
						<Avatar className="w-16 h-16 rounded-xl">
							<AvatarFallback className="rounded-xl bg-[#202020] text-white text-xl font-semibold">
								{channelName
									.split("-")
									.map((w) => w[0]?.toUpperCase())
									.join("")}
							</AvatarFallback>
						</Avatar>
						<div className="flex items-center gap-2 mt-3">
							<span className="text-[#202020] font-medium text-base">#{channelName}</span>
							<Button
								variant="ghost"
								size="icon"
								className="w-5 h-5 text-[#9a9a9a] hover:text-[#156d95]"
							>
								<Edit3 className="w-3 h-3" />
							</Button>
						</div>
						<p className="text-xs text-[#9a9a9a] mt-2 leading-relaxed max-w-[200px]">
							Collaborative channel for UI, UX, and Design Systems.
						</p>
					</div>

					<div className="h-px bg-[#e5e7eb]" />

					{/* Stats */}
					<div className="space-y-1">
						{detailItems.map((item) => (
							<div
								key={item.label}
								className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#f5f5f5] transition-colors cursor-pointer group"
							>
								<div className="flex items-center gap-2.5">
									<div className="w-7 h-7 rounded-md bg-[#f5f5f5] flex items-center justify-center text-[#9a9a9a] group-hover:text-[#404040]">
										<item.icon className="w-3.5 h-3.5" />
									</div>
									<span className="text-[#404040] text-sm">{item.label}</span>
								</div>
								<span className="text-xs text-[#9a9a9a]">{item.count}</span>
							</div>
						))}
					</div>

					<div className="h-px bg-[#e5e7eb]" />
					<div>
						<h3 className="text-[11px] font-semibold text-[#9a9a9a] uppercase tracking-wider mb-3">
							Integrations
						</h3>
						<div className="flex items-center gap-2">
							{integrations.map((integration) => (
								<Button
									key={integration.name}
									variant="ghost"
									size="icon"
									className={`w-8 h-8 rounded-lg ${integration.color} hover:opacity-80`}
								>
									{integration.icon ? (
										<integration.icon className="w-4 h-4 text-white" />
									) : (
										<span className="text-white font-semibold text-sm">{integration.letter}</span>
									)}
								</Button>
							))}
							<Button
								variant="ghost"
								size="icon"
								className="w-8 h-8 rounded-lg border border-dashed border-[#d5d5d5] text-[#9a9a9a] hover:border-[#404040] hover:text-[#404040]"
							>
								<Plus className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</ScrollArea>

			{/* Leave Channel */}
			<div className="p-4 border-t border-[#e5e7eb] shrink-0">
				<Button
					variant="ghost"
					className="w-full justify-center gap-2 text-[#9a9a9a] hover:text-red-500 hover:bg-red-50 text-sm"
				>
					<LogOut className="w-3.5 h-3.5" />
					<span>Leave Channel</span>
				</Button>
			</div>
		</div>
	);
}
