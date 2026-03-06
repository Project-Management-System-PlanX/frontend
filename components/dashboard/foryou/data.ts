export interface SpaceCard {
	id: string;
	name: string;
	type: string;
	icon: string;
	iconBg: string;
	tagline: string;
}

export interface ActivityItem {
	id: string;
	title: string;
	taskId: string;
	team: string;
	status: string;
	checked: boolean;
	avatarInitial: string;
	avatarColor: string;
	icon: "check" | "subtask";
}

export interface ActivityTab {
	label: string;
	badge?: string;
}

export interface ViewedItem {
	id: string;
	title: string;
	subtitle: string;
	type: "board" | "space" | "task";
	iconBg?: string;
	icon?: string;
	checked?: boolean;
}

export interface ViewedGroup {
	label: string;
	items: ViewedItem[];
}

export const recommendedSpaces: SpaceCard[] = [];

export const activityItems: ActivityItem[] = [];

export const activityTabs: ActivityTab[] = [
	{ label: "Worked on", badge: undefined },
	{ label: "Viewed", badge: undefined },
	{ label: "Assigned to me", badge: "0" },
	{ label: "Starred", badge: undefined },
	{ label: "Boards", badge: undefined },
];

export const spaceTabs = ["Recommended", "Recent"];

export const viewedGroups: ViewedGroup[] = [];
