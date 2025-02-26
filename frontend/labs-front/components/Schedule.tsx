"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { enrollInClass } from "@/app/actions/auth"

type ScheduleItem = {
  ID: number
  LabDate: string
  ClassNumber: number
  AudienceNumber: number
  Tutor: string
  SwitchesRemaining: number
  RoutersRemaining: number
}

type WeekSchedule = ScheduleItem[]

const TIME_SLOTS = [
  "08:50-10:20",
  "10:35-12:05", 
  "12:35-14:05", 
  "14:15-15:45", 
  "15:55-17:20", 
  "17:30-19:00"]

  const WEEKDAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"]

  const Schedule = () => {
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
    const [scheduleData, setScheduleData] = useState<WeekSchedule[]>([])
  
    useEffect(() => {
      console.log('Запрос данных профиля');

      fetchScheduleData()
    }, [])
  
    const fetchScheduleData = async () => {
      try {
        const response = await fetch(`/api/schedule?week=${currentWeekIndex}`)
        const data = await response.json()
        setScheduleData((prevData) => {
          const newData = [...prevData]
          newData[currentWeekIndex] = data
          return newData
        })
      } catch (error) {
        console.error("Error fetching schedule data:", error)
      }
    }
  
    const handleEnroll = async (date: string, slotNumber: number) => {
      try {
        const result = await enrollInClass(date, slotNumber)
        if (result.success) {
          console.log("Успешно записались на занятие")
          fetchScheduleData() // Обновляем данные после успешной записи
        } else {
          console.error("Ошибка при записи на занятие:", result.error)
        }
      } catch (error) {
        console.error("Ошибка при отправке запроса на запись:", error)
      }
    }
  
    const renderTimeSlots = (date: string) => {
      return TIME_SLOTS.map((slot, index) => {
        let scheduleItem
        try {
          scheduleItem = scheduleData[currentWeekIndex]?.find((item) => {
            if (!item || !item.LabDate) {
              console.warn(`Invalid item found for date ${date}, slot ${index + 1}:`, item)
              return false
            }
            return item.LabDate.split("T")[0] === date && item.ClassNumber === index + 1
          })
        } catch (error) {
          console.error(`Error processing schedule data for date ${date}, slot ${index + 1}:`, error)
        }
  
        const isScheduled = !!scheduleItem
  
        return (
          <div 
            key={index} 
            className={`
              p-4 min-h-[160px] border-b border-gray-200 last:border-b-0
              ${isScheduled ? "bg-green-50 hover:bg-green-100" : "bg-white hover:bg-gray-50"}
              transition-colors duration-150
            `}
          >
            <div className="text-gray-600 font-medium text-sm mb-2">{slot}</div>
            {isScheduled && scheduleItem && (
              <div className="text-gray-800 space-y-2">
                <div className="font-semibold text-base text-green-700">Доступное занятие</div>
                <div className="flex items-center text-sm">
                  <span className="w-24 text-gray-500">Аудитория:</span>
                  <span className="font-medium">{scheduleItem.AudienceNumber}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-24 text-gray-500">Преподаватель:</span>
                  <span className="font-medium truncate">{scheduleItem.Tutor}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-24 text-gray-500">Свитчи:</span>
                  <span className={`font-medium ${scheduleItem.SwitchesRemaining < 3 ? "text-red-600" : "text-green-600"}`}>
                    {scheduleItem.SwitchesRemaining}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-24 text-gray-500">Роутеры:</span>
                  <span className={`font-medium ${scheduleItem.RoutersRemaining < 3 ? "text-red-600" : "text-green-600"}`}>
                    {scheduleItem.RoutersRemaining}
                  </span>
                </div>
                <Button 
                  onClick={() => handleEnroll(date, index + 1)} 
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  Записаться
                </Button>
              </div>
            )}
          </div>
        )
      })
    }
  
    const getDaysOfWeek = (weekIndex: number) => {
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1 + weekIndex * 7))
      return Array(5)
        .fill(null)
        .map((_, i) => {
          const day = new Date(startOfWeek)
          day.setDate(startOfWeek.getDate() + i)
          return day.toISOString().split("T")[0]
        })
    }
  

    return (
      <div className="w-full max-w-[2000px] mx-auto px-4">
        <div className="flex justify-between mb-6 gap-4">
          <Button
          onClick={() => setCurrentWeekIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentWeekIndex === 0}
          size="lg"
          className="text-base bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Предыдущая неделя
        </Button>
        <Button
          onClick={() => setCurrentWeekIndex((prev) => prev + 1)}
          disabled={currentWeekIndex === 2}
          size="lg"
          className="text-base bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm"
        >            
        Следующая неделя
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {getDaysOfWeek(currentWeekIndex).map((date, index) => (
          <div 
            key={index} 
            className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="font-bold text-gray-800 text-lg mb-1">{WEEKDAYS[index]}</div>
              <div className="text-gray-500 text-sm font-medium">
                {new Date(date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
            {renderTimeSlots(date)}
          </div>
        ))}
      </div>
    </div>
  )
  }
  
  export default Schedule
  
  