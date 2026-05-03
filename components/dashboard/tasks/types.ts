import type { Task } from "@/lib/types/models";

export interface Column {
	id: string;
	name: string;
	color: string;
	taskIds: string[];
}

export const UI = {
	inbox: {
		bg: "linear-gradient(135deg, #2F6F66 0%, #3F8A80 100%)",
		input: "#1F2933",
		text: "#FFFFFF",
		muted: "rgba(255,255,255,0.75)",
	},
	planner: {
		bg: "#1F2329",
		card: "#2A2F36",
		accent: "#3B82F6",
		text: "#FFFFFF",
		muted: "#94A3B8",
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
		bg: "#0D0F12",
		border: "rgba(255,255,255,0.1)",
		primary: "#3B82F6",
	},
};
