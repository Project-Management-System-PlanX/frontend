import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Channel {
	id: string;
	name: string;
	workspaceId?: string;
	unread?: boolean;
	type?: "PUBLIC" | "PRIVATE" | "COMPANY-WIDE" | "DIRECT_MESSAGE";
	members?: number;
	description?: string;
	isJoined?: boolean;
	isStarred?: boolean;
	avatars?: string[];
	createdAt?: string;
	updatedAt?: string;
}

interface ChannelState {
	channels: Channel[];
	isLoaded: boolean;
	addChannel: (channel: Channel) => void;
	removeChannel: (channelId: string) => void;
	updateChannel: (channelId: string, updates: Partial<Channel>) => void;
	setChannels: (channels: Channel[]) => void;
}

export const useChannelStore = create<ChannelState>()(
	devtools(
		(set) => ({
			channels: [],
			isLoaded: false,
			addChannel: (channel) =>
				set(
					(state) => {
						if (state.channels.some((c) => c.id === channel.id)) return state;
						return { channels: [...state.channels, channel] };
					},
					false,
					"addChannel",
				),
			removeChannel: (channelId) =>
				set(
					(state) => ({
						channels: state.channels.filter((c) => c.id !== channelId),
					}),
					false,
					"removeChannel",
				),
			updateChannel: (channelId, updates) =>
				set(
					(state) => ({
						channels: state.channels.map((c) => (c.id === channelId ? { ...c, ...updates } : c)),
					}),
					false,
					"updateChannel",
				),
			setChannels: (channels) => set({ channels, isLoaded: true }, false, "setChannels"),
		}),
		{ name: "ChannelStore" },
	),
);
