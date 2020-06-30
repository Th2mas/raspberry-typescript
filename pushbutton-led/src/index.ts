import * as rpio from 'rpio';

const LED = 38;     // GPIO 20, physical pin: 38
const BUTTON = 40;  // GPIO 21, physical pin: 40
const PINS = [BUTTON, LED];

rpio.open(LED, rpio.OUTPUT, rpio.LOW);
rpio.open(BUTTON, rpio.INPUT, rpio.PULL_UP);

rpio.poll(BUTTON, pollCallback);

addExitHandler();

console.log('You can start pressing now!');

function pollCallback(pin: number): void {
    if (isValidPush(pin)) {
        const state = rpio.read(LED) === rpio.HIGH ? 'off' : 'on';
        console.log(`Turn LED ${state}`);
        toggleState(LED);
    }
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

function isValidPush(pin: number): boolean {
    rpio.msleep(20);
    return rpio.read(pin) === rpio.LOW;
}

function toggleState(pin: number): void {
    rpio.write(pin, rpio.read(pin) === rpio.HIGH ? rpio.LOW : rpio.HIGH);
}
