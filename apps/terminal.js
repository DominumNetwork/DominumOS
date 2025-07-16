// --- Core Terminal Bindings and Commands ---
const terminalInput = document.getElementById("terminal-input");
const terminalOutput = document.getElementById("terminal-output");
const snakeCanvas = document.getElementById("snake-canvas");
const matrixCanvas = document.getElementById("matrix-canvas");
let history = [];
let historyIndex = -1;

const commands = {
  help: `Available commands:\n- help, clear, whoami, date\n- echo [text], math [expr], sudo\n- cowsay [text], fortune, exit\n- hack, tetris, matrix, snake\n- about, random, joke` ,

  whoami: "You are webOS user.",
  date: () => new Date().toString(),
  fortune: () => "A smooth terminal is a happy terminal.",
  sudo: () => "Permission denied: This isn't Linux, buddy.",
  exit: () => "Session terminated. (Just kidding, welcome back.)",
  hack: () => "\n> Connecting...\n> Breaching firewall...\n> Uploading virus.exe...\n> System compromised. 💀",
  about: () => "webOS Terminal v1.0\nCreated by DominumNetwork\nTerminal shell simulation.",
  random: () => Math.floor(Math.random() * 1000000),
  joke: () => "Why do JavaScript devs wear glasses? Because they don't C#.",

  cowsay: (args) => `  ${args}\n   ^__^\n   (oo)\\_______\n   (__)\\       )\/\\\n       ||----w |\n       ||     ||`,

  math: (args) => {
    try {
      return "Result: " + eval(args);
    } catch {
      return "Math error.";
    }
  },

  tetris: () => {
    printOutput("Tetris launched. Use arrow keys to move.");
    startTetris();
  },

  snake: () => {
    printOutput("Launching Snake...");
    snakeCanvas.style.display = "block";
    startSnake();
  },

  matrix: () => {
    printOutput("Entering the Matrix...");
    matrixCanvas.style.display = "block";
    startMatrix();
  }
};

function printOutput(text) {
  const line = document.createElement("div");
  line.className = "terminal-output-line";
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function executeCommand(cmd) {
  const [command, ...args] = cmd.trim().split(" ");
  const inputLine = document.createElement("div");
  inputLine.className = "terminal-output-line";
  inputLine.innerHTML = `<span class='prompt'>webOS@user:~$</span> ${cmd}`;
  terminalOutput.appendChild(inputLine);

  if (command === "clear") {
    terminalOutput.innerHTML = "";
    snakeCanvas.style.display = "none";
    matrixCanvas.style.display = "none";
    return;
  }

  if (command === "echo") {
    printOutput(args.join(" "));
    return;
  }

  if (commands[command]) {
    const result = typeof commands[command] === "function" 
      ? commands[command](args.join(" ")) 
      : commands[command];
    if (result) printOutput(result);
  } else {
    printOutput(`Command not found: ${command}`);
  }
}

terminalInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const cmd = terminalInput.value;
    if (cmd.trim()) {
      history.unshift(cmd);
      historyIndex = -1;
    }
    executeCommand(cmd);
    terminalInput.value = "";
  }

  if (e.key === "ArrowUp") {
    if (historyIndex + 1 < history.length) {
      historyIndex++;
      terminalInput.value = history[historyIndex];
    }
  }

  if (e.key === "ArrowDown") {
    if (historyIndex > 0) {
      historyIndex--;
      terminalInput.value = history[historyIndex];
    } else {
      historyIndex = -1;
      terminalInput.value = "";
    }
  }
}
);

// Retain existing Tetris and Snake implementations below...
// --- Tetris Game Implementation ---
function startTetris() {
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 400;
  canvas.style.border = "1px solid #0f0";
  canvas.style.marginTop = "10px";
  terminalOutput.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 20;
  const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

  const shapes = [
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1], [1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[1, 1, 1, 1]]
  ];

  let current = {
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    x: 3,
    y: 0
  };

  function drawBlock(x, y, color = "#0f0") {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }

  function drawBoard() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) drawBlock(x, y);
      });
    });
    current.shape.forEach((row, dy) => {
      row.forEach((val, dx) => {
        if (val) drawBlock(current.x + dx, current.y + dy, "lime");
      });
    });
  }

  function validMove(x, y, shape) {
    return shape.every((row, dy) =>
      row.every((val, dx) => {
        const nx = x + dx;
        const ny = y + dy;
        return (!val || (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS && !board[ny][nx]));
      })
    );
  }

  function placeShape() {
    current.shape.forEach((row, dy) => {
      row.forEach((val, dx) => {
        if (val) board[current.y + dy][current.x + dx] = 1;
      });
    });
  }

  function clearLines() {
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every(v => v)) {
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(0));
        y++;
      }
    }
  }

  function drop() {
    if (validMove(current.x, current.y + 1, current.shape)) {
      current.y++;
    } else {
      placeShape();
      clearLines();
      current = {
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        x: 3,
        y: 0
      };
      if (!validMove(current.x, current.y, current.shape)) {
        printOutput("Game Over!");
        clearInterval(tetrisGame);
        return;
      }
    }
    drawBoard();
  }

  function move(dx) {
    if (validMove(current.x + dx, current.y, current.shape)) {
      current.x += dx;
      drawBoard();
    }
  }

  function rotate() {
    const rotated = current.shape[0].map((_, i) => current.shape.map(row => row[i]).reverse());
    if (validMove(current.x, current.y, rotated)) {
      current.shape = rotated;
      drawBoard();
    }
  }

  window.addEventListener("keydown", e => {
    switch (e.key) {
      case "ArrowLeft": move(-1); break;
      case "ArrowRight": move(1); break;
      case "ArrowDown": drop(); break;
      case "ArrowUp": rotate(); break;
    }
  });

  drawBoard();
  if (window.tetrisGame) clearInterval(window.tetrisGame);
  window.tetrisGame = setInterval(drop, 500);
}

// --- Snake Game Implementation ---
snakeCanvas.width = 200;
snakeCanvas.height = 200;
let snakeGame;
function startSnake() {
  const ctx = snakeCanvas.getContext("2d");
  const size = 20;
  const rows = snakeCanvas.height / size;
  const cols = snakeCanvas.width / size;
  let snake = [{ x: 5, y: 5 }];
  let dir = { x: 1, y: 0 };
  let food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
  let interval;

  function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    ctx.fillStyle = "lime";
    snake.forEach(p => ctx.fillRect(p.x * size, p.y * size, size, size));

    ctx.fillStyle = "red";
    ctx.fillRect(food.x * size, food.y * size, size, size);
  }

  function update() {
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (
      head.x < 0 || head.y < 0 ||
      head.x >= cols || head.y >= rows ||
      snake.some(p => p.x === head.x && p.y === head.y)
    ) {
      clearInterval(interval);
      printOutput("Game Over!");
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } else {
      snake.pop();
    }
    draw();
  }

  window.addEventListener("keydown", e => {
    switch (e.key) {
      case "ArrowUp": if (dir.y === 0) dir = { x: 0, y: -1 }; break;
      case "ArrowDown": if (dir.y === 0) dir = { x: 0, y: 1 }; break;
      case "ArrowLeft": if (dir.x === 0) dir = { x: -1, y: 0 }; break;
      case "ArrowRight": if (dir.x === 0) dir = { x: 1, y: 0 }; break;
    }
  });

  clearInterval(snakeGame);
  interval = setInterval(update, 200);
  snakeGame = interval;
}
