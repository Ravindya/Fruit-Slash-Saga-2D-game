const characterElm = document
    .querySelector('#character');
const scoreElm = document.getElementById('score');
const gameOverElm = document.getElementById('game-over');
const gameWinElm = document.getElementById('game-win');
const finalScoreElm = document.getElementById('final-score');
const yourScoreElm = document.getElementById('your-score');
const exit1Button = document.getElementById('Exit1');
const exit2Button = document.getElementById('Exit2');
const nextLevelButton = document.getElementById('next-level');
const restartButton = document.getElementById('restart');
const winingcupCounter = document.getElementById('winingcup-counter');

await new Promise((resolve)=>{
    document.querySelector("#start-screen > button")
        .addEventListener('click', async ()=>{
            await document.querySelector("html").requestFullscreen({
                navigationUI: 'hide',
            });
            document.querySelector("#start-screen").remove();
            resolve();
        });
});

// Score tracking
let score = 0;
let isGameOver = false;

await new Promise(function (resolve) {

    const images = ['/image/BG.jpg',
        '/image/tile/Tile (1).png',
        '/image/tile/Tile (2).png',
        '/image/tile/Tile (3).png',
        ...Array(10).fill('/image/character')
            .flatMap((v, i) => [
                `${v}/Jump__00${i}.png`,
                `${v}/Idle__00${i}.png`,
                `${v}/Run__00${i}.png`,
                `${v}/Attack__00${i}.png`,
            ])
    ];
    for (const image of images) {
        const img = new Image();
        img.src = image;
        img.addEventListener('load', progress);
    }

    const barElm = document.getElementById('bar');
    const totalImages = images.length;

    function progress(){
        images.pop();
        barElm.style.width = `${100 / totalImages * (totalImages - images.length)}%`
        if (!images.length){
            setTimeout(()=>{
                document.getElementById('overlay').classList.add('hide');
                resolve();
            }, 1000);
        }
    }
});

/* background music */
const backgroundMusicElement = document.getElementById("background-music");

const giftMusicElm = document.getElementById("gift-music");
const loseGameMusicElm = document.getElementById("lose-game-music");
const winGameMusicElm = document.getElementById("win-game-music");

// Play the audio
function playBackgroundMusic() {
    backgroundMusicElement.play();
    backgroundMusicElement.volume = 0.5;
    backgroundMusicElement.addEventListener("ended", () => {
        backgroundMusicElement.currentTime = 0; // Reset playback position to the beginning
        backgroundMusicElement.play(); // Start playing again
    });
}

playBackgroundMusic();

let fruit='';

function startGame() {
    isGameOver = false;
    score =0; // Increment score
    dropMainCharacter();
    scoreElm.textContent = `Score: ${score}`;
    gameOverElm.classList.add('hide');
    winingcupCount = 0;
    winingcupCounter.textContent = `You earned Wining Cups: ${winingcupCount}`; // Initialize counter text
    animateFruit(fruit);
    // Other game initialization code...
}

let dx = 0;                     // Run
let i = 0;                      // Rendering
let t = 0;
let run = false;
let jump = false;
let angle = 0;
let tmr4Jump;
let tmr4Run;
let renderTmr;
let tmr4Attack;
let previousTouch;
let attack = false;

// Fruits array for managing active fruits
const fruits = [];
let FRUIT_FALL_SPEED = 4; // Pixels per frame
const FRUIT_SPAWN_INTERVAL = 1500; // Milliseconds

// Start spawning fruits
let fruitSpawnInterval = setInterval(createFruit, FRUIT_SPAWN_INTERVAL);

/* Rendering Function */
function renderCharacters() {
    renderTmr = setInterval(() => {
        if (jump) {
            characterElm.style.backgroundImage =
                `url('/image/character/Jump__00${i++}.png')`;
            if (i === 10) i = 0;
        } else if (!run && !attack) {
            characterElm.style.backgroundImage =
                `url('/image/character/Idle__00${i++}.png')`;
            if (i === 10) i = 0;
        }
        if (attack) {
            characterElm.style.backgroundImage =
                `url('/image/character/Attack__00${i++}.png')`;
            if (i === 10) i = 0;
        } else if (run) {
            characterElm.style.backgroundImage =
                `url('/image/character/Run__00${i++}.png')`;
            if (i === 10) i = 0;
        }
    }, 1000 / 30);
}
renderCharacters();

// Initially Fall Down
function dropMainCharacter() {
    const tmr4InitialFall = setInterval(() => {
        const top = characterElm.offsetTop + (t++ * 0.2);
        if (characterElm.offsetTop >= (innerHeight - 128 - characterElm.offsetHeight)) {
            clearInterval(tmr4InitialFall);
            return;
        }
        characterElm.style.top = `${top}px`
    }, 20);
}
dropMainCharacter();

// Jump
function doJump() {
    if (tmr4Jump) return;
    i = 0;
    jump = true;
    const initialTop = characterElm.offsetTop;
    tmr4Jump = setInterval(() => {
        const top = initialTop - (Math.sin(toRadians(angle++))) * 150;
        characterElm.style.top = `${top}px`
        if (angle === 181) {
            clearInterval(tmr4Jump);
            tmr4Jump = undefined;
            jump = false;
            angle = 0;
            i = 0;
        }
    }, 1);
}

// Utility Fn (Degrees to Radians)
function toRadians(angle) {
    return angle * Math.PI / 180;
}

// Run
function doRun(left) {
    if (tmr4Run) return;
    run = true;
    i = 0;
    if (left) {
        dx = -10;
        characterElm.classList.add('rotate');
    } else {
        dx = 10;
        characterElm.classList.remove('rotate');
    }
    tmr4Run = setInterval(() => {
        if (dx === 0) {
            clearInterval(tmr4Run);
            tmr4Run = undefined;
            run = false;
            i = 0;
            return;
        }
        const left = characterElm.offsetLeft + dx;
        if (left + characterElm.offsetWidth >= innerWidth ||
            left <= 0) {
            if (left <= 0){
                characterElm.style.left = '0';
            }else{
                characterElm.style.left = `${innerWidth - characterElm.offsetWidth - 1}px`
            }
            dx = 0;
            return;
        }
        characterElm.style.left = `${left}px`;
    }, 20);
}
//Attack
function doAttack() {
    if (tmr4Attack) return;
    attack = true;
    i = 0;
    tmr4Attack = setInterval(() => {
        if (run) {
            clearInterval(tmr4Attack);
            tmr4Attack = undefined;
            attack = false;
            i = 0;
        }
    }, 30);  // Duration of attack animation
}
// Event Listeners
addEventListener('keydown', (e) => {
    if (isGameOver===true)return;
    switch (e.code) {
        case "ArrowLeft":
        case "ArrowRight":
            doRun(e.code === "ArrowLeft");
            break;
        case "Space":
            doJump();
            break;
        case "ArrowUp":
            doAttack();
    }
});

addEventListener('keyup', (e) => {
    if (isGameOver===true)return;
    switch (e.code) {
        case "ArrowLeft":
        case "ArrowRight":
            dx = 0;
            break;
        case "ArrowUp":
            clearInterval(tmr4Attack);
            tmr4Attack = undefined;
            attack = false;
    }
});

const resizeFn = ()=>{
    characterElm.style.top = `${innerHeight - 128 - characterElm.offsetHeight}px`;
    /*if (characterElm.offsetLeft < 0){
        characterElm.style.left = '0';
    }else*/ if (characterElm.offsetLeft >= innerWidth ){
        characterElm.style.left = `${innerWidth - characterElm.offsetWidth - 1}px`
    }
}

addEventListener('resize', resizeFn);
/* Fix screen orientation issue in mobile devices */
screen.orientation.addEventListener('change', resizeFn);

characterElm.addEventListener('touchmove', (e)=>{
    if (!previousTouch){
        previousTouch = e.touches.item(0);
        return;
    }
    const currentTouch = e.touches.item(0);
    doRun((currentTouch.clientX - previousTouch.clientX) < 0);
    if (currentTouch.clientY < previousTouch.clientY) doJump();
    previousTouch = currentTouch;
});
characterElm.addEventListener('touchend', (e)=>{
    previousTouch = null;
    dx = 0;
});

// Function to create fruits
function createFruit() {
    const fruitTypes = [
        '/image/fruits/avocado.png',
        '/image/fruits/watermelon.png',
        '/image/fruits/cherry.png',
        '/image/fruits/lemon.png',
        '/image/fruits/strawberry.png',
        '/image/fruits/red_apple.png',
        '/image/fruits/fruitbomb.png',
        '/image/fruits/winingcup.png',
    ];

    const fruitIndex = Math.floor(Math.random() * fruitTypes.length);
    fruit = document.createElement('div');
    fruit.className = 'fruit';
    fruit.style.backgroundImage = `url('${fruitTypes[fruitIndex]}')`;
    fruit.style.left = `${Math.random() * (window.innerWidth - 100)}px`; // Random X position
    document.body.appendChild(fruit);
    fruits.push(fruit);
    animateFruit(fruit);
}

// Function to animate falling fruits
function animateFruit(fruit) {
    const fallInterval = setInterval(() => {
        let top = fruit.offsetTop + FRUIT_FALL_SPEED;
        fruit.style.top = `${top}px`;

        checkFruitCollision();

        // Remove fruit if it falls off the screen
        if (top >= window.innerHeight-155) {
            fruit.classList.add('hide');
            fruit.remove();
            clearInterval(fallInterval);
        }
    }, 20);
}

// function makeCharacterDead() {
//     i = 0;
//     let deadTmr = setInterval(() => {
//         characterElm.style.backgroundImage = `url(/image/character/Dead__00${i++}.png)`;
//         if (i === 10) {
//             i=9;
//             /*stop game timers*/
//             clearInterval(tmr4Jump);
//             clearInterval(tmr4Run);
//             clearInterval(tmr4Attack);
//             clearInterval(renderTmr);
//
//         }
//         clearInterval(deadTmr);
//     }, 1000/30);
// }


// Function to check collision between two elements
function collisionCheck(elem1, elem2) {
        const rect1 = elem1.getBoundingClientRect();
        const rect2 = elem2.getBoundingClientRect();
        return !(rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom);
}
let winingcupCount = 0; // Counter for winingcup fruits touched

function checkFruitCollision() {
    const fruits = document.querySelectorAll('.fruit');
    fruits.forEach(fruit => {
        if (collisionCheck(characterElm, fruit)) {
            if (fruit.style.backgroundImage.includes('fruitbomb.png')) {
                // Game over condition
                gameOver();
            } else if (fruit.style.backgroundImage.includes('winingcup.png')) {
                // Check if it's already sliced to avoid multiple counts
                if (!fruit.classList.contains('sliced')) {
                    fruit.classList.add('sliced'); // Mark fruit as sliced
                    giftMusicElm.play();
                    winingcupCount++; // Increment winingcup count
                    winingcupCounter.textContent = `You earned Wining Cups: ${winingcupCount}`;
                    // Check if winingcup count reaches 5
                    if (winingcupCount === 3) {
                        winGame(); // Trigger win condition
                    }
                }
            } else if (attack && !fruit.classList.contains('sliced')) {
                fruit.classList.add('sliced'); // Mark fruit as sliced
                setTimeout(() => {
                    fruit.remove(); // Remove fruit from DOM after delay
                    score += 2; // Increment score
                    scoreElm.textContent = `Score: ${score}`; // Update score display
                }, 200); // Delay before removing sliced fruit
            }
        }
    });
}

function winGame() {
    clearInterval(tmr4Jump);
    clearInterval(tmr4Run);
    clearInterval(tmr4Attack);
    clearInterval(fruitSpawnInterval);

    backgroundMusicElement.pause(); /* pause background music */
    winGameMusicElm.play(); /* play winning music */

    isGameOver = false;
    yourScoreElm.textContent = score;
    gameWinElm.style.display = 'block';
    gameWinElm.classList.remove('hide');
}

function gameOver() {
    clearInterval(tmr4Jump);
    clearInterval(tmr4Run);
    clearInterval(tmr4Attack);
    clearInterval(fruitSpawnInterval);

    backgroundMusicElement.pause(); /* pause background music */
    loseGameMusicElm.play(); /* play winning music */

    isGameOver = true;
    finalScoreElm.textContent = score;
    gameOverElm.style.display = 'block';
    gameOverElm.classList.remove('hide');
}

function resetGame() {
    // Clear all intervals to avoid multiple interval issues
    clearInterval(tmr4Jump);
    clearInterval(tmr4Run);
    clearInterval(tmr4Attack);
    clearInterval(renderTmr);
    clearInterval(fruitSpawnInterval);

    playBackgroundMusic();

    // Reset game variables and UI elements
    run = false;
    attack = false;
    jump = false;
    t = 0;
    score = 0;
    scoreElm.textContent = `Score: ${score}`;
    gameOverElm.classList.add('hide');
    gameWinElm.classList.add('hide');
    characterElm.style.top = `${-20}px`;
    characterElm.style.left = `${20}px`;
    winingcupCount = 0;
    winingcupCounter.textContent = `You earned Wining Cups: ${winingcupCount}`;

    // Remove all existing fruits from the screen
    fruits.forEach(fruit => fruit.remove());
    fruits.length = 0;

    // Restart the game
    renderCharacters();
    startGame();

    // Restart the fruit spawning interval
     fruitSpawnInterval = setInterval(createFruit, FRUIT_SPAWN_INTERVAL);
}

resetGame();

restartButton.addEventListener('click', ()=>{
    location.reload();
});

nextLevelButton.addEventListener('click', () => {
    FRUIT_FALL_SPEED += 1; // Increase fruit fall speed by 1
    resetGame();
});

exit1Button.addEventListener('click', () => {
    /* reload the game */
    location.reload();
});
exit2Button.addEventListener('click', () => {
    /* reload the game */
    location.reload();
});