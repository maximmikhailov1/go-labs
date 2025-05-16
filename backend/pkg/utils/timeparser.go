package utils

import (
	"fmt"
	"reflect"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/datatypes"
)

type CustomTime datatypes.Date

// String() returns the time in string
func (ct *CustomTime) String() string {
	t := time.Time(*ct).String()
	return t
}

// Register the converter for CustomTime type format as 2006-01-02
var TimeConverter = func(value string) reflect.Value {
	fmt.Println("timeConverter", value)
	if v, err := time.Parse("2006-01-02", value); err == nil {
		return reflect.ValueOf(v)
	}
	return reflect.Value{}
}

func AddDateParser() fiber.ParserType {
	customTime := fiber.ParserType{
		Customtype: CustomTime{},
		Converter:  TimeConverter,
	}
	return customTime
}
