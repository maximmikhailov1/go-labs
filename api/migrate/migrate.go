package main

import (
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()
}

func main() {
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
