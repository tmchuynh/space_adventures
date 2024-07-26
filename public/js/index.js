const gameContainer = document.querySelector(".game-container");
const player = document.querySelector(".player");
const laser = document.querySelector(".laser");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const highScoreElement = document.getElementById("high-score");
const startButton = document.getElementById("start-button");
let gameInterval, enemyInterval, playerInterval;
let score = 0;
let lives = 4;
let highScore = localStorage.getItem("highScore") || 0;
const collidedEnemies = new Set();

// Function to move the player left or right
function movePlayer(event) {
      const key = event.key;
      const leftArrow = 37;
      const rightArrow = 39;

      if (key === "ArrowLeft" || event.keyCode === leftArrow) {
            movePlayerLeft();
      } else if (key === "ArrowRight" || event.keyCode === rightArrow) {
            movePlayerRight();
      }
}

function movePlayerLeft() {
      const currentPosition = parseInt(
            window.getComputedStyle(player).getPropertyValue("left")
      );
      if (currentPosition > 0) {
            player.style.left = `${currentPosition - 10}px`;
      }
}

function movePlayerRight() {
      const currentPosition = parseInt(
            window.getComputedStyle(player).getPropertyValue("left")
      );
      const gameContainerWidth = parseInt(
            window.getComputedStyle(gameContainer).getPropertyValue("width")
      );
      if (currentPosition < gameContainerWidth - 40) {
            player.style.left = `${currentPosition + 10}px`;
      }
}

function fireLaser() {
      laser.style.display = "block";
      const playerPosition =
            parseInt(window.getComputedStyle(player).getPropertyValue("left")) + 18;
      laser.style.left = `${playerPosition}px`;
      laser.style.top = `${gameContainer.offsetHeight - 80}px`;

      const laserInterval = setInterval(() => {
            const laserPosition = parseInt(laser.style.top);
            if (laserPosition > -10) {
                  laser.style.top = `${laserPosition - 10}px`;
                  checkLaserCollision(); // Check collision with enemies
            } else {
                  clearInterval(laserInterval);
                  laser.style.display = "none";
                  laser.style.top = "0px";
            }
      }, 50);
}

document.addEventListener("keydown", movePlayer);

// Spacebar triggers laser firing
document.addEventListener("keydown", function (event) {
      if (event.key === " " || event.keyCode === 32) {
            fireLaser();
      }
});

function createEnemy() {
      const enemy = document.createElement("div");
      enemy.classList.add("enemy");
      const enemyPosition = Math.floor(
            Math.random() * (gameContainer.scrollWidth - 40)
      );
      enemy.style.left = `${enemyPosition}px`;
      gameContainer.appendChild(enemy);

      setTimeout(() => {
            enemy.style.top = `${gameContainer.scrollHeight}px`; // Move enemy towards the player
            checkLaserCollision();
      }, 100);
}

function startGame() {
      gameInterval = setInterval(createEnemy, 3000);
      enemyInterval = setInterval(checkEnemyOffScreen, 10);
      playerInterval = setInterval(checkPlayerCollision, 100);
}

startButton.addEventListener("click", () => {
      startGame();
      startButton.style.display = "none"; // Hide the button after starting the game
});

function checkLaserCollision() {
      const enemies = document.querySelectorAll(".enemy");
      enemies.forEach((enemy) => {
            if (isCollision(laser, enemy)) {
                  enemy.style.transition = "none";
                  enemy.style.top = "600px"; // Move enemy off-screen
                  score++; // Updates the score
                  scoreElement.textContent = score;
                  updateHighScore();
                  laser.style.display = "none"; // Hide laser after hitting an enemy
            }
      });
}

function isCollision(obj1, obj2) {
      const rect1 = obj1.getBoundingClientRect();
      const rect2 = obj2.getBoundingClientRect();

      return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
      );
}

function updateHighScore() {
      if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            highScoreElement.textContent = highScore;
      }
}

function checkPlayerCollision() {
      const enemies = document.querySelectorAll(".enemy");
      enemies.forEach((enemy) => {
            if (isCollision(player, enemy) && !collidedEnemies.has(enemy)) {
                  enemy.style.transition = "none";
                  enemy.style.top = "600px"; // Move enemy off-screen
                  collidedEnemies.add(enemy);
                  reduceLife(); // Deduct life when player collides with enemy
            }
      });
}

function reduceLife() {
      lives--;
      livesElement.textContent = lives;
      if (lives === 0) {
            endGame();
      }
}

function checkEnemyOffScreen() {
      const enemies = document.querySelectorAll(".enemy");
      const gameContainerHeight = parseInt(
            window.getComputedStyle(gameContainer).getPropertyValue("height")
      );

      enemies.forEach((enemy) => {
            const enemyRect = enemy.getBoundingClientRect();

            if (enemyRect.bottom > gameContainerHeight && !collidedEnemies.has(enemy)) {
                  // Player completely missed the enemy
                  reduceLife();
                  collidedEnemies.add(enemy);
                  enemy.remove();
            }
      });
}

function endGame() {
      clearInterval(gameInterval); // Stop the game interval
      alert(`Game Over! Your final score is ${score}`);
      if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            highScoreElement.textContent = highScore;
      }
      resetGame();
}

function resetGame() {
      score = 0;
      lives = 3;
      scoreElement.textContent = score;
      livesElement.textContent = lives;
      const enemies = document.querySelectorAll(".enemy");
      enemies.forEach((enemy) => enemy.remove());
      startButton.style.display = "flex"; // Show the button after starting the game
      collidedEnemies.clear(); // Clear the set of collided enemies
}

// Initialize game (not auto-started)
scoreElement.textContent = score;
livesElement.textContent = lives;
highScoreElement.textContent = highScore;
