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

export const recommendedSpaces: SpaceCard[] = [
	{
		id: "sales-outreach",
		name: "(Example) Sales Outre...",
		type: "Software project",
		icon: "📦",
		iconBg: "#00ACC1",
		tagline: "Popular with teammates",
	},
	{
		id: "my-sales-team",
		name: "My Sales Team",
		type: "Software project",
		icon: "📋",
		iconBg: "#FF9800",
		tagline: "Popular with teammates",
	},
];

export const activityItems: ActivityItem[] = [
	{
		id: "1",
		title: "do",
		taskId: "KAN-4",
		team: "My Sales Team",
		status: "Created",
		checked: true,
		avatarInitial: "R",
		avatarColor: "#FF9800",
		icon: "check",
	},
	{
		id: "2",
		title: "Subtask 2.1",
		taskId: "KAN-3",
		team: "My Sales Team",
		status: "Created",
		checked: false,
		avatarInitial: "R",
		avatarColor: "#FF9800",
		icon: "subtask",
	},
	{
		id: "3",
		title: "Task 2",
		taskId: "KAN-2",
		team: "My Sales Team",
		status: "Created",
		checked: true,
		avatarInitial: "R",
		avatarColor: "#FF9800",
		icon: "check",
	},
	{
		id: "4",
		title: "Task 1",
		taskId: "KAN-1",
		team: "My Sales Team",
		status: "Created",
		checked: true,
		avatarInitial: "R",
		avatarColor: "#FF9800",
		icon: "check",
	},
	{
		id: "5",
		title: "Finalize Campaign Report",
		taskId: "SAM1-9",
		team: "(Example) Sales Outreach Strategy",
		status: "Created",
		checked: true,
		avatarInitial: "R",
		avatarColor: "#FF9800",
		icon: "check",
	},
	{
		id: "6",
		title: "Monitor Campaign Performance",
		taskId: "SAM1-8",
		team: "(Example) Sales Outreach Strategy",
		status: "Created",
		checked: true,
		avatarInitial: "R",
		avatarColor: "#FF9800",
		icon: "check",
	},
	{
		id: "7",
		title: "Prepare Outreach Materials",
		taskId: "SAM1-7",
		team: "(Example) Sales Outreach Strategy",
		status: "Created",
		checked: false,
		avatarInitial: "R",
		avatarColor: "#FF9800",
		icon: "subtask",
	},
	{
		id: "8",
		title: "Define Target Audience",
		taskId: "SAM1-6",
		team: "(Example) Sales Outreach Strategy",
		status: "Created",
		checked: true,
		avatarInitial: "R",
		avatarColor: "#FF9800",
		icon: "check",
	},
];

export const activityTabs: ActivityTab[] = [
	{ label: "Worked on", badge: undefined },
	{ label: "Viewed", badge: undefined },
	{ label: "Assigned to me", badge: "0" },
	{ label: "Starred", badge: undefined },
	{ label: "Boards", badge: undefined },
];

export const spaceTabs = ["Recommended", "Recent"];

export const viewedGroups: ViewedGroup[] = [
	{
		label: "TODAY",
		items: [
			{
				id: "v1",
				title: "KAN board",
				subtitle: "Board · My Sales Team",
				type: "board",
			},
			{
				id: "v2",
				title: "My Sales Team",
				subtitle: "Team-managed software",
				type: "space",
				iconBg: "#FF9800",
				icon: "📋",
			},
		],
	},
	{
		label: "YESTERDAY",
		items: [
			{
				id: "v3",
				title: "do",
				subtitle: "KAN-4 · My Sales Team",
				type: "task",
				checked: true,
			},
			{
				id: "v4",
				title: "SAM1 board",
				subtitle: "Board · (Example) Sales Outreach Strategy",
				type: "board",
			},
			{
				id: "v5",
				title: "(Example) Sales Outreach Strategy",
				subtitle: "Team-managed software",
				type: "space",
				iconBg: "#00ACC1",
				icon: "📦",
			},
		],
	},
];
