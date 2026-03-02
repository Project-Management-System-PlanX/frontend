import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface WorkspaceState {
	// Currently active workspace
	activeWorkspaceId: string | null;
	activeWorkspaceName: string | null;

	// Actions
	setActiveWorkspace: (id: string, name: string) => void;
	clearActiveWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
	devtools(
		persist(
			(set) => ({
				activeWorkspaceId: null,
				activeWorkspaceName: null,

				setActiveWorkspace: (id, name) =>
					set({ activeWorkspaceId: id, activeWorkspaceName: name }, false, "setActiveWorkspace"),

				clearActiveWorkspace: () =>
					set(
						{ activeWorkspaceId: null, activeWorkspaceName: null },
						false,
						"clearActiveWorkspace",
					),
			}),
			{
				name: "workspace-storage",
			},
		),
		{ name: "WorkspaceStore" },
	),
);
