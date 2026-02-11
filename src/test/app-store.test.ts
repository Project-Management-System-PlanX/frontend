import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "@/stores/app-store";

describe("useAppStore", () => {
	beforeEach(() => {
		// Reset store to initial state before each test
		const { setState } = useAppStore;
		setState({
			user: null,
			isAuthenticated: false,
			sidebarOpen: true,
			theme: "system",
		});
	});

	describe("initial state", () => {
		it("should have null user by default", () => {
			const state = useAppStore.getState();
			expect(state.user).toBeNull();
		});

		it("should not be authenticated by default", () => {
			const state = useAppStore.getState();
			expect(state.isAuthenticated).toBe(false);
		});

		it("should have sidebar open by default", () => {
			const state = useAppStore.getState();
			expect(state.sidebarOpen).toBe(true);
		});

		it("should have system theme by default", () => {
			const state = useAppStore.getState();
			expect(state.theme).toBe("system");
		});
	});

	describe("setUser", () => {
		it("should set user and mark as authenticated", () => {
			const mockUser = {
				id: "1",
				name: "John Doe",
				email: "john@example.com",
			};

			act(() => {
				useAppStore.getState().setUser(mockUser);
			});

			const state = useAppStore.getState();
			expect(state.user).toEqual(mockUser);
			expect(state.isAuthenticated).toBe(true);
		});

		it("should set user with avatar", () => {
			const mockUser = {
				id: "2",
				name: "Jane Doe",
				email: "jane@example.com",
				avatar: "https://example.com/avatar.png",
			};

			act(() => {
				useAppStore.getState().setUser(mockUser);
			});

			const state = useAppStore.getState();
			expect(state.user?.avatar).toBe("https://example.com/avatar.png");
		});

		it("should clear user when set to null", () => {
			act(() => {
				useAppStore.getState().setUser({ id: "1", name: "Test", email: "test@test.com" });
			});
			expect(useAppStore.getState().isAuthenticated).toBe(true);

			act(() => {
				useAppStore.getState().setUser(null);
			});

			const state = useAppStore.getState();
			expect(state.user).toBeNull();
			expect(state.isAuthenticated).toBe(false);
		});
	});

	describe("sidebar", () => {
		it("should toggle sidebar open/close", () => {
			expect(useAppStore.getState().sidebarOpen).toBe(true);

			act(() => {
				useAppStore.getState().toggleSidebar();
			});
			expect(useAppStore.getState().sidebarOpen).toBe(false);

			act(() => {
				useAppStore.getState().toggleSidebar();
			});
			expect(useAppStore.getState().sidebarOpen).toBe(true);
		});

		it("should set sidebar open state directly", () => {
			act(() => {
				useAppStore.getState().setSidebarOpen(false);
			});
			expect(useAppStore.getState().sidebarOpen).toBe(false);

			act(() => {
				useAppStore.getState().setSidebarOpen(true);
			});
			expect(useAppStore.getState().sidebarOpen).toBe(true);
		});
	});

	describe("theme", () => {
		it("should set light theme", () => {
			act(() => {
				useAppStore.getState().setTheme("light");
			});
			expect(useAppStore.getState().theme).toBe("light");
		});

		it("should set dark theme", () => {
			act(() => {
				useAppStore.getState().setTheme("dark");
			});
			expect(useAppStore.getState().theme).toBe("dark");
		});

		it("should set system theme", () => {
			act(() => {
				useAppStore.getState().setTheme("light");
			});
			act(() => {
				useAppStore.getState().setTheme("system");
			});
			expect(useAppStore.getState().theme).toBe("system");
		});
	});

	describe("logout", () => {
		it("should clear user and set isAuthenticated to false", () => {
			// First login
			act(() => {
				useAppStore.getState().setUser({ id: "1", name: "Test User", email: "test@example.com" });
			});
			expect(useAppStore.getState().isAuthenticated).toBe(true);

			// Then logout
			act(() => {
				useAppStore.getState().logout();
			});

			const state = useAppStore.getState();
			expect(state.user).toBeNull();
			expect(state.isAuthenticated).toBe(false);
		});

		it("should not affect sidebar or theme on logout", () => {
			act(() => {
				useAppStore.getState().setSidebarOpen(false);
				useAppStore.getState().setTheme("dark");
				useAppStore.getState().setUser({ id: "1", name: "Test", email: "test@test.com" });
			});

			act(() => {
				useAppStore.getState().logout();
			});

			const state = useAppStore.getState();
			expect(state.sidebarOpen).toBe(false);
			expect(state.theme).toBe("dark");
		});
	});
});
