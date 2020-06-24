import * as rpio from 'rpio';
import {IODIR, MCP23017} from "./mcp23017";
import * as Tetromino from './tetromino';

// Create the 8x8 matrix, which will store the on/off state of the LEDs (default 0)
// Instead of having a two-dimensional array, we will only create one array, which stores hexadecimal values
// (from 0x00 to 0xFF each)
const matrix: Array<number> = [];

// We need to start and stop i2c
rpio.i2cBegin();

// Activate the necessary MCP23017 -> 0, 1, 2, 3
activateMCP23017(MCP23017.ADDR_0);
activateMCP23017(MCP23017.ADDR_1);
activateMCP23017(MCP23017.ADDR_2);
activateMCP23017(MCP23017.ADDR_3);
const activeMCP23017 = [MCP23017.ADDR_0, MCP23017.ADDR_1, MCP23017.ADDR_2, MCP23017.ADDR_3];

// TODO: Write me

rpio.i2cEnd();

function activateMCP23017(address: MCP23017): void {
    rpio.i2cSetSlaveAddress(address);
    // Activate the pins at GPA and GPB
    // 0x00 as the second parameter configures the bank to serve as an output
    rpio.i2cWrite(Buffer.from([IODIR.A, 0x00]));
    rpio.i2cWrite(Buffer.from([IODIR.B, 0x00]));
}
