import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


interface User{
  ID:number,   
	Username:string, 
	PasswordHashed:string, 
  Name:string,
  SecondName:string, 
  Patronymic:string,
  Role:string,
	Group: string,
}

async function getUsers(): Promise<User[]>{
  const result = await fetch('http://127.0.0.1:3222/demo/users')
  return result.json()
}

export default async function Home() {
  const users = await getUsers()
  return (
    <main>
      <div className="grid grid-cols-3 gap-8">
        {users.map(user => (
          <Card key={user.ID} className="flex flex-col justify-between">
            <CardHeader className="flex-row gap-4 items-center">
              <div>
                <CardTitle>
                  {user.Username}
                </CardTitle>
                <CardDescription>{user.Name} зовут</CardDescription>
                <CardContent>
                  <p>{user.Name} {user.SecondName} {user.Patronymic}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <button>Посмотреть статистику</button>
                  {true && <p>Реально жестко</p>}
                </CardFooter>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}
