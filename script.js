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
let speed = 100;
let rows = 30;
let columns = 30;

// API Link
const RandomFact = 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=de';



// Create a playboard
const createPlayBoard = () => {
    playBoard.innerHTML = "";
    playBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    playBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
};

// Reduce playboardsize by 1 Column and Row
const reducePlayBoardSize = () => {
    if (rows > 1 && columns > 1) {
        rows -= 1;
        columns -= 1;
        createPlayBoard();
        updateFoodPosition();
    }
};

// speed ist Geschwindigkeit, aber in SetInterval wird die Zeit gesetzt nach der die Funktion erneut aufgerufen wird. delay wäre geeigneter
// Increase speed by 10 
const increaseSpeed = () => {
    speed += 10;  //speed
    clearInterval(snakeInterval);
    snakeInterval = setInterval(initGame, speed);
}

// Decrease speed by 20 and add 50 speed
// diese Methode verkleinert speed, was das Spiel schneller macht, aber ist begrenzt auf 50 ms. Schneller wird es dann nicht mehr.
const levelUp = () => {
    clearInterval(snakeInterval);
    //    alert(`Level Up`);
    foodEaten = 0;
    speed = Math.max(speed - 20, 50);  // speed for the next level
    snakeInterval = setInterval(initGame, speed);
}

// update the foodposition
const updateFoodPosition = () => {
    // Passing a random 1 - 30 value as food position
    foodX = Math.floor(Math.random() * rows) + 1;
    foodY = Math.floor(Math.random() * columns) + 1;
}

// Call API
async function userAction() {
    const response = await fetch(RandomFact, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });
    const myJson = await response.json(); //extract JSON from the http response

    const parsejson = JSON.stringify(myJson, ["text"]); // parse Json into string
    console.log(parsejson);
    alert("Schade ... Game Over, aber wusstest du schon: " + myJson["text"]);
}

// Game Over Message
async function handleGameOver() {
    // Clearing the timer and reloading the page on game over
    clearInterval(setIntervalId);
    // Game Over
    // alert(userAction());
    await userAction();
    location.reload();
}

// Change Direction of the Snake
const changeDirection = e => {
    // Changing velocity value based on key press
    if (e.key === "ArrowUp" && velocityY != 1) {
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
}

// Timer to eat food
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


    // Initial call und interval for timer
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return timerInterval;
};

const stopTimer = () => {
    clearInterval(timerInterval);
};

// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

// Initialise Game
// diese Funktion macht weit mehr als nur das Spiel zu initialisieren. Unterteilt es in mehrere Funktionen.
const initGame = () => {
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastMoveTime;

    if (timeElapsed >= 100) { // initGame wird doch alle 100 ms aufgerufen, warum diese Abfrage?
        lastMoveTime = currentTime;

        if (gameOver) {
            handleGameOver();
            gameOver = false;
            return;
        }
        // dieses if wird nie erreicht, weil es ja schon vorher abgefragt wird
        if (gameOver) return handleGameOver();
        let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

        // Checking if the snake hit the food
        if (snakeX === foodX && snakeY === foodY) {
            updateFoodPosition();
            snakeBody.push([foodY, foodX]);
            scoreElement.innerText = `Score: ${score += 1}`;
            foodEaten += 1;

            // Increase speed after eating 5 food
            if (foodEaten % 5 === 0) {
                increaseSpeed();
            }

            // Level up after eating 10 food
            if (foodEaten % 10 === 0) {
                levelUp();
            }

            // Reduce Playboardsize after eating 5 food
            if (foodEaten % 5 === 0) {
                reducePlayBoardSize();
            }

            // Reset the timer when a fruit is collected
            clearInterval(snakeInterval);
            timer = 20;
            document.getElementById("timerSpan").innerText = timer;
            snakeInterval = setInterval(initGame, speed);
            snakeInterval = startTimer();
        }

        // Updating the snake's head position based on the current velocity
        snakeX += velocityX;
        snakeY += velocityY;

        // Shifting forward the values of the elements in the snake body by one
        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = snakeBody[i - 1];
        }
        snakeBody[0] = [snakeX, snakeY]; // Setting first element of snake body to current snake position

        // Checking if the snake's head is out of wall, if so setting gameOver to true
        if (snakeX <= 0 || snakeX > rows || snakeY <= 0 || snakeY > columns) {
            return gameOver = true;
        }

        for (let i = 0; i < snakeBody.length; i++) {
            // Adding a div for each part of the snake's body
            if (i === 0) {
                // Add the orange-head class to the head of the snake
                html += `<div class="head orange-head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
            } else {
                html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
            }

            // Checking if the snake head hit the body, if so set gameOver to true
            if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
                gameOver = true;
            }
        }

        for (let i = 0; i < snakeBody.length - snakeBody.length + 1; i++) {
            // Adding a div for each part of the snake's body
            html += `<div class="tail" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
            // Checking if the snake head hit the body, if so set gameOver to true
            if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
                gameOver = true;
            }
        }

        playBoard.innerHTML = html;
    }
};

updateFoodPosition();
snakeInterval = setInterval(initGame, 100);
//snakeInterval = startTimer();
// warum wird changeDirection erneut aufgerufen, wenn man die Taste loslässt?
document.addEventListener("keyup", changeDirection); 