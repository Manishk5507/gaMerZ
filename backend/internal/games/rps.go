package games

import (
    "math/rand"
    "strings"
    "time"
)

// RPSGame represents a Rock Paper Scissors match vs simple RNG AI.
// Player plays until someone reaches Target wins.
// Moves: rock, paper, scissors.

type RPSGame struct {
    PlayerScore int    `json:"playerScore"`
    AIScore     int    `json:"aiScore"`
    Rounds      int    `json:"rounds"`
    Target      int    `json:"target"`
    LastPlayer  string `json:"lastPlayer"`
    LastAI      string `json:"lastAI"`
    LastResult  string `json:"lastResult"` // win, lose, draw
    Finished    bool   `json:"finished"`
    Winner      string `json:"winner"` // player, ai
}

func NewRPS(target int) *RPSGame {
    if target <= 0 { target = 3 }
    return &RPSGame{Target: target}
}

var rpsMoves = []string{"rock", "paper", "scissors"}

func (g *RPSGame) Play(move string) {
    if g.Finished { return }
    m := strings.ToLower(move)
    if !validMove(m) { return }
    rand.Seed(time.Now().UnixNano())
    ai := rpsMoves[rand.Intn(3)]
    g.LastPlayer = m
    g.LastAI = ai
    g.Rounds++
    switch outcome(m, ai) {
    case 1:
        g.PlayerScore++
        g.LastResult = "win"
    case -1:
        g.AIScore++
        g.LastResult = "lose"
    default:
        g.LastResult = "draw"
    }
    if g.PlayerScore >= g.Target || g.AIScore >= g.Target {
        g.Finished = true
        if g.PlayerScore > g.AIScore { g.Winner = "player" } else if g.AIScore > g.PlayerScore { g.Winner = "ai" }
    }
}

// Reset clears scores & rounds keeping same target.
func (g *RPSGame) Reset() {
    g.PlayerScore, g.AIScore, g.Rounds = 0, 0, 0
    g.LastPlayer, g.LastAI, g.LastResult = "", "", ""
    g.Finished = false
    g.Winner = ""
}

func validMove(m string) bool {
    for _, v := range rpsMoves { if v == m { return true } }
    return false
}

// outcome returns 1 if a beats b, -1 if lose, 0 draw
func outcome(a, b string) int {
    if a == b { return 0 }
    if (a == "rock" && b == "scissors") || (a == "paper" && b == "rock") || (a == "scissors" && b == "paper") { return 1 }
    return -1
}
