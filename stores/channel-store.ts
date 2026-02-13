import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface Channel {
	id: string;
	name: string;
	unread?: boolean;
	type?: "PUBLIC" | "PRIVATE" | "COMPANY-WIDE";
	members?: number;
	description?: string;
	isJoined?: boolean;
	avatars?: string[];
}

interface ChannelState {
	channels: Channel[];
	addChannel: (channel: Channel) => void;
	removeChannel: (channelId: string) => void;
	setChannels: (channels: Channel[]) => void;
}

const defaultChannels: Channel[] = [
	{
		id: "social",
		name: "social",
		type: "PUBLIC",
		members: 48,
		description: "Other channels are for work. This one's just for fun.",
		isJoined: true,
		avatars: ["/avatars/1.png", "/avatars/2.png", "/avatars/3.png"],
	},
	{
		id: "all-teamup",
		name: "all-teamup",
		type: "COMPANY-WIDE",
		members: 256,
		description:
			"Share announcements and updates about company news, upcoming events, or teammates. 📍",
		isJoined: true,
	},
	{
		id: "product-roadmap",
		name: "product-roadmap",
		type: "PRIVATE",
		members: 12,
		description: "Planning and tracking upcoming features and platform stability fixes.",
		isJoined: false,
	},
	{
		id: "marketing-dev",
		name: "marketing-dev",
		type: "PRIVATE",
		members: 24,
		description: "Coordination between marketing requests and technical implementation.",
		isJoined: false,
	},
	{
		id: "design-system",
		name: "design-system",
		type: "PUBLIC",
		members: 18,
		description: "Discussion about UI/UX standards, components, and design guidelines.",
		isJoined: true,
		avatars: ["/avatars/4.png", "/avatars/5.png"],
	},
	{ id: "product-design", name: "product-design", unread: true, isJoined: true },
];

export const useChannelStore = create<ChannelState>()(
	devtools(
		persist(
			(set) => ({
				channels: defaultChannels,
				addChannel: (channel) => set((state) => ({ channels: [...state.channels, channel] })),
				removeChannel: (channelId) =>
					set((state) => ({
						channels: state.channels.filter((c) => c.id !== channelId),
					})),
				setChannels: (channels) => set({ channels }),
			}),
			{
				name: "channel-storage",
			},
		),
	),
);
