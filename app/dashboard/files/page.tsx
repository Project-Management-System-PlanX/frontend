"use client";
import { Suspense } from 'react';
import { FilesArea } from "@/components/dashboard/FilesArea";

export default function FilesPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<FilesArea />
		</Suspense>
	);
}
