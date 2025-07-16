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

  cowsay: (args) => `  ${args}\n   \^__^\n   (oo)\\_______\n   (__)\\       )\/\\\n       ||----w |\n       ||     ||`,

  math: (args) => {
    try {
      return "Result: " + eval(args);
    } catch {
      return "Math error.";
    }
  },

  tetris: () => {
    printOutput("Tetris launched. Use arrow keys to move. [WIP]");
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
});

// --- Basic Tetris prototype ---
function startTetris() {
  const output = document.createElement("div");
  output.className = "terminal-output-line";
  output.id = "tetris-output";
  terminalOutput.appendChild(output);

  let board = Array(20).fill().map(() => Array(10).fill(" "));
  function renderBoard() {
    output.innerText = board.map(row => row.join(" ")).join("\n");
  }
  renderBoard();
  setTimeout(() => printOutput("[Tetris gameplay not implemented yet]"), 1000);
}

// --- Snake Game Implementation ---
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

// --- Matrix Effect Implementation ---
function startMatrix() {
  const ctx = matrixCanvas.getContext("2d");
  matrixCanvas.width = terminalOutput.clientWidth;
  matrixCanvas.height = terminalOutput.clientHeight;

  const letters = "アァイィウヴエェオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const fontSize = 14;
  const columns = Math.floor(matrixCanvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    ctx.fillStyle = "#0f0";
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = letters.charAt(Math.floor(Math.random() * letters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  if (window.matrixInterval) clearInterval(window.matrixInterval);
  window.matrixInterval = setInterval(drawMatrix, 50);
}
