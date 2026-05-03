"use client";

import { use } from "react";
import { Space } from "@/components/dashboard/Space";

export default function SpacePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const spaceId = decodeURIComponent(id);

	// Always render the Space view for any space to give access to the Kanban board and lists
	return <Space spaceId={spaceId} />;
}
