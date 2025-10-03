# gaMerZ

Full-stack game hub built with Golang (chi) + React (Vite + TypeScript).

## Tech
Backend: Go 1.22, chi router, net/http, in-memory game state.
Frontend: React 18, Vite 5, TypeScript strict mode.

## Run (Dev)
Backend:
```
cd backend
go mod tidy
go run ./cmd/server
```
Frontend (in new terminal):
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 . API served at http://localhost:8080/api

## Layout
```
backend/
	cmd/server/main.go        # program entry
	internal/games            # domain logic for each game
	internal/httpapi          # HTTP handlers / routing
frontend/
	src/                      # React app source
		components/games        # Game React components
	vite.config.ts            # Dev server + proxy
.gitignore
```

## Current Games
- Tic Tac Toe
- Number Guess (1-100)

## API (summary)
Health: GET /api/health -> ok
Game list: GET /api/games/list

TicTacToe:
- POST /api/games/tictactoe/new -> { gameId, state }
- GET  /api/games/tictactoe/{id} -> state
- POST /api/games/tictactoe/{id}/move { pos }

Number Guess:
- POST /api/games/numberguess/new -> { gameId, state }
- GET  /api/games/numberguess/{id} -> state
- POST /api/games/numberguess/{id}/guess { n }

## Suggested Commit Sequence
1. chore: scaffold project structure
2. feat(backend): add server skeleton + routing base
3. feat(backend): implement game logic (tic tac toe, number guess)
4. feat(backend): add API endpoints
5. feat(frontend): scaffold Vite React TS app
6. feat(frontend): game selection UI
7. feat(frontend): tic tac toe component
8. feat(frontend): number guess component
9. docs: expand README

## Next Improvements
- Unit tests for game logic (internal/games)
- E2E tests (Playwright) for UI flows
- Persistence layer (Postgres / Redis) instead of memory maps
- WebSocket multi-player sync
- Add more games (Connect Four, Hangman)
- Theming & responsive layout

## License
MIT (add LICENSE file before publishing)
