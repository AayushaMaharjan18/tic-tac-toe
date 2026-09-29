/*// person vs person
//  1. Game state
let board = Array(9).fill(null);  // 9 empty cells
let current = 'X';                // whose turn
let over = false;

// 2. All winning combinations (rows, cols, diagonals)
const WINS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],  // columns
  [0, 4, 8], [2, 4, 6]               // diagonals
];

// 3. Handle a cell click
function handleClick(index) {
  if (over || board[index]) return;  // ignore if game over or cell taken

  board[index] = current;            // place the mark
  document.querySelectorAll('.cell')[index].textContent = current;

  const result = checkWinner();
  if (result) {
    if (result.winner) {
      result.line.forEach(i =>
        document.querySelectorAll('.cell')[i].classList.add('win')
      );
      document.getElementById('status').textContent = result.winner + ' wins!';
    } else {
      document.getElementById('status').textContent = "It's a draw!";
    }
    over = true;
    return;
  }

  // Switch turns
  current = current === 'X' ? 'O' : 'X';
  document.getElementById('status').textContent = current + "'s turn";
}

// 4. Check if someone won or it's a draw
function checkWinner() {
  for (const [a, b, c] of WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every(v => v)) return { winner: null };  // draw
  return null;  // game still going
}

// 5. Restart the game
function restart() {
  board = Array(9).fill(null);
  current = 'X';
  over = false;
  document.getElementById('status').textContent = "X's turn";
  document.querySelectorAll('.cell').forEach(c => {
    c.textContent = '';
    c.classList.remove('win');
  });
}

// 6. Attach click listeners to all cells
document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', () => handleClick(+cell.dataset.i));
});*/

//computer vs person
let board = Array(9).fill(null);
let current = 'X';
let over = false;
let firstPlayer = 'X';
let drawTimeout = null;

const WINS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function handleClick(index) {
  if (over || board[index] || current === 'O') return; // block clicks on computer's turn

  board[index] = 'X';
  updateCell(index, 'X');

  if (endGame()) return;

  current = 'O'; //switch
  document.getElementById('status').textContent = "Computer is thinking...";

  setTimeout(() => {       // small delay so it feels natural
    const move = bestMove();
    board[move] = 'O';
    updateCell(move, 'O');
    if (!endGame()) {
      current = 'X';
      document.getElementById('status').textContent = "Your turn (X)";
    }
  }, 400);
}

// Update a cell on screen
function updateCell(index, mark) {
  document.querySelectorAll('.cell')[index].textContent = mark;
}

// Check win/draw, update UI, return true if game ended
function endGame() {
  const result = checkWinner();
  if (!result) return false;

  over = true;

  if (result.winner) {
    result.line.forEach(i =>
      document.querySelectorAll('.cell')[i].classList.add('win')
    );

    document.getElementById('status').textContent =
      result.winner === 'X' ? 'You win! 🎉' : 'Computer wins!';
  } else {
    // DRAW (no auto restart)
    document.getElementById('status').textContent =
      "Draw! Press Restart to play again.";
  }

  return true;
}

function checkWinner() {
  for (const [a,b,c] of WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a,b,c] };
    }
  }
  if (board.every(v => v)) return { winner: null };
  return null;
}

// --- AI: minimax ---

function bestMove() {
  let best = -Infinity;
  let moves = [];

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      let score = minimax(board, false);
      board[i] = null;

      if (score > best) {
        best = score;
        moves = [i]; // reset list
      } else if (score === best) {
        moves.push(i); // store equal moves
      }
    }
  }

  // pick random among best moves
  return moves[Math.floor(Math.random() * moves.length)];
}

function minimax(board, isMaximizing) {
  const result = checkWinner();
  if (result) {
    if (result.winner === 'O') return  10;  // computer wins
    if (result.winner === 'X') return -10;  // human wins
    return 0;                               // draw
  }

  if (isMaximizing) {
    // Computer's turn — pick highest score
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    // Human's turn — pick lowest score (worst for computer)
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function restart() {
  board = Array(9).fill(null);
  over = false;

  // 🔁 switch starting player ONLY when restart is pressed
  firstPlayer = firstPlayer === 'X' ? 'O' : 'X';
  current = firstPlayer;

  document.querySelectorAll('.cell').forEach(c => {
    c.textContent = '';
    c.classList.remove('win');
  });

  // If computer starts
  if (current === 'O') {
    document.getElementById('status').textContent = "Computer is thinking...";

    setTimeout(() => {
      const move = bestMove();
      board[move] = 'O';
      updateCell(move, 'O');
      current = 'X';
      document.getElementById('status').textContent = "Your turn (X)";
    }, 400);
  } else {
    document.getElementById('status').textContent = "Your turn (X)";
  }
}
document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', () => handleClick(+cell.dataset.i));
});