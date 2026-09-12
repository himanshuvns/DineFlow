import { HospitalityLoader } from "@/components/ui/hospitality-loader";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A12]">
      <HospitalityLoader
        variant="cloche"
        fullscreen={false}
        title="DineFlow Hospitality Cloud"
        subtitle="Setting up your dining environment…"
      />
    </div>
  );
}
