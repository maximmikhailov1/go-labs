"use client"
import type React from "react"

interface SpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  color?: "blue" | "white" | "gray"
}

const Spinner: React.FC<SpinnerProps> = ({
  className = "",
  size = "md",
  color = "blue"
}) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4"
  }

  const colorClasses = {
    blue: "border-blue-500 border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-400 border-t-transparent"
  }

  return (
    <div
      className={`animate-spin rounded-full ${
        sizeClasses[size]
      } ${colorClasses[color]} ${className}`}
      role="status"
    >
      <span className="sr-only">Загрузка...</span>
    </div>
  )
}

export default Spinner