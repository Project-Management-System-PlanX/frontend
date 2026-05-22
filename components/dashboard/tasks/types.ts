export interface Column {
	id: string;
	name: string;
	color: string;
	taskIds: string[];
}

export const UI = {
	inbox: {
		bg: "linear-gradient(160deg, #6B3A1F 0%, #8B4A2A 50%, #A05530 100%)",
		input: "#1F2933",
		text: "#FFFFFF",
		muted: "rgba(255,255,255,0.75)",
	},
	planner: {
		bg: "#1A1625",
		card: "#231D32",
		accent: "#8B5CF6",
		text: "#FFFFFF",
		muted: "#A78BFA",
	},
	board: {
		bg: "linear-gradient(135deg, #7C4D7E 0%, #8B5E8C 100%)",
		cols: {
			today: "#A16207",
			week: "#166534",
			later: "#111111",
		},
		text: "#FFFFFF",
	},
	nav: {
		bg: "#120E20",
		border: "rgba(255,255,255,0.08)",
		primary: "#8B5CF6",
	},
};
