"use client";

import ReportDialog from "@/components/moderation/ReportDialog";
import { useAuth } from "@/lib/hooks/useAuth";

const triggerClassName =
  "inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium opacity-85 hover:opacity-100 light:border-ink/15";

// A página do local é renderizada no servidor; quem está logado é decidido aqui, no cliente.
export default function LocationReportButton({ locationId }: { locationId: string }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <ReportDialog
      targetType="Location"
      targetId={locationId}
      triggerLabel="Informar erro ou denunciar"
      triggerClassName={triggerClassName}
    />
  );
}
