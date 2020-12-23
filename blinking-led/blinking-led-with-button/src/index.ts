import * as rpio from 'rpio';

const LED = 18;         // GPIO 24
const BUTTON_ON = 22;   // GPIO 25
const BUTTON_OFF = 32;  // GPIO 12
const PINS = [LED, BUTTON_ON, BUTTON_OFF];

// Configure the GPIO pins
rpio.open(LED, rpio.OUTPUT, rpio.LOW);
rpio.open(BUTTON_ON, rpio.INPUT, rpio.PULL_UP);
rpio.open(BUTTON_OFF, rpio.INPUT, rpio.PULL_UP);

/**
 * Defines the blinking speed in seconds
 */
const speedInSeconds = 1;

// Listen to button events
rpio.poll(BUTTON_ON, resumeBlinking);
rpio.poll(BUTTON_OFF, pauseBlinking);

// Define the blinking interval
let isBlinking = true;
let blinkInterval = setBlinkInterval(speedInSeconds);

addExitHandler();

// Notify the user that the program has started
console.log('Start blinking');

// METHODS

/**
 * Resumes the blinking, if it was stopped
 */
function resumeBlinking(): void {
    if (isValidPush(BUTTON_ON) && !isBlinking) {
        console.log('Resume blinking');
        isBlinking = true;
        blinkInterval = setBlinkInterval(speedInSeconds);
    }
}

/**
 * Stops the blinking
 */
function pauseBlinking(): void {
    if (isValidPush(BUTTON_OFF) && isBlinking) {
        console.log('Pause blinking');
        isBlinking = false;
        clearInterval(blinkInterval);
    }
}

/**
 * Checks for contact bounce
 * @param pin the physical pin number
 */
function isValidPush(pin: number): boolean {
    rpio.msleep(20);
    return rpio.read(pin) === rpio.LOW;
}

/**
 * Sets the blink interval to a number of seconds
 * @param seconds the speed of the blinking
 */
function setBlinkInterval(seconds: number): NodeJS.Timeout {
    return setInterval(() => toggleState(LED), seconds * 1000);
}

/**
 * Toggles the state of a pin
 * The pin can either be on ("1") or off ("0")
 * If the pin is on (high), then turn it off (low); otherwise the other way around
 *
 * @param pin the GPIO pin whose state should be toggled
 */
function toggleState(pin: number): void {
    rpio.write(pin, rpio.read(pin) === rpio.HIGH ? rpio.LOW : rpio.HIGH);
}

/**
 * Adds a handler for gracefully stopping the program, when 'CTRL+C' was pressed
 */
function addExitHandler(): void {
    // Start reading from stdin so we don't exit
    process.stdin.resume();
    process.on('SIGINT', () => {
        PINS.forEach(pin => rpio.close(pin));
        console.log('\nClosing the application');
        process.exit(0);
    });
}
