package games

import "math/rand"

// NumberGuess simple guessing game state
// Player tries to guess Secret (1-100)

type NumberGuess struct {
	Secret     int    `json:"-"`
	Tries      int    `json:"tries"`
	Last       int    `json:"last"`
	Hint       string `json:"hint"`
	Won        bool   `json:"won"`
	Max        int    `json:"max"`
	Difficulty string `json:"difficulty"`
}

func NewNumberGuess(difficulty string) *NumberGuess {
	max := 100
	switch difficulty {
	case "easy":
		max = 50
	case "hard":
		max = 500
	case "insane":
		max = 1000
	default:
		difficulty = "normal"
		max = 100
	}
	return &NumberGuess{Secret: rand.Intn(max) + 1, Max: max, Difficulty: difficulty}
}

func (g *NumberGuess) Guess(n int) {
	if g.Won {
		return
	}
	if g.Max == 0 { // legacy games before difficulty
		g.Max = 100
		if g.Difficulty == "" { g.Difficulty = "normal" }
		if g.Secret == 0 { g.Secret = rand.Intn(g.Max) + 1 }
	}
	if n < 1 || n > g.Max { // don't count invalid guess
		g.Hint = "out-of-range"
		return
	}
	g.Tries++
	g.Last = n
	if n == g.Secret {
		g.Hint = "correct"
		g.Won = true
	} else if n < g.Secret {
		g.Hint = "higher"
	} else {
		g.Hint = "lower"
	}
}

// Reset starts a fresh round with a new secret but same difficulty & range.
func (g *NumberGuess) Reset() {
	if g.Max == 0 { // safety for legacy
		g.Max = 100
		if g.Difficulty == "" { g.Difficulty = "normal" }
	}
	g.Secret = rand.Intn(g.Max) + 1
	g.Tries = 0
	g.Last = 0
	g.Hint = ""
	g.Won = false
}
