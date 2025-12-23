"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DailyNote {
  id: string
  note_date: string // "YYYY-MM-DD"
  symptoms: string
  mood: string
  weight: number | null
  notes: string
  created_at: string
}

interface NotesSectionProps {
  userId: string
}

export default function NotesSection({ userId }: NotesSectionProps) {
  const [notes, setNotes] = useState<DailyNote[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<DailyNote | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    note_date: new Date().toISOString().split("T")[0],
    symptoms: "",
    mood: "",
    weight: "",
    notes: "",
  })
  const router = useRouter()

  useEffect(() => {
    loadNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetForm = () => {
    setEditingNote(null)
    setFormData({
      note_date: new Date().toISOString().split("T")[0],
      symptoms: "",
      mood: "",
      weight: "",
      notes: "",
    })
  }

  // ✅ Fix timezone: interpretar YYYY-MM-DD como fecha local
  const formatDateLocal = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number)
    const dt = new Date(y, m - 1, d) // local time (no UTC shift)
    return dt.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const loadNotes = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("daily_notes")
      .select("*")
      .eq("user_id", userId)
      .order("note_date", { ascending: false })

    if (error) {
      console.error("Error loading notes:", error)
      return
    }

    if (data) setNotes(data)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()

    try {
      if (editingNote) {
        const { error } = await supabase
          .from("daily_notes")
          .update({
            symptoms: formData.symptoms,
            mood: formData.mood,
            weight: formData.weight ? Number.parseFloat(formData.weight) : null,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingNote.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("daily_notes").insert({
          user_id: userId,
          note_date: formData.note_date,
          symptoms: formData.symptoms,
          mood: formData.mood,
          weight: formData.weight ? Number.parseFloat(formData.weight) : null,
          notes: formData.notes,
        })

        if (error) throw error
      }

      setIsOpen(false)
      resetForm()
      await loadNotes()
      router.refresh()
    } catch (error) {
      console.error("Error saving:", error)
      alert("Error al guardar la nota.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (note: DailyNote) => {
    setEditingNote(note)
    setFormData({
      note_date: note.note_date,
      symptoms: note.symptoms || "",
      mood: note.mood || "",
      weight: note.weight != null ? note.weight.toString() : "",
      notes: note.notes || "",
    })
    setIsOpen(true)
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta nota?")) return

    const supabase = createClient()
    const { error } = await supabase.from("daily_notes").delete().eq("id", noteId)

    if (error) {
      console.error("Error deleting:", error)
      alert("Error al eliminar la nota.")
    } else {
      await loadNotes()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-rose-900">Notas diarias</h2>

        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setIsOpen(true)
              }}
              className="bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500"
            >
              Nueva nota
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-rose-900">{editingNote ? "Editar nota" : "Nueva nota diaria"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="note-date" className="text-rose-900">
                  Fecha
                </Label>
                <Input
                  id="note-date"
                  type="date"
                  value={formData.note_date}
                  onChange={(e) => setFormData({ ...formData, note_date: e.target.value })}
                  disabled={!!editingNote}
                  className="border-pink-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="symptoms" className="text-rose-900">
                  Síntomas
                </Label>
                <Input
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Ej: Náuseas, cansancio..."
                  className="border-pink-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mood" className="text-rose-900">
                  Estado de ánimo
                </Label>
                <Input
                  id="mood"
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  placeholder="Ej: Feliz, ansiosa, tranquila..."
                  className="border-pink-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="weight" className="text-rose-900">
                  Peso (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Ej: 65.5"
                  className="border-pink-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-rose-900">
                  Notas adicionales
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Cualquier observación importante del día..."
                  rows={4}
                  className="border-pink-200"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500"
              >
                {isSaving ? "Guardando..." : editingNote ? "Actualizar nota" : "Guardar nota"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {notes.map((note) => (
          <Card key={note.id} className="border-pink-100">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-rose-900">
                    {/* ✅ FIX: mostrar fecha sin corrimiento por zona horaria */}
                    {formatDateLocal(note.note_date)}
                  </CardTitle>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(note)}
                    className="border-pink-200 text-rose-700 hover:bg-pink-50"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(note.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {note.symptoms && (
                  <div>
                    <span className="text-sm font-medium text-rose-600">Síntomas: </span>
                    <span className="text-sm text-rose-900">{note.symptoms}</span>
                  </div>
                )}

                {note.mood && (
                  <div>
                    <span className="text-sm font-medium text-rose-600">Estado de ánimo: </span>
                    <span className="text-sm text-rose-900">{note.mood}</span>
                  </div>
                )}

                {note.weight != null && (
                  <div>
                    <span className="text-sm font-medium text-rose-600">Peso: </span>
                    <span className="text-sm text-rose-900">{note.weight} kg</span>
                  </div>
                )}

                {note.notes && (
                  <div>
                    <span className="text-sm font-medium text-rose-600">Notas: </span>
                    <p className="text-sm text-rose-900 mt-1 whitespace-pre-wrap">{note.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notes.length === 0 && (
        <Card className="border-pink-100">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <svg className="h-16 w-16 text-pink-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <p className="text-rose-600 text-center">
              Aún no has creado ninguna nota.
              <br />
              Comienza a documentar tus síntomas y observaciones diarias.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
