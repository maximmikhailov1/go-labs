"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, BookOpen } from "lucide-react"

const GroupSubjectAssignment: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Имитация отправки данных
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Assignment:", { selectedGroup, selectedSubject })
      // Здесь будет логика отправки данных на сервер
    } catch (error) {
      console.error("Ошибка:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Назначение предмета группе
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Группа
              </label>
              <Select 
                onValueChange={setSelectedGroup} 
                value={selectedGroup}
                disabled={isSubmitting}
              >
                <SelectTrigger className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 h-12">
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-lg border border-gray-200">
                  <SelectItem value="group1" className="hover:bg-gray-50">
                    Группа 1
                  </SelectItem>
                  <SelectItem value="group2" className="hover:bg-gray-50">
                    Группа 2
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Предмет
              </label>
              <Select 
                onValueChange={setSelectedSubject} 
                value={selectedSubject}
                disabled={isSubmitting}
              >
                <SelectTrigger className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 h-12">
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-lg border border-gray-200">
                  <SelectItem value="subject1" className="hover:bg-gray-50">
                    Предмет 1
                  </SelectItem>
                  <SelectItem value="subject2" className="hover:bg-gray-50">
                    Предмет 2
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-sm"
              disabled={isSubmitting || !selectedGroup || !selectedSubject}
            >
              {isSubmitting ? "Назначение..." : "Назначить предмет"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default GroupSubjectAssignment