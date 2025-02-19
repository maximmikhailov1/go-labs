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

  const Schedule = () => {
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
    const [scheduleData, setScheduleData] = useState<WeekSchedule[]>([])
  
    useEffect(() => {
      fetchScheduleData()
    }, []) // Removed unnecessary dependency: currentWeekIndex
  
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
  
    const renderTimeSlots = (date: string) => {
      return TIME_SLOTS.map((slot, index) => {
        const scheduleItem = scheduleData[currentWeekIndex]?.find(
          (item) => item.LabDate.split("T")[0] === date && item.ClassNumber === index + 1,
        )
        const isScheduled = !!scheduleItem
  
        return (
          <div
          key={index}
          className={`border p-2 h-48 ${isScheduled ? "bg-green-100" : ""}`} // Увеличена высота с h-24 до h-32
        >
            <div className="text-black time-slot">{slot}</div>
            {isScheduled && (
              <div className="text-green-600 text-sm">
                <div>{scheduleItem.AudienceNumber}</div>
                <div>{scheduleItem.Tutor}</div>
                <div>К: {scheduleItem.SwitchesRemaining} М: {scheduleItem.RoutersRemaining}</div>
                <Button onClick={() => handleEnroll(date, index + 1)} className="mt-12 w-full" size="sm">
                Записаться
              </Button>
              </div>
            )}
          </div>
        )
      })
    }
    const handleEnroll = async (date: string, slotNumber: number) => {
      try {
        const result = await enrollInClass(date, slotNumber)
        if (result.success) {
          console.log("Успешно записались на занятие")
          // Здесь можно добавить обновление UI или перезагрузку данных
        } else {
          console.error("Ошибка при записи на занятие:", result.error)
        }
      } catch (error) {
        console.error("Ошибка при отправке запроса на запись:", error)
      }
    }
    const getDaysOfWeek = (weekIndex: number) => {
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1 + weekIndex * 7))
      return Array(7)
        .fill(null)
        .map((_, i) => {
          const day = new Date(startOfWeek)
          day.setDate(startOfWeek.getDate() + i)
          return day.toISOString().split("T")[0]
        })
    }
  
    return (
      <div className="mt-4">
        <div className="flex justify-between mb-4">
          <Button onClick={() => setCurrentWeekIndex((prev) => Math.max(prev - 1, 0))} disabled={currentWeekIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Предыдущая неделя
          </Button>
          <Button onClick={() => setCurrentWeekIndex((prev) => prev + 1)} disabled={currentWeekIndex === 2}>
            Следующая неделя
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {getDaysOfWeek(currentWeekIndex).map((date, index) => (
            <div key={index} className="border">
              <div className="bg-gray-100 p-2 font-bold">{date}</div>
              {renderTimeSlots(date)}
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default Schedule
  
  