"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function HomePage() {
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
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
    </div>
  )
}
