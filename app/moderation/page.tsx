import type { Metadata } from "next";
import ModerationDashboard from "@/components/moderation/ModerationDashboard";
import { NO_INDEX } from "@/lib/utils/shareMetadata";

export const metadata: Metadata = { title: "Moderação", ...NO_INDEX };

export default function ModerationPage() {
  return (
    <div className="px-[5vw] py-32">
      <h1 className="mb-6 font-display text-3xl font-semibold">Moderação</h1>
      <ModerationDashboard />
    </div>
  );
}
