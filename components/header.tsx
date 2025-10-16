"use client"

import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Logo from "@/app/src/logo.svg"
import Image from "next/image"
import Link from "next/link"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full bg-header px-8 ">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Link href={'/dashboard'}><Image className="w-32" src={Logo} alt="headerLogo" /></Link>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white">{user.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-white hover:bg-white/10 hover:text-accent"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
