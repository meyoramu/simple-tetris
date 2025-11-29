# Mini Tetris

A tiny, focused Tetris-like game written with plain HTML, CSS and JavaScript.

This repository contains a small playable Tetris implementation intended for learning, modification, and quick play. The code is intentionally compact so you can read and change it easily.

---

## Quick Start

- Option A — Open directly in your browser:
  - Double-click `index.html` in the project folder to open it in your default browser.
  - This works for basic testing and local play.

- Option B — Run a simple local web server (recommended for development):

```powershell
# from the project root folder run (PowerShell)
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Other servers such as VS Code Live Server also work well.

---

## Files and Structure

- `index.html` — page structure, canvas (`id="game"`), UI elements such as the score and Start button.
- `styles/style.css` — styling for layout, the score panel and basic visuals.
- `scripts/main.js` — game logic: board representation, piece definitions, collision detection, drawing, input handling and the main loop.

Note: The code has been annotated with beginner-friendly comments to explain functions and important lines. See `scripts/main.js` for the detailed explanations.

---

## How To Play

- Click the `Start` button to begin a game.
- Use the arrow keys to control the falling piece:
  - Left Arrow (←): move piece left
  - Right Arrow (→): move piece right
  - Up Arrow (↑): rotate piece clockwise
  - Down Arrow (↓): soft drop (move piece down one row)

The falling tetromino moves down automatically over time. When a piece lands (cannot move down), it locks into the board and a new piece appears at the top.

---

## Game Mechanics (Explained)

- Board size: The playfield is a grid of `10` columns by `20` rows (COLS × ROWS).
- Pieces: The seven standard tetrominoes are represented as small 2D arrays (`1` marks block cells).
- Positioning: The current piece has coordinates `(px, py)` in grid units (columns, rows).
- Collision: Before moving or rotating, the game checks whether the new position would overlap the board edges, the floor, or existing locked blocks. If it would, the move or rotation is blocked.
- Merge: When a piece can no longer move down, it is merged (copied) into the board array and becomes a permanent block.
- Clearing lines: When a board row is completely filled (no empty cells), it is removed and an empty row is added at the top. Each cleared line increases your score.
- Drawing: The board and piece are rendered on an HTML `<canvas>` with a simple cell size (20 pixels by default).
- Game loop: A `tick` function runs on a half-second interval (500 ms) by default; each `tick` attempts to move the current piece down one row.

---

## Scoring

- Each cleared line grants `10` points by default. The score is shown in the `#score` element in the side panel.

You can easily change the scoring rules in `scripts/main.js` (look for the `clearLines()` function and update `score += cleared * 10`).

---

## How You Win (and Custom Win Conditions)

Classic Tetris is an endless survival game — there is no fixed "win" condition: the goal is to survive as long as possible and maximize score. This small project follows that idea by default (there is no built-in win state). However, you can define a win condition for challenges or scoring:

Suggested win conditions you can add or enforce:

- Reach a target score (example: `score >= 1000`).
- Clear a target number of lines (example: clear 40 lines total — the classic 40-line guideline for many Tetris variants).
- Survive for a target time (example: keep playing for 5 minutes).

To implement a win condition, add a check in the game loop (the `tick()` function) after `clearLines()` and call a `win()` function or show a message when the condition is satisfied. For example:

```js
// inside tick() after clearLines():
if (linesClearedTotal >= 40) {
  // handle win
}
```

If you want, I can implement a default win goal (for example: "clear 40 lines to win") and add a visible counter in the UI — tell me which win condition you prefer.

---

## How You Lose

- Game over occurs when a newly spawned piece immediately collides with existing blocks at its spawn position. Practically this means the stack of locked blocks has reached the top of the board and there's no room for new pieces.
- When the game ends the interval loop stops and an alert appears with your final score (this behavior is implemented in the `gameOver()` function in `scripts/main.js`).

---

## Accessibility Notes

- The canvas has an `aria-label` (`Tetris game board`) to communicate purpose to screen readers.
- The score uses a regular DOM element (`#score`) that can be focused or exposed to an ARIA live region for updates (future improvement: add `aria-live="polite"` so assistive tech reads score changes).

---

## Customization & Developer Notes

Common quick changes you might make in `scripts/main.js`:

- Board dimensions: change `COLS` and `ROWS` at the top to make the playfield wider or taller.
- Cell size: change `SIZE` to alter visual scale (remember to update canvas `width`/`height` in `index.html` accordingly: `width = COLS * SIZE`, `height = ROWS * SIZE`).
- Game speed: change the interval in `setInterval(tick, 500)` inside `start()` — a smaller value makes the game faster.
- Scoring: modify the points in `clearLines()`.
- Colors: update the color strings passed to `drawCell()` to change block colors.
- Next piece preview: the UI contains a placeholder but the preview is not implemented; you can render the next piece into a small canvas or DOM grid in the side panel.

Developer tip: we cloned shape arrays when spawning pieces to avoid mutating the original `SHAPES` constants during rotation — keep this practice when modifying pieces.

---

## Troubleshooting

- If the page doesn't display the canvas, confirm that `index.html` references `./scripts/main.js` and that the file exists.
- If the Start button does nothing, open the browser console (F12) and look for JavaScript errors. The console will show line numbers and error messages to help debug.

---

## Next Improvements (optional)

- Implement a visible next-piece preview in the side panel.
- Add a pause/resume button and keyboard mapping for pause.
- Add sound effects and nicer visuals for line clears.
- Implement harder levels and gravity that increases speed when lines cleared.
- Add persistent high score saving using `localStorage`.

---

If you'd like, I can implement one of the next improvements now — for example, a simple `Next piece` preview or a configurable win condition (clear 40 lines). Which would you prefer?
