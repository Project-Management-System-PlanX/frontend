"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/hooks/api/use-workspaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export default function WorkspaceIndexPage() {
	const params = useParams();
	const workspaceId = params.id as string;
	const { token } = useSupabaseAuth();

	const { data: workspace, isLoading } = useWorkspace(workspaceId, token);

	if (isLoading || !workspace) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-gray-400">
				<Loader2 className="w-8 h-8 animate-spin text-[#0B6E4F]" />
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center h-full bg-[#fcfdfd] text-center px-4">
			<div className="w-20 h-20 bg-[#50C878]/10 rounded-3xl flex items-center justify-center mb-6 border border-[#50C878]/30">
				<MessageSquare className="w-10 h-10 text-[#0B6E4F]" />
			</div>
			<h1 className="text-3xl font-bold text-[#013220] tracking-tight mb-2">
				Welcome to {workspace.name}
			</h1>
			<p className="text-gray-500 max-w-sm mb-8">
				Select a channel from the sidebar to start collaborating with your team, or create a new one
				to discuss specific topics.
			</p>

			<div className="flex gap-4">
				{/* When we implement the CreateChannelDialog, we can trigger it from here as well */}
				{/* <button className="px-6 py-2.5 bg-[#0B6E4F] text-white rounded-xl font-medium hover:bg-[#013220] transition-colors shadow-sm">
					Create Channel
				</button> */}
			</div>
		</div>
	);
}
