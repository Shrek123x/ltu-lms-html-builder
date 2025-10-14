import Breadcrumbs from "../components/breadcrumbs";
import CourtRoom from "./Courtroom";

export default function CourtRoomPage() {
    return (
        <section>
            <h1>Court Room</h1>
            <Breadcrumbs />
        <main style={{ padding: 16 }}>
            <CourtRoom />
        </main>
        </section>
    )
}
