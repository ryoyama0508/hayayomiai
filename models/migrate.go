package models

import "gorm.io/gorm"

func Migrate(db *gorm.DB) {
	// 新しいテーブルを作成したくなったら、以下に追加する
	// db.AutoMigrate(&NewTable{})
	db.AutoMigrate(&History{})
}
