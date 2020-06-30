import * as rpio from 'rpio';

// Create four buttons - MOVE_LEFT, MOVE_RIGHT, ROTATE_LEFT, ROTATE_RIGHT
const MOVE_RIGHT_BUTTON = 31;    // GPIO 6, Physical pin 31
const MOVE_LEFT_BUTTON = 33;    // GPIO 13, Physical pin 33
const ROTATE_RIGHT_BUTTON = 35;    // GPIO 19, Physical pin 35
const ROTATE_LEFT_BUTTON = 37;    // GPIO 26, Physical pin 37
const buttons = [MOVE_LEFT_BUTTON, MOVE_RIGHT_BUTTON, ROTATE_LEFT_BUTTON, ROTATE_RIGHT_BUTTON];

function activateControlButtons(): void {
    buttons.forEach(button => rpio.open(button, rpio.INPUT, rpio.PULL_UP));

    rpio.poll(MOVE_LEFT_BUTTON, moveLeft);
    rpio.poll(MOVE_RIGHT_BUTTON, moveRight);
    rpio.poll(ROTATE_LEFT_BUTTON, rotateLeft);
    rpio.poll(ROTATE_RIGHT_BUTTON, rotateRight);

    console.log('Activated control buttons');
}

function deactivateControlButtons(): void {
    buttons.forEach(button => rpio.close(button));
}

function moveLeft(pin: number): void {
    if (isValidPush(pin)) {
        console.log('Move left');
    }
}

function moveRight(pin: number): void {
    if (isValidPush(pin)) {
        console.log('Move right');
    }
}

function rotateLeft(pin: number): void {
    if (isValidPush(pin)) {
        console.log('Rotate left');
    }
}

function rotateRight(pin: number): void {
    if (isValidPush(pin)) {
        console.log('Rotate right');
    }
}

// TODO Optional: Maybe make this as a decorator
function isValidPush(pin: number): boolean {
    rpio.msleep(50);
    return rpio.read(pin) === rpio.LOW;
}

export {activateControlButtons, deactivateControlButtons};
