"use client";

import { usePathname } from "next/navigation";
import { TaskSidebar } from "@/components/dashboard/TaskSidebar";

export default function TaskLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	// Extract active space ID from URL
	const getActiveSpaceId = () => {
		const spaceMatch = pathname.match(/\/dashboard\/task\/space\/(.+)/);
		if (spaceMatch) return spaceMatch[1];
		return undefined;
	};

	const isForYouActive = pathname === "/dashboard/task/for-you";

	return (
		<div className="h-screen flex overflow-hidden bg-[#D1F2EB]">
			{/* Left Sidebar - Task-specific sidebar */}
			<TaskSidebar forYouActive={isForYouActive} activeSpaceId={getActiveSpaceId()} />

			{/* Main Content Area */}
			{children}
		</div>
	);
}
