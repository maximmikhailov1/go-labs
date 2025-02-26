import type React from "react"
import { TabsDemo } from "./tabs-demo"

interface AuthPageProps {
  onLogin: (role: "student" | "tutor") => void
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-full max-w-md p-4">
        <TabsDemo onLogin={onLogin} />
      </div>
    </div>
  )
}

export default AuthPage