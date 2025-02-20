"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  isLoggedIn: boolean
  onLogout: () => void
  setCurrentPage: (page: string) => void
}

const Navigation: React.FC<NavigationProps> = ({ isLoggedIn, onLogout, setCurrentPage }) => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100">
      <Link href="/" className="text-xl font-bold" onClick={() => setCurrentPage("home")}>
        Расписание
      </Link>
      {isLoggedIn && (
        <div>
          <Button variant="ghost" onClick={() => setCurrentPage("home")} className="mr-4">
            Главная
          </Button>
          <Button onClick={onLogout}>Выйти</Button>
        </div>
      )}
    </nav>
  )
}

export default Navigation

