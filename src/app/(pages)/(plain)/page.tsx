export const revalidate = 300; // ✅ 5분마다 ISR 캐시 재검증

import LandingClient from "./LandingClient";

export default function Page() {
    return <LandingClient />;
}
