import * as rpio from 'rpio';

const LED = 18;         // GPIO 24
const BUTTON_ON = 22;   // GPIO 25
const BUTTON_OFF = 32;  // GPIO 12
const PINS = [LED, BUTTON_ON, BUTTON_OFF];

rpio.open(LED, rpio.OUTPUT, rpio.LOW);
rpio.open(BUTTON_ON, rpio.INPUT, rpio.PULL_UP);
rpio.open(BUTTON_OFF, rpio.INPUT, rpio.PULL_UP);

console.log('Start blinking');
let blinkInterval: NodeJS.Timeout;
blinkInterval = setBlinkInterval();

// Listen to button events
rpio.poll(BUTTON_ON, resumeBlinking);
rpio.poll(BUTTON_OFF, pauseBlinking);

addExitHandler();

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

function resumeBlinking(): void {
    if (isValidPush(BUTTON_ON)) {
        console.log('Resume blinking');
        blinkInterval = setBlinkInterval();
    }
}

function pauseBlinking(): void {
    if (isValidPush(BUTTON_OFF)) {
        console.log('Pause blinking');
        clearInterval(blinkInterval);
    }
}

function setBlinkInterval(): NodeJS.Timeout {
    return setInterval(() => toggleState(LED), 500);
}

/**
 * Checks for contact bounce
 * @param pin the physical pin number
 */
function isValidPush(pin: number): boolean {
    rpio.msleep(20);
    return rpio.read(pin) === rpio.LOW;
}

function addExitHandler(): void {
    // Start reading from stdin so we don't exit
    process.stdin.resume();
    process.on('SIGINT', () => {
        PINS.forEach(pin => rpio.close(pin));
        console.log('\nClosing the application');
        process.exit(0);
    });
}
