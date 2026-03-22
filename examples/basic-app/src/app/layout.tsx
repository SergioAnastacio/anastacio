import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface RootLayoutProps {
	children?: ReactNode;
}

export default function RootLayout({
	children,
}: RootLayoutProps) {
	return (
		<main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
			<header style={{ marginBottom: "1rem" }}>
				<h1>Anastacio Basic App</h1>
				<p>Example fixture for Phase 1 routing and inspect.</p>
			</header>
			{children ?? <Outlet />}
		</main>
	);
}
