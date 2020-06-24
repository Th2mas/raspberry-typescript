/**
 * Remember:
 * Since we have 'Tetromino's, we only have 4 LEDs to work with
 *
 * LED0: Index 0, 2^0 -> 1 = 0x1
 * LED1: Index 1, 2^1 -> 2 = 0x2
 * LED2: Index 2, 2^2 -> 4 = 0x4
 * LED3: Index 3, 2^2 -> 8 = 0x8
 */
const LED0 = 0x1;
const LED1 = 0x2;
const LED2 = 0x4;
const LED3 = 0x8;

/**
 * This type describes all possible rotations of a tetromino
 * The properties describe the tetromino at a specific angle (0°, 90°, 180°, 270°) with 0° being the default case
 * We assumed a clockwise rotation
 * The value can either be an array (already defined which LEDs will be on) or a number. The number is a reference to the
 * property inside the block, which holds the information array
 */
interface TetrominoBlock {
    0: Array<number> | number;
    90: Array<number> | number;
    180: Array<number> | number;
    270: Array<number> | number;
}

/**
 * This is the interface for the object containing all possible tetromino block
 */
interface Tetromino {
    I: TetrominoBlock;
    J: TetrominoBlock;
    L: TetrominoBlock;
    O: TetrominoBlock;
    T: TetrominoBlock;
    S: TetrominoBlock;
    Z: TetrominoBlock;
}

/**
 * Describes the possible tetromino blocks
 */
enum TetrominoLetter {
    I,
    J,
    L,
    O,
    T,
    S,
    Z
}

/**
 * The number of all possible tetromino blocks
 */
const NUM_TETROMINO_BLOCKS = 7;

/**
 * This object holds all possible tetromino blocks and their rotation values
 */
const TETROMINO: Tetromino = {
    I: {
        0: [LED0, LED0, LED0, LED0],        // 4 rows, all LED0
        90: [LED0 | LED1 | LED2 | LED3],    // 1 row, LED0, LED1, LED2, LED3
        180: 0,                             // Reference to '0'
        270: 90                             // Reference to '90'
    },
    J: {
        0: [LED1, LED1, LED0 | LED1],       // 1st row: LED1, 2nd row: LED1, 3rd row: LED0, LED1
        90: [LED0, LED0 | LED1 | LED2],     // 1st row: LED0, 2nd row: LED0, LED1, LED2
        180: [LED0 | LED1, LED0, LED0],     // 1st row: LED0, LED1, 2nd row: LED0, 3rd row: LED0
        270: [LED0 | LED1 | LED2, LED2]     // 1st row: LED0, LED1, LED2, 2nd row: LED2
    },
    L: {
        0: [LED0, LED0, LED0 | LED1],       // 1st row: LED0, 2nd row: LED0, 3rd row: LED0, LED1
        90: [LED0 | LED1 | LED2, LED0],     // 1st row: LED0, LED1, LED2, 2nd row: LED0
        180: [LED0 | LED1, LED1, LED1],     // 1st row: LED0, LED1, 2nd row: LED1, 3rd row: LED1
        270: [LED2, LED0 | LED1 | LED2]     // 1st row: LED2, 2nd row: LED0, LED1, LED2
    },
    O: {
        0: [LED0 | LED1, LED0 | LED1],      // 1st row: LED0, LED1, 2nd row: LED0, LED1
        90: 0,                              // Reference to '0'
        180: 0,                             // Reference to '0'
        270: 0                              // Reference to '0'
    },
    T: {
        0: [LED1, LED0 | LED1 | LED2],      // 1st row: LED1, 2nd row: LED0, LED1, LED2
        90: [LED0, LED0 | LED1, LED0],      // 1st row: LED0, 2nd row: LED0, LED1, 3rd row: LED0
        180: [LED0 | LED1 | LED2, LED1],    // 1st row: LED0, LED1, LED2, 2nd row: LED1
        270: [LED1, LED0 | LED1, LED1]      // 1st row: LED1, 2nd row: LED0, LED1, 3rd row: LED1
    },
    Z: {
        0: [LED1, LED0 | LED1, LED0],       // 1st row: LED1, 2nd row: LED0, LED1, 3rd row: LED0
        90: [LED0 | LED1, LED1 | LED2],     // 1st row: LED0, LED1, 2nd row: LED1, LED2
        180: 0,
        270: 90
    },
    S: {
        0: [LED0, LED0 | LED1, LED1],  // 1st row: LED0, 2nd row: LED0, LED1, 3rd row: LED1
        90: [LED1 | LED2, LED0 | LED1], // 1st row: LED1, LED2, 2nd row: LED0, LED1
        180: 0,
        270: 90
    }
};

/**
 * Returns a random Tetromino letter
 * @return a random Tetromino letter
 */
function getRandomTetrominoLetter(): TetrominoLetter {
    const rand = Math.floor(Math.random() * NUM_TETROMINO_BLOCKS);  // Number between 0 inclusive and 7 exclusive
    return TetrominoLetter[TetrominoLetter[rand]];
}

/**
 * Returns the LED values of a random rotation value of the given letter
 * @param letter the type of letter we want to get the LED values from
 */
function getRandomTetrominoPosition(letter: TetrominoLetter): Array<number> {
    // We have four different positions, therefore we need a random number between 0 inclusive and 4 exclusive
    // We will use that number to point to the correct property
    const rand = Math.floor(Math.random() * 4);
    const block = getTetrominoBlock(letter);
    let angle: number;
    switch (rand) {
        case 0:
            angle = 0;
            break;
        case 1:
            angle = 90;
            break;
        case 2:
            angle = 180;
            break;
        default:
            angle = 270;
    }

    let ledArr = block[angle];

    // Check if the value we just got is a reference -> a single number
    // If yes, then retrieve the value of that reference
    if (typeof ledArr === 'number') {
        ledArr = block[ledArr];
    }

    return ledArr;
}

/**
 * Returns the array of the currently active LEDs after rotating clockwise
 * If the current angle is for example 180°, the result will be the array of the block at 270° (right rotation)
 *
 * @param letter the type of the block to be rotated
 * @param currentAngle the current angle of the letter
 * @return the LED values of the rotated block
 */
function rotateClockWise(letter: TetrominoLetter, currentAngle: number): Array<number> {
    // Check for a correct angle value
    if (!(currentAngle === 0 || currentAngle === 90 || currentAngle === 180 || currentAngle === 270)) {
        console.log(`Error in rotateClockWise: Invalid angle ${currentAngle}. Defaulting to 0`);
        currentAngle = 0;
    }

    // Check if current angle is 270° -> Need to subtract 360° before continuing with calculation
    if (currentAngle === 270) {
        currentAngle -= 360;
    }

    const block = getTetrominoBlock(letter);

    // Getting the next element in a clockwise manner is an addition of 90°
    let ledArr = block[currentAngle + 90];

    // Check if the value we just got is a reference -> a single number
    // If yes, then retrieve the value of that reference
    if (typeof ledArr === 'number') {
        ledArr = block[ledArr];
    }

    return ledArr;
}

/**
 * Returns the array of the currently active LEDs after rotating counter clockwise
 * If the current angle is for example 180°, the result will be the array of the block at 90° (left rotation)
 *
 * @param letter the type of the block to be rotated
 * @param currentAngle the current angle of the letter
 * @return the LED values of the rotated block
 */
function rotateCounterClockWise(letter: TetrominoLetter, currentAngle: number): Array<number> | null {
    // Check for a correct angle value
    if (!(currentAngle === 0 || currentAngle === 90 || currentAngle === 180 || currentAngle === 270)) {
        console.log(`Error in rotateClockWise: Invalid angle ${currentAngle}. Defaulting to 0`);
        currentAngle = 0;
    }

    // Check if the current angle is 0° -> Need to add 360° before continuing with calculation
    if (currentAngle === 0) {
        currentAngle += 360;
    }

    const block = getTetrominoBlock(letter);

    // Getting the next element in a counter clockwise manner is a subtraction of 90°
    let ledArr = block[currentAngle - 90];

    // Check if the value we just got is a reference -> a single number
    // If yes, then retrieve the value of that reference
    if (typeof ledArr === 'number') {
        ledArr = block[ledArr];
    }

    return ledArr;
}

/**
 * Gets the tetromino object from the given letter
 * @param letter the letter of the desired tetromino block
 * @return the block, containing the information for the desired letter
 */
function getTetrominoBlock(letter: TetrominoLetter): TetrominoBlock {
    let block: TetrominoBlock;
    switch (letter) {
        case TetrominoLetter.I:
            block = TETROMINO.I;
            break;
        case TetrominoLetter.J:
            block = TETROMINO.J;
            break;
        case TetrominoLetter.L:
            block = TETROMINO.L;
            break;
        case TetrominoLetter.O:
            block = TETROMINO.O;
            break;
        case TetrominoLetter.S:
            block = TETROMINO.S;
            break;
        case TetrominoLetter.T:
            block = TETROMINO.T;
            break;
        default:
            block = TETROMINO.Z;
    }
    return block;
}

export {TetrominoLetter, getRandomTetrominoLetter, getRandomTetrominoPosition, rotateClockWise, rotateCounterClockWise};
