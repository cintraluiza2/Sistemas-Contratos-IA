import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/app/contexts/themeContext';
import { Suspense } from "react"
import { ThemeToggleButton } from "@/components/themeToggleButton"
import './globals.css'

export const metadata: Metadata = {
  title: 'ContractFlow',
  description: 'Sistema de Criação e Gestão de Contratos Jurídicos',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider>
            {children}
            <ThemeToggleButton />
            <Analytics />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
