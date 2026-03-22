import { useParams } from "react-router-dom";

export default function CustomerDetailPage() {
	const params = useParams<{ id: string }>();

	return (
		<section>
			<h2>Customer Detail</h2>
			<p>Customer id: {params.id ?? "unknown"}</p>
		</section>
	);
}
