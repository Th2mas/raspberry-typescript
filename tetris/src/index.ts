import * as rpio from 'rpio';
import {MCP23017, activateMCP23017} from "./mcp23017";

// Create the 8x8 matrix, which will store the on/off state of the LEDs (default 0)
// Instead of having a two-dimensional array, we will only create one array, which stores hexadecimal values
// (from 0x00 to 0xFF each)
const matrix: Array<number> = [];

// Create four buttons - MOVE_LEFT, MOVE_RIGHT, ROTATE_LEFT, ROTATE_RIGHT
const MOVE_LEFT_BUTTON = 29;    // GPIO 5, Physical pin 29
const MOVE_RIGHT_BUTTON = 31;    // GPIO 6, Physical pin 31
const ROTATE_LEFT_BUTTON = 33;    // GPIO 13, Physical pin 33
const ROTATE_RIGHT_BUTTON = 35;    // GPIO 19, Physical pin 35
const buttons = [MOVE_LEFT_BUTTON, MOVE_RIGHT_BUTTON, ROTATE_LEFT_BUTTON, ROTATE_RIGHT_BUTTON];

// We need to start and stop i2c
rpio.i2cBegin();

// Activate the necessary MCP23017 -> 0, 1, 2, 3
const addressesMCP23017 = [MCP23017.ADDR_0, MCP23017.ADDR_1, MCP23017.ADDR_2, MCP23017.ADDR_3];
addressesMCP23017.forEach(address => activateMCP23017(address));

let hasGameEnded = false;
while (!hasGameEnded) {
    // TODO: Write the game loop
}

rpio.i2cEnd();

// Don't forget to close all open GPIO ports
buttons.forEach(button => rpio.close(button));
