import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
	useEffect(() => {
		document.documentElement.setAttribute("data-theme", "light");
	}, []);

	return (
		<Layout>
			<Component {...pageProps} />
		</Layout>
	);
}
