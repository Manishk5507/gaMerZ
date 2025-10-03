package httpapi

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/Manishk5507/gaMerZ/backend/internal/games"
)

func NewRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("ok")) })
	// simple in-memory stores (not for production)
	var (
		muTic   sync.Mutex
		muNum   sync.Mutex
		ticGames = map[string]*games.TicTacToe{}
		numGames = map[string]*games.NumberGuess{}
	)

	r.Route("/games", func(r chi.Router) {
		r.Get("/list", func(w http.ResponseWriter, r *http.Request) {
			resp := []map[string]string{
				{"id": "tictactoe", "name": "Tic Tac Toe"},
				{"id": "numberguess", "name": "Number Guess"},
			}
			writeJSON(w, http.StatusOK, resp)
		})

		// TicTacToe endpoints
		r.Post("/tictactoe/new", func(w http.ResponseWriter, r *http.Request) {
			muTic.Lock(); defer muTic.Unlock()
			var body struct { VsAI bool `json:"vsAI"`; Difficulty string `json:"difficulty"` }
			_ = json.NewDecoder(r.Body).Decode(&body) // optional body
			id := randID()
			g := games.NewTicTacToe(body.VsAI, body.Difficulty)
			ticGames[id] = g
			writeJSON(w, http.StatusCreated, map[string]any{"gameId": id, "state": g})
		})
		r.Get("/tictactoe/{id}", func(w http.ResponseWriter, r *http.Request) {
			id := chi.URLParam(r, "id")
			muTic.Lock(); defer muTic.Unlock()
			g, ok := ticGames[id]
			if !ok { http.NotFound(w, r); return }
			writeJSON(w, http.StatusOK, g)
		})
		r.Post("/tictactoe/{id}/move", func(w http.ResponseWriter, r *http.Request) {
			id := chi.URLParam(r, "id")
			muTic.Lock(); defer muTic.Unlock()
			g, ok := ticGames[id]
			if !ok { http.NotFound(w, r); return }
			var body struct { Pos int `json:"pos"` }
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil { writeErr(w, http.StatusBadRequest, "invalid body"); return }
			if !g.MakeMove(body.Pos) { writeErr(w, http.StatusBadRequest, "invalid move"); return }
			writeJSON(w, http.StatusOK, g)
		})
		r.Post("/tictactoe/{id}/reset", func(w http.ResponseWriter, r *http.Request) {
			id := chi.URLParam(r, "id")
			muTic.Lock(); defer muTic.Unlock()
			g, ok := ticGames[id]
			if !ok { http.NotFound(w, r); return }
			g.Reset()
			writeJSON(w, http.StatusOK, g)
		})
		r.Post("/tictactoe/{id}/undo", func(w http.ResponseWriter, r *http.Request) {
			id := chi.URLParam(r, "id")
			muTic.Lock(); defer muTic.Unlock()
			g, ok := ticGames[id]
			if !ok { http.NotFound(w, r); return }
			if !g.Undo() { writeErr(w, http.StatusBadRequest, "cannot undo"); return }
			writeJSON(w, http.StatusOK, g)
		})

		// Number guess
		r.Post("/numberguess/new", func(w http.ResponseWriter, r *http.Request) {
			muNum.Lock(); defer muNum.Unlock()
			var body struct { Difficulty string `json:"difficulty"` }
			_ = json.NewDecoder(r.Body).Decode(&body) // optional
			id := randID()
			g := games.NewNumberGuess(body.Difficulty)
			numGames[id] = g
			writeJSON(w, http.StatusCreated, map[string]any{"gameId": id, "state": g})
		})
		r.Get("/numberguess/{id}", func(w http.ResponseWriter, r *http.Request) {
			id := chi.URLParam(r, "id")
			muNum.Lock(); defer muNum.Unlock()
			g, ok := numGames[id]
			if !ok { http.NotFound(w, r); return }
			writeJSON(w, http.StatusOK, g)
		})
		r.Post("/numberguess/{id}/guess", func(w http.ResponseWriter, r *http.Request) {
			id := chi.URLParam(r, "id")
			muNum.Lock(); defer muNum.Unlock()
			g, ok := numGames[id]
			if !ok { http.NotFound(w, r); return }
			var body struct { N int `json:"n"` }
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil { writeErr(w, http.StatusBadRequest, "invalid body"); return }
			g.Guess(body.N)
			writeJSON(w, http.StatusOK, g)
		})
	})

	return r
}

func randID() string { return strconv.FormatInt(time.Now().UnixNano()+int64(rand.Intn(9999)), 36) }

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
