import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UnreadState {
	counts: Record<string, number>;
	lastReadMessageIds: Record<string, string | null>;
	setCount: (channelId: string, count: number) => void;
	incrementCount: (channelId: string) => void;
	resetCount: (channelId: string) => void;
	setCounts: (
		data: { channelId: string; count: number; lastReadMessageId?: string | null }[],
	) => void;
	setLastReadMessageId: (channelId: string, messageId: string | null) => void;
	getTotalUnread: () => number;
}

export const useUnreadStore = create<UnreadState>()(
	devtools(
		(set, get) => ({
			counts: {},
			lastReadMessageIds: {},

			setCount: (channelId, count) =>
				set(
					(state) => ({
						counts: { ...state.counts, [channelId]: count },
					}),
					false,
					"setCount",
				),

			incrementCount: (channelId) =>
				set(
					(state) => ({
						counts: {
							...state.counts,
							[channelId]: (state.counts[channelId] || 0) + 1,
						},
					}),
					false,
					"incrementCount",
				),

			resetCount: (channelId) =>
				set(
					(state) => ({
						counts: { ...state.counts, [channelId]: 0 },
					}),
					false,
					"resetCount",
				),

			setCounts: (data) =>
				set(
					(state) => {
						const newCounts = { ...state.counts };
						const newLastRead = { ...state.lastReadMessageIds };
						for (const item of data) {
							newCounts[item.channelId] = item.count;
							if (item.lastReadMessageId !== undefined) {
								newLastRead[item.channelId] = item.lastReadMessageId ?? null;
							}
						}
						return { counts: newCounts, lastReadMessageIds: newLastRead };
					},
					false,
					"setCounts",
				),

			setLastReadMessageId: (channelId, messageId) =>
				set(
					(state) => ({
						lastReadMessageIds: { ...state.lastReadMessageIds, [channelId]: messageId },
					}),
					false,
					"setLastReadMessageId",
				),

			getTotalUnread: () => {
				const counts = get().counts;
				return Object.values(counts).reduce((sum, c) => sum + c, 0);
			},
		}),
		{ name: "UnreadStore" },
	),
);
