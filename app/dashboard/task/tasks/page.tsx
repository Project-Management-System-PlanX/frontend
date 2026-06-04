import React, { Suspense } from "react";
import { TasksArea } from "@/components/dashboard/TasksArea";

// Render TasksArea (a client component that uses `useSearchParams`) inside
// a Suspense boundary from the server. This satisfies Next.js' requirement
// that client navigation hooks be wrapped in a suspense boundary when the
// server attempts to prerender the page.
export const dynamic = "force-dynamic";

export default function TasksPage() {
	return (
		<Suspense fallback={<div className="p-6">Loading tasks...</div>}>
			<TasksArea />
		</Suspense>
	);
}
