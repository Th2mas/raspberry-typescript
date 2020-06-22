import * as rpio from 'rpio';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

// Still the same GPIO code
const PIN_RED = 36;
const PIN_YELLOW = 38;
const PIN_GREEN = 40;
const LEDs = [PIN_RED, PIN_YELLOW, PIN_GREEN];

rpio.open(PIN_RED, rpio.OUTPUT, rpio.LOW);
rpio.open(PIN_YELLOW, rpio.OUTPUT, rpio.LOW);
rpio.open(PIN_GREEN, rpio.OUTPUT, rpio.LOW);

// Now we can create the actual server
const app = express();

// Use the bodyParser, so that the request.body is always a JSON object
app.use(bodyParser.json());

// Use cors to be able to access the Raspberry from another device/browser
app.use(cors());

// To make the interface available when we start the server, we will serve the client directly with the server
// Now we will be able to connect to the client by just typing 'http://localhost:9000'
// (or whatever address your Raspberry uses)
app.use(express.static(__dirname + '/../client'));

const port: number = 9000;
const server = app.listen(port, () => console.log(`Traffic light app listening at http://localhost:${port}`));

app.post('/', (req, res) => {
    const LED: string = req.body.led;
    if (!(LED === 'red' || LED === 'yellow' || LED === 'green')) {
        res.send(`Sorry, we don't know ${LED}. Please choose 'red', 'yellow' or 'green'.`);
    }
    switchColor(LED);

    // Send empty response for confirmation
    res.send();
});

// Listen to the 'CTRL+C' event
process.on('SIGINT', () => {
    closeApplication();
    process.exit(0);
});

/**
 * Toggles the LED with the passed color
 * @param ledColor the color of the LED which should be toggled
 */
function switchColor(ledColor: string): void {
    // Switch to the correct pin
    let pin;
    switch (ledColor) {
        case "red":
            pin = PIN_RED;
            break;
        case "yellow":
            pin = PIN_YELLOW;
            break;
        case "green":
            pin = PIN_GREEN;
            break;
        default:
            // No default case
            break;
    }
    toggleState(pin);
}

/**
 * Toggles the state of the given pin
 * @param pin the pin to be toggled
 */
function toggleState(pin: number): void {
    const pinState = rpio.read(pin);
    const outputState = pinState === rpio.HIGH ? rpio.LOW : rpio.HIGH;
    rpio.write(pin, outputState);
}

/**
 * Frees the GPIO pins and closes the server
 */
function closeApplication(): void {
    console.log('Closing the server');

    // Free all LED pins when the user closes the application
    LEDs.forEach(LED => rpio.close(LED));

    // Close the server
    server.close();
}
