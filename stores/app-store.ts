import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
}

interface AppState {
	// User state
	user: User | null;
	isAuthenticated: boolean;

	// UI state
	sidebarOpen: boolean;
	theme: "light" | "dark" | "system";

	// Actions
	setUser: (user: User | null) => void;
	setSidebarOpen: (open: boolean) => void;
	toggleSidebar: () => void;
	setTheme: (theme: "light" | "dark" | "system") => void;
	logout: () => void;
}

export const useAppStore = create<AppState>()(
	devtools(
		persist(
			(set) => ({
				// Initial state
				user: null,
				isAuthenticated: false,
				sidebarOpen: true,
				theme: "system",

				// Actions
				setUser: (user) => set({ user, isAuthenticated: !!user }, false, "setUser"),

				setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }, false, "setSidebarOpen"),

				toggleSidebar: () =>
					set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, "toggleSidebar"),

				setTheme: (theme) => set({ theme }, false, "setTheme"),

				logout: () => set({ user: null, isAuthenticated: false }, false, "logout"),
			}),
			{
				name: "app-storage",
				partialize: (state) => ({
					theme: state.theme,
					sidebarOpen: state.sidebarOpen,
				}),
			},
		),
		{ name: "AppStore" },
	),
);
