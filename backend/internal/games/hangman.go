package games

import (
    "math/rand"
    "strings"
    "time"
)

// Hangman simple single-player word guessing.
// Difficulty controls word length & max mistakes.

type Hangman struct {
    Word        string   `json:"-"`
    Masked      string   `json:"masked"`
    Guessed     []string `json:"guessed"`
    Wrong       int      `json:"wrong"`
    MaxWrong    int      `json:"maxWrong"`
    Finished    bool     `json:"finished"`
    Won         bool     `json:"won"`
    Difficulty  string   `json:"difficulty"`
}

var wordPool = []string{
    "go", "code", "game", "react", "pixel", "binary", "dragon", "async", "memory", "network",
    "galaxy", "hangman", "puzzle", "random", "frontend", "backend", "context", "pointer", "compiler", "optimize",
}

func NewHangman(diff string) *Hangman {
    if diff == "" { diff = "normal" }
    rand.Seed(time.Now().UnixNano())
    // Filter by length heuristics
    var candidates []string
    for _, w := range wordPool {
        l := len(w)
        switch diff {
        case "easy":
            if l <= 5 { candidates = append(candidates, w) }
        case "hard":
            if l >= 6 { candidates = append(candidates, w) }
        default: // normal
            if l >= 4 && l <= 8 { candidates = append(candidates, w) }
        }
    }
    if len(candidates) == 0 { candidates = wordPool }
    word := candidates[rand.Intn(len(candidates))]
    maxWrong := 6
    if diff == "easy" { maxWrong = 8 } else if diff == "hard" { maxWrong = 5 }
    h := &Hangman{Word: word, Difficulty: diff, MaxWrong: maxWrong, Guessed: []string{}}
    h.updateMasked()
    return h
}

func (h *Hangman) updateMasked() {
    var b strings.Builder
    for _, ch := range h.Word {
        c := string(ch)
        if contains(h.Guessed, c) { b.WriteString(c) } else { b.WriteString("_") }
    }
    h.Masked = b.String()
}

func contains(arr []string, v string) bool { for _, a := range arr { if a == v { return true } }; return false }

func (h *Hangman) Guess(letter string) {
    if h.Finished { return }
    if letter == "" { return }
    l := strings.ToLower(letter[:1])
    if contains(h.Guessed, l) { return }
    h.Guessed = append(h.Guessed, l)
    if !strings.Contains(h.Word, l) { h.Wrong++ }
    h.updateMasked()
    if h.Masked == h.Word { h.Finished = true; h.Won = true }
    if h.Wrong >= h.MaxWrong { h.Finished = true }
}

// Reset starts a new word with same difficulty parameters.
func (h *Hangman) Reset() {
    diff := h.Difficulty
    *h = *NewHangman(diff)
}
