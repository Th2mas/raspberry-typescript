import "jasmine";
import { Game } from '../src/game';
import {Polyomino} from '../src/blocks/polyomino';
import {TETROMINO_DEFINITION} from '../src/blocks/definitions/tetromino.definition';

describe('Game', () => {
    describe('moveDown', () => {
        let matrix: Array<number>;
        let polyomino: Polyomino;

        beforeEach(() => {
            // Reset matrix
            matrix = [];
            for (let i = 0; i < 8; i++) {
                matrix.push(0x00);
            }

            // Get random polyomino
            polyomino = new Polyomino(TETROMINO_DEFINITION);

            // Push it to the matrix
            polyomino.getPosition().forEach((val, idx) => matrix[idx] = val);
        });

        it('should move the current position one row down', () => {
            // Arrange
            const matrixBefore = [...matrix];

            // Act
            Game.moveDown(matrix);

            // Assert
            expect(matrix.length).toBe(matrixBefore.length);
            matrix.forEach((row, idx) =>
                expect(matrix[idx]).toEqual(idx > 0 ? matrixBefore[idx - 1] : 0)
            );
        });
    });
});
