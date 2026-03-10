"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { WorkspaceSidebar } from "@/components/workspaces/WorkspaceSidebar";
import { useWorkspace } from "@/hooks/api/use-workspaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const workspaceId = params.id as string;
	const { token } = useSupabaseAuth();

	const { data: workspace, isLoading } = useWorkspace(workspaceId, token);

	if (isLoading) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-[#F8FCFA]">
				<Loader2 className="w-8 h-8 animate-spin text-[#0B6E4F]" />
			</div>
		);
	}

	if (!workspace) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-[#F8FCFA]">
				<p className="text-gray-500">Workspace not found.</p>
			</div>
		);
	}

	return (
		<div className="flex h-screen w-full bg-[#f2f2f4] overflow-hidden">
			{/* Sidebar */}
			<WorkspaceSidebar workspace={workspace} />

			{/* Main Content Area */}
			<main className="flex-1 flex flex-col h-full bg-[#f2f2f4] p-3 pl-2">
				<div className="w-full h-full bg-white rounded-[24px] shadow-sm overflow-hidden flex flex-col relative">
					{children}
				</div>
			</main>
		</div>
	);
}
