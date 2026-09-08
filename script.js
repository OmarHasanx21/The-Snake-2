//function to get element by id
function i(id) {
    return document.getElementById(id);
}

let startButton = i("startButton"), startPage =i("startPage"), pauseButton = i("pauseButton");

const gridColumns = 25;
const gridRows = 25;
let blockSize;
let boardWidth;
let boardHeight;


let lastTime =0, fps = 0, frameCount =0, fpsTimer =0;
let deltaTime =0;
let accumulator =0;

let isPaused = 1;

startButton.addEventListener("click", function () {
	startGame();
} )

pauseButton.addEventListener("click", function() {
	pauseGame(1);
})



let snake = {
	color:"red",
	direction:"right",
	speed:1000/5,
	tail: [
		{x:5, y:5}, {x:4, y:5}, {x:3, y:5}
	]
}

let food = {color:"purple", x:10, y:10};

let inputQueue = [];

let canvas, ctx;
//setup the canvas and start the game loop
window.onload = function() {

	canvas = i("canvas");
	ctx = canvas.getContext('2d');
	
	resizeCanvas();
	window.addEventListener('resize', resizeCanvas);


};


function startGame() {
	startPageToggle(0);
	isPaused = 0;
	lastTime = 0;
	requestAnimationFrame(gameLoop);
	pauseButtonToggle(true);
	inputQueue = [];

}

function startPageToggle(p) {
	
	startPage.style.display = p ? "flex" : "none";

}

function pauseButtonToggle(show) {

	pauseButton.style.display = show ? "block" : "none";

}

function pauseGame(c) {
	startPageToggle(1);
	isPaused = 1;
	pauseButtonToggle(false);
	startButton.innerHTML = c ? "Resume" : "Start Again";
	inputQueue = [];

}

function gameOver() {
	pauseGame(0);
	startAgain();
}

function startAgain() {
	snake.tail=[{x:5, y:5}, {x:4, y:5}, {x:3, y:5}];
	snake.direction = "right";
	snake.speed = 1000/5;
	getNewFood();
	inputQueue = [];
	
}

// Resize the canvas responsively while keeping the fixed grid count (25x25) most convienent for all screens and for fairplay
function resizeCanvas() {
	if (!canvas) return;

	// Use up to 95% width and 85% height to leave margin for buttons and UI
	const maxWidth = window.innerWidth * 0.95;
	const maxHeight = window.innerHeight * 0.85;

	// Calculate block size so both width and height fit comfortably
	blockSize = Math.floor(Math.min(maxWidth / gridColumns, maxHeight / gridRows));
	boardWidth = blockSize * gridColumns;
	boardHeight = blockSize * gridRows;

	canvas.width = boardWidth;
	canvas.height = boardHeight;
	canvas.style.backgroundColor = "#222";

	// Center the canvas on screen
	canvas.style.position = "absolute";
	canvas.style.left = ((window.innerWidth - boardWidth) / 2) + "px";
	canvas.style.top = ((window.innerHeight - boardHeight) / 2) + "px";

	drawGameComponents();
}



function gameLoop(timestamp) {
	
	if(isPaused) return;

	//Calculate FPS
	if (!lastTime) lastTime = timestamp;
	deltaTime = timestamp - lastTime;
	lastTime = timestamp;
	fpsTimer += deltaTime;
	frameCount++;
	if(fpsTimer >= 1000) {
		fps = frameCount;
		frameCount = 0;
		fpsTimer = 0;
	}

	//Move the snake based on its speed
	if(accumulator > snake.speed) accumulator = snake.speed;
	accumulator +=deltaTime;
	if(accumulator >= snake.speed) {
		MoveSnake();
		accumulator = 0;
	}

	//Draw the game
	drawGameComponents();

	requestAnimationFrame(gameLoop);

}


//Draw the Game Components
function drawGameComponents() {
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
/*
	//Draw the grid (experemintal)
	ctx.beginPath();
	
	for (let x=0; x<=boardWidth; x+= blockSize) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, boardHeight);
	}
	for (let y=0; y<=boardHeight; y+= blockSize) {
		ctx.moveTo(0, y);
		ctx.lineTo(boardWidth, y);
	}

	ctx.strokeStyle="white";
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.closePath();
*/


	//Draw the Snake
	ctx.beginPath();
	ctx.fillStyle = snake.color;
	for(let i=0; i<snake.tail.length; i++) {
		ctx.fillRect(blockSize * snake.tail[i].x, blockSize * snake.tail[i].y, blockSize, blockSize);
	}
	ctx.closePath();


	//Draw the food
	ctx.beginPath();
	ctx.fillStyle=food.color;
	ctx.fillRect(food.x*blockSize,food.y*blockSize, blockSize, blockSize);
	ctx.closePath();


	//Draw the FPS
	ctx.fillStyle = "#0f0";
	ctx.font = "20px Arial";
	ctx.textAlign ="right";
	ctx.fillText(fps, canvas.width-20, 30);
	ctx.textAlign ="left";

	ctx.fillStyle = "#fff";
	ctx.font = "20px Arial";
	ctx.textAlign ="center";
	ctx.fillText("Score: " + (snake.tail.length - 3), canvas.width/2, 30);
	
}



//Move the Snake with arrow keys
document.addEventListener("keydown", function(e) {

    // 1. Prevent keys if 2 moves are already queued
    if (inputQueue.length >= 2) return;

    // 2. Find the last planned direction to compare against
    const lastDirection = inputQueue.length > 0 
        ? inputQueue[inputQueue.length - 1] 
        : snake.direction;

    // 3. Queue valid turns
    switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            e.preventDefault();
            
                queueDirection("up");
            
            break;

        case "ArrowDown":
        case "s":
        case "S":
            e.preventDefault();
                queueDirection("down");
            
            break;

        case "ArrowLeft":
        case "a":
        case "A":
            e.preventDefault();
                queueDirection("left");
            
            break;

        case "ArrowRight":
        case "d":
        case "D":
            e.preventDefault();
                queueDirection("right");
            
            break;

		case "Escape" :
			if( isPaused ) {
				startGame();
			}
			else {
			pauseGame(1);
			}
			break;
    }
});

//Move the snake based on its direction its called in the gameLoop
function MoveSnake() {

	if(inputQueue.length > 0) {
		snake.direction = inputQueue.shift();
	}

	let headX = snake.tail[0].x;
	let headY = snake.tail[0].y;

		
	switch(snake.direction) {
		case "up":
			headY--;
			break;
		case "down":
			headY++;
			break;
		case "left":
			headX--;
			break;
		case "right":
			headX++;
			break;

	}

	//add the new head
	snake.tail.unshift({x: headX, y: headY});

	//check if snake ate itself
	for (let i =1; i< snake.tail.length; i++) {
		if(headX == snake.tail[i].x && headY == snake.tail[i].y) {
			gameOver();
			return;
		}
	}

	//check for wall collision
		if(headX< 0 || headX>= gridColumns || headY < 0 || headY >= gridRows) {
			gameOver();
			return;
		}
	


	//Check for food collision
		if(headX == food.x && headY == food.y) {

			//get New Food
			getNewFood();

			//make it faster
			snake.speed *= 0.97;
		}
		else {
			//remove the last tail if snake didnt eat food
			snake.tail.pop();
		}
	
}

function getNewFood() {
	let newFoodX, newFoodY;
	do {
		newFoodX = Math.floor(Math.random() *gridColumns);
		newFoodY = Math.floor(Math.random() * gridRows);
	}
	while(snake.tail.some(segment => segment.x === newFoodX && segment.y === newFoodY));

	food.x = newFoodX;
	food.y = newFoodY;
	food.color = getRandomColor("rgb", 255, 1);
	
}

function getRandomColor(type, max, opacity) {

	switch (type) {
		case "rgb": return `rgb(${Math.floor(Math.random() * max)}, ${Math.floor(Math.random()* max)}, ${Math.floor(Math.random() * max)})`;
		case "rgba": return `rgba(${Math.floor(Math.random() * max)}, ${Math.floor(Math.random()* max)}, ${Math.floor(Math.random() * max)}, ${opacity})`;
		default: return `#${Math.floor(Math.random()*16777215).toString(16)}`;
	}
}
//add touch support for mobile devices
function queueDirection(newDirection) {
	if(isPaused) return;
	if(inputQueue.length >= 2) return;
	
	const lastDirection = inputQueue.length > 0
		? inputQueue[inputQueue.length - 1]
		: snake.direction;
		if(newDirection === "up" && lastDirection !== "down" && lastDirection !== "up") {
			inputQueue.push("up");
		}
		else if (newDirection === "down" && lastDirection !== "up" && lastDirection !== "down") {
       		 inputQueue.push("down");
   		 } else if (newDirection === "left" && lastDirection !== "right" && lastDirection !== "left") {
       		 inputQueue.push("left");
   		 } else if (newDirection === "right" && lastDirection !== "left" && lastDirection !== "right") {
        inputQueue.push("right");
    }
}

let touchStartX = 0;
let touchStartY = 0;
const minSwipeDistance = 30; // Minimum distance in pixels to count as a swipe (prevents accidental taps)

window.addEventListener("touchstart", function(e) {
    // Only track single-finger gestures
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}, { passive: true });

window.addEventListener("touchend", function(e) {
    if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Check if movement exceeds threshold
        if (Math.abs(diffX) > minSwipeDistance || Math.abs(diffY) > minSwipeDistance) {
            // Determine if the swipe was more horizontal or vertical
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe (Left or Right)
                if (diffX > 0) {
                    queueDirection("right");
                } else {
                    queueDirection("left");
                }
            } else {
                // Vertical swipe (Up or Down)
                if (diffY > 0) {
                    queueDirection("down");
                } else {
                    queueDirection("up");
                }
            }
        }
    }
}, { passive: true });


// 1. Prevent touchpad pinch zoom and Ctrl + Mouse Wheel zoom
window.addEventListener('wheel', function(e) {
	if (e.ctrlKey) {
		e.preventDefault();
	}
}, { passive: false });

// 2. Prevent Ctrl + / Ctrl - / Ctrl 0 keyboard shortcuts
window.addEventListener('keydown', function(e) {
	if (e.ctrlKey || e.metaKey) {
		if (
			e.key === '+' ||
			e.key === '-' ||
			e.key === '=' ||
			e.key === '_' ||
			e.key === '0' ||
			e.code === 'NumpadAdd' ||
			e.code === 'NumpadSubtract' ||
			e.code === 'Numpad0' ||
			e.code === 'Equal' ||
			e.code === 'Minus' ||
			e.code === 'Digit0'
		) {
			e.preventDefault();
		}
	}
});

// 3. Prevent Safari / WebKit gesture zooming (trackpad pinch and iOS gestures)
document.addEventListener('gesturestart', function(e) {
	e.preventDefault();
});
document.addEventListener('gesturechange', function(e) {
	e.preventDefault();
});
document.addEventListener('gestureend', function(e) {
	e.preventDefault();
});

// 4. Prevent multi-touch pinch zooming on touchscreens
document.addEventListener('touchstart', function(e) {
	if (e.touches.length > 1) {
		e.preventDefault();
	}
}, { passive: false });

