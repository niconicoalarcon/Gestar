"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, MapPin, User, Trash2, Edit2, Clock } from "lucide-react"
import { format, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface Appointment {
  id: string
  title: string
  description: string | null
  appointment_date: string
  location: string | null
  doctor_name: string | null
}

interface AppointmentsSectionProps {
  userId: string
}

export default function AppointmentsSection({ userId }: AppointmentsSectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    appointment_date: "",
    appointment_time: "",
    location: "",
    doctor_name: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  // Cargar todas las citas para marcar en el calendario
  useEffect(() => {
    loadAllAppointments()
  }, [])

  // Filtrar citas del día seleccionado
  useEffect(() => {
    if (allAppointments.length > 0) {
      const filtered = allAppointments.filter((apt) =>
        isSameDay(parseISO(apt.appointment_date), selectedDate)
      )
      setAppointments(filtered)
    }
  }, [selectedDate, allAppointments])

  const loadAllAppointments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("medical_appointments")
      .select("*")
      .eq("user_id", userId)
      .order("appointment_date", { ascending: true })

    if (!error && data) {
      setAllAppointments(data)
    }
    setLoading(false)
  }

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      const appointmentDate = new Date(appointment.appointment_date)
      setEditingId(appointment.id)
      setFormData({
        title: appointment.title,
        description: appointment.description || "",
        appointment_date: format(appointmentDate, "yyyy-MM-dd"),
        appointment_time: format(appointmentDate, "HH:mm"),
        location: appointment.location || "",
        doctor_name: appointment.doctor_name || "",
      })
    } else {
      setEditingId(null)
      setFormData({
        title: "",
        description: "",
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: "",
        location: "",
        doctor_name: "",
      })
    }
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingId(null)
    setFormData({
      title: "",
      description: "",
      appointment_date: "",
      appointment_time: "",
      location: "",
      doctor_name: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`)

    const appointmentData = {
      user_id: userId,
      title: formData.title,
      description: formData.description || null,
      appointment_date: appointmentDateTime.toISOString(),
      location: formData.location || null,
      doctor_name: formData.doctor_name || null,
    }

    if (editingId) {
      const { error } = await supabase
        .from("medical_appointments")
        .update(appointmentData)
        .eq("id", editingId)

      if (!error) {
        handleCloseDialog()
        loadAllAppointments()
      }
    } else {
      const { error } = await supabase.from("medical_appointments").insert(appointmentData)

      if (!error) {
        handleCloseDialog()
        loadAllAppointments()
      }
    }

    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás segura de que quieres eliminar esta cita?")) return

    const { error } = await supabase.from("medical_appointments").delete().eq("id", id)

    if (!error) {
      loadAllAppointments()
    }
  }

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), "HH:mm", { locale: es })
  }

  const formatFullDate = (dateString: string) => {
    return format(parseISO(dateString), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  }

  // Marcar días con citas en el calendario
  const appointmentDates = allAppointments.map((apt) => parseISO(apt.appointment_date))

  const modifiers = {
    hasAppointment: appointmentDates,
  }

  const modifiersClassNames = {
    hasAppointment: "bg-primary/20 font-bold text-primary hover:bg-primary/30",
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      {/* Calendario */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
          <CardDescription>Selecciona un día para ver las citas</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={es}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Panel de citas */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="capitalize">{formatFullDate(selectedDate.toISOString())}</CardTitle>
                <CardDescription>
                  {appointments.length === 0
                    ? "No hay citas programadas"
                    : `${appointments.length} ${appointments.length === 1 ? "cita" : "citas"}`}
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva cita
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Lista de citas del día seleccionado */}
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">Cargando citas...</CardContent>
          </Card>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No hay citas programadas para este día</p>
              <Button onClick={() => handleOpenDialog()} variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Agendar cita
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold leading-none">{appointment.title}</h3>
                          <p className="text-sm font-medium text-primary">{formatTime(appointment.appointment_date)}</p>
                        </div>
                      </div>

                      {appointment.doctor_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{appointment.doctor_name}</span>
                        </div>
                      )}

                      {appointment.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{appointment.location}</span>
                        </div>
                      )}

                      {appointment.description && (
                        <p className="text-sm text-muted-foreground border-l-2 border-primary/20 pl-3 py-1">
                          {appointment.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(appointment)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(appointment.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog para crear/editar cita */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar cita" : "Agendar nueva cita"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Modifica los detalles de la cita médica" : "Completa la información de tu próxima consulta"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Tipo de consulta *</Label>
                <Input
                  id="title"
                  required
                  placeholder="Ej: Control mensual, Ecografía"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor_name">Médico/a</Label>
                <Input
                  id="doctor_name"
                  placeholder="Nombre del profesional"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="appointment_date">Fecha *</Label>
                <Input
                  id="appointment_date"
                  type="date"
                  required
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment_time">Hora *</Label>
                <Input
                  id="appointment_time"
                  type="time"
                  required
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lugar</Label>
              <Input
                id="location"
                placeholder="Consultorio, clínica o dirección"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Notas</Label>
              <Textarea
                id="description"
                placeholder="Estudios previos, preparación necesaria, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : editingId ? "Actualizar cita" : "Guardar cita"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}