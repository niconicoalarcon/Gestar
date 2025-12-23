import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50">
      <div className="w-full max-w-md">
        <Card className="border-pink-100 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-400">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl text-rose-900">¡Cuenta creada exitosamente!</CardTitle>
            <CardDescription className="text-rose-600">Revisa tu correo para confirmar tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-rose-700 leading-relaxed text-center">
              Hemos enviado un correo de confirmación a tu dirección de email. Por favor, revisa tu bandeja de entrada y
              haz clic en el enlace de confirmación antes de iniciar sesión.
            </p>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500"
            >
              <Link href="/auth/login">Ir al inicio de sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
