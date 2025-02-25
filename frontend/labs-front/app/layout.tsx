import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

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
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  )
}