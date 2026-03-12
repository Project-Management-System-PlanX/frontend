import withBundleAnalyzer from "@next/bundle-analyzer";

const analyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},

	// ✅ Image optimization enabled with remote patterns
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.supabase.co",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com", // Google OAuth avatars
			},
			{
				protocol: "https",
				hostname: "**.googleusercontent.com",
			},
		],
	},

	// ✅ React Compiler for automatic memoization (Next.js 16+)
	reactCompiler: true,

	turbopack: {
		root: process.cwd(),
	},

	async rewrites() {
		const workspaceServiceUrl = process.env.WORKSPACE_SERVICE_URL || "http://localhost:3002";
		const meetingServiceUrl = process.env.MEETING_SERVICE_URL || "http://localhost:3005";

		return {
			beforeFiles: [],
			afterFiles: [
				// Meeting service routes
				{
					source: "/api/meetings/:path*",
					destination: `${meetingServiceUrl}/api/meetings/:path*`,
				},
			],
			// Workspace service catch-all — only applies when no Next.js API route matches
			fallback: [
				{
					source: "/api/:path*",
					destination: `${workspaceServiceUrl}/:path*`,
				},
			],
		};
	},
};

export default analyzer(nextConfig);
