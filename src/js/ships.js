export class Ship {
    constructor(name, length, hits, sunk) {
        this.name = name;
        this.length = length;
        this.hits = hits;
        this.sunk = sunk;
        this.axis = 'y';
    }

    isSunk() {
        this.sunk = this.length - this.hits ? false : true;
    }

    hit() {
        this.hits += 1;
    }

    switchAxis() {
        this.axis = this.axis === 'y' ? 'x' : 'y';
    }
}
