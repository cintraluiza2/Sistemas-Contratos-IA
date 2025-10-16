"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PublicoPrivadoPage() {
  const router = useRouter()

  useEffect(() => {
    const authStorageString = localStorage.getItem("auth-storage");

    if (authStorageString || authStorageString !== null)
      var authDataObject = JSON.parse(authStorageString);

    const isUserAuthenticated = authDataObject.state.isAuthenticated;

    if (!isUserAuthenticated) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4 gap-2 hover:bg-accent/10">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">Público e Privado</h1>
            <p className="text-lg text-muted-foreground">Em desenvolvimento</p>
          </div>
        </div>
      </main>
    </div>
  )
}
