import {Gpio} from 'onoff';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

// Still the same GPIO code
const RED = new Gpio(16, 'out');
const YELLOW = new Gpio(20, 'out');
const GREEN = new Gpio(21, 'out');
const LEDs = [RED, YELLOW, GREEN];

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
    // Switch to the correct pin
    let pin: Gpio;
    switch (LED) {
        case "red":
            pin = RED;
            console.log('Toggling red LED');
            break;
        case "yellow":
            pin = YELLOW;
            console.log('Toggling yellow LED');
            break;
        case "green":
            pin = GREEN;
            console.log('Toggling green LED');
            break;
        default:
            // No default case
            break;
    }
    toggle(pin);

    // Send empty response for confirmation
    res.send();
});

// Listen to the 'CTRL+C' event
process.on('SIGINT', () => {
    closeApplication();
    process.exit(0);
});

/**
 * Toggles the state of the given pin
 * @param pin the pin to be toggled
 */
function toggle(pin: Gpio): void {
    const status = pin.readSync();
    pin.writeSync(status === Gpio.HIGH ? Gpio.LOW : Gpio.HIGH);
}

/**
 * Frees the GPIO pins and closes the server
 */
function closeApplication(): void {
    console.log('Closing the server');

    // Free all LED pins when the user closes the application
    LEDs.forEach(LED => freePin(LED));

    // Close the server
    server.close();
}

/**
 * Turns the given pin off and frees the resources
 * @param pin the pin to be freed
 */
function freePin(pin: Gpio): void {
    // Turn the pin off
    pin.writeSync(Gpio.LOW);
    // Free resources
    pin.unexport();
}
