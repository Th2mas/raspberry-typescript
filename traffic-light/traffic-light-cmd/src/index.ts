import * as rpio from 'rpio';
import * as readline from 'readline';

const PIN_RED = 36;
const PIN_YELLOW = 38;
const PIN_GREEN = 40;
const LEDs = [PIN_RED, PIN_YELLOW, PIN_GREEN];

rpio.open(PIN_RED, rpio.OUTPUT, rpio.LOW);
rpio.open(PIN_YELLOW, rpio.OUTPUT, rpio.LOW);
rpio.open(PIN_GREEN, rpio.OUTPUT, rpio.LOW);

// Now we can create the user prompt
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('close', () => {
    console.log('\nClosing the application');
    LEDs.forEach(LED => rpio.close(LED));
    process.exit(0);
});

rl.setPrompt('Which LED should be turned on? ');
rl.prompt();

// There should be no time limitation on when the user inputs something
// Get user input
rl.on('line', led => {
    if (!(led === 'red' || led === 'yellow' || led === 'green')) {
        console.log(`Sorry, we don't know ${led}. Please choose 'red', 'yellow' or 'green'.`);
    } else {
        switchColor(led);
    }
    rl.prompt();
});

/**
 * Switches to the LED with the passed color
 * @param ledColor the color of the LED which needs to be turned on
 */
function switchColor(ledColor: string): void {
    // Switch to the correct pin
    let pin;
    switch (ledColor) {
        case "red":
            pin = PIN_RED;
            break;
        case "yellow":
            pin = PIN_YELLOW;
            break;
        case "green":
            pin = PIN_GREEN;
            break;
        default:
            // No default case
            break;
    }
    switchTo(pin);
}

/**
 * Turns the given pin on and all other LED pins off
 * @param pin the pin to be turned on
 */
function switchTo(pin: number): void {
    LEDs.forEach(LED => rpio.write(LED, pin === LED ? rpio.HIGH : rpio.LOW));
}
