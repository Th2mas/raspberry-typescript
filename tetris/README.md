# tetris
In this project, we use the custom made LED matrix and program a fully functional tetris clone, using nothing but a Raspberry Pi, some 
electrical components and TypeScript.
You will be able to play a simple tetris version, using buttons for control and seeing the result on the matrix.

## Table of contents
1. [Components](#components)
2. [Design](#design)
3. [Circuit Diagram](#circuit-diagram)
4. [Dependencies](#dependencies)
5. [Code](#code)
    - [Low-level communication](#low-level-communication)
    - [Definitions](#definitions)
    - [Game Logic](#game-logic)
6. [Run application](#run-application)
7. [Notes](#notes)
8. [Further reading](#further-reading)

## Components
- 1x [LED matrix](../led-matrix-8x8)
- 4x Push buttons
- 4x 100&Omega; resistors
- Male-to-Male jumper wires

## Design
Coming soon

## Circuit Diagram
Coming soon

## Dependencies
In order to be able to use TypeScript and the other packages, we need to include these dependencies in a package.json file.
The packages needed in this project are

- [i2c-bus](https://www.npmjs.com/package/i2c-bus)
- [rpio](https://www.npmjs.com/package/rpio)
- [rxjs](https://www.npmjs.com/package/rxjs)
- [typescript](https://www.npmjs.com/package/typescript)
- [ts-node](https://www.npmjs.com/package/ts-node)

As a reference, the full can be found in the [package.json](./package.json) file.

## Code
We are going to split the code into three main parts:
1) Low-level communication with the LED matrix and buttons
2) Definitions
3) Game Logic

We will start with the simplest, the low-level communication.

### Low-level communication
We have split the low-level communication into two parts:
1) LED matrix communication
2) Push-button communication

#### LED matrix communication
We have already described the low-level i2c communication in the [LED matrix](../led-matrix-8x8) project.
The methods will be later used in the game loop.

#### Push-button communication
Our game will need four buttons:

- Move left
- Move right
- Rotate left
- Rotate right

Using the rpio module, we can listen to any button events.
First, we need to open each of the buttons for event changes.
We can do this by executing the `open` method
```javascript
buttons.forEach(button => rpio.open(button, rpio.INPUT, rpio.PULL_UP))
```
Afterwards, we need to assign a listener to each button event.
This can be done by using the `poll` method, where the first parameter is the number of the GPIO pin and the second 
parameter the function to be executed.
An example would be
```javascript
const MOVE_LEFT_BUTTON = 38;    // GPIO 20, Physical pin 38
rpio.poll(MOVE_LEFT_BUTTON, moveLeft);
```
Inside the `moveLeft` method, we can now use a RXJS subject, which will notify all observers that a change has occurred.
```javascript
function moveLeft(pin: number): void {
    if (isValidPush(pin)) {
        moveLeftSubject.next();
    }
}
```
We use the RXJS Subject, since it allows to emit an event and let all observers know, that a change has occurred.
In our case all observers of the `moveLeft` method will observe, that a push on the 'move left' button has occurred.
The other three buttons work pretty much the same, only the GPIO pins are different.

You can find the pins and methods in the [controls.ts](./src/controls.ts) file.
That's it with the buttons, let's take a look at the definitions.

### Definitions
In order to have a clear structure of how a tetris block should look like, we want to create a definitions object, which 
will store the object's data. 
With this, we will also be able to adjust the game a little (but we will discuss this later).

### Game Logic
The game logic and the loop itself is the heaviest [file](./src/game.ts) in this project.
We have to split this one up into several parts:

- Game loop
- Helper methods
- Movement down, right and left
- Rotating

#### Game loop

#### Helper methods

#### Movement down, right and left

#### Rotation

## Run application
Using only the i2c-bus, we can run the game by simply calling
```shell script
npm run start
```
After some seconds, you should be able to see a random tetromino appear on the top edge of the LED matrix.

## Notes
Using the definitions object, it is possible to use any [Polyomino](https://en.wikipedia.org/wiki/Polyomino) that we want.
Tetris already has the name "four" inside it, but we can also use blocks consisting of only one, two, three or more areas.
The only thing we would have to change is the definitions object.

## Further reading
Coming soon
