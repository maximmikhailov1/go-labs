package migrations

import (
	"github.com/maximmikhailov1/go-labs/backend/api/initializers"
	"github.com/maximmikhailov1/go-labs/backend/api/models"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()
}

func Migrate() {
	initializers.DB.AutoMigrate(
		&models.Subject{},
		&models.Lab{},
		&models.Group{},
		&models.User{},
		&models.Team{},
		&models.Record{},
		&models.Entry{},
	)
}
