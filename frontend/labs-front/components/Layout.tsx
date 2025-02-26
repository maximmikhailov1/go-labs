"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Navigation from "./Navigation"
import Home from "./Home"
import {getUser} from "@/app/actions/auth"
import { ProfilePage } from "./profile/profile-page"
import AuthPage from "./AuthPage"
import SubjectManagement from "./teacher/SubjectManagement"
import LabScheduling from "./teacher/LabScheduling"
import GroupSubjectAssignment from "./teacher/GroupSubjectAssignment"
import AllTeachersSchedule from "./teacher/AllTeachersSchedule"
import Spinner from "./Spinner"


const Layout: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState("home")
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<"student" | "tutor" | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn")
    const storedUserRole = localStorage.getItem("userRole") as "student" | "tutor" | null
    const lastPage = localStorage.getItem("lastPage")

    if (loggedInStatus === "true" && storedUserRole) {
      setIsLoggedIn(true)
      setUserRole(storedUserRole)

      if (pathname === "/auth") {
        const callbackUrl = searchParams?.get("callbackUrl")
        router.replace(callbackUrl || lastPage || "/")
      }
    } else {
      if (pathname !== "/auth") {
        localStorage.setItem("lastPage", pathname)
        router.replace("/auth")
      }
      setIsLoggedIn(false)
      setUserRole(null)
    }

    // Устанавливаем текущую страницу на основе pathname
    if (pathname === "/") {
      setCurrentPage("home")
    } else {
      setCurrentPage(pathname.slice(1))
    }

    setIsLoading(false)
  }, [pathname, router, searchParams])

  const handleLogin = async (role: "student" | "tutor") => {
    setIsLoggedIn(true)
    setUserRole(role)
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userRole", role)
    try {
      const result = await getUser();
      if (result.success && result.user) {
        localStorage.setItem("userProfile", JSON.stringify(result.user));
      }
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error);
    }
    const lastPage = localStorage.getItem("lastPage")
    const callbackUrl = searchParams?.get("callbackUrl")
    router.replace(callbackUrl || lastPage || "/")
    setCurrentPage(callbackUrl?.slice(1) || lastPage?.slice(1) || "home")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole(null)
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    localStorage.removeItem("lastPage")
    localStorage.removeItem("userProfile")
    router.replace("/auth",{scroll:false})
  }

  const handlePageChange = (page: string) => {
    if (!isLoggedIn && page !== "auth") {
      localStorage.setItem("lastPage", `/${page}`)
      router.replace("/auth",{scroll:false})
      return
    }

    setCurrentPage(page)
    const path = page === "home" ? "/" : `/${page}`
    localStorage.setItem("lastPage", path)
    router.replace(path,{scroll:false})
  }

  const renderContent = () => {
    if (!isLoggedIn || currentPage === "auth") {
      return <AuthPage onLogin={handleLogin} />
    }

    switch (currentPage) {
      case "home":
        return <Home />
      case "profile":
        return <ProfilePage />
      case "subject-management":
        return userRole === "tutor" ? <SubjectManagement /> : null
      case "lab-scheduling":
        return userRole === "tutor" ? <LabScheduling /> : null
      case "group-subject-assignment":
        return userRole === "tutor" ? <GroupSubjectAssignment /> : null
      case "all-teachers-schedule":
        return userRole === "tutor" ? <AllTeachersSchedule /> : null
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
        <div className="space-y-8 max-w-3xl mx-auto p-4">
             <div className=" bg-gray-50 h-full">
      <Navigation
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        setCurrentPage={handlePageChange}
        userRole={userRole}
      />

<main 
  className={`
    mx-auto 
    ${currentPage === "auth" ? "px-0 max-w-md" : "container px-4 sm:px-6 lg:px-8"}
    pt-6 pb-8 transition-all duration-300
  `}
>
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

