package main

import (
	"fmt"
	"os"

	"hayayomiai/cobra/migrate"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "hayayomiai",
	Short: "HayayomiAI is a book summary generator",
}

func main() {
	// 新しいコマンドはここに追加する
	rootCmd.AddCommand(migrate.Cmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
