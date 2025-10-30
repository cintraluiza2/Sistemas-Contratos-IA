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
    required: true, // Magia! Se não estiver logado, redireciona para a página de login
    onUnauthenticated() {
      router.push("/login");
    },
  });


  const handleGenerateLegalOpinion = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const res = await fetch("/api/parecer", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    // ✅ Recebe o arquivo gerado (blob)
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    // ✅ Armazena temporariamente no localStorage
    localStorage.setItem("parecerGerado", base64);
  };



  const handleProcess = async (files: File[], selectedParagraphs: string[]) => {
    if (!files || files.length === 0) {
      alert("Envie um arquivo .docx para processar.");
      return;
    }

    const preContrato = files.find((file) => file.name.endsWith(".docx"));
    if (!preContrato) {
      alert("Nenhum arquivo .docx foi encontrado.");
      return;
    }

    setIsProcessing(true);

    try {
      // 🧩 1️⃣ Gera o contrato — agora com tipo de contrato
      const formData = new FormData();
      formData.append("pre_contrato", preContrato);
      formData.append("selectedParagraphs", JSON.stringify(selectedParagraphs))
      formData.append("tipo_contrato", "financiamento-ms"); // <- muda aqui

      const response = await fetch("https://4eb693410904.ngrok-free.app/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      localStorage.setItem("contratoGerado", base64);

      await handleGenerateLegalOpinion(files);

      router.push("/dashboard/resultado?tipo=financiamento-goiania");

    } catch (error) {
      console.error("Erro ao gerar contrato:", error);
      alert("Erro ao gerar contrato. Veja o console para detalhes.");
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <h2 className="mb-2 text-2xl font-bold">Processando Documentos</h2>
            <p className="text-muted-foreground">Aguarde enquanto geramos seu contrato...</p>
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
            <h1 className="mb-4 text-4xl font-bold tracking-tight">Compra e Venda à Vista</h1>
            <p className="text-lg text-muted-foreground">
              Faça upload dos documentos e selecione as cláusulas necessárias
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          <DocumentUpload title="Upload de Documentos" onProcess={handleProcess} />
        </div>
      </main>
    </div>
  )
}
