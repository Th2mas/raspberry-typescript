import { Gpio } from 'onoff';

/**
 * Defines GPIO pin we want to use
 */
const gpioNumber = 24;   // We want to use GPIO 24

/**
 * Defines the pin as an output
 */
const LED = new Gpio(gpioNumber, 'out');

/**
 * Defines how often the LED should blink (in ms)
 */
const blinkTime = 200;  // every 200ms

/**
 * Defines when the blinking should stop (in ms)
 */
const endTime = 10000; // after 10 seconds

/**
 * Toggles the state of a GPIO pin
 * The pin can either be on ("1") or off ("0")
 * If the pin is on (high), then turn it off (low); otherwise the other way around
 *
 * @param pin the GPIO pin whose state should be toggled
 */
function toggleState(pin: Gpio): void {
    const pinState = pin.readSync();
    const outputState = pinState === Gpio.HIGH ? Gpio.LOW : Gpio.HIGH;
    pin.writeSync(outputState);
}

/**
 * Ends the toggling for the given pin
 *
 * @param pin the GPIO pin, whose state is currently toggled
 * @param interval the interval which should be cleared
 */
function endToggling(pin: Gpio, interval: number): void {
    clearInterval(interval);
    // Turn the pin off
    pin.writeSync(Gpio.LOW);
    // Free resources
    pin.unexport();
}

const blinkInterval = setInterval(() => toggleState(LED), blinkTime);
setTimeout(() => endToggling(LED, blinkInterval), endTime);
