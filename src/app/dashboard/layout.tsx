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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Use service client so RLS policy gaps don't accidentally block the farm
  // lookup and send authenticated users into an onboarding loop.
  const svc = createServiceClient();
  const { data: farm } = await svc
    .from("farms")
    .select("name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!farm) redirect("/onboarding");

  return (
    <div className="flex flex-col min-h-screen">
      <Header farmName={farm.name} />
      <div className="flex-1 pb-20">{children}</div>
      <Navbar />
    </div>
  );
}
