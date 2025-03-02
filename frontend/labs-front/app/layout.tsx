import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Расписание занятий",
  description: "Приложение для управления расписанием занятий",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full w-full">
      <body className={`${inter.className} h-full`}>
        {children}
        <Toaster 
          position="bottom-right" 
          richColors 
          closeButton 
          theme="light" 
          toastOptions={{
            classNames: {
              toast: "bg-background text-foreground border border-border shadow-lg",
              title: "font-semibold",
              description: "text-muted-foreground",
              success: "bg-green-50 border-green-500 text-green-900",
              error: "bg-red-50 border-red-500 text-red-900",
              warning: "bg-yellow-50 border-yellow-500 text-yellow-900",
              info: "bg-blue-50 border-blue-500 text-blue-900",
              closeButton: "text-foreground hover:bg-accent",
            },
          }}
        />
        </body>
    </html>
  )
}