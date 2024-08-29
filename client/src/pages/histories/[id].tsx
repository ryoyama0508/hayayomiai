import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface History {
	ID: number;
	Title: string;
	Content: string;
	UserID: number;
	CreatedAt: string;
	UpdatedAt: string;
}

export default function HistoryDetail() {
	const router = useRouter();
	const { id } = router.query;
	const [history, setHistory] = useState<History | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!router.isReady) return;

		const fetchHistory = async () => {
			setIsLoading(true);
			setError("");
			try {
				const response = await fetch(`/api/histories/${id}`);
				if (response.ok) {
					const data = await response.json();
					setHistory(data);
				} else {
					setError("履歴の取得に失敗しました");
				}
			} catch (error) {
				setError("エラーが発生しました: " + (error as Error).message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchHistory();
	}, [router.isReady, id]);

	return (
		<div className="container mx-auto px-4 py-8">
			<Link href="/histories">
				<button className="btn btn-primary btn-sm mb-4">←戻る</button>
			</Link>
			{isLoading ? (
				<div className="flex flex-col justify-center items-center h-40">
					<h3 className="text-xl font-bold text-primary">読み込み中...</h3>
					<div className="loading loading-dots loading-lg text-primary"></div>
				</div>
			) : error ? (
				<div className="text-red-500">{error}</div>
			) : history ? (
				<div>
					<h1 className="text-3xl font-bold mb-6">{history.Title}</h1>
					<ReactMarkdown className="prose max-w-none">
						{history.Content}
					</ReactMarkdown>
				</div>
			) : (
				<div>履歴が見つかりませんでした</div>
			)}
		</div>
	);
}
