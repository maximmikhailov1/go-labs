"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const AllTeachersSchedule: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<any[]>([])

  useEffect(() => {
    // Здесь будет логика загрузки данных с сервера
    // Пример данных:
    const mockData = [
      { teacher: "Иванов И.И.", date: "2023-06-01", time: "09:00", subject: "Математика", audience: "101" },
      { teacher: "Петров П.П.", date: "2023-06-01", time: "11:00", subject: "Физика", audience: "202" },
      // ... другие записи
    ]
    setScheduleData(mockData)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Расписание всех преподавателей</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Преподаватель</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Время</TableHead>
              <TableHead>Предмет</TableHead>
              <TableHead>Аудитория</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduleData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.teacher}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.time}</TableCell>
                <TableCell>{item.subject}</TableCell>
                <TableCell>{item.audience}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default AllTeachersSchedule

