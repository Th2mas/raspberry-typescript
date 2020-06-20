import {Gpio} from 'onoff';

const RED = new Gpio(16, 'out');
const YELLOW = new Gpio(20, 'out');
const GREEN = new Gpio(21, 'out');
const LEDs = [RED, YELLOW, GREEN];

/**
 * Turns the given pin off and frees the resources
 * @param pin the pin to be freed
 */
function freePin(pin: Gpio): void {
    // Turn the pin off
    pin.writeSync(Gpio.LOW);
    // Free resources
    pin.unexport();
}

setTimeout(() => RED.writeSync(Gpio.HIGH), 0);
setTimeout(() => YELLOW.writeSync(Gpio.HIGH), 2000);
setTimeout(() => GREEN.writeSync(Gpio.HIGH), 4000);

// Free all LED pins
setTimeout(() => LEDs.forEach(LED => freePin(LED)), 6000);
