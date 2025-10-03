package main

import (
	"log"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"

	"github.com/Manishk5507/gaMerZ/backend/internal/httpapi"
)

func main() {
	rand.Seed(time.Now().UnixNano())
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	allowedOrigins := []string{"http://localhost:5173"}
	if ao := os.Getenv("ALLOWED_ORIGINS"); ao != "" { // comma separated override
		allowedOrigins = strings.Split(ao, ",")
	}
	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	})

	r.Mount("/api", httpapi.NewRouter())

	// Serve built frontend (SPA) if dist directory exists. FRONTEND_DIR env can override.
	distDir := os.Getenv("FRONTEND_DIR")
	if distDir == "" { distDir = filepath.Join("..", "frontend", "dist") }
	if info, err := os.Stat(distDir); err == nil && info.IsDir() {
		log.Printf("serving frontend from %s", distDir)
		r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
			// Let /api/* be handled by mounted router (shouldn't reach here, but guard anyway)
			if strings.HasPrefix(r.URL.Path, "/api/") { http.NotFound(w, r); return }
			// Map path to file inside dist; fallback to index.html for SPA routes
			reqPath := r.URL.Path
			if reqPath == "/" { reqPath = "/index.html" }
			// Prevent directory traversal
			safe := filepath.Clean(strings.TrimPrefix(reqPath, "/"))
			filePath := filepath.Join(distDir, safe)
			if fi, err := os.Stat(filePath); err == nil && !fi.IsDir() {
				http.ServeFile(w, r, filePath)
				return
			}
			// Fallback to index.html
			http.ServeFile(w, r, filepath.Join(distDir, "index.html"))
		})
	} else {
		log.Printf("frontend dist dir not found, skipping static serve: %s", distDir)
	}

	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("server listening on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
