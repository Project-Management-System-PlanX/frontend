"use client";

import { createBrowserClient } from "@supabase/ssr";

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
	if (supabaseInstance) return supabaseInstance;

	// biome-ignore lint/style/noNonNullAssertion: env vars are guaranteed at runtime
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
	// biome-ignore lint/style/noNonNullAssertion: env vars are guaranteed at runtime
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

	supabaseInstance = createBrowserClient(url, key);
	return supabaseInstance;
}

export const supabase = createClient();
