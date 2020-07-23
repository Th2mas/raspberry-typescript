import * as rpio from 'rpio';
import {Subject} from 'rxjs';

// Create four buttons - MOVE_LEFT, MOVE_RIGHT, ROTATE_LEFT, ROTATE_RIGHT
const ROTATE_LEFT_BUTTON = 32;    // GPIO 12, Physical pin 32
const ROTATE_RIGHT_BUTTON = 36;    // GPIO 16, Physical pin 36
const MOVE_LEFT_BUTTON = 38;    // GPIO 20, Physical pin 38
const MOVE_RIGHT_BUTTON = 40;    // GPIO 21, Physical pin 40
const buttons = [MOVE_LEFT_BUTTON, MOVE_RIGHT_BUTTON, ROTATE_LEFT_BUTTON, ROTATE_RIGHT_BUTTON];

const moveLeftSubject = new Subject<void>();
const moveLeft$ = moveLeftSubject.asObservable();

const moveRightSubject = new Subject<void>();
const moveRight$ = moveRightSubject.asObservable();

const rotateLeftSubject = new Subject<void>();
const rotateLeft$ = rotateLeftSubject.asObservable();

const rotateRightSubject = new Subject<void>();
const rotateRight$ = rotateRightSubject.asObservable();

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
 *
 */
function moveLeft(pin: number): void {
    if (isValidPush(pin)) {
        moveLeftSubject.next();
    }
}

/**
 * Lets the program know, that a move to the right occurred
 * @param pin the pin number of the button, which was pushed
 */
function moveRight(pin: number): void {
    if (isValidPush(pin)) {
        moveRightSubject.next();
    }
}

/**
 * Lets the program know, that a counter clockwise rotation (rotation to the left) occurred
 * @param pin the pin number of the button, which was pushed
 */
function rotateLeft(pin: number): void {
    if (isValidPush(pin)) {
        rotateLeftSubject.next();
    }
}

/**
 * Lets the program know, that a clockwise rotation (rotation to the right) occurred
 * @param pin the pin number of the button, which was pushed
 */
function rotateRight(pin: number): void {
    if (isValidPush(pin)) {
        rotateRightSubject.next();
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

export {activateControlButtons, deactivateControlButtons, moveLeft$, moveRight$, rotateLeft$, rotateRight$};
