"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname} from "next/navigation"
import Navigation from "./Navigation"
import Home from "./Home"
import {checkAuthAndRole, getUser} from "@/app/actions/auth"
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState("home")
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<"student" | "tutor" | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initialize = async () => {
      const { isAuthenticated, storedRole } = await checkAuthAndRole()  

      if (isAuthenticated && storedRole) {
        setIsAuthenticated(true)
        setUserRole(storedRole)

        // Перенаправление преподавателей на страницу расписания
        const pageFromPath = pathname === "/" ? "home" : pathname.slice(1)

        const allowedPages = {
          tutor: [
            "subject-management",
            "lab-scheduling",
            "group-subject-assignment",
            "all-teachers-schedule"
          ],
          student: ["home", "profile"]
        }

        if (!allowedPages[storedRole].includes(pageFromPath)) {
          const defaultRoute = storedRole === "tutor" 
            ? "/all-teachers-schedule" 
            : "/profile" // Изменили дефолтный роут для студента
          router.replace(defaultRoute)
          setCurrentPage(defaultRoute.replace(/^\//, ""))
          return
        }
        setCurrentPage(pageFromPath)

      } else {
        if (pathname !== "/auth") {
          localStorage.setItem("lastPage", pathname)
          router.replace("/auth")
        }
        setIsAuthenticated(false)
        setUserRole(null)
      }
  
      const page = pathname === "/" ? "home" : pathname.slice(1)
      setCurrentPage(page)
      setIsLoading(false)
    }
  
    initialize()
  }, [pathname, router, searchParams])


  const handleLogin = async (role: "student" | "tutor") => {
    const { isAuthenticated, storedRole } = await checkAuthAndRole()

    console.log(isAuthenticated, storedRole)
    if (!isAuthenticated || storedRole !== role) {
      toast.error("Ошибка авторизации")
      return
    }

    setIsAuthenticated(true)
    setUserRole(storedRole)

    try {
      const result = await getUser()
      if (result.success && result.user) {
        localStorage.setItem("userProfile", JSON.stringify(result.user))
      }
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error)
      toast.error("Ошибка загрузки данных пользователя")

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
    setIsAuthenticated(false)
    setUserRole(null)
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem("lastPage")
    localStorage.removeItem("userProfile")
    router.replace("/auth",{scroll:false})
  }

  const handlePageChange = (page: string) => {
    if (!isAuthenticated && page !== "auth") {
      localStorage.setItem("lastPage", `/${page}`)
      router.replace("/auth", { scroll: false })
      return
    }
  
    // Сначала обновляем состояние
    setCurrentPage(page)

    const path = page === "home" ? "/" : `/${page}`
    localStorage.setItem("lastPage", path)
    router.replace(path, { scroll: false })
  }

  const renderContent = () => {
    if (!isAuthenticated || currentPage === "auth") {
      return <AuthPage onLogin={handleLogin} />
    }

    // Упрощенная проверка доступа
    const allowedPages = {
      tutor: [
        "subject-management",
        "lab-scheduling",
        "group-subject-assignment",
        "all-teachers-schedule"
      ],
      student: ["home", "profile"]
    }

    if (!allowedPages[userRole!].includes(currentPage)) {
      router.replace(userRole === "tutor" 
        ? "/all-teachers-schedule" 
        : "/profile") // Перенаправляем студентов на профиль
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
                isLoggedIn={isAuthenticated}
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

