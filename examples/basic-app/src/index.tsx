import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./AppRouter";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element #root was not found.");
}

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<AppRouter />
	</React.StrictMode>,
);
