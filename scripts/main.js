
/*
  Simple Tetris - annotated for beginners

  This file implements a small, simple Tetris-like game. The goal of
  the comments below is to explain what each function, variable and
  line does — so a beginner can read, run, and modify the game.

  Quick overview:
  - A grid (board) is represented as a 2D array of rows and columns.
  - Tetromino shapes are small 2D arrays with 1s where a block exists.
  - A falling piece has an (px,py) position on the board and is drawn
    on top of existing board blocks until it collides and merges.
  - Lines get cleared when they are completely filled and the score updates.
*/

// Board size (10 columns × 20 rows)
// `COLS` is number of columns, `ROWS` is number of rows, `SIZE` is pixel size
const COLS = 10, // number of cells horizontally; the playfield width
      ROWS = 20, // number of cells vertically; the playfield height
      SIZE = 20; // size in pixels of one cell when drawing on canvas

// Get the canvas element from the HTML by its id 'game'. This is where
// we will draw the board and tetromino pieces.
const canvas = document.getElementById("game");

// Get the 2D rendering context from the canvas. `ctx` provides drawing
// methods such as `fillRect` to paint rectangles (cells) on the canvas.
const ctx = canvas.getContext("2d");

// Score element in the DOM — this shows the player's score on the page.
const scoreEl = document.getElementById("score");

// Audio elements for theme music control
const themeMusic = document.getElementById("themeMusic");
const audioToggleBtn = document.getElementById("audioToggle");
const volumeSlider = document.getElementById("volumeSlider");

// Audio state management
const audioState = {
  isMuted: false,
  volume: 70, // default volume (0-100)
  
  // Load saved settings from localStorage
  load() {
    const saved = localStorage.getItem('tetrisAudioSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.volume = settings.volume || 70;
      this.isMuted = settings.isMuted || false;
    }
    this.applySettings();
  },
  
  // Save current settings to localStorage
  save() {
    localStorage.setItem('tetrisAudioSettings', JSON.stringify({
      volume: this.volume,
      isMuted: this.isMuted
    }));
  },
  
  // Apply current audio settings
  applySettings() {
    // Set volume (0-1 range for Web Audio API)
    themeMusic.volume = this.isMuted ? 0 : (this.volume / 100);
    
    // Update UI to reflect mute state
    if (this.isMuted) {
      audioToggleBtn.classList.add('muted');
      audioToggleBtn.title = 'Sound is muted';
    } else {
      audioToggleBtn.classList.remove('muted');
      audioToggleBtn.title = 'Toggle sound';
    }
    
    // Update volume slider UI
    volumeSlider.value = this.volume;
  },
  
  // Toggle mute on/off
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.applySettings();
    this.save();
  },
  
  // Set volume level (0-100)
  setVolume(level) {
    this.volume = Math.max(0, Math.min(100, level));
    if (this.volume > 0 && this.isMuted) {
      this.isMuted = false;
    }
    this.applySettings();
    this.save();
  },
  
  // Play theme music
  play() {
    if (themeMusic.paused) {
      themeMusic.play().catch(err => {
        console.log('Audio playback prevented. User interaction may be required.', err);
      });
    }
  },
  
  // Stop theme music
  stop() {
    themeMusic.pause();
    themeMusic.currentTime = 0;
  }
};

// Initialize audio system and attach event listeners
function initAudio() {
  // Load saved settings
  audioState.load();
  
  // Toggle mute button
  audioToggleBtn.addEventListener('click', () => {
    audioState.toggleMute();
  });
  
  // Volume slider
  volumeSlider.addEventListener('input', (e) => {
    audioState.setVolume(parseInt(e.target.value));
  });
  
  // Attempt to start playing music (may be blocked by browser until user interaction)
  audioState.play();
}

// Tetromino shapes: these are the seven classic Tetris pieces.
// Each shape is a small 2D array where `1` marks a filled cell and `0` or
// the absence of a `1` means empty. We use these arrays to render and
// to check for collisions.
const SHAPES = {
  I: [[1,1,1,1]],        // I shape: a straight line
  O: [[1,1],[1,1]],      // O shape: a square (2x2)
  L: [[1,0],[1,0],[1,1]],// L shape
  J: [[0,1],[0,1],[1,1]],// J shape (mirrored L)
  T: [[1,1,1],[0,1,0]],  // T shape
  S: [[0,1,1],[1,1,0]],  // S shape
  Z: [[1,1,0],[0,1,1]]   // Z shape
};

// Game state variables (declared here so they are available everywhere):
let board,   // 2D array representing the playfield grid
    piece,   // current falling tetromino (2D array from SHAPES)
    px,      // x position of the piece (column index on the board)
    py,      // y position of the piece (row index on the board)
    score,   // player's score (number)
    loop;    // interval id for the game loop (used with setInterval)

/*
  Create empty board
  - Purpose: build a fresh 2D array with ROWS rows and COLS columns
  - Each cell starts as 0 meaning "empty". A filled cell will be 1.
  - Returns: a new 2D array used as the game board.
*/
function newBoard(){
  // `Array.from` creates an array with `ROWS` elements. For each element
  // we create an inner array of length `COLS` and fill it with zeros.
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

/*
  Pick random tetromino
  - Purpose: choose a random shape from SHAPES and return a cloned copy.
  - Why clone?: we may rotate or change the piece later; cloning prevents
  - modifying the original shape stored in SHAPES.
  - Returns: a 2D array representing the chosen piece.
*/
function newPiece(){
  // Get the shape names as an array: ['I','O','L',...]
  const keys = Object.keys(SHAPES);
  // Choose a random index in that array
  const shape = SHAPES[keys[Math.floor(Math.random() * keys.length)]];
  // Return a shallow clone of each row so that later modifications
  // (like rotation) don't modify the original template in SHAPES.
  return shape.map(r => r.slice()); // clone
}

/*
  Draw the board + falling piece
  - Purpose: clear the canvas and draw the current state: first the
    permanent blocks stored in `board`, then the falling `piece` on top.
  - Important: calling this after state changes (move, rotate, clear) keeps
    the visual in sync with the game state.
*/
function draw(){
  // Clear the whole canvas to prepare for fresh drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the filled cells from the board array
  for(let r = 0; r < ROWS; r++){
    for(let c = 0; c < COLS; c++){
      // If board cell is 1 (filled), draw that cell in blue (#0af)
      if(board[r][c]) drawCell(c, r, "#0af");
    }
  }

  // Draw the current falling piece on top of the board
  // `piece` is a 2D array; we iterate rows and columns and draw where value is 1
  piece.forEach((row, r) => row.forEach((v, c) => {
    if(v) drawCell(px + c, py + r, "#fa0"); // orange color for falling piece
  }));
}

/*
  Draw a single cell on the canvas
  - x,y: column and row indices in the game grid
  - color: string with CSS color to use
*/
function drawCell(x, y, color){
  // Set the fill color used for the rectangle
  ctx.fillStyle = color;
  // Draw a rectangle representing the cell. Multiply indices by SIZE
  // to convert grid coordinates into pixel coordinates. Use SIZE-1 so
  // there's a subtle grid line between cells for better visibility.
  ctx.fillRect(x * SIZE, y * SIZE, SIZE - 1, SIZE - 1);
}

/*
  Check if a piece collides with walls, floor, or other blocks
  - nx, ny: the position to test (column, row)
  - np: optional piece array to test; defaults to the current `piece`
  - Returns: true if there is a collision, false otherwise
  - Why important?: before moving or rotating a piece we must ensure it
    doesn't overlap another block or exit bounds.
*/
function collide(nx, ny, np = piece){
  // Iterate over the np array rows
  for(let r = 0; r < np.length; r++){
    // Iterate over the row columns
    for(let c = 0; c < np[r].length; c++){
      // If this cell of the piece is filled (1), check the board
      if(np[r][c]){
        let x = nx + c, // convert piece-local column to board column
            y = ny + r; // convert piece-local row to board row
        // Collision conditions:
        // - x < 0 : hit left wall
        // - x >= COLS : hit right wall
        // - y >= ROWS : hit bottom/floor
        // - board[y][x] is truthy: another block already occupies this cell
        if(x < 0 || x >= COLS || y >= ROWS || board[y][x]) return true;
      }
    }
  }
  // No collisions found
  return false;
}

/*
  Merge piece permanently into the board
  - Purpose: when a falling piece lands, we copy its filled cells into
    the `board` array so they become part of the static playfield.
*/
function merge(){
  // For every filled cell in `piece`, set corresponding board cell to 1
  piece.forEach((row, r) => row.forEach((v, c) => {
    if(v) board[py + r][px + c] = 1; // copy into board
  }));
}

/*
  Remove full lines and update score
  - Purpose: check the board for rows that are all filled and clear them.
  - Implementation detail: we filter out rows that are full, then add
    empty rows at the top until we have ROWS rows again.
  - Score rule here: each cleared line gives 10 points (simple scoring).
*/
function clearLines(){
  let cleared = 0; // counter for how many lines were removed
  // Keep only rows that contain at least one empty cell (0). If a row
  // has no zeros it is full and gets removed by the filter.
  board = board.filter(row => row.some(v => !v));
  // While the board has fewer rows than ROWS, add new empty rows at top
  while(board.length < ROWS){
    board.unshift(Array(COLS).fill(0)); // add empty row at the start
    cleared++;
  }
  // Increase the score based on lines cleared
  score += cleared * 10;
  // Update the on-page score display so the player sees the change
  scoreEl.textContent = score;
}

/*
  Game loop step: `tick`
  - This function moves the current piece down by one if possible.
  - If moving down causes a collision, the piece is merged, lines are
    cleared, and a new piece is spawned. If the new piece immediately
    collides, the game is over.
*/
function tick(){
  // If the piece can move down without colliding, increase py
  if(!collide(px, py + 1)){
    py++; // move piece down one row
  } else {
    // Piece cannot go down: lock it into the board
    merge();
    // After locking, remove any full lines
    clearLines();
    // Spawn a new piece at the top center
    resetPiece();
    // If the new piece collides where it spawned, the board is stacked
    // to the top and the game is over
    if(collide(px, py)) return gameOver();
  }
  // Redraw the updated board and piece positions
  draw();
}

/*
  Reset piece position
  - Purpose: set `piece` to a new random piece and position it near the top
  - px: center horizontally (approx), py: 0 (top row)
*/
function resetPiece(){
  piece = newPiece(); // get a cloned random piece
  // Place the piece horizontally near the center. `Math.floor(COLS/2)-1`
  // is a simple way to roughly center shapes of different widths.
  px = Math.floor(COLS / 2) - 1;
  py = 0; // start at the top row
}

/*
  Game Over
  - Purpose: stop the game loop and notify the player.
*/
function gameOver(){
  // Stop the interval-based loop so `tick` is no longer called
  clearInterval(loop);
  // Show a browser alert with the final score. A beginner can replace
  // this with a nicer overlay or DOM element if desired.
  alert("Game Over! Score: " + score);
}

/*
  Start game
  - Purpose: initialize the game state and begin the timer-driven loop
    that repeatedly calls `tick`.
*/
function start(){
  board = newBoard(); // create an empty playfield
  score = 0;          // reset score
  resetPiece();       // spawn first piece
  draw();             // draw the initial state
  // If there is already a loop running, clear it to avoid duplicates
  if(loop) clearInterval(loop);
  // Ensure theme music is playing when game starts
  audioState.play();
  // Start the game loop: call `tick` every 500 milliseconds (half a second)
  loop = setInterval(tick, 500);
}

/*
  Rotate piece 90 degrees clockwise
  - Purpose: return a rotated copy of the piece array. Rotation is done
    by transposing the rows/columns and then reversing the rows to get
    a 90-degree clockwise rotation.
  - Input: `p` is a 2D array representing the piece. The function does
    not modify the original `p` — it returns a new array.
*/
function rotate(p){
  // `p[0].map((_, i) => p.map(r => r[i]))` transposes the matrix.
  // `.reverse()` then reverses the row order to complete clockwise rotation.
  return p[0].map((_, i) => p.map(r => r[i])).reverse();
}

/*
  Keyboard controls
  - Purpose: allow the player to move left/right/down and rotate with
    arrow keys. We check collisions before applying moves to keep the
    piece within valid positions.
*/
window.onkeydown = e => {
  // Left arrow: try to move left if no collision
  if(e.key === "ArrowLeft" && !collide(px - 1, py)) px--;
  // Right arrow: try to move right if no collision
  if(e.key === "ArrowRight" && !collide(px + 1, py)) px++;
  // Down arrow: soft drop (move down one row) if possible
  if(e.key === "ArrowDown" && !collide(px, py + 1)) py++;
  // Up arrow: attempt rotation
  if(e.key === "ArrowUp"){
    const np = rotate(piece); // compute rotated version
    // If rotated version doesn't collide, accept the rotation
    if(!collide(px, py, np)) piece = np;
  }
  // After any input we redraw to reflect the new state immediately
  draw();
};

// Hook the Start button in the DOM: when clicked it runs `start()`
document.getElementById("start").onclick = start;

// Initialize audio system when DOM is ready
initAudio();