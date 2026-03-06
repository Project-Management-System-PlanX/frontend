"use client";

import { use } from "react";
import { Space } from "@/components/dashboard/Space";
import { TasksArea } from "@/components/dashboard/TasksArea";

export default function SpacePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const spaceId = decodeURIComponent(id);

	// Always render the Space view for any space to give access to the Kanban board and lists
	return <Space spaceId={spaceId} />;
}
