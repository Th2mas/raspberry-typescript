import * as i2cBus from 'i2c-bus';

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
    ADDR_3
}

enum LED {
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

let i2c: i2cBus.PromisifiedBus;
let buffer: Buffer;

async function open(): Promise<void> {
    try {
        i2c = await i2cBus.openPromisified(1);
    } catch (e) {
        console.info('Error in open');
        console.error(e);
    }
}

async function activateAll(): Promise<void> {
    console.info('Activating MCP23017');

    const values = Object.values(MCP23017)
        .map(value => Number(value))
        .filter(value => !isNaN(value));

    try {
        for (const value of values) {
            buffer = Buffer.from([IODIR.A, 0x00]);
            await i2c.i2cWrite(value, buffer.length, buffer);

            buffer = Buffer.from([IODIR.B, 0x00]);
            await i2c.i2cWrite(value, buffer.length, buffer);
        }
    } catch (e) {
        console.info('Error in activateAll');
        console.error(e);
    }
}

async function deactivateAll(): Promise<void> {
    console.info('\nDeactivating MCP23017');
    for (let i = 0; i < 8; i++) {
        try {
            await writeLedArray(i, []);
        } catch (e) {
            console.info('Error in deactivateAll');
            console.error(e);
        }
    }
}

async function writeLedArray(row: number, leds: Array<LED>): Promise<void> {
    const result = leds.reduce((acc, curr) => acc | curr, 0);

    try {
        await writeLedNumber(row, result);
    } catch (e) {
        console.info('Error in writeLedArray');
        console.error(e);
    }
}

async function writeLedNumber(row: number, leds: number): Promise<void> {
    let MCP;
    switch (row) {
        case 0:
        case 1:
            MCP = MCP23017.ADDR_0;
            break;
        case 2:
        case 3:
            MCP = MCP23017.ADDR_1;
            break;
        case 4:
        case 5:
            MCP = MCP23017.ADDR_2;
            break;
        case 6:
        case 7:
            MCP = MCP23017.ADDR_3;
            break;
        default:
            throw Error(`Row ${row} not supported`);
    }
    const bank = row % 2 === 0 ? OLAT.A : OLAT.B;

    buffer = Buffer.from([bank, leds]);

    try {
        await i2c.i2cWrite(MCP, buffer.length, buffer);
    } catch (e) {
        console.info('Error in writeLedNumber');
        console.error(e);
    }
}

async function close(): Promise<void> {
    try {
        await i2c.close();
    } catch (e) {
        console.info('Error in close');
        console.error(e);
    }
}

export {LED, open, close, activateAll, deactivateAll, writeLedNumber, writeLedArray};
