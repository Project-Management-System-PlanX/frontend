"use client";

import {
	persistQueryClientRestore,
	persistQueryClientSave,
} from "@tanstack/query-persist-client-core";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { useEffect, useState } from "react";
import { getQueryClient } from "@/lib/query-client";

interface QueryProviderProps {
	children: React.ReactNode;
}

const STORAGE_KEY = "TANSTACK_QUERY_CACHE";

export function QueryProvider({ children }: QueryProviderProps) {
	const [queryClient] = useState(() => getQueryClient());

	useEffect(() => {
		if (typeof window !== "undefined") {
			const persister = createSyncStoragePersister({
				storage: window.localStorage,
				key: STORAGE_KEY,
			});

			// Restore persisted queries
			persistQueryClientRestore({ queryClient, persister });

			// Save cache to localStorage on updates
			const unsubscribe = queryClient.getQueryCache().subscribe(() => {
				persistQueryClientSave({ queryClient, persister });
			});

			return () => unsubscribe();
		}
	}, [queryClient]);

	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryStreamedHydration>
				{children}
			</ReactQueryStreamedHydration>
			{/* process.env.NODE_ENV === "development" && (
				<ReactQueryDevtools buttonPosition="bottom-left" />
			) */}
		</QueryClientProvider>
	);
}
