import * as rpio from 'rpio';
import {activateControlButtons, deactivateControlButtons} from "./controls";



// const addressesMCP23017 = [MCP23017.ADDR_0, MCP23017.ADDR_1, MCP23017.ADDR_2, MCP23017.ADDR_3];

init();

console.log('Game started');

function init(): void {
    // We need to start and stop i2c
    rpio.i2cBegin();

    // Activate the control buttons
    activateControlButtons();

    // Add a handler, which catches 'CTRL+C'
    addExitHandler();

    // Activate the necessary MCP23017 -> 0, 1, 2, 3
    // addressesMCP23017.forEach(address => activateMCP23017(address));

    console.log('Finish init');
}

function addExitHandler(): void {
    // Start reading from stdin so we don't exit
    process.stdin.resume();
    process.on('SIGINT', () => {
        cleanup();
        console.log('\nClosing the application');
        process.exit(0)
    });
    console.log('Added Exit handler');
}

function cleanup(): void {
    deactivateControlButtons();

    // When everything is done, we need to close the i2c connection
    rpio.i2cEnd();

    console.log('\nFinish cleanup');
}

// Notes: To fix seg fault and crashes -> https://www.npmjs.com/package/rpio#disable-gpio-interrupts
