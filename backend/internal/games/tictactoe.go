package games

// TicTacToe represents a simple tic tac toe game state.
// Board has 9 cells indexed 0..8
// CurrentPlayer is either "X" or "O"
// Winner is "X", "O", or "D" for draw, or "" if ongoing
type Move struct {
	Pos    int    `json:"pos"`
	Player string `json:"player"`
}

type TicTacToe struct {
	Board         [9]string `json:"board"`
	CurrentPlayer string    `json:"currentPlayer"`
	Winner        string    `json:"winner"`
	WinningLine   [3]int    `json:"winningLine"`
	Moves         []Move    `json:"moves"`
	VsAI          bool      `json:"vsAI"`
	Difficulty    string    `json:"difficulty"` // "easy" or "optimal" (only relevant when VsAI)
}

// NewTicTacToe creates a new game; if vsAI true, player X is human and O is AI.
func NewTicTacToe(vsAI bool, difficulty string) *TicTacToe {
	if difficulty == "" { difficulty = "easy" }
	g := &TicTacToe{CurrentPlayer: "X", VsAI: vsAI, WinningLine: [3]int{-1, -1, -1}, Difficulty: difficulty}
	for i := 0; i < 9; i++ {
		g.Board[i] = ""
	}
	return g
}

// Reset the board while keeping mode (VsAI).
func (g *TicTacToe) Reset() {
	for i := 0; i < 9; i++ { g.Board[i] = "" }
	g.CurrentPlayer = "X"
	g.Winner = ""
	g.Moves = nil
	g.WinningLine = [3]int{-1,-1,-1}
}

func (g *TicTacToe) MakeMove(pos int) bool {
	if pos < 0 || pos >= 9 || g.Board[pos] != "" || g.Winner != "" {
		return false
	}
	g.Board[pos] = g.CurrentPlayer
	g.Moves = append(g.Moves, Move{Pos: pos, Player: g.CurrentPlayer})
	g.checkWinner()
	if g.Winner == "" { // switch turns only if game not finished
		if g.CurrentPlayer == "X" {
			g.CurrentPlayer = "O"
		} else {
			g.CurrentPlayer = "X"
		}
	}
	// If vs AI and it's AI's turn and game still ongoing, make AI move.
	if g.VsAI && g.CurrentPlayer == "O" && g.Winner == "" {
		g.aiMove()
	}
	return true
}

func (g *TicTacToe) aiMove() {
	if g.Winner != "" { return }
	var best int
	if g.Difficulty == "optimal" {
		_, best = g.minimax(g.Board, "O")
	} else {
		best = g.heuristicMove()
	}
	if best >= 0 {
		g.Board[best] = "O"
		g.Moves = append(g.Moves, Move{Pos: best, Player: "O"})
		g.checkWinner()
		if g.Winner == "" { g.CurrentPlayer = "X" }
	}
}

func (g *TicTacToe) heuristicMove() int {
	best := -1
	tryMove := func(p int, mark string) bool {
		if g.Board[p] != "" { return false }
		g.Board[p] = mark
		won := g.isWinning(mark)
		g.Board[p] = ""
		return won
	}
	for i:=0;i<9;i++ { if tryMove(i,"O") { best = i; break } }
	if best == -1 { for i:=0;i<9;i++ { if tryMove(i,"X") { best = i; break } } }
	if best == -1 && g.Board[4] == "" { best = 4 }
	if best == -1 { for _, c := range []int{0,2,6,8} { if g.Board[c] == "" { best = c; break } } }
	if best == -1 { for i:=0;i<9;i++ { if g.Board[i] == "" { best = i; break } } }
	return best
}

func (g *TicTacToe) minimax(board [9]string, player string) (score int, move int) {
	// Terminal checks
	if g.boardWin(board, "O") { return 1, -1 }
	if g.boardWin(board, "X") { return -1, -1 }
	full := true
	for _, c := range board { if c == "" { full = false; break } }
	if full { return 0, -1 }
	if player == "O" { // maximize
		bestScore := -2
		bestMove := -1
		for i:=0;i<9;i++ { if board[i]=="" { board[i]="O"; sc,_ := g.minimax(board,"X"); board[i]=""; if sc>bestScore { bestScore=sc; bestMove=i } } }
		return bestScore, bestMove
	}
	// minimizing for X
	bestScore := 2
	bestMove := -1
	for i:=0;i<9;i++ { if board[i]=="" { board[i]="X"; sc,_ := g.minimax(board,"O"); board[i]=""; if sc<bestScore { bestScore=sc; bestMove=i } } }
	return bestScore, bestMove
}

func (g *TicTacToe) boardWin(board [9]string, mark string) bool {
	lines := [8][3]int{{0,1,2},{3,4,5},{6,7,8},{0,3,6},{1,4,7},{2,5,8},{0,4,8},{2,4,6}}
	for _, l := range lines { if board[l[0]]==mark && board[l[1]]==mark && board[l[2]]==mark { return true } }
	return false
}

func (g *TicTacToe) isWinning(mark string) bool {
	lines := [8][3]int{{0,1,2},{3,4,5},{6,7,8},{0,3,6},{1,4,7},{2,5,8},{0,4,8},{2,4,6}}
	for _, l := range lines {
		if g.Board[l[0]] == mark && g.Board[l[1]] == mark && g.Board[l[2]] == mark { return true }
	}
	return false
}

func (g *TicTacToe) checkWinner() {
	lines := [8][3]int{{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4, 6}}
	for _, l := range lines {
		a, b, c := g.Board[l[0]], g.Board[l[1]], g.Board[l[2]]
		if a != "" && a == b && b == c {
			g.Winner = a
			g.WinningLine = l
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

// Undo reverts last move; if vs AI it reverts AI + previous human move to keep turn with human.
func (g *TicTacToe) Undo() bool {
	if len(g.Moves) == 0 { return false }
	// If game ended, clear winner so we can resume after undo
	g.Winner = ""
	g.WinningLine = [3]int{-1,-1,-1}
	// Remove last move
	last := g.Moves[len(g.Moves)-1]
	g.Board[last.Pos] = ""
	g.Moves = g.Moves[:len(g.Moves)-1]
	// If vs AI and last was AI, also remove previous human move to give human chance again
	if g.VsAI && last.Player == "O" && len(g.Moves) > 0 {
		prev := g.Moves[len(g.Moves)-1]
		g.Board[prev.Pos] = ""
		g.Moves = g.Moves[:len(g.Moves)-1]
	}
	// Determine current player
	if len(g.Moves) == 0 { g.CurrentPlayer = "X" } else { g.CurrentPlayer = opposite(g.Moves[len(g.Moves)-1].Player) }
	return true
}

func opposite(p string) string { if p=="X" { return "O" }; return "X" }
