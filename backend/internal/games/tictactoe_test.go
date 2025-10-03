package games

import "testing"

func TestTicTacToeWin(t *testing.T) {
	g := NewTicTacToe(false, "easy")
	moves := []int{0,3,1,4,2} // X wins top row
	for _, m := range moves {
		if !g.MakeMove(m) { t.Fatalf("move %d rejected", m) }
	}
	if g.Winner != "X" { t.Fatalf("expected X winner got %q", g.Winner) }
}

func TestTicTacToeInvalid(t *testing.T) {
	g := NewTicTacToe(false, "easy")
	if !g.MakeMove(0) { t.Fatal("first move invalid") }
	if g.MakeMove(0) { t.Fatal("should not allow overwrite") }
}

func TestOptimalAIMoveGeneration(t *testing.T) {
	g := NewTicTacToe(true, "optimal")
	// Human plays a corner, AI should respond optimally (usually center)
	if !g.MakeMove(0) { t.Fatal("human corner move failed") }
	if g.Board[4] == "" { t.Fatalf("expected AI to take center optimally, board: %+v", g.Board) }
	if g.Winner != "" { t.Fatalf("game should not be over early, winner=%s", g.Winner) }
}
