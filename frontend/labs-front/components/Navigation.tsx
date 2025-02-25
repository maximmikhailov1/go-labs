"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { User, Book, Calendar, Users, Clock } from "lucide-react"

interface NavigationProps {
  isLoggedIn: boolean
  onLogout: () => void
  setCurrentPage: (page: string) => void
  userRole: "student" | "tutor" | null
}

const Navigation: React.FC<NavigationProps> = ({ isLoggedIn, onLogout, setCurrentPage, userRole }) => {
  return (
    <nav className="flex w-full max-w-full px-24 justify-between items-center p-4 bg-gray-100">
      <Button variant="link" className="text-xl font-bold p-0" onClick={() => setCurrentPage("home")}>
        Расписание
      </Button>
      {isLoggedIn && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setCurrentPage("home")}>
            Главная
          </Button>
          <Button variant="ghost" onClick={() => setCurrentPage("profile")}>
            <User className="h-4 w-4 mr-2" />
            Профиль
          </Button>
          {userRole === "tutor" && (
            <>
              <Button variant="ghost" onClick={() => setCurrentPage("subject-management")}>
                <Book className="h-4 w-4 mr-2" />
                Управление предметами
              </Button>
              <Button variant="ghost" onClick={() => setCurrentPage("lab-scheduling")}>
                <Calendar className="h-4 w-4 mr-2" />
                Планирование занятий
              </Button>
              <Button variant="ghost" onClick={() => setCurrentPage("group-subject-assignment")}>
                <Users className="h-4 w-4 mr-2" />
                Назначение предметов
              </Button>
              <Button variant="ghost" onClick={() => setCurrentPage("all-teachers-schedule")}>
                <Clock className="h-4 w-4 mr-2" />
                Расписание преподавателей
              </Button>
            </>
          )}
          <Button onClick={onLogout}>Выйти</Button>
        </div>
      )}
    </nav>
  )
}

export default Navigation

