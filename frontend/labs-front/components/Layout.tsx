"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Navigation from "./Navigation"
import Home from "./Home"
import { getUser, logout } from "@/app/actions/auth"
import ProfilePage from "./profile/profile-page"
import AuthPage from "./AuthPage"
import SubjectManagement from "./teacher/SubjectManagement"
import GroupSubjectAssignment from "./teacher/GroupSubjectAssignment"
import AllTeachersSchedule from "./teacher/AllTeachersSchedule"
import TeacherGrades from "./teacher/TeacherGrades"
import AudienceManagement from "./teacher/AudienceManagement"
import Scoreboard from "./Scoreboard"

interface LayoutProps {
  searchParams?: string;
}


const Layout: React.FC<LayoutProps> = ({ searchParams }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState("home")
  const [userRole, setUserRole] = useState<"student" | "tutor" | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()
  const hasVerifiedAuth = useRef(false)

  useEffect(() => {
    const page = pathname === "/" ? "home" : pathname.slice(1).split("?")[0] ?? "home"
    setCurrentPage(page)

    if (pathname === "/auth") {
      setIsLoggedIn(false)
      setUserRole(null)
      const verifyFromAuth = async () => {
        try {
          const result = await getUser()
          if (result?.success && result?.user) {
            const lastPage = localStorage.getItem("lastPage")
            const params = new URLSearchParams(searchParams ?? "")
            const callbackUrl = params.get("callbackUrl")
            router.replace(callbackUrl || lastPage || "/")
          }
        } catch {
          // not logged in, stay on auth
        }
      }
      verifyFromAuth()
      return
    }

    const storedRole = localStorage.getItem("userRole") as "student" | "tutor" | null
    if (storedRole) {
      setUserRole(storedRole)
      setIsLoggedIn(true)
    }

    if (hasVerifiedAuth.current) return

    const verify = async () => {
      try {
        const result = await getUser()
        hasVerifiedAuth.current = true
        if (result?.success && result?.user) {
          const role = (result.user.role === "tutor" ? "tutor" : "student") as "student" | "tutor"
          setIsLoggedIn(true)
          setUserRole(role)
          localStorage.setItem("isLoggedIn", "true")
          localStorage.setItem("userRole", role)
          localStorage.setItem("userProfile", JSON.stringify(result.user))
          if (role === "tutor" && (pathname === "/" || pathname === "/home")) {
            router.replace("/all-teachers-schedule")
            setCurrentPage("all-teachers-schedule")
          }
        } else {
          hasVerifiedAuth.current = false
          setIsLoggedIn(false)
          setUserRole(null)
          localStorage.removeItem("isLoggedIn")
          localStorage.removeItem("userRole")
          localStorage.removeItem("userProfile")
          localStorage.setItem("lastPage", pathname)
          router.replace("/auth")
        }
      } catch {
        hasVerifiedAuth.current = false
        setIsLoggedIn(false)
        setUserRole(null)
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("userRole")
        localStorage.removeItem("userProfile")
        localStorage.setItem("lastPage", pathname)
        router.replace("/auth")
      }
    }
    verify()
  }, [pathname, searchParams])

  const handleLogin = async (role: "student" | "tutor") => {
    setIsLoggedIn(true)
    setUserRole(role)
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userRole", role)
    
    try {
      const result = await getUser()
      if (result?.success && result?.user) {
        localStorage.setItem("userProfile", JSON.stringify(result.user))
      }
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error)
    }

    const params = new URLSearchParams(searchParams)
    const callbackUrl = params.get("callbackUrl")
    const lastPage = localStorage.getItem("lastPage")
    
    // Перенаправление преподавателей по умолчанию
    const defaultRoute = role === "tutor" ? "/all-teachers-schedule" : "/"
    router.replace(callbackUrl || lastPage || defaultRoute)
    setCurrentPage(callbackUrl?.slice(1) || lastPage?.slice(1) || (role === "tutor" ? "all-teachers-schedule" : "home"))
  }

  const handleLogout = async () => {
    setIsLoggedIn(false)
    setUserRole(null)
    hasVerifiedAuth.current = false
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    localStorage.removeItem("lastPage")
    localStorage.removeItem("userProfile")
    try {
      await logout()
    } catch {
      // очищаем cookie локально на случай если бэкенд недоступен
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    }
    router.replace("/auth", { scroll: false })
  }

  const handlePageChange = (page: string) => {
    if (!isLoggedIn && page !== "auth") {
      localStorage.setItem("lastPage", `/${page}`)
      router.replace("/auth", { scroll: false })
      return
    }
  
    // Сначала обновляем состояние
    setCurrentPage(page)
    
    // Затем выполняем навигацию
    const path = page === "home" ? "/" : `/${page}`
    localStorage.setItem("lastPage", path)
    router.replace(path, { scroll: false })
  }

  const renderContent = () => {
    if (!isLoggedIn || currentPage === "auth") {
      return <AuthPage onLogin={handleLogin} />
    }

    // Автоматическое перенаправление для преподавателей
    if (userRole === "tutor" && (currentPage === "home" || currentPage === "")) {
      router.replace("/all-teachers-schedule")
      return null
    }

    const tutorPages = [
      "subject-management",
      "group-subject-assignment",
      "all-teachers-schedule",
      "grades",
      "audience-management"
    ]

    const studentPages = ["home", "profile", "scoreboard"]

    if (
      (userRole === "tutor" && !tutorPages.includes(currentPage)) ||
      (userRole === "student" && !studentPages.includes(currentPage))
    ) {
      router.replace(userRole === "tutor" ? "/all-teachers-schedule" : "/")
      return null
    }

    switch (currentPage) {
      case "home":
        return <Home />
      case "profile":
        return <ProfilePage />
      case "scoreboard":
        return <Scoreboard />
      case "subject-management":
        return <SubjectManagement />
      case "group-subject-assignment":
        return <GroupSubjectAssignment />
      case "all-teachers-schedule":
        return <AllTeachersSchedule />
      case "grades":
        return <TeacherGrades />
      case "audience-management":
        return <AudienceManagement />
      default:
        return <Home />
    }
  }

  return (
    <div className="space-y-8 h-full mx-auto p-0">
      <div className="bg-gray-50 min-h-full">
        <Navigation
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          setCurrentPage={handlePageChange}
          userRole={userRole}
          currentPage={currentPage}
        />
        <main
          className={`
            mx-auto
            ${currentPage === "auth" ? "px-0 max-w-md" : "container px-4 sm:px-6 lg:px-8"}
            pt-6 pb-8 transition-all duration-300`}
        >
          <div className={currentPage === "auth" ? "" : "bg-white rounded-lg shadow-sm p-6"}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );

 
}

export default Layout