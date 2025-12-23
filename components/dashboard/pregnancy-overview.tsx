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

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-rose-600">Semanas de embarazo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-900">{weeks} semanas</div>
            <p className="text-sm text-rose-600 mt-1">De 40 semanas totales</p>
          </CardContent>
        </Card>

        <Card className="border-pink-100 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-amber-600">Días restantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{daysRemaining}</div>
            <p className="text-sm text-amber-600 mt-1">Hasta la fecha estimada</p>
          </CardContent>
        </Card>

        <Card className="border-pink-100 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-purple-600">Fecha de parto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-900">
              {new Date(pregnancyInfo.due_date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-pink-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-rose-900">Información del embarazo</CardTitle>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-pink-200 text-rose-700 hover:bg-pink-50 bg-transparent">
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-rose-900">Editar información</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-partner" className="text-rose-900">
                    Nombre de tu pareja
                  </Label>
                  <Input
                    id="edit-partner"
                    value={formData.partner_name}
                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                    className="border-pink-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-due" className="text-rose-900">
                    Fecha probable de parto
                  </Label>
                  <Input
                    id="edit-due"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="border-pink-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-last" className="text-rose-900">
                    Fecha última menstruación
                  </Label>
                  <Input
                    id="edit-last"
                    type="date"
                    value={formData.last_period_date || ""}
                    onChange={(e) => setFormData({ ...formData, last_period_date: e.target.value })}
                    className="border-pink-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-doctor" className="text-rose-900">
                    Nombre del médico
                  </Label>
                  <Input
                    id="edit-doctor"
                    value={formData.doctor_name || ""}
                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                    className="border-pink-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-hospital" className="text-rose-900">
                    Hospital o clínica
                  </Label>
                  <Input
                    id="edit-hospital"
                    value={formData.hospital || ""}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    className="border-pink-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-blood" className="text-rose-900">
                    Tipo de sangre
                  </Label>
                  <Input
                    id="edit-blood"
                    value={formData.blood_type || ""}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    className="border-pink-200"
                  />
                </div>
                <Button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500"
                >
                  {isLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-rose-600">Pareja</dt>
              <dd className="text-base text-rose-900">{pregnancyInfo.partner_name}</dd>
            </div>
            {pregnancyInfo.doctor_name && (
              <div>
                <dt className="text-sm font-medium text-rose-600">Médico</dt>
                <dd className="text-base text-rose-900">{pregnancyInfo.doctor_name}</dd>
              </div>
            )}
            {pregnancyInfo.hospital && (
              <div>
                <dt className="text-sm font-medium text-rose-600">Hospital</dt>
                <dd className="text-base text-rose-900">{pregnancyInfo.hospital}</dd>
              </div>
            )}
            {pregnancyInfo.blood_type && (
              <div>
                <dt className="text-sm font-medium text-rose-600">Tipo de sangre</dt>
                <dd className="text-base text-rose-900">{pregnancyInfo.blood_type}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
