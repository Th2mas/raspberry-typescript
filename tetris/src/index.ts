import {Game} from './game';
import {activateAll, close, resetAll, open} from './mcp23017';

init()
    .then(() => console.log('Finish init'));

async function init(): Promise<void> {

    try {
        await open();
        await activateAll();

        // Add a handler, which catches 'CTRL+C'
        addExitHandler();

        const game = new Game();
        game.activate();
        game.start();
    } catch (e) {
        console.error(e);
    }
}

function addExitHandler(): void {
    // Start reading from stdin so we don't exit
    process.stdin.resume();
    process.on('SIGINT', async () => {
        try {
            await resetAll();
            await close();
        } catch (e) {
            console.error(e);
        }
        console.info('\nClosing the application');
        process.exit(0);
    });
    console.log('Added Exit handler');
}

// Notes: To fix seg fault and crashes -> https://www.npmjs.com/package/rpio#disable-gpio-interrupts
