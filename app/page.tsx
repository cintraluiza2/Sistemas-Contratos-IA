"use client";

import { useEffect } from "react"; // 1. Importe o useEffect
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession({
    onUnauthenticated() {
      router.push("/login");
    },
    required: true
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  // Retorna nulo para evitar qualquer "flash" de conteúdo antes do redirecionamento
  return null;
}