export class Player {
    lastHit;
    prevHit;
    enemyField
    targetShip;
    sank;
    row;
    detectedRestrict = [];
    countOfSank = 0;
    
    constructor(name, board) {
        this.name = name;
        this.board = board;
    }

    humanAttack(enemy) {
        return new Promise((resolve) => {
            const humanAttackEvent = (e) => {
                const cell = e.target;
                
                if (!cell.classList.contains('cell') || enemy.board[cell.classList[1]].hasShot) return;

                document.querySelector(`.board.${enemy.player}`).removeEventListener('click', humanAttackEvent);                
                this._attack(cell.classList[1], enemy, resolve);
            }

            document.querySelector(`.board.${enemy.player}`).addEventListener('click', humanAttackEvent);
        });
    }
        
    aiAttack(enemy) {
        this.enemyField = enemy;
        return new Promise((resolve) => {
            setTimeout(() => {
                this._attack(this._aiAttackAlgorithm(), enemy, resolve);
            }, 400);
        });
    }

    _aiAttackAlgorithm() {
        // if ship was sunk reset class fields and set restricted cells
        if (this.sank) {
            this.detectedRestrict = this.detectedRestrict
            .concat(
            this.enemyField.board
            .filter(el => el.hasShip === `restricted by ${this.targetShip.name}`)
            );

            this.lastHit = false;
            this.targetShip = false;
            this.sank = false;
            this.row = false;
            this.prevHit = false;
        }

        // If the AI detects a ship, it will hit it until the ship sinks
        if (this.targetShip) {
            const targets = this.enemyField.board.filter(el => el.hasShip === this.targetShip && !el.hasShot);
            if (!this.prevHit) return targets[0].index;
            if (!this.row) this.row = this.lastHit - this.prevHit;
            return this.lastHit + this.row < 100 && this.lastHit + this.row >= 0 ? this.lastHit + this.row : this.lastHit;
        }

        // if ai hits the ship, but not detected the ship axis yet 
        if (this.lastHit) {

            // random cell arount the hit
            const random = Math.trunc(Math.random() * 4);
            const nextHit = random === 3 ? -10 : random === 2 ? 10 : random === 1 ? 1 : -1;

            // checks if next hit is correct 
            return this.lastHit + nextHit < 100 && this.lastHit + nextHit >= 0 ? this.lastHit + nextHit : this.lastHit;

        } else {
            // random cell
            return Math.trunc(Math.random() * 100);
        }
    }
    
    _checkAllowed(index) {
        return this.detectedRestrict.find(el => el.index === index); 
    }

    _attack(cell, enemyBoard, resolve) {

        // reset previous hit
        this.prevHit = false;

        // if ai hits to a cell that already was hit
        if (enemyBoard.board[cell].hasShot || this._checkAllowed(cell)) {
            return this._attack(this._aiAttackAlgorithm(), enemyBoard, resolve);
        }

        // receiveHit() returns the cell with the hit ship
        const hitShipCell = enemyBoard.receiveHit(cell);

        if (hitShipCell) {
            this.board.changeText(`${this.board.player} hit the ship. ${enemyBoard.player} it's your turn now`);

            if (this.lastHit && !this.targetShip) {
                this.targetShip = enemyBoard.board[cell].hasShip;
            }

            this.prevHit = this.lastHit;
            this.lastHit = hitShipCell;

        } else {
            this.board.changeText(`${this.board.player} missed. ${enemyBoard.player} it's your turn now`);
        }

        // if the ship sank by the last shot
        if (enemyBoard.board[cell].hasShip.sunk) {
            this.sank = true;

            // increase count of sank
            this.countOfSank++;
        }

        // switch the hover effect on boards
        this.board.toggleHover();
        enemyBoard.toggleHover();

        resolve();
    }
}
