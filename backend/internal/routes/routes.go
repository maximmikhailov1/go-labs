package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/backend/internal/auth"
	group "github.com/maximmikhailov1/go-labs/backend/internal/groups"
	"github.com/maximmikhailov1/go-labs/backend/internal/lab"
	"github.com/maximmikhailov1/go-labs/backend/internal/middleware"
	"github.com/maximmikhailov1/go-labs/backend/internal/record"
	"github.com/maximmikhailov1/go-labs/backend/internal/schedule"
	"github.com/maximmikhailov1/go-labs/backend/internal/subject"
	team "github.com/maximmikhailov1/go-labs/backend/internal/team"
	"github.com/maximmikhailov1/go-labs/backend/internal/user"
	"github.com/maximmikhailov1/go-labs/backend/pkg/database"
	"os"
)

func SetupRoutes(app *fiber.App) {

	authRepo := auth.NewAuthRepository(database.DB)
	authService := auth.NewAuthService(authRepo)
	authHandler := auth.NewAuthHandler(authService)

	userRepo := user.NewUserRepository(database.DB)
	userService := user.NewUserService(userRepo)
	userHandler := user.NewUserHandler(userService)

	subjectRepo := subject.NewRepository(database.DB)
	subjectService := subject.NewService(subjectRepo)
	subjectHandler := subject.NewHandler(subjectService)

	scheduleRepo := schedule.NewRepository(database.DB)
	scheduleService := schedule.NewService(scheduleRepo)
	scheduleHandler := schedule.NewHandler(scheduleService)

	teamRepo := team.NewRepository(database.DB)
	teamService := team.NewService(teamRepo)
	teamHandler := team.NewHandler(teamService)

	labRepo := lab.NewRepository(database.DB)
	labService := lab.NewService(labRepo)
	labHandler := lab.NewHandler(labService)

	recordRepo := record.NewRepository(database.DB)
	recordService := record.NewService(recordRepo)
	recordHandler := record.NewHandler(recordService)

	groupRepo := group.NewRepository(database.DB)
	groupService := group.NewService(groupRepo)
	groupHandler := group.NewHandler(groupService)

	// Роуты авторизации
	api := app.Group("/api/v1")
	authGroup := api.Group("/auth")
	{
		authGroup.Post("/signin", authHandler.SignIn)
		authGroup.Post("/signup", authHandler.SignUp)
		authGroup.Post("/logout", authHandler.Logout)
	}
	// Роуты пользователя
	users := api.Group("/users", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		users.Get("/", userHandler.GetProfile)
		users.Get("/tutors", middleware.RoleMiddleware("tutor"), userHandler.GetTutors)
	}
	// Роуты предметов
	subjects := api.Group("/subjects", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		subjects.Post("/", middleware.RoleMiddleware("tutor"), subjectHandler.CreateSubject)
		subjects.Get("/", subjectHandler.GetAllSubjects)
	}
	//Роуты расписания
	schedules := api.Group("/schedules", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		schedules.Post("/", middleware.RoleMiddleware("tutor"), scheduleHandler.CreateSchedule)
		schedules.Delete("/", scheduleHandler.Unsubscribe)
		schedules.Get("/week", scheduleHandler.GetWeekSchedule)
	}

	teams := api.Group("/teams", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		teams.Get("/", teamHandler.GetUserTeams)
		teams.Post("/", teamHandler.CreateTeam)
		teams.Put("/", teamHandler.JoinTeam)
		teams.Delete("/", teamHandler.LeaveTeam)
		teams.Patch("/", teamHandler.UpdateTeamName)
	}

	labs := api.Group("/labs", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		labs.Get("/", labHandler.GetLabsBySubject)
		labs.Get("/my", labHandler.GetUserLabs)
		labs.Get("/numbers", labHandler.GetLabNumbers)
		labs.Post("/", middleware.RoleMiddleware("tutor"), labHandler.CreateLab)
		labs.Delete("/:id", middleware.RoleMiddleware("tutor"), labHandler.DeleteLab)
	}

	records := api.Group("/records", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		records.Get("/", recordHandler.GetUserRecords)
		records.Post("/enroll", middleware.RoleMiddleware("student"), recordHandler.Enroll)
	}

	groups := api.Group("/groups", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		groups.Post("/", middleware.RoleMiddleware("tutor"), groupHandler.CreateGroup)
		groups.Get("/", middleware.RoleMiddleware("tutor"), groupHandler.GetAllGroups)
		groups.Patch("/", middleware.RoleMiddleware("tutor"), groupHandler.UpdateGroupSubject)
	}
	//new
	//app.Get("/api/subjects", handlers.SubjectIndex)   //возвращает список предметов secure
	//app.Post("/api/subjects", handlers.SubjectCreate) // secure

	//app.Get("/api/labs/", handlers.LabsFirstBySubject)
	//app.Get("/api/user/labs", handlers.UserLabsIndex)
	//app.Post("/api/labs", handlers.LabCreate)       // создаёт новую лабу
	//app.Delete("/api/labs/:id", handlers.LabDelete) // secure
	//app.Get("/api/labs/numbers", handlers.LabsNumbersGet)

	// ne isp app.Post("/api/records", handlers.RecordCreate) //secure
	//app.Post("/api/enroll", handlers.Enroll)
	// ne isp app.Get("/api/records", handlers.RecordsGet)
	//app.Get("/api/records/dates", handlers.RecordsDatesGet)
	//app.Get("/api/records/times/:date", handlers.RecordsClassesGet)
	//app.Get("/api/records/:id", handlers.RecordIndex)
	//app.Delete("/api/records/:id", handlers.RecordDelete) //secure
	//app.Delete("/api/user/records", handlers.UnsubRecord) // recordId + tutor: studentID отписка

	//app.Get("/api/users", handlers.UserFirst)
	//app.Get("/api/users/team", handlers.UserTeamsIndex)
	//app.Post("/api/users/team", handlers.TeamCreate)
	//app.Get("/api/tutors", handlers.TutorsIndex)
	//app.Get("/api/schedule", handlers.ScheduleWeek)
	//app.Post("/api/schedule", handlers.ScheduleCreate) //secure
	//app.Patch("/api/user/team", handlers.TeamChangeName) // предполагается query с кодом
	//app.Put("/api/user/team", handlers.TeamEnter)        // предполагается query с кодом
	//app.Delete("api/user/team", handlers.TeamLeave)
	//app.Get("api/user/records", handlers.UserRecords)
	//app.Get("/api/check-auth", handlers.CheckAuth)
	//app.Post("/api/groups", handlers.GroupCreate)         //создает новую группу
	//app.Get("/api/groups", handlers.GroupsIndex)          //возвращает список групп с Subject
	//app.Patch("/api/groups", handlers.GroupUpdateSubject) // обновляет предмет у группы
	//*new
	//LABS

	// app.Get("/api/labs", controllers.LabsGet)

	//STUDENTS

	// app.Get("/api/student-info")
	//app.Get("/api/student/:id", handlers.StudentGetRecords)

}
