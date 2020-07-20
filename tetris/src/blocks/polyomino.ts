type PolyominoRotation = '0' | '90' | '180' | '270';

/**
 * Defines a structure of a JSON object, containing the positions of all possible Polyomino rotations
 */
export interface PolyominoRotationJSON {
    0: number | Array<number>,
    90: number | Array<number>,
    180: number | Array<number>,
    270: number | Array<number>
}

/**
 * Stores all necessary properties and methods for working with any Polyomino definition
 * In order to use such an object, we need to define a formDefinition first, which is passed to the constructor
 * An example for such a definition would be 'Tetromino' (the classic Tetris case)
 */
export class Polyomino {

    /**
     * Stores the hexadecimal values of which LEDs are currently on
     */
    private currentPosition: Array<number>;

    /**
     * Stores the current rotation angle
     * Either 0°, 90°, 180° or 270° (as a string type)
     */
    private currentRotation: PolyominoRotation;

    /**
     * Stores the current block object
     * It contains values of which LEDs are on for all possible rotations
     */
    private block: PolyominoRotationJSON;

    /**
     * Creates a new basic Polyomino object
     */
    constructor(private formDefinition: Array<PolyominoRotationJSON>) {
        this.initialise();
    }

    initialise(): void {
        this.block = this.getRandomForm();
        this.currentRotation = this.getRandomRotation();
        this.currentPosition = this.getPosition();
    }

    /**
     * Returns a random for of the 'formDefinition' array
     */
    private getRandomForm(): PolyominoRotationJSON {
        const randomIndex = Math.floor(Math.random() * this.formDefinition.length);
        return this.formDefinition[randomIndex];
    }

    /**
     * Returns a random angle for the current block
     * We need this to define which LEDs are on
     */
    private getRandomRotation(): PolyominoRotation {
        const rotationIndex = Math.floor(Math.random() * 4);
        let rotation: PolyominoRotation;
        switch (rotationIndex) {
            case 0:
                rotation = '0';
                break;
            case 1:
                rotation = '90';
                break;
            case 2:
                rotation = '180';
                break;
            default:
                rotation = '270';
        }
        return rotation;
    }

    /**
     * Gets the LED positions defined in the 'formDefinition' array
     */
    getPosition(): Array<number> {
        let position = this.block[this.currentRotation];
        if (typeof position === "number") {
            position = this.block[position];
        }
        return position as Array<number>;
    }

    /**
     * Sets the rotation value to be the next in line
     */
    rotateClockWise(): void {
        let rotation = Number(this.currentRotation);
        if (rotation === 270) {
            rotation -= 360;
        }
        rotation += 90;
        this.currentRotation = this.convertToPolyominoRotation(rotation);
    }

    /**
     * Sets the rotation value to be the previous in line
     */
    rotateCounterClockWise(): void {
        let rotation = Number(this.currentRotation);
        if (rotation === 0) {
            rotation += 360;
        }
        rotation -= 90;
        this.currentRotation = this.convertToPolyominoRotation(rotation);
    }

    /**
     * Converts a number to one of the valid PolyominoRotation values
     * This method is needed, since somehow a valid number cannot be converted to the type
     * @param rotation one of the following values: 0, 90, 180, 270
     */
    convertToPolyominoRotation(rotation: number): PolyominoRotation {
        let polyominoRotation: PolyominoRotation;
        switch (rotation) {
            case 0:
                polyominoRotation = '0';
                break;
            case 90:
                polyominoRotation = '90';
                break;
            case 180:
                polyominoRotation = '180';
                break;
            default:
                polyominoRotation = '270';
        }
        return polyominoRotation;
    }
}
