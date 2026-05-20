import { createClient } from "@/lib/supabase/server";
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

  const { data: farm } = await supabase
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
