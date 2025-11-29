
// Board size (10 columns × 20 rows)
const COLS=10, ROWS=20, SIZE=20;
const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

// Score element
const scoreEl=document.getElementById("score");

// Tetromino shapes (very simple representation)
const SHAPES={
  I:[[1,1,1,1]],
  O:[[1,1],[1,1]],
  L:[[1,0],[1,0],[1,1]],
  J:[[0,1],[0,1],[1,1]],
  T:[[1,1,1],[0,1,0]],
  S:[[0,1,1],[1,1,0]],
  Z:[[1,1,0],[0,1,1]]
};

let board, piece, px, py, score, loop;

// Create empty board
function newBoard(){
  return Array.from({length:ROWS},()=>Array(COLS).fill(0));
}

// Pick random tetromino
function newPiece(){
  const keys=Object.keys(SHAPES);
  const shape=SHAPES[keys[Math.floor(Math.random()*keys.length)]];
  return shape.map(r=>r.slice()); // clone
}

// Draw the board + falling piece
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Draw board
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      if(board[r][c]) drawCell(c,r,"#0af");
    }
  }

  // Draw falling piece
  piece.forEach((row,r)=>row.forEach((v,c)=>{
    if(v) drawCell(px+c,py+r,"#fa0");
  }));
}

// Draw a single cell
function drawCell(x,y,color){
  ctx.fillStyle=color;
  ctx.fillRect(x*SIZE,y*SIZE,SIZE-1,SIZE-1);
}

// Check if piece collides with wall/floor/blocks
function collide(nx,ny,np=piece){
  for(let r=0;r<np.length;r++){
    for(let c=0;c<np[r].length;c++){
      if(np[r][c]){
        let x=nx+c, y=ny+r;
        if(x<0||x>=COLS||y>=ROWS||board[y][x]) return true;
      }
    }
  }
  return false;
}

// Merge piece permanently into the board
function merge(){
  piece.forEach((row,r)=>row.forEach((v,c)=>{
    if(v) board[py+r][px+c]=1;
  }));
}

// Remove full lines
function clearLines(){
  let cleared=0;
  board=board.filter(row=>row.some(v=>!v));
  while(board.length<ROWS){ board.unshift(Array(COLS).fill(0)); cleared++; }
  score+=cleared*10;
  scoreEl.textContent=score;
}

// Game loop step
function tick(){
  if(!collide(px,py+1)){
    py++;
  }else{
    merge();
    clearLines();
    resetPiece();
    if(collide(px,py)) return gameOver();
  }
  draw();
}

// Reset piece position
function resetPiece(){
  piece=newPiece();
  px=Math.floor(COLS/2)-1;
  py=0;
}

// Game Over
function gameOver(){
  clearInterval(loop);
  alert("Game Over! Score: "+score);
}

// Start game
function start(){
  board=newBoard();
  score=0;
  resetPiece();
  draw();
  if(loop) clearInterval(loop);
  loop=setInterval(tick,500);
}

// Rotate piece 90°
function rotate(p){
  return p[0].map((_,i)=>p.map(r=>r[i])).reverse();
}

// Keyboard controls
window.onkeydown=e=>{
  if(e.key==="ArrowLeft" && !collide(px-1,py)) px--;
  if(e.key==="ArrowRight" && !collide(px+1,py)) px++;
  if(e.key==="ArrowDown" && !collide(px,py+1)) py++;
  if(e.key==="ArrowUp"){
    const np=rotate(piece);
    if(!collide(px,py,np)) piece=np;
  }
  draw();
};

document.getElementById("start").onclick=start;