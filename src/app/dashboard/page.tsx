import { createClient, createServiceClient } from "@/lib/supabase/server";
import FarmStatusCard from "@/components/dashboard/FarmStatusCard";
import AIDiagnosisCard from "@/components/dashboard/AIDiagnosisCard";
import IrrigationPrediction from "@/components/dashboard/IrrigationPrediction";
import PWAPrompt from "@/components/PWAPrompt";
import ETCard from "@/components/dashboard/ETCard";
import type { Reading, SensorNode, Diagnosis, Farm } from "@/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getActiveFarm(svc: ReturnType<typeof createServiceClient>, userId: string) {
  // Owned farm — primary path, must always work
  const { data: owned, error } = await svc.from("farms").select("*").eq("user_id", userId).maybeSingle();
  if (error) console.error("farm lookup error:", error.message);
  if (owned) return owned as Farm;

  // Shared farm via farm_members — only if owned lookup returned nothing
  try {
    const { data: mem } = await svc
      .from("farm_members")
      .select("farms(*)")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mem as any)?.farms) return (mem as any).farms as Farm;
  } catch { /* farm_members table not yet created — safe to ignore */ }

  return null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const svc = createServiceClient();
  const farm = await getActiveFarm(svc, user.id);
  if (!farm) redirect("/onboarding");

  const { data: nodes } = await svc
    .from("sensor_nodes").select("*").eq("farm_id", farm.id).order("created_at", { ascending: true });

  const primaryNode: SensorNode | null = (nodes?.[0] as SensorNode) ?? null;

  const { data: latestReading } = await svc
    .from("readings").select("*").eq("farm_id", farm.id)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();

  const { data: latestDiagnosis } = await svc
    .from("diagnoses").select("*").eq("farm_id", farm.id)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();

  return (
    <main className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">
      <FarmStatusCard
        initialReading={latestReading as Reading | null}
        node={primaryNode}
        farmId={farm.id}
        farmLat={farm.latitude ?? null}
        farmLon={farm.longitude ?? null}
      />
      <AIDiagnosisCard diagnosis={latestDiagnosis as Diagnosis | null} farmId={farm.id} />
      <ETCard />
      <IrrigationPrediction diagnosis={latestDiagnosis as Diagnosis | null} />
      <PWAPrompt />
    </main>
  );
}
