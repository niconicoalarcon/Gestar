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

interface DashboardClientProps {
  user: User
  pregnancyInfo: any
}

export default function DashboardClient({ user, pregnancyInfo }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "notes">("overview")
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
        <div className="mb-6 flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "overview"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "documents"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Documentos
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "notes"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Notas diarias
          </button>
        </div>

        {activeTab === "overview" && <PregnancyOverview pregnancyInfo={pregnancyInfo} userId={user.id} />}
        {activeTab === "documents" && <DocumentsSection userId={user.id} />}
        {activeTab === "notes" && <NotesSection userId={user.id} />}
      </div>
    </div>
  )
}
