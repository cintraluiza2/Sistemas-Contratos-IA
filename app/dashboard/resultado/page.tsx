"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, CheckCircle2, FileText, Home } from "lucide-react"
import { generateContract } from "@/lib/document-generator"
import { useSession } from "next-auth/react"


function ResultadoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get("tipo") || "contrato"

  const { data: session, status } = useSession({
    required: true, // Magia! Se não estiver logado, redireciona para a página de login
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const handleDownloadContract = () => {
    const base64 = localStorage.getItem("contratoGerado");
    if (!base64) {
      alert("Nenhum contrato gerado encontrado. Tente novamente.");
      return;
    }

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contrato-${tipo}-${Date.now()}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const handleDownloadOpinion = () => {
    const base64 = localStorage.getItem("parecerGerado");
    if (!base64) {
      alert("Nenhum parecer gerado encontrado. Tente novamente.");
      return;
    }

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parecer-juridico-${tipo}-${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Success Message */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle2 className="h-12 w-12 text-accent" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight">Processamento Concluído!</h1>
            <p className="text-lg text-muted-foreground">Seus documentos foram gerados com sucesso</p>
          </div>

          {/* Download Cards */}
          <div className="mb-8 space-y-4">
            <Card className="border-2 transition-all hover:border-accent hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Contrato Final</CardTitle>
                    <CardDescription className="mt-1">
                      Documento completo com todas as cláusulas selecionadas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDownloadContract}
                  className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Download className="h-4 w-4" />
                  Baixar Contrato (DOCX)
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 transition-all hover:border-accent hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Parecer Jurídico</CardTitle>
                    <CardDescription className="mt-1">Análise jurídica completa do contrato gerado</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDownloadOpinion}
                  className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Download className="h-4 w-4" />
                  Baixar Parecer Jurídico (DOCX)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex-1 gap-2">
              <Home className="h-4 w-4" />
              Voltar ao Início
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/imobiliario")} className="flex-1 gap-2">
              Novo Contrato
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ResultadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      }
    >
      <ResultadoContent />
    </Suspense>
  )
}
