/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination:
					process.env.NODE_ENV === "production"
						? "https://app.hayayomiai.com/:path*"
						: "http://localhost:8080/:path*",
			},
		];
	},
};

export default nextConfig;
