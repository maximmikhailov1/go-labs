import type React from "react"
import { TabsDemo } from "./tabs-demo"

interface AuthPageProps {
  onLogin: (role: "student" | "tutor") => void
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      <TabsDemo onLogin={onLogin} />
    </div>
  )
}

export default AuthPage

