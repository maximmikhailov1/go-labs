package routes

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/backend/internal/audience"
	"github.com/maximmikhailov1/go-labs/backend/internal/auth"
	group "github.com/maximmikhailov1/go-labs/backend/internal/groups"
	"github.com/maximmikhailov1/go-labs/backend/internal/lab"
	"github.com/maximmikhailov1/go-labs/backend/internal/middleware"
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"github.com/maximmikhailov1/go-labs/backend/internal/record"
	"github.com/maximmikhailov1/go-labs/backend/internal/schedule"
	"github.com/maximmikhailov1/go-labs/backend/internal/scoreboard"
	"github.com/maximmikhailov1/go-labs/backend/internal/subject"
	team "github.com/maximmikhailov1/go-labs/backend/internal/team"
	"github.com/maximmikhailov1/go-labs/backend/internal/user"
	"github.com/maximmikhailov1/go-labs/backend/pkg/database"
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
	audienceRepo := audience.NewRepository(database.DB)
	scheduleService := schedule.NewService(scheduleRepo, audienceRepo)
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

	audienceService := audience.NewService(audienceRepo)
	audienceHandler := audience.NewHandler(audienceService)

	scoreboardService := scoreboard.NewService(database.DB)
	scoreboardHandler := scoreboard.NewHandler(scoreboardService)

	// Роуты авторизации
	api := app.Group("/api/v1")
	authGroup := api.Group("/auth")
	{
		authGroup.Post("/signin", authHandler.SignIn)
		authGroup.Post("/signup", authHandler.SignUp)
		authGroup.Post("/logout", authHandler.Logout)
		authGroup.Get("/check-auth", authHandler.CheckAuth)
	}
	// Роуты пользователя
	users := api.Group("/users", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		users.Get("/", userHandler.GetProfile)
		users.Get("/tutors", middleware.RoleMiddleware(models.RoleTutor), userHandler.GetTutors)
	}
	// Роуты предметов
	subjects := api.Group("/subjects", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		subjects.Post("/", middleware.RoleMiddleware(models.RoleTutor), subjectHandler.CreateSubject)
		subjects.Get("/", subjectHandler.GetAllSubjects)
	}
	//Роуты расписания
	schedules := api.Group("/schedules", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		schedules.Post("/", middleware.RoleMiddleware(models.RoleTutor), scheduleHandler.CreateSchedule)
		schedules.Delete("/", scheduleHandler.Unsubscribe)
		schedules.Get("/week", scheduleHandler.GetWeekSchedule)
		schedules.Patch("/records/:id", middleware.RoleMiddleware(models.RoleTutor), scheduleHandler.PatchRecordStatus)
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
		labs.Post("/", middleware.RoleMiddleware(models.RoleTutor), labHandler.CreateLab)
		labs.Delete("/:id", middleware.RoleMiddleware(models.RoleTutor), labHandler.DeleteLab)
	}

	records := api.Group("/records", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		records.Get("/", recordHandler.GetUserRecords)
		records.Post("/enroll", middleware.RoleMiddleware(models.RoleStudent), recordHandler.Enroll)
		records.Patch("/entries/:id", middleware.RoleMiddleware(models.RoleTutor), recordHandler.PatchEntryStatus)
	}

	api.Get("/scoreboard", middleware.AuthMiddleware(os.Getenv("SECRET")), middleware.RoleMiddleware(models.RoleStudent), scoreboardHandler.Get)

	groups := api.Group("/groups", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		groups.Post("/", middleware.RoleMiddleware(models.RoleTutor), groupHandler.CreateGroup)
		groups.Get("/", middleware.RoleMiddleware(models.RoleTutor), groupHandler.GetAllGroups)
		groups.Get("/:id/members", middleware.RoleMiddleware(models.RoleTutor), groupHandler.GetGroupMembers)
		groups.Patch("/subject", middleware.RoleMiddleware(models.RoleTutor), groupHandler.UpdateGroupSubject)
		groups.Delete("/:id", middleware.RoleMiddleware(models.RoleTutor), groupHandler.DeleteGroup)
	}

	audiences := api.Group("/audiences", middleware.AuthMiddleware(os.Getenv("SECRET")))
	{
		audiences.Get("/", middleware.RoleMiddleware(models.RoleTutor), audienceHandler.List)
		audiences.Post("/", middleware.RoleMiddleware(models.RoleTutor), audienceHandler.Create)
		audiences.Get("/:id", middleware.RoleMiddleware(models.RoleTutor), audienceHandler.Get)
		audiences.Patch("/:id", middleware.RoleMiddleware(models.RoleTutor), audienceHandler.Update)
		audiences.Delete("/:id", middleware.RoleMiddleware(models.RoleTutor), audienceHandler.Delete)
	}
}
