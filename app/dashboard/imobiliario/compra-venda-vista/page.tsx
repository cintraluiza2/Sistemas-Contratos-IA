"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { DocumentUpload } from "@/components/document-upload"
import { ArrowLeft } from "lucide-react"
import { useSession } from "next-auth/react"

export default function CompraVendaVistaPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login")
    },
  })

  const handleProcess = async (
    files: File[],
    selectedParagraphs: string[],
    extraText: string
  ) => {

    if (!files || files.length === 0) {
      alert("Envie ao menos um arquivo para continuar.")
      return
    }

    const preContrato = files.find((file) => file.name.endsWith(".docx"))

    setIsProcessing(true)

    console.log("Enviando requisição ao Flask!")

    try {
      const formData = new FormData()

      if (preContrato) {
        formData.append("pre_contrato", preContrato)
      }

      formData.append("selectedParagraphs", JSON.stringify(selectedParagraphs))
      formData.append("extraText", extraText)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text)
      }

      // Salva o contrato gerado
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      )
      localStorage.setItem("contratoGerado", base64)

      // Redireciona para a tela de resultado
      router.push("/dashboard/resultado?tipo=compra-venda-vista")

    } catch (error) {
      console.error("Erro ao gerar contrato:", error)
      alert("Erro ao gerar contrato. Veja o console para detalhes.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <h2 className="mb-2 text-2xl font-bold">Processando Documentos</h2>
            <p className="text-muted-foreground">
              Aguarde enquanto geramos seu contrato...
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/imobiliario")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              Compra e Venda à Vista
            </h1>
            <p className="text-lg text-muted-foreground">
              Faça upload dos documentos e selecione as cláusulas necessárias
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          <DocumentUpload
            title="Upload de Documentos"
            onProcess={handleProcess}
          />
        </div>
      </main>
    </div>
  )
}
