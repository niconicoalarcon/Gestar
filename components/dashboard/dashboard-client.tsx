"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import PregnancyOverview from "./pregnancy-overview"
import DocumentsSection from "./documents-section"
import NotesSection from "./notes-section"
import SetupPregnancyInfo from "./setup-pregnancy-info"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import AppointmentsSection from "./AppointmentsSection"

interface DashboardClientProps {
  user: User
  pregnancyInfo: any
}

export default function DashboardClient({ user, pregnancyInfo }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "notes" | "appointments">("overview")
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  if (!pregnancyInfo) {
    return <SetupPregnancyInfo userId={user.id} />
  }

  const tabBase =
    "px-6 py-3 font-medium transition-colors -mb-px border-b-2 border-transparent " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-background rounded-t-md"

  const tabActive = "border-primary text-foreground"
  const tabInactive = "text-muted-foreground hover:text-foreground"

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Mi Embarazo</h1>
          </div>

          <Button onClick={handleSignOut} variant="outline">
            Cerrar sesión
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            aria-current={activeTab === "overview" ? "page" : undefined}
            className={`${tabBase} ${activeTab === "overview" ? tabActive : tabInactive}`}
          >
            Resumen
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            aria-current={activeTab === "documents" ? "page" : undefined}
            className={`${tabBase} ${activeTab === "documents" ? tabActive : tabInactive}`}
          >
            Documentos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            aria-current={activeTab === "notes" ? "page" : undefined}
            className={`${tabBase} ${activeTab === "notes" ? tabActive : tabInactive}`}
          >
            Notas diarias
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("appointments")}
            aria-current={activeTab === "appointments" ? "page" : undefined}
            className={`${tabBase} ${activeTab === "appointments" ? tabActive : tabInactive}`}
          >
            Citas médicas
          </button>
        </div>

        {activeTab === "overview" && <PregnancyOverview pregnancyInfo={pregnancyInfo} userId={user.id} />}
        {activeTab === "documents" && <DocumentsSection userId={user.id} />}
        {activeTab === "notes" && <NotesSection userId={user.id} />}
        {activeTab === "appointments" && <AppointmentsSection userId={user.id} />}
      </div>
    </div>
  )
}
