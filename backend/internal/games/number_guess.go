package games

import "math/rand"

// NumberGuess simple guessing game state
// Player tries to guess Secret (1-100)

type NumberGuess struct {
	Secret int `json:"-"`
	Tries  int `json:"tries"`
	Last   int `json:"last"`
	Hint   string `json:"hint"`
	Won    bool   `json:"won"`
}

func NewNumberGuess() *NumberGuess {
	return &NumberGuess{Secret: rand.Intn(100) + 1}
}

func (g *NumberGuess) Guess(n int) {
	if g.Won {
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
