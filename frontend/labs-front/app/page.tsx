"use client"
import Schedule from "@/components/Schedule"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Расписание на неделю</h1>
        <Schedule />
      </main>
    </div>
  )
}

