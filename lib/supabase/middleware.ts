import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	// biome-ignore lint/style/noNonNullAssertion: env vars are guaranteed at runtime
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
	// biome-ignore lint/style/noNonNullAssertion: env vars are guaranteed at runtime
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
	const supabase = createServerClient(url, key, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				for (const { name, value } of cookiesToSet) {
					request.cookies.set(name, value);
				}
				supabaseResponse = NextResponse.next({
					request,
				});
				for (const { name, value, options } of cookiesToSet) {
					supabaseResponse.cookies.set(name, value, options);
				}
			},
		},
	});

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Protected routes - redirect to onboarding if not authenticated
	const protectedPaths = ["/dashboard", "/workspaces"];
	const isProtectedRoute = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

	if (!user && isProtectedRoute) {
		const url = request.nextUrl.clone();
		url.pathname = "/onboarding";
		return NextResponse.redirect(url);
	}

	// If user is authenticated and trying to access onboarding, redirect to workspaces
	if (user && request.nextUrl.pathname.startsWith("/onboarding")) {
		const url = request.nextUrl.clone();
		url.pathname = "/workspaces";
		return NextResponse.redirect(url);
	}

	return supabaseResponse;
}
