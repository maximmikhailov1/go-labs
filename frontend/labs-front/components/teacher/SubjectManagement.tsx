"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const SubjectManagement: React.FC = () => {
  const [subjectName, setSubjectName] = useState("")
  const [subjectDescription, setSubjectDescription] = useState("")
  const [labNumber, setLabNumber] = useState("")
  const [labDescription, setLabDescription] = useState("")
  const [maxStudents, setMaxStudents] = useState("")
  const [routersRequired, setRoutersRequired] = useState("1")
  const [switchesRequired, setSwitchesRequired] = useState("1")

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Здесь будет логика отправки данных на сервер
    console.log("Subject submitted:", { subjectName, subjectDescription })
  }

  const handleLabSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Здесь будет логика отправки данных на сервер
    console.log("Lab submitted:", { labNumber, labDescription, maxStudents, routersRequired, switchesRequired })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Создание предмета</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubjectSubmit} className="space-y-4">
            <Input
              placeholder="Название предмета"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
            <Textarea
              placeholder="Описание предмета"
              value={subjectDescription}
              onChange={(e) => setSubjectDescription(e.target.value)}
            />
            <Button type="submit">Создать предмет</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Создание лабораторной работы</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLabSubmit} className="space-y-4">
            <Input placeholder="Номер лабораторной" value={labNumber} onChange={(e) => setLabNumber(e.target.value)} />
            <Textarea
              placeholder="Описание лабораторной"
              value={labDescription}
              onChange={(e) => setLabDescription(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Максимальное количество студентов"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Требуемое количество роутеров"
              value={routersRequired}
              onChange={(e) => setRoutersRequired(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Требуемое количество свитчей"
              value={switchesRequired}
              onChange={(e) => setSwitchesRequired(e.target.value)}
            />
            <Button type="submit">Создать лабораторную</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubjectManagement

