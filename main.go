package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"hayayomiai/models"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
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

// 環境変数
var env string

func initEnv() error {
	err := godotenv.Load()
	if err != nil {
		return err
	}

	env = os.Getenv("GO_ENV")
	if env == "" {
		env = "development"
	}
	return nil
}

func loggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request: %s %s", r.Method, r.URL.Path)
		log.Printf("Request body: %s", requestBody(r))
		next(w, r)
	}
}

func requestBody(r *http.Request) string {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return ""
	}
	defer r.Body.Close()

	r.Body = io.NopCloser(bytes.NewBuffer(body))
	return string(body)
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		allowedOrigin := "http://localhost:3000"
		if env == "production" {
			allowedOrigin = "https://hayayomiai.com"
		}
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func handleSummaryRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Title string `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	summary, err := generateBookSummary(req.Title)
	if err != nil {
		log.Printf("error: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp := map[string]string{"summary": summary}
	json.NewEncoder(w).Encode(resp)
}

func generateBookSummary(bookTitle string) (string, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	url := "https://api.openai.com/v1/chat/completions"

	requestBody, err := json.Marshal(map[string]interface{}{
		"model": "gpt-4o",
		"messages": []map[string]string{
			{"role": "user", "content": "本のタイトル「" + bookTitle + "」の要約をしてください。"},
		},
	})
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(requestBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	log.Printf("summarizing book: %s", bookTitle)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var result map[string]interface{}
	err = json.Unmarshal(body, &result)
	if err != nil {
		return "", fmt.Errorf("failed to parse response: %v", err)
	}

	if errorObj, ok := result["error"].(map[string]interface{}); ok {
		errorMessage := errorObj["message"].(string)
		errorType := errorObj["type"].(string)
		return "", fmt.Errorf("API error: %s (type: %s)", errorMessage, errorType)
	}

	summaries, ok := result["choices"].([]interface{})
	if !ok || len(summaries) == 0 {
		return "", fmt.Errorf("no summaries returned")
	}

	summary, ok := summaries[0].(map[string]interface{})["message"].(map[string]interface{})["content"].(string)
	if !ok {
		return "", fmt.Errorf("invalid response format")
	}

	return summary, nil
}

func handleHealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func handleHistoriesRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
		return
	}

	var histories []models.History
	db.Find(&histories)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(histories)
}

func handleHistoryShowRequest(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var history models.History
	result := db.First(&history, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "History not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to retrieve history", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

func handleHistoryCreateRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Title   string `json:"title"`
		Content string `json:"content"`
		UserId  uint   `json:"user_id"`
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(body, &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	summary := models.History{
		Title:   req.Title,
		Content: req.Content,
		UserID:  req.UserId,
	}

	db.Create(&summary)
}

func initServer() error {
	r := mux.NewRouter()
	r.HandleFunc("/", handleHealthCheck)
	r.HandleFunc("/summary", loggingMiddleware(corsMiddleware(handleSummaryRequest))).Methods("POST")
	r.HandleFunc("/histories", loggingMiddleware(corsMiddleware(handleHistoriesRequest))).Methods("GET")
	r.HandleFunc("/histories/{id:[0-9]+}", loggingMiddleware(corsMiddleware(handleHistoryShowRequest))).Methods("GET")
	r.HandleFunc("/histories/create", loggingMiddleware(corsMiddleware(handleHistoryCreateRequest))).Methods("POST")

	log.Println("Server is running on http://localhost:8080")
	return http.ListenAndServe(":8080", r)
}
func main() {
	err := initEnv()
	if err != nil {
		log.Fatalf("Failed to load environment variables: %v", err)
	}
	log.Println("Loaded environment variables")

	err = initDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Connected to database")

	err = initServer()
	if err != nil {
		log.Fatalf("Server startup failed: %v", err)
	}
}
