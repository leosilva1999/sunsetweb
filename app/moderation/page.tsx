import type { Metadata } from "next";
import ModerationDashboard from "@/components/moderation/ModerationDashboard";

export const metadata: Metadata = { title: "Moderação — Sunset" };

export default function ModerationPage() {
  return (
    <div className="px-[5vw] py-32">
      <h1 className="mb-6 font-display text-3xl font-semibold">Moderação</h1>
      <ModerationDashboard />
    </div>
  );
}
