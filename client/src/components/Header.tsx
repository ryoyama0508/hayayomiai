import React, { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiHome, FiClock, FiMail } from "react-icons/fi";
import { useRouter } from "next/router";

const Header: React.FC = () => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const router = useRouter();

	const toggleDrawer = () => {
		setIsDrawerOpen(!isDrawerOpen);
	};
	const isActive = (path: string) => router.pathname === path;

	const getLinkClass = (path: string) => {
		return `flex items-center p-3 rounded-lg transition-colors duration-200 ${
			isActive(path) ? "bg-purple-500 text-white" : "hover:bg-base-300"
		}`;
	};

	return (
		<header className="bg-base-100 shadow-lg">
			<div className="navbar container">
				<div className="flex-none lg:hidden">
					<button className="btn btn-square btn-ghost" onClick={toggleDrawer}>
						{isDrawerOpen ? (
							<FiX className="w-6 h-6" />
						) : (
							<FiMenu className="w-6 h-6" />
						)}
					</button>
				</div>
				<div className="flex-1 pl-10">
					<Link href="/" className="btn btn-ghost normal-case text-2xl">
						HayayomiAI
					</Link>
				</div>
				<div className="flex-none hidden lg:block">
					<ul className="menu menu-horizontal px-1">
						<li className="rounded-lg hover:bg-purple-500 hover:text-white">
							<Link href="/history">履歴</Link>
						</li>
						<li className="rounded-lg hover:bg-purple-500 hover:text-white">
							<Link href="/contact">問い合わせ</Link>
						</li>
					</ul>
				</div>
			</div>
			<div className={`drawer ${isDrawerOpen ? "drawer-open" : ""}`}>
				<input
					id="my-drawer"
					type="checkbox"
					className="drawer-toggle"
					checked={isDrawerOpen}
					onChange={toggleDrawer}
				/>
				<div className="drawer-side">
					<label htmlFor="my-drawer" className="drawer-overlay"></label>
					<div className="menu p-4 w-80 h-full bg-base-200 text-base-content">
						<div className="flex flex-col h-full">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold">メニュー</h2>
							</div>
							<ul className="flex-grow">
								<li className="mb-2">
									<Link
										href="/"
										onClick={toggleDrawer}
										className={getLinkClass("/")}
									>
										<FiHome className="w-5 h-5 mr-3" />
										<span>ホーム</span>
									</Link>
								</li>
								<li className="mb-2">
									<Link
										href="/history"
										onClick={toggleDrawer}
										className={getLinkClass("/history")}
									>
										<FiClock className="w-5 h-5 mr-3" />
										<span>履歴</span>
									</Link>
								</li>
								<li className="mb-2">
									<Link
										href="/contact"
										onClick={toggleDrawer}
										className={getLinkClass("/contact")}
									>
										<FiMail className="w-5 h-5 mr-3" />
										<span>問い合わせ</span>
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
