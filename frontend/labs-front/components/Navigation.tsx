import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"

const Navigation = () => {
  const router = useRouter()

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      router.push("/auth")
    } else {
      console.error("Ошибка при выходе:", result.error)
      // Here you can add some UI feedback for the user
    }
  }

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100">
      <Link href="/" className="text-xl font-bold">
        Расписание
      </Link>
      <div>
        <Link href="/" className="mr-4">
          <Button variant="ghost">Главная</Button>
        </Link>
        <Button onClick={handleLogout}>Выйти</Button>
      </div>
    </nav>
  )
}

export default Navigation

