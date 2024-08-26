import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Summary() {
	const router = useRouter();
	const { title } = router.query;
	const [summary, setSummary] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showToast, setShowToast] = useState(false);

	useEffect(() => {
		if (title) {
			const fetchSummary = async () => {
				setIsLoading(true);
				setError("");
				try {
					const response = await fetch("/api/summary", {
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

	useEffect(() => {
		if (showToast) {
			const timer = setTimeout(() => {
				setShowToast(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [showToast]);

	const handleSave = () => {
		fetch("/api/histories/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ title: title as string, content: summary }),
		}).then(() => {
			setShowToast(true);
		});
		// TODO:ここでエラー返ってきた時にうまく処理できてなさそう
	};

	if (error) {
		return <div>エラー: {error}</div>;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">{title}</h1>
			<div className="bg-white shadow-md rounded-lg p-6">
				{isLoading ? (
					<div className="flex flex-col justify-center items-center h-40">
						<h3 className="text-xl font-bold text-primary">AIが要約中...</h3>
						<div className="loading loading-dots loading-lg text-primary"></div>
					</div>
				) : (
					<>
						<h3 className="text-xl font-bold text-primary">AIの要約結果</h3>
						<ReactMarkdown className="prose max-w-none">
							{summary}
						</ReactMarkdown>
						<div className="mt-4 flex justify-center">
							<button className="btn btn-primary btn-lg" onClick={handleSave}>
								要約を保存する
							</button>
						</div>
					</>
				)}
			</div>
			{showToast && (
				<div className="toast toast-top toast-center">
					<div className="alert alert-success">
						<span className="text-white">要約が保存されました。</span>
					</div>
				</div>
			)}
		</div>
	);
}
