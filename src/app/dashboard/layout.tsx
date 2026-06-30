import { createClient, createServiceClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const svc = createServiceClient();

  // Check owned farm first
  const { data: ownedFarm } = await svc
    .from("farms").select("name").eq("user_id", user.id).maybeSingle();

  if (ownedFarm) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header farmName={ownedFarm.name} />
        <div className="flex-1 pb-20">{children}</div>
        <Navbar />
      </div>
    );
  }

  // Check shared farm via farm_members (two queries — nested selects can silently fail)
  try {
    const { data: mem } = await svc
      .from("farm_members")
      .select("farm_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (mem?.farm_id) {
      const { data: sharedFarm } = await svc
        .from("farms")
        .select("name")
        .eq("id", mem.farm_id)
        .maybeSingle();

      if (sharedFarm?.name) {
        return (
          <div className="flex flex-col min-h-screen">
            <Header farmName={sharedFarm.name} />
            <div className="flex-1 pb-20">{children}</div>
            <Navbar />
          </div>
        );
      }
    }
  } catch { /* farm_members table not yet created */ }

  redirect("/onboarding");
}
