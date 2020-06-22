import * as rpio from 'rpio';

/**
 * We want to use GPIO 16, which has the physical pin 36
 */
const PIN_RED = 36;

/**
 * We want to use GPIO 20, which has the physical pin 38
 */
const PIN_YELLOW = 38;

/**
 * We want to use GPIO 21, which has the physical pin 40
 */
const PIN_GREEN = 40;

const LEDs = [PIN_RED, PIN_YELLOW, PIN_GREEN];

rpio.open(PIN_RED, rpio.OUTPUT, rpio.LOW);
rpio.open(PIN_YELLOW, rpio.OUTPUT, rpio.LOW);
rpio.open(PIN_GREEN, rpio.OUTPUT, rpio.LOW);

setTimeout(() => rpio.write(PIN_RED, rpio.HIGH), 0);
setTimeout(() => rpio.write(PIN_YELLOW, rpio.HIGH), 2000);
setTimeout(() => rpio.write(PIN_GREEN, rpio.HIGH), 4000);

// Free all LED pins
setTimeout(() => LEDs.forEach(LED => rpio.close(LED)), 6000);
