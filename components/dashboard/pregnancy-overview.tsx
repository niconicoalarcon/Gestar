"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PregnancyOverviewProps {
  pregnancyInfo: any
  userId: string
}

export default function PregnancyOverview({ pregnancyInfo, userId }: PregnancyOverviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(pregnancyInfo)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const calculateWeeks = () => {
    if (!pregnancyInfo.due_date) return 0
    const dueDate = new Date(pregnancyInfo.due_date)
    const today = new Date()
    const totalDays = 280 // 40 semanas
    const daysPassed = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const weeksPregnant = Math.floor((totalDays - daysPassed) / 7)
    return Math.max(0, Math.min(weeksPregnant, 40))
  }

  const calculateDaysRemaining = () => {
    if (!pregnancyInfo.due_date) return 0
    const dueDate = new Date(pregnancyInfo.due_date)
    const today = new Date()
    const daysRemaining = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysRemaining)
  }

  const handleUpdate = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("pregnancy_info")
        .update({
          partner_name: formData.partner_name,
          due_date: formData.due_date,
          last_period_date: formData.last_period_date,
          doctor_name: formData.doctor_name,
          hospital: formData.hospital,
          blood_type: formData.blood_type,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) throw error

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const weeks = calculateWeeks()
  const daysRemaining = calculateDaysRemaining()
  const dueDateLabel = pregnancyInfo.due_date
    ? new Date(pregnancyInfo.due_date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : "-"

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Semanas de embarazo</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <svg className="h-5 w-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3"
                />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{weeks} semanas</div>
            <p className="text-sm text-muted-foreground mt-1">De 40 semanas totales</p>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Días restantes</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <svg className="h-5 w-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{daysRemaining}</div>
            <p className="text-sm text-muted-foreground mt-1">Hasta la fecha estimada</p>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fecha de parto</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <svg className="h-5 w-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6h4"
                />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground">{dueDateLabel}</div>
            <p className="text-sm text-muted-foreground mt-1">Fecha estimada</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Información del embarazo</CardTitle>

          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline">Editar</Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-foreground">Editar información</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-partner" className="text-foreground">
                    Nombre de tu pareja
                  </Label>
                  <Input
                    id="edit-partner"
                    value={formData.partner_name}
                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-due" className="text-foreground">
                    Fecha probable de parto
                  </Label>
                  <Input
                    id="edit-due"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-last" className="text-foreground">
                    Fecha última menstruación
                  </Label>
                  <Input
                    id="edit-last"
                    type="date"
                    value={formData.last_period_date || ""}
                    onChange={(e) => setFormData({ ...formData, last_period_date: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-doctor" className="text-foreground">
                    Nombre del médico
                  </Label>
                  <Input
                    id="edit-doctor"
                    value={formData.doctor_name || ""}
                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-hospital" className="text-foreground">
                    Hospital o clínica
                  </Label>
                  <Input
                    id="edit-hospital"
                    value={formData.hospital || ""}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-blood" className="text-foreground">
                    Tipo de sangre
                  </Label>
                  <Input
                    id="edit-blood"
                    value={formData.blood_type || ""}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                  />
                </div>

                <Button onClick={handleUpdate} disabled={isLoading} className="w-full">
                  {isLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Pareja</dt>
              <dd className="text-base text-foreground">{pregnancyInfo.partner_name}</dd>
            </div>

            {pregnancyInfo.doctor_name && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Médico</dt>
                <dd className="text-base text-foreground">{pregnancyInfo.doctor_name}</dd>
              </div>
            )}

            {pregnancyInfo.hospital && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Hospital</dt>
                <dd className="text-base text-foreground">{pregnancyInfo.hospital}</dd>
              </div>
            )}

            {pregnancyInfo.blood_type && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tipo de sangre</dt>
                <dd className="text-base text-foreground">{pregnancyInfo.blood_type}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
