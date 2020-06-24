import * as rpio from 'rpio';

// MCP23017 address with A0 = 0, A1 = 0, A2 = 0
// According to the datasheet with this configuration, the address is 0x20
const MCP23017_ADDRESS = 0x20;

// Needed, when trying to access GPA
const IODIRA_ADDRESS = 0x00;
const OLATA_ADDRESS = 0x14;

// Needed, when trying to access GPB
const IODIRB_ADDRESS = 0x01;
const OLATB_ADDRESS = 0x15;

const IODIR_OUTPUT = 0x00;

// Start i2c
rpio.i2cBegin();

// Configure the slave address
rpio.i2cSetSlaveAddress(MCP23017_ADDRESS);

// Make the pins at the GPA bank to be configured as outputs
rpio.i2cWrite(Buffer.from([IODIRA_ADDRESS, IODIR_OUTPUT]));
rpio.i2cWrite(Buffer.from([IODIRB_ADDRESS, IODIR_OUTPUT]));

console.log('Start counting');
/*
// With two loops
let counter = 0;
for (let i = 0; i < 256; i++) {
    rpio.i2cWrite(Buffer.from([OLATB_ADDRESS, i]));
    for (let j = 0; j < 256; j++) {
        console.log(`Counter at ${++counter}`);
        rpio.i2cWrite(Buffer.from([OLATA_ADDRESS, j]));
        rpio.msleep(50);
    }
}
 */
for (let i = 0; i < 65536; i++) {
    console.log(`Counter at ${i}`);
    rpio.i2cWrite(Buffer.from([OLATA_ADDRESS, i & 0x00FF]));
    rpio.i2cWrite(Buffer.from([OLATB_ADDRESS, (i & 0xFF00) >> 8]));
    rpio.msleep(50);
}

console.log('Stop counting');

rpio.i2cWrite(Buffer.from([OLATA_ADDRESS, 0x00]));
rpio.i2cWrite(Buffer.from([OLATB_ADDRESS, 0x00]));

// After the counting is done, we need to free the i2c interface
rpio.i2cEnd();
