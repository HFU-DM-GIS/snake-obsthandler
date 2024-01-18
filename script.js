// API Link
const RandomFact = 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=de';

// Game-related variables
const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const controls = document.querySelectorAll(".controls i");

let gameOver = false;
let foodX, foodY;
let snakeX = 15, snakeY = 15;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let lastMoveTime = Date.now();
let timer = 20;
let snakeInterval;
let foodEaten = 0;
let delay = 100;
let rows = 30;
let columns = 30;

// Function to create the playboard
const createPlayBoard = () => {
    playBoard.innerHTML = "";
    playBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    playBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
};

// Function to reduce playboard size
const reducePlayBoardSize = () => {
    if (rows > 1 && columns > 1) {
        rows -= 1;
        columns -= 1;
        createPlayBoard();
        updateFoodPosition();
    }
};

// Function to increase delay and speed
const increaseDelay = () => {
    delay -= 10;
    clearInterval(snakeInterval);
    snakeInterval = setInterval(startGame, delay);
};

// Function to level up and reset foodEaten
const levelUp = () => {
    clearInterval(snakeInterval);
    foodEaten = 0;
    delay = Math.max(delay - 20, 50);
    snakeInterval = setInterval(startGame, delay);
};

// Function to update the food position
const updateFoodPosition = () => {
    foodX = Math.floor(Math.random() * rows) + 1;
    foodY = Math.floor(Math.random() * columns) + 1;
};

// Async function to call API and display fact on game over
async function userAction() {
    try {
        const response = await fetch(RandomFact);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const myJson = await response.json();
        const parsejson = JSON.stringify(myJson, ["text"]);
        console.log(parsejson);
        alert("Schade ... Game Over, aber wusstest du schon: " + myJson["text"]);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to handle game over and display highscores
const handleGameOver = async () => {
    clearInterval(snakeInterval);
    await userAction();
    location.reload();
    displayHighscores();
};

// Function to change direction based on keyboard input
const changeDirection = e => {
    if (e.key === "ArrowUp" && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
};

// Function to start the timer
const startTimer = () => {
    const timerSpan = document.getElementById("timerSpan");

    const updateTimer = () => {
        timer--;
        timerSpan.innerText = timer;

        if (timer <= 0) {
            clearInterval(snakeInterval);
            handleGameOver();
        }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return timerInterval;
};

// Function to stop the timer
const stopTimer = () => {
    clearInterval(timerInterval);
};

// Load highscore from localStorage
let highscores = JSON.parse(localStorage.getItem('highscores')) || [];

// Function to save highscore in localStorage
const saveHighscore = (username, score) => {
    highscores.push({ username, score });
    highscores = highscores.sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem('highscores', JSON.stringify(highscores));
};

// Function to display highscores in the table
const displayHighscores = () => {
    const highscoresBody = document.getElementById("highscoresBody");

    highscores.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${index + 1}</td><td>${entry.username}</td><td>${entry.score}</td>`;
        highscoresBody.appendChild(row);
    });
};

// Event listeners for button clicks and keyboard input
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

// Function to initialize the game
const startGame = () => {
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastMoveTime;

    if (timeElapsed >= 100) {
        lastMoveTime = currentTime;

        if (gameOver) {
            handleGameOver();
            gameOver = false;
            const username = prompt("Game over! Enter your username:");
            if (username) {
                saveHighscore(username, score);
                displayHighscores();
            }
            return;
        }

        let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

        if (snakeX === foodX && snakeY === foodY) {
            updateFoodPosition();
            snakeBody.push([foodY, foodX]);
            scoreElement.innerText = `Score: ${score += 1}`;
            foodEaten += 1;

            if (foodEaten % 5 === 0) {
                increaseDelay();
            }

            if (foodEaten % 10 === 0) {
                levelUp();
            }

            if (foodEaten % 5 === 0) {
                reducePlayBoardSize();
            }

            clearInterval(snakeInterval);
            timer = 20;
            document.getElementById("timerSpan").innerText = timer;
            snakeInterval = setInterval(startGame, delay);
            snakeInterval = startTimer();
        }

        snakeX += velocityX;
        snakeY += velocityY;

        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = snakeBody[i - 1];
        }
        snakeBody[0] = [snakeX, snakeY];

        if (snakeX <= 0 || snakeX > rows || snakeY <= 0 || snakeY > columns) {
            return gameOver = true;
        }

        for (let i = 0; i < snakeBody.length; i++) {
            const isHead = i === 0;
            const className = isHead ? "head orange-head" : "head";
            html += `<div class="${className}" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;

            if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
                gameOver = true;
            }
        }

        for (let i = 0; i < snakeBody.length - snakeBody.length + 1; i++) {
            html += `<div class="tail" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
            if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
                gameOver = true;
            }
        }

        playBoard.innerHTML = html;
    }
};

// Initial setup
updateFoodPosition();
snakeInterval = setInterval(startGame, 100);
document.addEventListener("keyup", changeDirection);
