import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
	const [title, setTitle] = useState("");
	const router = useRouter();

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (title.trim()) {
			router.push(`/summary?title=${encodeURIComponent(title)}`);
		}
	};

	return (
		<main
			className="min-h-screen bg-cover bg-center flex flex-col"
			style={{ backgroundImage: "url('/booklist.jpg')" }}
		>
			<div className="bg-white">
				<div className="container mx-auto px-4 pt-8 pb-1">
					<h1 className="text-4xl font-bold text-center mb-4">HayayomiAI</h1>
					<p className="text-xl text-center mb-8">
						本を読みたくても時間のないあなたへ。<br></br>
						AIがあなたの読みたい本の要約とキーポイントを数秒で生成します。
					</p>
					<form onSubmit={handleSearch} className="max-w-md mx-auto">
						<div className="flex">
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="本のタイトルを入力"
								className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
							/>
							<button
								type="submit"
								className="px-6 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
							>
								検索
							</button>
						</div>
					</form>
				</div>
			</div>
			<div className="flex-grow bg-gradient-to-b from-white via-white/10 to-transparent"></div>
		</main>
	);
}
