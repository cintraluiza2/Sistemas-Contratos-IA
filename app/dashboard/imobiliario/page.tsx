"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Home, Building } from "lucide-react"
import { useSession } from "next-auth/react"

export default function ImobiliarioPage() {
  const router = useRouter()

  const { data: session, status } = useSession({
    required: true, // Magia! Se não estiver logado, redireciona para a página de login
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const subcategories = [
    {
      id: "compra-venda-vista",
      title: "Compra e Venda à Vista",
      description: "Contratos de compra e venda de imóveis com pagamento à vista",
      icon: Home,
      href: "/dashboard/imobiliario/compra-venda-vista",
    },
    {
      id: "financiamento-goiania",
      title: "Financiamento Goiânia",
      description: "Contratos de financiamento imobiliário em Goiânia",
      icon: Building,
      href: "/dashboard/imobiliario/financiamento-goiania",
    },
    {
      id: "financiamento-aparecida",
      title: "Financiamento Aparecida",
      description: "Contratos de financiamento imobiliário em Aparecida de Goiânia",
      icon: FileText,
      href: "/dashboard/imobiliario/financiamento-aparecida",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">Contratos Imobiliários</h1>
            <p className="text-lg text-muted-foreground">Selecione o tipo de contrato imobiliário</p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {subcategories.map((subcategory) => {
            const Icon = subcategory.icon
            return (
              <Card
                key={subcategory.id}
                className="group cursor-pointer border-2 transition-all hover:border-accent hover:shadow-lg"
                onClick={() => router.push(subcategory.href)}
              >
                <CardHeader className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent">
                    <Icon className="h-7 w-7 text-accent transition-colors group-hover:text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl leading-tight">{subcategory.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{subcategory.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
