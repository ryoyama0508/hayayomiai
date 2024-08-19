/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination:
					process.env.NODE_ENV === "production"
						? "http://hayayomi-ai-262972139.ap-northeast-1.elb.amazonaws.com/:path*"
						: "http://localhost:8080/:path*",
			},
		];
	},
};

export default nextConfig;
