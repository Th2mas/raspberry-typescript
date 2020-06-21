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
            console.log('Turning red LED on');
            break;
        case "yellow":
            pin = YELLOW;
            console.log('Turning yellow LED on');
            break;
        case "green":
            pin = GREEN;
            console.log('Turning green LED on');
            break;
        default:
            // No default case
            break;
    }
    switchTo(pin);

    // Send empty response for confirmation
    res.send();
});

process.on('SIGINT', () => {
    closeApplication();
    process.exit(0);
});

/**
 * Turns the given pin on and all other LED pins off
 * @param pin the pin to be turned on
 */
function switchTo(pin: Gpio): void {
    switch (pin) {
        case RED:
            RED.writeSync(Gpio.HIGH);
            YELLOW.writeSync(Gpio.LOW);
            GREEN.writeSync(Gpio.LOW);
            break;
        case YELLOW:
            RED.writeSync(Gpio.LOW);
            YELLOW.writeSync(Gpio.HIGH);
            GREEN.writeSync(Gpio.LOW);
            break;
        case GREEN:
            RED.writeSync(Gpio.LOW);
            YELLOW.writeSync(Gpio.LOW);
            GREEN.writeSync(Gpio.HIGH);
            break;
        default:
            // There is no default case, so just leave it blank
            break;
    }
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
