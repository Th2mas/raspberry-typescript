import * as rpio from 'rpio';

/**
 * Defines the physical pin we want to use
 * We want to use GPIO 24, which has the physical pin 18
 */
const pinNumber = 18;

/**
 * Defines the pin as an output with an initial state of LOW
 */
rpio.open(pinNumber, rpio.OUTPUT, rpio.LOW);

/**
 * Defines how often the LED should blink (in ms)
 */
const blinkTime = 200;  // every 200ms

/**
 * Defines when the blinking should stop (in ms)
 */
const endTime = 10000; // after 10 seconds

/**
 * Toggles the state of a pin
 * The pin can either be on ("1") or off ("0")
 * If the pin is on (high), then turn it off (low); otherwise the other way around
 *
 * @param pin the GPIO pin whose state should be toggled
 */
function toggleState(pin: number): void {
    const pinState = rpio.read(pin);
    const outputState = pinState === rpio.HIGH ? rpio.LOW : rpio.HIGH;
    rpio.write(pin, outputState);
}

/**
 * Ends the toggling for the given pin
 *
 * @param pin the pin, whose state is currently toggled
 * @param interval the interval which should be cleared
 */
function endToggling(pin: number, interval: NodeJS.Timeout): void {
    clearInterval(interval);
    // Turn the pin off
    rpio.write(pin, rpio.LOW);
}

const blinkInterval = setInterval(() => toggleState(pinNumber), blinkTime);
setTimeout(() => endToggling(pinNumber, blinkInterval), endTime);
