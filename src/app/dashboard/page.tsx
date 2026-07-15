import { createClient, createServiceClient } from "@/lib/supabase/server";
import FarmStatusCard from "@/components/dashboard/FarmStatusCard";
import AIDiagnosisCard from "@/components/dashboard/AIDiagnosisCard";
import IrrigationPrediction from "@/components/dashboard/IrrigationPrediction";
import PWAPrompt from "@/components/PWAPrompt";
import ETCard from "@/components/dashboard/ETCard";
import WaterHero from "@/components/dashboard/WaterHero";
import WelcomeTour from "@/components/dashboard/WelcomeTour";
import SensorList, { type SensorItem } from "@/components/dashboard/SensorList";
import type { Reading, SensorNode, Diagnosis, Farm } from "@/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getActiveFarm(svc: ReturnType<typeof createServiceClient>, userId: string) {
  // Owned farm — primary path, must always work
  const { data: owned, error } = await svc.from("farms").select("*").eq("user_id", userId).maybeSingle();
  if (error) console.error("farm lookup error:", error.message);
  if (owned) return owned as Farm;

  // Shared farm via farm_members (two queries — nested selects can silently fail)
  try {
    const { data: mem } = await svc
      .from("farm_members")
      .select("farm_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (mem?.farm_id) {
      const { data: shared } = await svc
        .from("farms").select("*").eq("id", mem.farm_id).maybeSingle();
      if (shared) return shared as Farm;
    }
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

  // Latest reading for EACH sensor, so multiple sensors all show up.
  const sensors: SensorItem[] = await Promise.all(
    ((nodes ?? []) as SensorNode[]).map(async (n) => {
      const { data: r } = await svc
        .from("readings")
        .select("moisture_percent, created_at")
        .eq("farm_id", farm.id)
        .eq("node_id", n.node_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return {
        id: n.id,
        name: n.name,
        node_id: n.node_id,
        moisture: (r?.moisture_percent as number) ?? null,
        created_at: (r?.created_at as string) ?? null,
      };
    })
  );

  const { data: latestDiagnosis } = await svc
    .from("diagnoses").select("*").eq("farm_id", farm.id)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();

  return (
    <>
    <WelcomeTour />
    <main className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4 stagger">
      <WaterHero />
      <FarmStatusCard
        initialReading={latestReading as Reading | null}
        node={primaryNode}
        farmId={farm.id}
        farmLat={farm.latitude ?? null}
        farmLon={farm.longitude ?? null}
      />
      {sensors.length > 1 && <SensorList sensors={sensors} />}
      <AIDiagnosisCard diagnosis={latestDiagnosis as Diagnosis | null} farmId={farm.id} />
      <ETCard />
      <IrrigationPrediction diagnosis={latestDiagnosis as Diagnosis | null} />
      <PWAPrompt />
    </main>
    </>
  );
}
