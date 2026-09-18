import { HospitalityLoader } from "@/components/ui/hospitality-loader";

export default function PlatformDashboardLoading() {
  return (
    <HospitalityLoader
      fullscreen
      variant="platform"
      colorTheme="rose"
      title="Securing Platform Console…"
      subtitle="Verifying cryptographic token and elevated platform permissions"
      messages={[
        "Verifying cryptographic security token…",
        "Initializing multi-tenant control plane…",
        "Synchronizing cluster telemetry & health ledgers…",
        "Access granted — entering Super Admin Console…",
      ]}
    />
  );
}
