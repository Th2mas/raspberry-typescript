import * as rpio from 'rpio';

// MCP23017 address with A0 = 0, A1 = 0, A2 = 0
// According to the datasheet with this configuration, the address is 0x20
const MCP23017_ADDRESS = 0x20;

// Needed, when trying to access GPA
const IODIRA_ADDRESS = 0x00;
const OLATA_ADDRESS = 0x14;

const IODIR_OUTPUT = 0x00;

// Start i2c
rpio.i2cBegin();

// Configure the slave address
rpio.i2cSetSlaveAddress(MCP23017_ADDRESS);

// Make the pins at the GPA bank to be configured as outputs
rpio.i2cWrite(Buffer.from([IODIRA_ADDRESS, IODIR_OUTPUT]));

console.log('Start counting');
for (let i = 0; i < 256; i++) {
    console.log(`Count at ${i}`);
    rpio.i2cWrite(Buffer.from([OLATA_ADDRESS, i]));
    rpio.sleep(1);
}
console.log('Stop counting');

rpio.i2cWrite(Buffer.from([OLATA_ADDRESS, 0x00]));

// After the counting is done, we need free the i2c interface
rpio.i2cEnd();
