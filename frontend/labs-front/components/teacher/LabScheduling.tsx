"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const LabScheduling: React.FC = () => {
  const [labDate, setLabDate] = useState("")
  const [classNumber, setClassNumber] = useState("")
  const [audienceNumber, setAudienceNumber] = useState("")
  const [selectedTutor, setSelectedTutor] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Здесь будет логика отправки данных на сервер
    console.log("Lab scheduled:", { labDate, classNumber, audienceNumber, selectedTutor })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Планирование лабораторного занятия</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="date" value={labDate} onChange={(e) => setLabDate(e.target.value)} />
          <Select onValueChange={setClassNumber} value={classNumber}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите номер пары" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Номер аудитории"
            value={audienceNumber}
            onChange={(e) => setAudienceNumber(e.target.value)}
          />
          <Select onValueChange={setSelectedTutor} value={selectedTutor}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите преподавателя" />
            </SelectTrigger>
            <SelectContent>
              {/* Здесь будет список преподавателей */}
              <SelectItem value="tutor1">Преподаватель 1</SelectItem>
              <SelectItem value="tutor2">Преподаватель 2</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Запланировать занятие</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default LabScheduling

