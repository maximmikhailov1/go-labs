"use client"

import type React from "react"
import { useState } from "react"
import Navigation from "./Navigation"
import { TabsDemo } from "./tabs-demo"
import Schedule from "./Schedule"

const Layout: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState("home")

  const handleLogin = () => {
    setIsLoggedIn(true)
    setCurrentPage("home")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage("auth")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation isLoggedIn={isLoggedIn} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
      <main className="container mx-auto p-4">
        {isLoggedIn ? (
          currentPage === "home" ? (
            <>
              <h1 className="text-2xl font-bold mb-4">Расписание на неделю</h1>
              <Schedule />
            </>
          ) : (
            <p>Другие страницы можно добавить здесь</p>
          )
        ) : (
          <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
            <TabsDemo onLogin={handleLogin} />
          </div>
        )}
      </main>
    </div>
  )
}

export default Layout

