"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to task/tasks page by default
		router.replace("/dashboard/task/tasks");
	}, [router]);

	return null;
}
