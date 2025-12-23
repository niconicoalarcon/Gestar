import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "@/components/dashboard/dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Obtener información del embarazo
  const { data: pregnancyInfo } = await supabase.from("pregnancy_info").select("*").eq("user_id", data.user.id).single()

  return <DashboardClient user={data.user} pregnancyInfo={pregnancyInfo} />
}
