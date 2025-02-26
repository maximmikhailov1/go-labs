"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BookOpen, FlaskConical } from "lucide-react"

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
    <div className="space-y-8 max-w-3xl mx-auto p-4">
      <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Создание нового предмета
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <form onSubmit={handleSubjectSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Название предмета *</label>
              <Input
                placeholder="Введите название предмета"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Описание предмета</label>
              <Textarea
                placeholder="Добавьте описание предмета"
                value={subjectDescription}
                onChange={(e) => setSubjectDescription(e.target.value)}
                className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 min-h-[120px]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-sm"
            >
              Создать предмет
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-6 w-6 text-green-600" />
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Создание лабораторной работы
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <form onSubmit={handleLabSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Номер работы *</label>
                <Input
                  placeholder="Номер лабораторной"
                  value={labNumber}
                  onChange={(e) => setLabNumber(e.target.value)}
                  className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Макс. студентов *</label>
                <Input
                  type="number"
                  placeholder="Максимальное количество"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                  className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Описание работы *</label>
              <Textarea
                placeholder="Подробное описание лабораторной"
                value={labDescription}
                onChange={(e) => setLabDescription(e.target.value)}
                className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Роутеры *</label>
                <Input
                  type="number"
                  placeholder="Количество роутеров"
                  value={routersRequired}
                  onChange={(e) => setRoutersRequired(e.target.value)}
                  className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Свитчи *</label>
                <Input
                  type="number"
                  placeholder="Количество свитчей"
                  value={switchesRequired}
                  onChange={(e) => setSwitchesRequired(e.target.value)}
                  className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-lg bg-green-600 hover:bg-green-700 h-12 text-lg shadow-sm"
            >
              Создать лабораторную
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubjectManagement