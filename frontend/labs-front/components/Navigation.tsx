"use client"
import { Button } from "@/components/ui/button"
import { User, Book, Calendar, Users, HomeIcon, DoorClosed } from "lucide-react"
import React from "react"

interface NavigationProps {
  userRole: "student" | "tutor" | null
  currentPage: string
  onPageChange: (page: string) => void
  onLogout: () => void
}

const tutorPages = [
  { id: "all-teachers-schedule", icon: Calendar, title: "Расписание преподавателей" },
  { id: "lab-scheduling", icon: Book, title: "Планирование занятий" },
  { id: "subject-management", icon: Users, title: "Управление предметами" },
  { id: "group-subject-assignment", icon: Users, title: "Назначение предметов" }
]

const studentPages = [
  { id: "home", icon: HomeIcon, title: "Главная" },
  { id: "profile", icon: User, title: "Профиль" }
]

const Navigation: React.FC<NavigationProps> = ({ 
  userRole, 
  currentPage,
  onPageChange,
  onLogout
}) => {
  const handleNavigation = (page: string) => {
    if (page !== currentPage) {
      onPageChange(page)
    }
  }

  const renderButtons = (pages: typeof tutorPages) => (
    pages.map(({ id, icon: Icon, title }) => (
      <Button
        key={id}
        variant={currentPage === id ? "default" : "ghost"}
        onClick={() => handleNavigation(id)}
        className={`rounded-full h-10 w-10 p-0 transition-colors ${
          currentPage === id 
            ? "bg-blue-600 text-white hover:bg-blue-700" 
            : "bg-white hover:bg-gray-200"
        }`}
        title={title}
      >
        <Icon className="h-5 w-5" />
      </Button>
    ))
  )

  return (
    <nav className="w-full mt-0 pt-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center h-14">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 shadow-inner">
            
            {userRole === "student" && renderButtons(studentPages)}
            {userRole === "tutor" && renderButtons(tutorPages)}

            <Button 
              onClick={onLogout}
              className="rounded-full h-10 bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
              title="Выйти"
            >
              <DoorClosed className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation