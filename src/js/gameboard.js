import { Ship } from "./ships";

export class Gameboard {
    container = document.querySelector('.container');
    boardEl;

    constructor(player) {
        this.player = player;
        this.board = Array.apply(null, Array(100)).map((el, i) => el = {hasShip: false, hasShot: false, index: i});
        this.ships = [
            new Ship('carrier', 5, 0, false),
            new Ship('battleship', 4, 0, false),
            new Ship('cruiser', 3, 0, false),
            new Ship('submarine', 3, 0, false),
            new Ship('destroyer', 2, 0, false),
        ];
    }

    _hideShips() {
        this.boardEl.querySelectorAll('.ship').forEach(el => el.style.opacity = '0');
    }

    _revealSankShip(ship) {
        this.boardEl.querySelector('.'+ship).classList.add('sank');
    }

    _createBoard() {
        this.changeText(`${this.player.replace(/-/, ' ')}, place your ships. Press "R" to rotate a ship`);

        this.container.insertAdjacentHTML('beforeend', `
            <div>
                <h2>${this.player.replace(/-/, ' ')}</h2>
                <div class="board ${this.player}"></div>
                <button class="finish">Finish Setup</button>
            </div>
        `);

        this.board.forEach((el, i) => document.querySelector(`.board.${this.player}`).insertAdjacentHTML('beforeend', `<div class="cell ${i}"></div>`));
        this.boardEl = document.querySelector(`.board.${this.player}`);
    }

    _createShips() {
        this.ships.forEach(el => {
            const ship = document.createElement('div');
            ship.classList.add('ship', el.name, this.player);
            document.querySelector('.ships').appendChild(ship);
        });
    }

    _setShip(ship, id, axis) {
        id = +(id);

        if (axis === 'x') {
            // Add restricted cells
            if (id % 10) {
                this.board[(id - 1)].hasShip = `restricted by ${ship.name}`;
            }

            if (Math.trunc(id / 10) === Math.trunc((id + ship.length) / 10)) {
                this.board[(id + ship.length)].hasShip = `restricted by ${ship.name}`;
            }

            for (let i = 0; i < ship.length; i++) {
                // place ship
                this.board[id + i].hasShip = ship;

                // Add restricted cells
                if (id > 10) {
                    this.board[id + i - 10].hasShip = `restricted by ${ship.name}`;
                }

                if (id < 89) {
                    this.board[id + i + 10].hasShip = `restricted by ${ship.name}`;
                }
            }
            
        } else {
            // Add restricted cells
            if (id > 10) {
                this.board[(id - 10)].hasShip = `restricted by ${ship.name}`;
            }

            if (id + ship.length * 10 < 100) {
                this.board[(id + ship.length * 10)].hasShip = `restricted by ${ship.name}`;
            }

            for (let i = 0; i < ship.length; i++) {
                // place ship
                this.board[id + i * 10].hasShip = ship;

                // Add restricted cells
                if ((id) % 10 > 0) {
                    this.board[(id - 1) + i * 10].hasShip = `restricted by ${ship.name}`;
                }

                if (id.toString().at(-1) !== '9') {
                    this.board[(id + 1) + i * 10].hasShip = `restricted by ${ship.name}`;
                }
            }
        }
    }

    receiveHit(id) {
        const cell = this.board[id];
        let hit = 'miss';

        // if a cell already have a shot, return nothing 
        if (cell.hasShot) return;
        cell.hasShot = true;

        if (typeof cell.hasShip === 'object') {
            cell.hasShip.hit();
            cell.hasShip.isSunk();
            if (cell.hasShip.sunk) this._revealSankShip(cell.hasShip.name);
            hit = 'hit';
        }
        this.boardEl.querySelector(`.${CSS.escape(id)}`)
        .insertAdjacentHTML('afterbegin', `<div class="${hit}"></div>`);

        // returns the cell with ship that was hit
        if (typeof cell.hasShip === 'object') return id;
    }

    _cell(e) {
        return e.target.closest('.cell');
    }

    _checkCellsCorrectness(cell, index, axis) {
        const leng = this.ships[index].length;

        if (axis === 'x') {
            // When the ship goes out of row
            if (Math.trunc((cell - 1 + leng) / 10) > Math.trunc(cell / 10)) return true;

            for (let i = 0; i < leng; i++) {
                // when the ship crossing other ship
                if (this.board[+(cell) + i]?.hasShip) return true;
            }
        } else {
            for (let i = 0; i < leng; i++) {
                // When the ship goes out of col
                if (+(cell) + i * 10 > 99) return true;

                // when the ship crossing other ship
                if (this.board[+(cell) + i * 10]?.hasShip) return true;
            }
        }
        return false;
    }

    toggleHover() {
        document.querySelector(`.${this.player}`).classList.toggle('hover');
    }

    changeText(text) {
        document.querySelector('.text').textContent = text;
    }

    // HUMAN METHODS
    setupBoard() {
        return new Promise((resolve) => {
            this._createBoard();
            this._createShips();
            this._placeShipHelper();
            this._hideShips();
            document.querySelector('.finish').addEventListener('click', (e) => {
                this._hideShips();
                e.target.remove();
                this.changeText(`player 1, fire`);
                resolve('');
            }, { once: true });
        });
    }

    async _placeShipHelper() {
        for (let i = 0; i < this.ships.length; i++) await this._placeShipHuman(i);
    }

    _placeShipHuman(shipIndex) {
        return new Promise((resolve) => {
            // variables
            const ship = document.querySelector(`.${this.ships[shipIndex].name}.${this.player}`);

            // Moving ship by pointing on a cell
            const moveAt = (e) => {
                const cell = this._cell(e);
                if (!cell) return;
                cell.appendChild(ship);
            }

            // Change axis
            const changeShipAxis = (e) => {
                if (e.key !== 'r') return;
                this.ships[shipIndex].switchAxis();
                this.ships[shipIndex].axis === 'x' ? ship.classList.add('hor') : ship.classList.remove('hor');  
            }
            
            const shipValidation = (e) => {
                const cell = this._cell(e);

                // Check if ships have been placed in the correct cell
                if (!cell || this._checkCellsCorrectness(cell.classList[1], shipIndex, this.ships[shipIndex].axis)) {
                    // Add listener again
                    return this.boardEl.addEventListener('click', shipValidation, { once: true });
                }

                // Set ships in js, not DOM 
                this._setShip(this.ships[shipIndex], cell.classList[1], this.ships[shipIndex].axis);

                // Removing events
                document.removeEventListener('keydown', changeShipAxis);
                this.boardEl.removeEventListener('mousemove', moveAt);

                // Resolve promise
                resolve(shipIndex);
            }

            // Add events
            document.addEventListener('keydown', changeShipAxis);
            this.boardEl.addEventListener('mousemove', moveAt);
            this.boardEl.addEventListener('click', shipValidation, { once: true });
        });
    }

    // AI METHODS

    _placeShipAi(i) {
        // If index of ships lesser than one, end recursion  
        if (i < 0) return;
        // Random cell
        const cellId = Math.trunc(Math.random() * 100);
        // Randim axis
        Math.trunc(Math.random() * 2) ? this.ships[i].switchAxis() : '';
        // If placement fails, call again
        if (this._checkCellsCorrectness(cellId, i, this.ships[i].axis)) return this._placeShipAi(i);

        this._setShip(this.ships[i], cellId, this.ships[i].axis);

        const cell = this.boardEl.querySelector(`.cell.${CSS.escape(cellId)}`);
        const ship = document.querySelector(`.${this.ships[i].name}.${this.player}`);

        this.ships[i].axis === 'x' ? ship.classList.add('hor') : '';
        cell.appendChild(ship);
        return this._placeShipAi(i - 1);
    }
    
    setupBoardAi() {
        return new Promise((resolve) => {
            this._createBoard();
            this._createShips();
            this._placeShipAi(this.ships.length - 1);
            this._hideShips();
            document.querySelector('.finish').remove();
            this.changeText(`player 1, fire`);
            resolve('');
        });
    }
}
