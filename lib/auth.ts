"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  isAuthenticated: boolean
  user: { email: string; name: string } | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: async (email: string, password: string) => {
        // Simulação de autenticação - em produção, conectar com API real
        if (email && password) {
          set({
            isAuthenticated: true,
            user: { email, name: email.split("@")[0] },
          })
          return true
        }
        return false
      },
      logout: () => {
        set({ isAuthenticated: false, user: null })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
