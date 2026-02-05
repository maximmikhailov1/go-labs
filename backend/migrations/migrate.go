package migrations

import (
	models2 "github.com/maximmikhailov1/go-labs/backend/internal/models"
	"github.com/maximmikhailov1/go-labs/backend/pkg/database"
	"github.com/maximmikhailov1/go-labs/backend/pkg/utils"
)

func init() {
	utils.LoadEnvVariables()
	database.ConnectToDB()
}

func Migrate() {
	database.DB.AutoMigrate(
		&models2.Subject{},
		&models2.Lab{},
		&models2.Group{},
		&models2.User{},
		&models2.Team{},
		&models2.Record{},
		&models2.Entry{},
		&models2.Audience{},
	)
}
