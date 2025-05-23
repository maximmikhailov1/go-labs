package database

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectToDB() {
	var err error
	dsn := os.Getenv("DB_URL")
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		TranslateError:         true,
		SkipDefaultTransaction: false, //Speeds up operations if set to true, but doesn't write an operation in log
	})
	DB.Session(&gorm.Session{FullSaveAssociations: true})
	if err != nil {
		log.Fatal("Failed to connect to database")
	}
}
