import {Gpio} from 'onoff';
import * as PromptSync from 'prompt-sync';

const prompt = PromptSync({sigint: true});
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

// We have to handle a possible interrupt (CTRL+C)
// @ts-ignore
process.on('SIGINT', () => process.exit(0));
// @ts-ignore
process.on('exit', () => {
    console.log('Closing the application');
    LEDs.forEach(LED => freePin(LED));
    // @ts-ignore
    process.exit(0);
})

// There should be no time limitation on when the user inputs something -> create an infinity loop
while (true) {
    // Get user input
    let led = prompt('Which LED should be turned on? ').toLowerCase();
    if (!(led === 'red' || led === 'yellow' || led === 'green')) {
        console.log(`Sorry, we don't know ${led}. Please choose 'red', 'yellow' or 'green'.`);
        continue;
    }
    // Switch to the correct pin
    let pin;
    switch (led) {
        case "red":
            pin = RED;
            break;
        case "yellow":
            pin = YELLOW;
            break;
        case "green":
            pin = GREEN;
            break;
        default:
            // No default case
            break;
    }
    switchTo(pin);
}
