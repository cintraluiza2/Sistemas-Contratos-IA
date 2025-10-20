"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()

  const { data: session, status } = useSession({
    required: true, // Magia! Se não estiver logado, redireciona para a página de login
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const categories = [
    {
      id: "imobiliario",
      title: "Imobiliário",
      description: "Contratos de compra, venda e financiamento de imóveis",
      icon: Building2,
      href: "/dashboard/imobiliario",
    },
    {
      id: "publico-privado",
      title: "Público e Privado",
      description: "Contratos entre entidades públicas e privadas",
      icon: Users,
      href: "/dashboard/publico-privado",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Selecione a Categoria</h1>
          <p className="text-lg text-muted-foreground">Escolha o tipo de contrato que deseja processar</p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card
                key={category.id}
                className="group cursor-pointer border-2 transition-all hover:border-accent hover:shadow-lg"
                onClick={() => router.push(category.href)}
              >
                <CardHeader className="space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent">
                    <Icon className="h-8 w-8 text-accent transition-colors group-hover:text-accent-foreground" />
                  </div>
                  <CardTitle className="text-2xl">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{category.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
