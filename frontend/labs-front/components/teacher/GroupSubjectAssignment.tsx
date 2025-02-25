"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const GroupSubjectAssignment: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Здесь будет логика отправки данных на сервер
    console.log("Assignment:", { selectedGroup, selectedSubject })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Назначение предмета группе</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select onValueChange={setSelectedGroup} value={selectedGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите группу" />
            </SelectTrigger>
            <SelectContent>
              {/* Здесь будет список групп */}
              <SelectItem value="group1">Группа 1</SelectItem>
              <SelectItem value="group2">Группа 2</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedSubject} value={selectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите предмет" />
            </SelectTrigger>
            <SelectContent>
              {/* Здесь будет список предметов */}
              <SelectItem value="subject1">Предмет 1</SelectItem>
              <SelectItem value="subject2">Предмет 2</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Назначить предмет</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default GroupSubjectAssignment

