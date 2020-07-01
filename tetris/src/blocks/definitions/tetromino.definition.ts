import {PolyominoRotationJSON} from "../polyomino";

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
 * This object holds all possible tetromino blocks and their rotation values
 */
const TETROMINO_DEFINITION: Array<PolyominoRotationJSON> = [
    // I
    {
        0: [LED0, LED0, LED0, LED0],        // 4 rows, all LED0
        90: [LED0 | LED1 | LED2 | LED3],    // 1 row, LED0, LED1, LED2, LED3
        180: 0,                             // Reference to '0'
        270: 90                             // Reference to '90'
    },
    // J
    {
        0: [LED1, LED1, LED0 | LED1],       // 1st row: LED1, 2nd row: LED1, 3rd row: LED0, LED1
        90: [LED0, LED0 | LED1 | LED2],     // 1st row: LED0, 2nd row: LED0, LED1, LED2
        180: [LED0 | LED1, LED0, LED0],     // 1st row: LED0, LED1, 2nd row: LED0, 3rd row: LED0
        270: [LED0 | LED1 | LED2, LED2]     // 1st row: LED0, LED1, LED2, 2nd row: LED2
    },
    // L
    {
        0: [LED0, LED0, LED0 | LED1],       // 1st row: LED0, 2nd row: LED0, 3rd row: LED0, LED1
        90: [LED0 | LED1 | LED2, LED0],     // 1st row: LED0, LED1, LED2, 2nd row: LED0
        180: [LED0 | LED1, LED1, LED1],     // 1st row: LED0, LED1, 2nd row: LED1, 3rd row: LED1
        270: [LED2, LED0 | LED1 | LED2]     // 1st row: LED2, 2nd row: LED0, LED1, LED2
    },
    // O
    {
        0: [LED0 | LED1, LED0 | LED1],      // 1st row: LED0, LED1, 2nd row: LED0, LED1
        90: 0,                              // Reference to '0'
        180: 0,                             // Reference to '0'
        270: 0                              // Reference to '0'
    },
    // T
    {
        0: [LED1, LED0 | LED1 | LED2],      // 1st row: LED1, 2nd row: LED0, LED1, LED2
        90: [LED0, LED0 | LED1, LED0],      // 1st row: LED0, 2nd row: LED0, LED1, 3rd row: LED0
        180: [LED0 | LED1 | LED2, LED1],    // 1st row: LED0, LED1, LED2, 2nd row: LED1
        270: [LED1, LED0 | LED1, LED1]      // 1st row: LED1, 2nd row: LED0, LED1, 3rd row: LED1
    },
    // Z
    {
        0: [LED1, LED0 | LED1, LED0],       // 1st row: LED1, 2nd row: LED0, LED1, 3rd row: LED0
        90: [LED0 | LED1, LED1 | LED2],     // 1st row: LED0, LED1, 2nd row: LED1, LED2
        180: 0,
        270: 90
    },
    // S
    {
        0: [LED0, LED0 | LED1, LED1],  // 1st row: LED0, 2nd row: LED0, LED1, 3rd row: LED1
        90: [LED1 | LED2, LED0 | LED1], // 1st row: LED1, LED2, 2nd row: LED0, LED1
        180: 0,
        270: 90
    }
];

export {TETROMINO_DEFINITION};
