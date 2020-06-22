# binary-counter
In this project, eight LEDs build up an 8-Bit counter, counting from 0 to 255, using nothing but a Raspberry Pi, some 
electrical components and TypeScript.
It shows visually how numbers are counted in a binary system from 0 to 255.

After finishing this project, you should be able to see the LEDs light up, depending on the binary value of the current 
number.

## Table of contents
1. [Components](#components)
2. [Design](#design)
3. [Circuit Diagram](#circuit-diagram)
4. [Dependencies](#dependencies)
5. [Code](#code)
6. [Run application](#run-application)
7. [Notes](#notes)
8. [Further reading](#further-reading)

## Components
- 1x Raspberry Pi 3
- 1x Breadboard
- 1x MCP23017 Port Expander
- 8x 100&Omega; resistors
- 8x LED (color does not really matter, we used red ones)
- 16x Male-to-male jumper wires
- 4x Female-to-male jumper wires

## Design

![Fritzing diagram of the binary counterL example](./images/binary-counter.svg)

*Diagram created using [Fritzing](https://fritzing.org/home/)*

E.g. if the number is 1100100<sub>2</sub> (100<sub>10</sub>), the first, second and fifth LED (from top to bottom) should be on, while the others are off.

## Circuit Diagram
Coming soon

## Dependencies
In order to be able to use TypeScript and the other packages, we need to include these dependencies in a package.json file.
The packages needed in this project are

- [rpio](https://www.npmjs.com/package/rpio)
- [typescript](https://www.npmjs.com/package/typescript)
- [ts-node](https://www.npmjs.com/package/ts-node)

As a reference, the full can be found in the [package.json](./package.json) file.

## Code
Coming soon

## Run application
Open the console in the directory in which you stored the package.json file on your Raspberry Pi.

To run the application, type
```shell script
npm run start
```
in the console.
After a short time you should be able to see the LEDs light up, starting from 0 (all LEDs off) up to 255 (all LEDs) on.

## Notes
Coming soon

## Further reading
Coming soon
