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

/**
 * Turns the given pin on and all other LED pins off
 * @param pin the pin to be turned on
 */
function switchTo(pin: Gpio): void {
    switch (pin) {
        case RED:
            RED.writeSync(Gpio.HIGH);
            YELLOW.writeSync(Gpio.LOW);
            GREEN.writeSync(Gpio.LOW);
            break;
        case YELLOW:
            RED.writeSync(Gpio.LOW);
            YELLOW.writeSync(Gpio.HIGH);
            GREEN.writeSync(Gpio.LOW);
            break;
        case GREEN:
            RED.writeSync(Gpio.LOW);
            YELLOW.writeSync(Gpio.LOW);
            GREEN.writeSync(Gpio.HIGH);
            break;
        default:
            // There is no default case, so just leave it blank
            break;
    }
}

setTimeout(() => switchTo(RED), 0);
setTimeout(() => switchTo(YELLOW), 2000);
setTimeout(() => switchTo(GREEN), 4000);

// Free all LED pins
setTimeout(() => LEDs.forEach(LED => freePin(LED)), 6000);
