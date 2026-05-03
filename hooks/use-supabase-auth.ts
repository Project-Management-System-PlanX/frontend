"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthState {
	user: User | null;
	session: Session | null;
	token: string | undefined;
	isLoading: boolean;
	isAuthenticated: boolean;
}

export function useSupabaseAuth(): AuthState & {
	signOut: () => Promise<void>;
} {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const supabase = createClient();

	useEffect(() => {
		// Get initial session
		const getSession = async () => {
			const {
				data: { session: currentSession },
			} = await supabase.auth.getSession();
			setSession(currentSession);
			setUser(currentSession?.user ?? null);
			setIsLoading(false);
		};

		getSession();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession);
			setUser(newSession?.user ?? null);
			setIsLoading(false);
		});

		return () => subscription.unsubscribe();
	}, [supabase.auth]);

	const signOut = useCallback(async () => {
		await supabase.auth.signOut();
		setUser(null);
		setSession(null);
	}, [supabase.auth]);

	return {
		user,
		session,
		token: session?.access_token,
		isLoading,
		isAuthenticated: !!user,
		signOut,
	};
}
