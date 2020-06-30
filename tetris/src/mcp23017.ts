import * as rpio from 'rpio';

/**
 * An MCP23017 can have 2^3=8 different addresses, since it has three address pins, A0, A1, and A2, with a base address
 * of 0x20
 * If we want the MCP23017 to have a certain physical address, we have to change the voltage at those pins
 * This can be done by connecting to power or GND
 * Therefore the possible addresses are
 *
 * Base address: 0x20
 * Index    A0      A1      A2      Sum with base address (actual address)
 * ----------------------------------------------------------------------------------
 *     0    0       0       0       0x20
 *     1    0       0       1       0x21
 *     2    0       1       0       0x22
 *     3    0       1       1       0x23
 *     4    1       0       0       0x24
 *     5    1       0       1       0x25
 *     6    1       1       0       0x26
 *     7    1       1       1       0x27
 *
 * A MCP23017 has two banks, GPA and GPB, with 8 configurable GPIO pins each
 * This means, that one MCP23017 can serve up to 16 additional GPIO pins
 */

enum MCP23017 {
    ADDR_0 = 0x20,
    ADDR_1,
    ADDR_2,
    ADDR_3,
    ADDR_4,
    ADDR_5,
    ADDR_6,
    ADDR_7
}

enum GP {
    _0 = 0x01,
    _1 = 0x02,
    _2 = 0x04,
    _3 = 0x08,
    _4 = 0x10,
    _5 = 0x20,
    _6 = 0x40,
    _7 = 0x80
}

/**
 * The enum for the OLATA and OLATB banks (the ones controlling the eight pins)
 */
enum OLAT {
    A = 0x14,
    B = 0x15
}

/**
 * The necessary enum for the IODIRA and IODIRB banks (needed for activating/deactivating GPA and GBA)
 */
enum IODIR {
    A = 0x00,   // GPA
    B = 0x01    // GPB
}

function activateMCP23017(address: MCP23017): void {
    // Activate the pins at GPA and GPB
    // 0x00 as the second parameter configures the bank to serve as an output
    rpio.i2cWrite(Buffer.from([address, IODIR.A, 0x00]));
    rpio.i2cWrite(Buffer.from([address, IODIR.B, 0x00]));
}

export {MCP23017, activateMCP23017};
