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
          <div key={index} className={`border p-4 min-h-[160px] ${isScheduled ? "bg-green-100" : ""}`}>
            <div className="text-black time-slot">{slot}</div>
            {isScheduled && scheduleItem && (
              <div className="text-green-600 text-sm mt-2 space-y-1">
                <div className="font-bold text-base">Занятие</div>
                <div>Аудитория: {scheduleItem.AudienceNumber}</div>
                <div>Преподаватель: {scheduleItem.Tutor}</div>
                <div>Свитчи: {scheduleItem.SwitchesRemaining}</div>
                <div>Роутеры: {scheduleItem.RoutersRemaining}</div>
                <Button onClick={() => handleEnroll(date, index + 1)} className="mt-2 w-full" size="sm">
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
      <div className="mt-4 w-full max-w-[2000px] mx-auto px-4">
        <div className="flex justify-between mb-4">
        <Button
          onClick={() => setCurrentWeekIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentWeekIndex === 0}
          size="lg"
          className="text-base"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
            Предыдущая неделя
          </Button>
          <Button
          onClick={() => setCurrentWeekIndex((prev) => prev + 1)}
          disabled={currentWeekIndex === 2}
          size="lg"
          className="text-base"
        >            
        Следующая неделя
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {getDaysOfWeek(currentWeekIndex).map((date, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-4 text-center border-b">
            <div className="font-bold text-lg mb-1">{WEEKDAYS[index]}</div>
            <div className="text-gray-600">{date}</div>
          </div>
              {renderTimeSlots(date)}
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default Schedule
  
  