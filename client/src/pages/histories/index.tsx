import { useState, useEffect } from "react";
import Link from "next/link";

interface History {
	ID: number;
	Title: string;
	Content: string;
	UserID: number;
	CreatedAt: string;
	UpdatedAt: string;
}

export default function Histories() {
	const [histories, setHistories] = useState<History[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchHistories = async () => {
			setIsLoading(true);
			setError("");
			try {
				const response = await fetch("/api/histories");
				if (response.ok) {
					const data = await response.json();
					setHistories(data);
				} else {
					setError("履歴の取得に失敗しました");
				}
			} catch (error) {
				setError("エラーが発生しました: " + (error as Error).message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchHistories();
	}, []);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">履歴一覧</h1>
			{isLoading ? (
				<div className="flex flex-col justify-center items-center h-40">
					<h3 className="text-xl font-bold text-primary">読み込み中...</h3>
					<div className="loading loading-dots loading-lg text-primary"></div>
				</div>
			) : error ? (
				<div className="text-red-500">{error}</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{histories.map((history) => (
						<div key={history.ID} className="card bg-base-100 shadow-xl">
							<div className="card-body">
								<h2 className="card-title">{history.Title}</h2>
								<p>{history.Content.slice(0, 100)}...</p>
								<div className="card-actions justify-end">
									<Link href={`/histories/${history.ID}`}>
										<button className="btn btn-primary">詳細を見る</button>
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
