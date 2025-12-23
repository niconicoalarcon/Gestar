"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SetupPregnancyInfoProps {
  userId: string
}

export default function SetupPregnancyInfo({ userId }: SetupPregnancyInfoProps) {
  const [partnerName, setPartnerName] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [lastPeriodDate, setLastPeriodDate] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [hospital, setHospital] = useState("")
  const [bloodType, setBloodType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: insertError } = await supabase.from("pregnancy_info").insert({
        user_id: userId,
        partner_name: partnerName,
        due_date: dueDate,
        last_period_date: lastPeriodDate || null,
        doctor_name: doctorName || null,
        hospital: hospital || null,
        blood_type: bloodType || null,
      })

      if (insertError) throw insertError

      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50">
      <Card className="w-full max-w-2xl border-pink-100 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-rose-900">Información del embarazo</CardTitle>
          <CardDescription className="text-rose-600">
            Completa estos datos para comenzar a usar la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="partnerName" className="text-rose-900">
                Nombre de tu pareja *
              </Label>
              <Input
                id="partnerName"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                required
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate" className="text-rose-900">
                Fecha probable de parto *
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastPeriodDate" className="text-rose-900">
                Fecha última menstruación
              </Label>
              <Input
                id="lastPeriodDate"
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="doctorName" className="text-rose-900">
                Nombre del médico
              </Label>
              <Input
                id="doctorName"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hospital" className="text-rose-900">
                Hospital o clínica
              </Label>
              <Input
                id="hospital"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bloodType" className="text-rose-900">
                Tipo de sangre
              </Label>
              <Input
                id="bloodType"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                placeholder="Ej: O+, A-, etc."
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar información"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
