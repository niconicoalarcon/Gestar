import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (data?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg">
            <svg className="h-12 w-12 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground text-balance">Diario del embarazo</h1>
          <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
            Documenta cada momento especial de tu embarazo. Guarda ecografías, análisis médicos y registra síntomas
            diarios en un solo lugar seguro.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/auth/sign-up">Comenzar ahora</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent">
            <Link href="/auth/login">Iniciar sesión</Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 mt-12 text-left">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary mb-3">
              <svg className="h-5 w-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Documentos médicos</h3>
            <p className="text-sm text-muted-foreground">
              Guarda y visualiza ecografías, análisis y recetas sin descargarlos
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary mb-3">
              <svg className="h-5 w-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Notas diarias</h3>
            <p className="text-sm text-muted-foreground">
              Registra síntomas, estado de ánimo y observaciones por fecha
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary mb-3">
              <svg className="h-5 w-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Seguimiento</h3>
            <p className="text-sm text-muted-foreground">
              Monitorea semanas de embarazo y días restantes hasta el parto
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
