"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react";
import LogoRounded from "@/app/src/logoRounded.svg"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false, // Importante: não redireciona a página inteira
        email,
        password,
      });

      if (result?.error) {
        setError("Email ou senha inválidos.");
        console.error(result.error);
      } else {
        // Sucesso! Redireciona para o dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar fazer login.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-lg bg-primary-foreground">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <div className="h-0.5 bg-black w-32"></div>
            <Image className="mx-4" src={LogoRounded} alt="clarionLogo" />
            <div className="h-0.5 bg-black w-32"></div>
          </div>
          <CardTitle className="text-3xl font-semibold">
            Login
          </CardTitle>
          <CardDescription className="text-base">Sistema de Gestão de Contratos Jurídicos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
