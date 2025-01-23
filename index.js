const player = document.getElementById("player");
const gameConsole = document.getElementById("game_console");
const scoreEl = document.getElementById("score");
const healthValue = document.getElementById("healthValue");
const gameDetails = document.getElementById("game_details");
const game = document.getElementById("game");

let playerHealth = 1000;
let score = 0;
let enemyCount = 0;
let enemyLimit = 10;
let enemyFireCount = 0;
const enemyFireLimit = 20;
let playerFireCount = 0;
const playerFireLimit = 50;
const enemyHitCount = new Map();

player.style.top = window.innerHeight/2  + "px";
player.style.left = window.innerWidth / 2 + "px";

function isColliding(a, b) {
  if (!a || !b) return false;
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return (
    r1.left < r2.right &&
    r1.right > r2.left &&
    r1.top < r2.bottom &&
    r1.bottom > r2.top
  );
}

function decreaseHealth(penalty) {
  playerHealth -= penalty;
  if (playerHealth < 0) playerHealth = 0;
  const ratio = playerHealth / 1000;
  healthValue.style.width = (ratio * 100) + "%";
  if (playerHealth <= 0) {
    gameConsole.remove();
    gameDetails.remove();
    const gameOver = document.createElement("div");
    gameOver.className = "gameOver";
    const message = document.createElement("h1");
    message.innerHTML = `GAME OVER<hr><br>YOUR SCORE: ${score}`;
    gameOver.appendChild(message);
    game.appendChild(gameOver);
  }
}

function removeEnemy(enemy) {
  enemyHitCount.delete(enemy);
  enemy.remove();
  enemyCount--;
  score += 10;
  scoreEl.innerText = score;
}

function spawnEnemy() {
  if (enemyCount >= enemyLimit) return;
  const enemy = document.createElement("div");
  enemy.className = "enemy";
  const img = document.createElement("img");
  img.src = "icons/enmy.png";
  enemy.appendChild(img);
  gameConsole.appendChild(enemy);

  enemyCount++;
  enemyHitCount.set(enemy, 0);

  let posX = Math.random() * (gameConsole.clientWidth - 100);
  let moveRight = Math.random() < 0.5;

  function moveEnemy() {
    if (!document.body.contains(enemy)) return;
    if (posX <= 0) moveRight = true;
    if (posX >= gameConsole.clientWidth - 100) moveRight = false;
    posX += moveRight ? 3 : -3;
    enemy.style.left = posX + "px";
    enemy.style.top = "0px";
    requestAnimationFrame(moveEnemy);
  }
  requestAnimationFrame(moveEnemy);
}

function spawnEnemyFires() {
  if (enemyFireCount >= enemyFireLimit) return;
  const enemies = document.getElementsByClassName("enemy");
  for (const enemy of enemies) {
    const fire = document.createElement("div");
    fire.className = "enemy_fire";
    const img = document.createElement("img");
    img.src = "icons/enemy_fire.png";
    fire.appendChild(img);
    gameConsole.appendChild(fire);

    fire.style.position = "absolute";
    let leftVal = parseInt(enemy.style.left) || 0;
    fire.style.left = leftVal + 30 + "px";
    fire.style.top = "100px";
    enemyFireCount++;
  }
}

function spawnPlayerFire() {
  if (playerFireCount >= playerFireLimit) return;
  playerFireCount++;
  const bullet = document.createElement("div");
  bullet.className = "player_fire";
  const img = document.createElement("img");
  img.src = "icons/player_fire.png";
  bullet.appendChild(img);
  bullet.style.position = "absolute";
  let leftVal = parseInt(player.style.left) || 0;
  let topVal = parseInt(player.style.top) || 0;
  bullet.style.left = (leftVal + 30) + "px";
  bullet.style.top = (topVal - 45) + "px";
  gameConsole.appendChild(bullet);
}

function handleMovements() {
  // Move enemy fires
  const enemyFires = document.getElementsByClassName("enemy_fire");
  for (const fire of enemyFires) {
    let topVal = parseInt(fire.style.top) || 0;
    topVal += 3;
    fire.style.top = topVal + "px";
    if (topVal > gameConsole.clientHeight) {
      fire.remove();
      enemyFireCount--;
    } else if (isColliding(fire, player)) {
      decreaseHealth(30);
      fire.remove();
      enemyFireCount--;
    }
  }

  // Move player fires
  const playerFires = document.getElementsByClassName("player_fire");
  for (const fire of playerFires) {
    let topVal = parseInt(fire.style.top) || 0;
    topVal -= 5;
    fire.style.top = topVal + "px";
    if (topVal <= 0) {
      fire.remove();
      playerFireCount--;
    }
  }

  // Collisions: player with enemies
  const enemies = document.getElementsByClassName("enemy");
  for (const enemy of enemies) {
    if (isColliding(enemy, player)) {
      removeEnemy(enemy);
      decreaseHealth(30);
    }
  }

  // Collisions: enemy with player fire
  for (const fire of document.getElementsByClassName("player_fire")) {
    for (const enemy of enemies) {
      if (isColliding(enemy, fire)) {
        const count = enemyHitCount.get(enemy) || 0;
        if (count >= 3) {
          removeEnemy(enemy);
        } else {
          enemyHitCount.set(enemy, count + 1);
        }
        fire.remove();
        playerFireCount--;
        break;
      }
    }
  }
}

function update() {
  handleMovements();
  requestAnimationFrame(update);
}

gameConsole.addEventListener("mousemove", (e) => {
  const rect = gameConsole.getBoundingClientRect();
  player.style.left = e.clientX - rect.left - 50 + "px";
  player.style.top = e.clientY - rect.top - 50 + "px";
});

gameConsole.addEventListener("drag", (e) => {
  const rect = gameConsole.getBoundingClientRect();
  player.style.left = e.clientX - rect.left - 50 + "px";
  player.style.top = e.clientY - rect.top - 50 + "px";
});

gameConsole.addEventListener("touchmove", (e) => {
  const rect = gameConsole.getBoundingClientRect();
  player.style.left = e.touches[0].clientX - rect.left - 50 + "px";
  player.style.top = e.touches[0].clientY - rect.top - 50 + "px";
});

// Timers for spawning
setInterval(spawnEnemy, 1500);
setInterval(spawnEnemyFires, 1000);
setInterval(spawnPlayerFire, 200);

// Start render loop
update();