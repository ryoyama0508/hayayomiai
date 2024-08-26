package migrate

import (
	"fmt"
	"hayayomiai/models"
	"log"
	"os"

	"github.com/spf13/cobra"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func initDB() error {
	var err error
	dsn := os.Getenv("DATABASE_URL")
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}
	return nil
}

var Cmd = &cobra.Command{
	Use:   "migrate",
	Short: "Run database migrations",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Running migrations...")
		err := initDB()
		if err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
		models.Migrate(db)
		fmt.Println("Migrations completed successfully.")
	},
}
