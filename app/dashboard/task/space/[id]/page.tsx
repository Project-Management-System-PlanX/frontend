"use client";

import { use } from "react";
import { Space } from "@/components/dashboard/Space";
import { TasksArea } from "@/components/dashboard/TasksArea";

export default function SpacePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const spaceId = decodeURIComponent(id);

	// "My Sales Team" spaces render the Space component, others render TasksArea
	const isMySalesTeam = spaceId === "my-sales-team" || spaceId === "my-sales-team-2";

	return isMySalesTeam ? <Space /> : <TasksArea />;
}
