"use client";

import { useState } from "react";
import { ForYouView } from "@/components/dashboard/ForYouView";
import { TaskSidebar } from "@/components/dashboard/TaskSidebar";
import { TasksArea } from "@/components/dashboard/TasksArea";

export default function TaskPage() {
	const [showForYou, setShowForYou] = useState(false);

	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Left Sidebar - Task-specific sidebar */}
			<TaskSidebar onForYouClick={() => setShowForYou(true)} forYouActive={showForYou} />

			{/* Main Content Area */}
			{showForYou ? <ForYouView /> : <TasksArea />}
		</div>
	);
}
