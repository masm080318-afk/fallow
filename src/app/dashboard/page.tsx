import { createClient } from "@/lib/supabase/server";
import FarmStatusCard from "@/components/dashboard/FarmStatusCard";
import AIDiagnosisCard from "@/components/dashboard/AIDiagnosisCard";
import IrrigationPrediction from "@/components/dashboard/IrrigationPrediction";
import PWAPrompt from "@/components/PWAPrompt";
import ETCard from "@/components/dashboard/ETCard";
import type { Reading, SensorNode, Diagnosis } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: farm } = await supabase
    .from("farms")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const { data: nodes } = await supabase
    .from("sensor_nodes")
    .select("*")
    .eq("farm_id", farm!.id)
    .order("created_at", { ascending: true });

  const primaryNode: SensorNode | null = nodes?.[0] ?? null;

  const { data: latestReading } = await supabase
    .from("readings")
    .select("*")
    .eq("farm_id", farm!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: latestDiagnosis } = await supabase
    .from("diagnoses")
    .select("*")
    .eq("farm_id", farm!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">
      <FarmStatusCard
        initialReading={latestReading as Reading | null}
        node={primaryNode}
        farmId={farm!.id}
      />
      <AIDiagnosisCard diagnosis={latestDiagnosis as Diagnosis | null} farmId={farm!.id} />
      <ETCard />
      <IrrigationPrediction diagnosis={latestDiagnosis as Diagnosis | null} />
      <PWAPrompt />
    </main>
  );
}
