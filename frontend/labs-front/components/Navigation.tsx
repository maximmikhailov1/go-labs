"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { User, Book, Calendar, Users, Clock, HomeIcon } from "lucide-react"

interface NavigationProps {
  isLoggedIn: boolean
  onLogout: () => void
  setCurrentPage: (page: string) => void
  userRole: "student" | "tutor" | null
  currentPage: string
}

const Navigation: React.FC<NavigationProps> = ({ isLoggedIn, onLogout, setCurrentPage, userRole,currentPage }) => {
  return (
<nav className="w-full mt-0 pt-4 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center h-14">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 shadow-inner">
            {isLoggedIn ? (
              <>
              <Button 
                variant={currentPage === "home" ? "default" : "ghost"}
                className={`rounded-full h-10 w-10 p-0 ${currentPage === "home" ? "bg-white shadow-sm" : "hover:bg-white"}`}
                onClick={() => setCurrentPage("home")}
                title="Главная"
              >
                <HomeIcon className="h-5 w-5" />
                </Button>

                <Button 
                  variant="ghost"
                  className={`rounded-full h-10 w-10 p-0 ${currentPage === "profile" ? "bg-white shadow-sm" : "hover:bg-white"}`}
                  onClick={() => setCurrentPage("profile")}
                  title="Профиль"
                >
                  <User className="h-5 w-5" />
                </Button>

                {userRole === "tutor" && (
                  <>
                    <Button 
                      variant="ghost"
                      className={`rounded-full h-10 w-10 p-0 ${currentPage === "subject-management" ? "bg-white shadow-sm" : "hover:bg-white"}`}
                      onClick={() => setCurrentPage("subject-management")}
                      title="Управление предметами"
                    >
                      <Book className="h-5 w-5" />
                    </Button>

                    <Button 
                      variant="ghost"
                      className={`rounded-full h-10 w-10 p-0 ${currentPage === "lab-sceduling" ? "bg-white shadow-sm" : "hover:bg-white"}`}
                      onClick={() => setCurrentPage("lab-scheduling")}
                      title="Планирование занятий"
                    >
                      <Calendar className="h-5 w-5" />
                    </Button>

                    <Button 
                      variant="ghost"
                      className={`rounded-full h-10 w-10 p-0 ${currentPage === "group-subject-assignment" ? "bg-white shadow-sm" : "hover:bg-white"}`}
                      onClick={() => setCurrentPage("group-subject-assignment")}
                      title="Назначение предметов"
                    >
                      <Users className="h-5 w-5" />
                    </Button>

                    <Button 
                      variant="ghost"
                      className={`rounded-full h-10 w-10 p-0 ${currentPage === "all-teachers-schedule" ? "bg-white shadow-sm" : "hover:bg-white"}`}
                      onClick={() => setCurrentPage("all-teachers-schedule")}
                      title="Расписание преподавателей"
                    >
                      <Clock className="h-5 w-5" />
                    </Button>
                  </>
                )}

                <Button 
                  onClick={onLogout}
                  className="rounded-full h-10 bg-red-100 hover:bg-red-200 text-red-600"
                  title="Выйти"
                >
                  <span className="hidden sm:inline">Выйти</span>
                  <span className="inline sm:hidden">🚪</span>
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setCurrentPage("auth")}
                className="rounded-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation