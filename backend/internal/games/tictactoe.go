package games

// TicTacToe represents a simple tic tac toe game state.
// Board has 9 cells indexed 0..8
// CurrentPlayer is either "X" or "O"
// Winner is "X", "O", or "D" for draw, or "" if ongoing
type TicTacToe struct {
	Board         [9]string `json:"board"`
	CurrentPlayer string    `json:"currentPlayer"`
	Winner        string    `json:"winner"`
}

func NewTicTacToe() *TicTacToe {
	g := &TicTacToe{CurrentPlayer: "X"}
	for i := 0; i < 9; i++ {
		g.Board[i] = ""
	}
	return g
}

func (g *TicTacToe) MakeMove(pos int) bool {
	if pos < 0 || pos >= 9 || g.Board[pos] != "" || g.Winner != "" {
		return false
	}
	g.Board[pos] = g.CurrentPlayer
	g.checkWinner()
	if g.Winner == "" { // switch turns only if game not finished
		if g.CurrentPlayer == "X" {
			g.CurrentPlayer = "O"
		} else {
			g.CurrentPlayer = "X"
		}
	}
	return true
}

func (g *TicTacToe) checkWinner() {
	lines := [8][3]int{{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4, 6}}
	for _, l := range lines {
		a, b, c := g.Board[l[0]], g.Board[l[1]], g.Board[l[2]]
		if a != "" && a == b && b == c {
			g.Winner = a
			return
		}
	}
	full := true
	for _, cell := range g.Board {
		if cell == "" {
			full = false
			break
		}
	}
	if full {
		g.Winner = "D"
	}
}
