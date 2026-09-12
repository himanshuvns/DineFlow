import { HospitalityLoader } from "@/components/ui/hospitality-loader";

export default function DashboardLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <HospitalityLoader
        variant="cloche"
        title="Loading Workspace…"
        subtitle="Connecting live orders, table reservations & kitchen display systems"
      />
    </div>
  );
}
