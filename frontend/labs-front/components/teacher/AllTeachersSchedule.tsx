"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, User, Book, Home } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"

const AllTeachersSchedule: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Имитация загрузки данных
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockData = [
          { teacher: "Иванов И.И.", date: "2023-06-01", time: "09:00", subject: "Математика", audience: "101" },
          { teacher: "Петров П.П.", date: "2023-06-01", time: "11:00", subject: "Физика", audience: "202" },
          { teacher: "Сидорова С.С.", date: "2023-06-02", time: "13:00", subject: "Информатика", audience: "303" }
        ]
        
        setScheduleData(mockData)
      } catch (error) {
        console.error("Ошибка загрузки данных:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Расписание всех преподавателей
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Преподаватель
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Дата
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Время
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    Предмет
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Аудитория
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  </TableRow>
                ))
              ) : (
                scheduleData.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{item.teacher}</TableCell>
                    <TableCell>
                      {format(new Date(item.date), "d MMMM yyyy", { locale: ru })}
                    </TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>{item.audience}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default AllTeachersSchedule