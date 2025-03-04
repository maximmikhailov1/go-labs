"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname} from "next/navigation"
import Navigation from "./Navigation"
import Home from "./Home"
import {checkAuth, getUser} from "@/app/actions/auth"
import { ProfilePage } from "./profile/profile-page"
import AuthPage from "./AuthPage"
import SubjectManagement from "./teacher/SubjectManagement"
import LabScheduling from "./teacher/LabScheduling"
import GroupSubjectAssignment from "./teacher/GroupSubjectAssignment"
import AllTeachersSchedule from "./teacher/AllTeachersSchedule"
import Spinner from "./Spinner"
import { toast } from "sonner"


interface LayoutProps {
  searchParams?: string;
}


const Layout: React.FC<LayoutProps> = ({ searchParams }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState("home")
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<"student" | "tutor" | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initialize = async () => {
      const loggedInStatus = localStorage.getItem("isLoggedIn")
      getAndSetUserRole()
      const lastPage = localStorage.getItem("lastPage")
  
      if (loggedInStatus === "true" && userRole) {
        setIsLoggedIn(true)
        setUserRole(userRole)

        // Перенаправление преподавателей на страницу расписания
        if (userRole === "tutor" && (pathname === "/" || pathname === "/home")) {
          router.replace("/all-teachers-schedule")
          setCurrentPage("all-teachers-schedule")
          return
        }

        if (pathname === "/auth") {
          const params = new URLSearchParams(searchParams)
          const callbackUrl = params.get("callbackUrl")
          router.replace(callbackUrl || lastPage || (userRole === "tutor" ? "/all-teachers-schedule" : "/"))
        }
      } else {
        if (pathname !== "/auth") {
          localStorage.setItem("lastPage", pathname)
          router.replace("/auth")
        }
        setIsLoggedIn(false)
        setUserRole(null)
      }
  
      const page = pathname === "/" ? "home" : pathname.slice(1)
      setCurrentPage(page)
      setIsLoading(false)
    }
  
    initialize()
  }, [pathname, router, searchParams])

  const getAndSetUserRole = async () => {
    try {
      const result = await checkAuth()
      if (result.success && result.userRole){
        setUserRole(result.userRole)
      }
    } catch (error) {
      toast.error("Попытка перейти на страницу, которая не предназначается пользователю")
    }
  }

  const handleLogin = async (role: "student" | "tutor") => {
    setIsLoggedIn(true)
    setUserRole(role)
    localStorage.setItem("isLoggedIn", "true")
    
    try {
      const result = await getUser()
      if (result.success && result.user) {
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

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole(null)
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("lastPage")
    localStorage.removeItem("userProfile")
    router.replace("/auth",{scroll:false})
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
      "lab-scheduling",
      "group-subject-assignment",
      "all-teachers-schedule"
    ]

    const studentPages = ["home", "profile"]

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
      case "subject-management":
        return <SubjectManagement />
      case "lab-scheduling":
        return <LabScheduling />
      case "group-subject-assignment":
        return <GroupSubjectAssignment />
      case "all-teachers-schedule":
        return <AllTeachersSchedule />
      default:
        return <Home />
    }
  }

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-8 h-full mx-auto p-0">
            <div className=" bg-gray-50 min-h-full">
              <Navigation
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                setCurrentPage={handlePageChange}
                userRole={userRole}
                currentPage={currentPage} />
              <main 
                className={`
                  mx-auto 
                  ${currentPage === "auth" ? "px-0 max-w-md" : "container px-4 sm:px-6 lg:px-8"}
                  pt-6 pb-8 transition-all duration-300`}>
                  <div className={currentPage === "auth" ? "" : "bg-white rounded-lg shadow-sm p-6"}>
                    {renderContent()}
                  </div>
              </main>
            </div>
        </div>
      )}
    </>
  );

 
}

export default Layout

