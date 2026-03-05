/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	turbopack: {
		root: process.cwd(),
	},
	async rewrites() {
		const workspaceServiceUrl = process.env.WORKSPACE_SERVICE_URL || 'http://localhost:3002';
		const meetingServiceUrl = process.env.MEETING_SERVICE_URL || 'http://localhost:3005';
		
		return [
			// Meeting service routes
			{
				source: '/api/meetings/:path*',
				destination: `${meetingServiceUrl}/api/meetings/:path*`,
			},
			// Workspace service routes (default for all other /api calls)
			{
				source: '/api/:path*',
				destination: `${workspaceServiceUrl}/:path*`,
			},
		];
	},
};

export default nextConfig;
