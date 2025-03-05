"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Navigation from "./Navigation"
import Home from "./Home"
import ProfilePage from "./profile/profile-page"
import SubjectManagement from "./teacher/SubjectManagement"
import LabScheduling from "./teacher/LabScheduling"
import GroupSubjectAssignment from "./teacher/GroupSubjectAssignment"
import AllTeachersSchedule from "./teacher/AllTeachersSchedule"
import Spinner from "./Spinner"
import AuthPage from "./AuthPage"
import { checkAuthAndRole, getUser } from "@/app/actions/auth"

const Layout = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState("home")
  const [userRole, setUserRole] = useState<"student" | "tutor" | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Мемоизированный обработчик навигации
  const handlePageChange = useCallback((page: string) => {
    const allowedPages = {
      tutor: [
        "subject-management", 
        "lab-scheduling",
        "group-subject-assignment",
        "all-teachers-schedule"
      ],
      student: ["home", "profile"]
    }

    if (userRole && allowedPages[userRole].includes(page)) {
      const path = page === "home" ? "/" : `/${page}`
      router.replace(path)
      setCurrentPage(page)
    }
  }, [userRole, router])

  // Проверка авторизации и синхронизация страницы
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isAuthenticated, storedRole } = await checkAuthAndRole()
        
        if (!isAuthenticated) {
          router.replace("/auth")
          return
        }

        setIsAuthenticated(true)
        setUserRole(storedRole)

        // Синхронизация страницы из URL
        const pageFromPath = pathname === '/' ? 'home' : pathname.slice(1)
        if (pageFromPath !== currentPage) {
          handlePageChange(pageFromPath)
        }

      } catch (error) {
        console.error("Auth check failed:", error)
        router.replace("/auth")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname])

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole(null)
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem("lastPage")
    localStorage.removeItem("userProfile")
    router.replace("/auth",{scroll:false})
  }
  // Рендер контента через switch
  const renderContent = () => {
    if (isLoading) {
      return <Spinner />
    }

    if (!isAuthenticated) {
      return <AuthPage onLogin={handlePageChange} />
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
    <div className="layout-container">
      {isAuthenticated && (
        <Navigation
          userRole={userRole}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onLogout={handleLogout}
          />
      )}
      
      <main className="content-wrapper">
        {renderContent()}
      </main>
    </div>
  )
}

export default Layout