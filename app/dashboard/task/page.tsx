"use client";

import { useState } from "react";
import { ForYouView } from "@/components/dashboard/ForYouView";
import { Space } from "@/components/dashboard/Space";
import { TaskSidebar } from "@/components/dashboard/TaskSidebar";
import { TasksArea } from "@/components/dashboard/TasksArea";

export default function TaskPage() {
	const [view, setView] = useState<"for-you" | "space" | "tasks">("tasks");
	const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

	const handleForYouClick = () => {
		setView("for-you");
		setSelectedSpaceId(null);
	};

	const handleSpaceClick = (spaceId: string) => {
		if (spaceId === "my-sales-team" || spaceId === "my-sales-team-2") {
			setView("space");
		} else {
			// For example, starred space "sales-outreach"
			setView("tasks");
		}
		setSelectedSpaceId(spaceId);
	};

	const isMySalesTeamView =
		view === "space" &&
		(selectedSpaceId === "my-sales-team" || selectedSpaceId === "my-sales-team-2");

	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Left Sidebar - Task-specific sidebar */}
			<TaskSidebar
				onForYouClick={handleForYouClick}
				onSpaceClick={handleSpaceClick}
				forYouActive={view === "for-you"}
				activeSpaceId={selectedSpaceId || undefined}
			/>

			{/* Main Content Area */}
			{view === "for-you" && <ForYouView />}
			{isMySalesTeamView && <Space />}
			{(view === "tasks" || (view === "space" && !isMySalesTeamView)) && <TasksArea />}
		</div>
	);
}
