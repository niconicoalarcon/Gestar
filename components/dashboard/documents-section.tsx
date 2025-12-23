"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DocumentRow {
  id: string
  title: string
  description: string | null
  file_url: string // ⚠️ aquí vamos a guardar el PATH del storage (ej: userId/archivo.pdf)
  file_type: string
  upload_date: string
  document_date: string | null
  category: string
}

interface DocumentView extends DocumentRow {
  signedUrl?: string
}

interface DocumentsSectionProps {
  userId: string
}

const BUCKET = "medical-documents"
const SIGNED_URL_TTL_SECONDS = 60 * 10 // 10 minutos

export default function DocumentsSection({ userId }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<DocumentView[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [documentDate, setDocumentDate] = useState("")
  const [category, setCategory] = useState("otros")
  const [viewingDocument, setViewingDocument] = useState<DocumentView | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const extractStoragePath = (value: string) => {
    // Si ya es path tipo "uuid/archivo.pdf", lo devolvemos.
    if (!value) return value
    if (!value.startsWith("http")) return value

    // Si viene una URL vieja (public), intentamos extraer el path
    const marker = `/storage/v1/object/${BUCKET}/`
    const idx = value.indexOf(marker)
    if (idx !== -1) {
      return value.slice(idx + marker.length)
    }

    // Otro caso: /medical-documents/...
    const marker2 = `/${BUCKET}/`
    const idx2 = value.indexOf(marker2)
    if (idx2 !== -1) {
      return value.slice(idx2 + marker2.length)
    }

    // Si no se puede parsear, devolvemos el original
    return value
  }

  const getSignedUrlForPath = async (path: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
    if (error) throw error
    return data.signedUrl
  }

  const loadDocuments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("medical_documents")
      .select("*")
      .eq("user_id", userId)
      .order("upload_date", { ascending: false })

    if (error) {
      console.error("Error loading documents:", error)
      return
    }

    const rows = (data ?? []) as DocumentRow[]

    // Generar signed URLs para mostrar (bucket privado)
    // Si tenés muchos documentos, esto puede ser pesado; pero para empezar está bien.
    const withSigned: DocumentView[] = await Promise.all(
      rows.map(async (doc) => {
        try {
          const path = extractStoragePath(doc.file_url)
          const signedUrl = await getSignedUrlForPath(path)
          return { ...doc, file_url: path, signedUrl }
        } catch (e) {
          console.error("Error creating signed URL for doc:", doc.id, e)
          return { ...doc, signedUrl: undefined }
        }
      })
    )

    setDocuments(withSigned)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !title) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      // ✅ usar el usuario autenticado real (importante para policies RLS)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) throw new Error("No hay sesión activa. Inicia sesión para subir documentos.")

      // Subir archivo a Storage (bucket privado) bajo carpeta user.id/
      const fileExt = selectedFile.name.split(".").pop() || "bin"
      const safeName = selectedFile.name.replace(/[^\w.\-]+/g, "_")
      const path = `${user.id}/${Date.now()}-${safeName}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, selectedFile, {
        upsert: false,
        contentType: selectedFile.type,
        cacheControl: "3600",
      })
      if (uploadError) throw uploadError

      // Guardar metadata en la DB:
      // ⚠️ Guardamos el PATH (no URL) porque el bucket es privado
      const fileType = selectedFile.type.includes("pdf") ? "pdf" : "image"
      const { error: dbError } = await supabase.from("medical_documents").insert({
        user_id: user.id,
        title,
        description,
        file_url: path, // ✅ path de storage
        file_type: fileType,
        file_size: selectedFile.size,
        document_date: documentDate || null,
        category,
      })
      if (dbError) throw dbError

      setIsOpen(false)
      setSelectedFile(null)
      setTitle("")
      setDescription("")
      setDocumentDate("")
      setCategory("otros")

      await loadDocuments()
      router.refresh()
    } catch (error) {
      console.error("Error uploading:", error)
      alert("Error al subir el archivo. Por favor intenta de nuevo.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (docId: string, storedPathOrUrl: string) => {
    if (!confirm("¿Estás seguro de eliminar este documento?")) return

    const supabase = createClient()

    try {
      // En bucket privado, guardamos path en DB (igual hacemos extract por compatibilidad)
      const path = extractStoragePath(storedPathOrUrl)

      const { error: storageError } = await supabase.storage.from(BUCKET).remove([path])
      if (storageError) throw storageError

      const { error: dbError } = await supabase.from("medical_documents").delete().eq("id", docId)
      if (dbError) throw dbError

      await loadDocuments()
    } catch (error) {
      console.error("Error deleting:", error)
      alert("Error al eliminar el documento.")
    }
  }

  const getCategoryLabel = (cat: string) => {
    const labels: { [key: string]: string } = {
      ecografia: "Ecografía",
      analisis: "Análisis",
      receta: "Receta médica",
      otros: "Otros",
    }
    return labels[cat] || cat
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-rose-900">Documentos médicos</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500">
              Subir documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-rose-900">Subir nuevo documento</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="file" className="text-rose-900">
                  Archivo (PDF o imagen)
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="border-pink-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title" className="text-rose-900">
                  Título *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Ecografía 12 semanas"
                  className="border-pink-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category" className="text-rose-900">
                  Categoría
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-pink-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ecografia">Ecografía</SelectItem>
                    <SelectItem value="analisis">Análisis</SelectItem>
                    <SelectItem value="receta">Receta</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="doc-date" className="text-rose-900">
                  Fecha del documento
                </Label>
                <Input
                  id="doc-date"
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  className="border-pink-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-rose-900">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notas adicionales..."
                  className="border-pink-200"
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !title}
                className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500"
              >
                {isUploading ? "Subiendo..." : "Subir documento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="border-pink-100 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base text-rose-900">{doc.title}</CardTitle>
                  <p className="text-xs text-rose-600 mt-1">{getCategoryLabel(doc.category)}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {doc.description && <p className="text-sm text-rose-700 mb-3 line-clamp-2">{doc.description}</p>}
              <div className="text-xs text-rose-600 mb-3">
                {doc.document_date && <p>Fecha: {new Date(doc.document_date).toLocaleDateString("es-ES")}</p>}
                <p>Subido: {new Date(doc.upload_date).toLocaleDateString("es-ES")}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    // refrescar la signed URL justo antes de ver
                    try {
                      const signedUrl = await getSignedUrlForPath(doc.file_url)
                      setViewingDocument({ ...doc, signedUrl })
                    } catch (e) {
                      console.error(e)
                      alert("No se pudo generar el enlace para ver el documento.")
                    }
                  }}
                  className="flex-1 border-pink-200 text-rose-700 hover:bg-pink-50"
                >
                  Ver
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(doc.id, doc.file_url)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card className="border-pink-100">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-rose-600 text-center">
              Aún no has subido ningún documento.
              <br />
              Comienza agregando ecografías, análisis o recetas médicas.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-rose-900">{viewingDocument?.title}</DialogTitle>
          </DialogHeader>

          <div className="overflow-auto max-h-[70vh]">
            {viewingDocument?.file_type === "pdf" ? (
              <iframe
                src={viewingDocument?.signedUrl}
                className="w-full h-[70vh]"
                title={viewingDocument?.title || "documento"}
              />
            ) : (
              <img
                src={viewingDocument?.signedUrl || "/placeholder.svg"}
                alt={viewingDocument?.title || "documento"}
                className="w-full h-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
