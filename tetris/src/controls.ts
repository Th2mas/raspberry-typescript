import * as rpio from 'rpio';

// Create four buttons - MOVE_LEFT, MOVE_RIGHT, ROTATE_LEFT, ROTATE_RIGHT
const ROTATE_RIGHT_BUTTON = 31;    // GPIO 6, Physical pin 31
const ROTATE_LEFT_BUTTON = 33;    // GPIO 13, Physical pin 33
const MOVE_RIGHT_BUTTON = 35;    // GPIO 19, Physical pin 35
const MOVE_LEFT_BUTTON = 37;    // GPIO 26, Physical pin 37
const buttons = [MOVE_LEFT_BUTTON, MOVE_RIGHT_BUTTON, ROTATE_LEFT_BUTTON, ROTATE_RIGHT_BUTTON];

/**
 * Opens the four button pins and assigns them a poll callback
 */
function activateControlButtons(): void {
    buttons.forEach(button => rpio.open(button, rpio.INPUT, rpio.PULL_UP));

    rpio.poll(MOVE_LEFT_BUTTON, moveLeft);
    rpio.poll(MOVE_RIGHT_BUTTON, moveRight);
    rpio.poll(ROTATE_LEFT_BUTTON, rotateLeft);
    rpio.poll(ROTATE_RIGHT_BUTTON, rotateRight);

    console.log('Activated control buttons');
}

/**
 * Frees all button pins
 */
function deactivateControlButtons(): void {
    buttons.forEach(button => rpio.close(button));
}

/**
 * Lets the program know, that a move to the left occurred
 * @param pin the pin number of the button, which was pushed
 */
function moveLeft(pin: number): void {
    if (isValidPush(pin)) {
        console.log('Move left');
    }
}

/**
 * Lets the program know, that a move to the right occurred
 * @param pin the pin number of the button, which was pushed
 */
function moveRight(pin: number): void {
    if (isValidPush(pin)) {
        console.log('Move right');
    }
}

/**
 * Lets the program know, that a counter clockwise rotation (rotation to the left) occurred
 * @param pin the pin number of the button, which was pushed
 */
function rotateLeft(pin: number): void {
    if (isValidPush(pin)) {
        console.log('Rotate left');
    }
}

/**
 * Lets the program know, that a clockwise rotation (rotation to the right) occurred
 * @param pin the pin number of the button, which was pushed
 */
function rotateRight(pin: number): void {
    if (isValidPush(pin)) {
        console.log('Rotate right');
    }
}

/**
 * Checks, if the press was a real push or just a contact bounce
 * @param pin the pin number of the button, which was pushed
 */
function isValidPush(pin: number): boolean {
    rpio.msleep(50);
    return rpio.read(pin) === rpio.LOW;
}

export {activateControlButtons, deactivateControlButtons};
