package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/backend/api/controllers"
	"github.com/maximmikhailov1/go-labs/backend/api/middleware"
)

func SetupRoutes(app *fiber.App) {
	//Static files mounting
	app.Static("/static", "./public/assets")
	//MIDDLEWARE
	app.Use(middleware.Authorized)
	//new
	app.Get("/api/subjects", controllers.SubjectIndex)   //возвращает список предметов secure
	app.Post("/api/subjects", controllers.SubjectCreate) // secure

	app.Get("/api/labs/", controllers.LabsFirstBySubject)
	app.Get("/api/user/labs", controllers.UserLabsIndex)

	app.Post("/api/records", controllers.RecordCreate) //secure

	app.Get("/api/user", controllers.UserFirst)
	app.Get("/api/user/teams", controllers.UserTeamsIndex)
	app.Post("/api/user/teams", controllers.TeamCreate)
	app.Get("/api/tutors", controllers.TutorsIndex)
	app.Get("/api/schedule", controllers.ScheduleWeek)
	app.Post("/api/schedule", controllers.ScheduleCreate) //secure
	app.Get("/demo/users", controllers.UsersIndex)        //secure
	app.Post("/api/enroll", controllers.Enroll)
	app.Patch("/api/user/teams", controllers.TeamChangeName) // предполагается query с кодом
	app.Put("/api/user/teams", controllers.TeamEnter)        // предполагается query с кодом
	app.Delete("api/user/teams", controllers.TeamLeave)
	app.Get("api/user/records", controllers.UserRecords)
	app.Get("/api/check-auth", controllers.CheckAuth)
	app.Post("/api/labs", controllers.LabCreate)             // создаёт новую лабу
	app.Post("/api/groups", controllers.GroupCreate)         //создает новую группу
	app.Get("/api/groups", controllers.GroupsIndex)          //возвращает список групп с Subject
	app.Patch("/api/groups", controllers.GroupUpdateSubject) // обновляет предмет у группы
	app.Delete("/api/user/records", controllers.UnsubRecord) // recordId + tutor: studentID отписка
	//*new
	//API Routes
	app.Post("/api/signin", controllers.SingIn)
	app.Post("/api/signup", controllers.SignUp)
	app.Post("/api/logout", controllers.Logout)
	//RECORDS
	app.Get("/api/records", controllers.RecordsGet)
	app.Get("/api/records/dates", controllers.RecordsDatesGet)
	app.Get("/api/records/times/:date", controllers.RecordsClassesGet)
	app.Get("/api/records/:id", controllers.RecordIndex)
	app.Delete("/api/records/:id", controllers.RecordDelete) //secure
	//LABS

	// app.Get("/api/labs", controllers.LabsGet)
	app.Delete("/api/labs/:id", controllers.LabDelete) // secure
	app.Get("/api/labs/numbers", controllers.LabsNumbersGet)
	//STUDENTS

	// app.Get("/api/student-info")
	app.Get("/api/student/:id", controllers.StudentGetRecords)

}
