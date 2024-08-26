package models

import (
	"gorm.io/gorm"
)

type History struct {
	gorm.Model
	Title   string
	Content string
	UserID  uint
}
