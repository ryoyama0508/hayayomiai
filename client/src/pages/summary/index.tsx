import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Summary() {
	const router = useRouter();
	const { title } = router.query;
	const [summary, setSummary] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (title) {
			const fetchSummary = async () => {
				setIsLoading(true);
				setError("");
				try {
					const response = await fetch("http://localhost:8080/summary", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ title: title as string }),
					});
					if (response.ok) {
						const data = await response.json();
						setSummary(data.summary);
					} else {
						setError("要約の取得に失敗しました");
					}
				} catch (error) {
					setError("エラーが発生しました: " + (error as Error).message);
				} finally {
					setIsLoading(false);
				}
			};

			fetchSummary();
		}
	}, [title]);

	if (error) {
		return <div>エラー: {error}</div>;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">{title}</h1>
			<div className="bg-white shadow-md rounded-lg p-6">
				{isLoading ? (
					<div className="flex justify-center items-center h-40">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
					</div>
				) : (
					<ReactMarkdown className="prose max-w-none">{summary}</ReactMarkdown>
				)}
			</div>
		</div>
	);
}
