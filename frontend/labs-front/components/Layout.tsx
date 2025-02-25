"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Navigation from "./Navigation"
import Home from "./Home"
import { ProfilePage } from "./profile/profile-page"
import AuthPage from "./AuthPage"
import SubjectManagement from "./teacher/SubjectManagement"
import LabScheduling from "./teacher/LabScheduling"
import GroupSubjectAssignment from "./teacher/GroupSubjectAssignment"
import AllTeachersSchedule from "./teacher/AllTeachersSchedule"

const Layout: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState("home")
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<"student" | "tutor" | null>(null)

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn")
    const storedUserRole = localStorage.getItem("userRole") as "student" | "tutor" | null

    if (loggedInStatus === "true") {
      setIsLoggedIn(true)
      setUserRole(storedUserRole)
    }

    const path = window.location.pathname
    if (path === "/profile") {
      setCurrentPage("profile")
    } else if (path === "/auth" && loggedInStatus !== "true") {
      setCurrentPage("auth")
    } else {
      setCurrentPage("home")
    }

    setIsLoading(false)
  }, [])

  const handleLogin = (role: "student" | "tutor") => {
    setIsLoggedIn(true)
    setUserRole(role)
    setCurrentPage("home")
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userRole", role)
    window.history.pushState(null, "", "/")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole(null)
    setCurrentPage("auth")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    window.history.pushState(null, "", "/auth")
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
    if (page === "profile") {
      window.history.pushState(null, "", "/profile")
    } else if (page === "home") {
      window.history.pushState(null, "", "/")
    } else {
      window.history.pushState(null, "", `/${page}`)
    }
  }

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        setCurrentPage={handlePageChange}
        userRole={userRole}
      />
      <main className="w-full max-w-full p-4">
        {isLoggedIn ? (
          <>
            {currentPage === "home" && <Home />}
            {currentPage === "profile" && <ProfilePage />}
            {userRole === "tutor" && (
              <>
                {currentPage === "subject-management" && <SubjectManagement />}
                {currentPage === "lab-scheduling" && <LabScheduling />}
                {currentPage === "group-subject-assignment" && <GroupSubjectAssignment />}
                {currentPage === "all-teachers-schedule" && <AllTeachersSchedule />}
              </>
            )}
          </>
        ) : (
          <AuthPage onLogin={handleLogin} />
        )}
      </main>
    </div>
  )
}

export default Layout

