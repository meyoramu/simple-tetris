## 📜 Game Script: Mini Tetris Logic Specification

This specification outlines the behavior and rules the JavaScript code must follow. It is the blueprint for our game logic.

### Part 1: Setup and Initialization ⚙️

| Component | Variable/Function | Description |
| :--- | :--- | :--- |
| **Physical Rules** | $\text{const COLS}=10, \text{ROWS}=20, \text{SIZE}=20;$ | Define the fixed dimensions of the board and the pixel size of each block. |
| **Shapes Data** | $\text{const SHAPES} = \{...\}$ | Store the $7$ **Tetromino shapes** (I, O, L, J, T, S, Z) as $2\text{D}$ arrays of $1\text{s}$ (solid block) and $0\text{s}$ (empty). |
| **Graphics Link** | $\text{const canvas, ctx}$ | Establish the connection to the HTML $\text{<canvas>}$ element and get its **$2\text{D}$ drawing context** for rendering. |
| **Start Game** | $\text{function start()}$ | **Resets** the $\text{board}$ (to all $0\text{s}$), sets $\text{score}$ to $0$, calls $\text{resetPiece()}$, and initializes the game loop with $\text{setInterval()}$. |

---

### Part 2: The Game Loop

The **$\text{tick()}$** function executes repeatedly (every $500\text{ms}$) to advance the game state.

1.  **Check for Fall:** Call $\text{collide(px, py+1)}$ to check if the piece can legally move down one step.
2.  **Move Down:**
    * If **NO collision**, update the vertical position: $\text{py++}$.
3.  **Land and Lock:**
    * If a **COLLISION** is detected:
        * **Lock-in:** Call $\text{merge()}$ to copy the piece's blocks onto the main $\text{board}$.
        * **Score Check:** Call $\text{clearLines()}$ to detect, remove full rows, shift blocks down, and update the $\text{score}$.
        * **New Piece:** Call $\text{resetPiece()}$ to introduce a new random piece at the top-center.
        * **Game Over Check:** Immediately check if the **newly spawned piece** collides ($\text{collide(px, py)}$). If true, call $\text{gameOver()}$ and stop the loop ($\text{clearInterval(loop)}$).
4.  **Render:** Call $\text{draw()}$ to refresh the screen with the new positions.

---

### Part 3: Player Controls and Movement 🕹️

The $\text{window.onkeydown}$ function handles player input from the arrow keys.

| Key | Action | Collision Logic |
| :--- | :--- | :--- |
| **$\leftarrow$ (Left)** | Move piece left ($\text{px}-1$). | Check $\text{collide(px}-1, \text{py})$. If false, apply the move. |
| **$\rightarrow$ (Right)** | Move piece right ($\text{px}+1$). | Check $\text{collide(px}+1, \text{py})$. If false, apply the move. |
| **$\downarrow$ (Down)** | Fast drop ($\text{py}+1$). | Check $\text{collide(px}, \text{py}+1)$. If false, apply the move. |
| **$\uparrow$ (Rotate)** | Attempt $90^\circ$ rotation. | Get the new shape ($\text{np} = \text{rotate(piece)}$). Check $\text{collide(px}, \text{py}, \text{np})$. If false, update $\text{piece} = \text{np}$. |

---

### Part 4: Core Helper Functions 🧱

These functions handle the fundamental logic that powers the game loop.

#### **Collision Detection ($\text{function collide(...)}$)**
* **Purpose:** Determine if the piece at a potential new position overlaps with any boundaries or settled blocks.
* **Returns:** $\text{True}$ if any part of the piece overlaps; $\text{False}$ otherwise.
* **Checks:** Iterates through every solid block in the piece and verifies that its new board coordinates ($\text{x}, \text{y}$) satisfy **all** conditions: $0 \le \text{x} < \text{COLS}$, $0 \le \text{y} < \text{ROWS}$, and $\text{board}[\text{y}][\text{x}] = 0$ (empty).


#### **Line Clearing ($\text{function clearLines()}$)**
* **Purpose:** Identify, remove, and score completed rows.
* **Implementation:**
    1.  **Filter:** Use the array $\text{filter()}$ method to **keep only rows that are NOT full**. (Full rows are deleted automatically).
    2.  **Refill:** Use a $\text{while}$ loop and $\text{unshift()}$ to add new, empty rows ($\text{Array}(\text{COLS}).\text{fill}(0)$) to the **top** of the board until the total number of rows equals $\text{ROWS}$ (20).


#### **Drawing ($\text{function draw()}$)**
* **Purpose:** Renders the game state.
* **Steps:**
    1.  Clear the entire canvas ($\text{ctx.clearRect(...)}$).
    2.  Loop through the $\text{board}$ array and call $\text{drawCell()}$ for all settled blocks (color 1).
    3.  Loop through the $\text{piece}$ array, calculate the screen position ($\text{px}+\text{c}, \text{py}+\text{r}$), and call $\text{drawCell()}$ for the falling piece (color 2).

#### **Rotation ($\text{function rotate(p)}$)**
* **Purpose:** Calculate the $90^\circ$ clockwise rotation of the piece's $2\text{D}$ array shape.
* **Mechanism:** Achieved by combining two array operations: **transposition** (swapping rows and columns) followed by **reversing** the row order.
