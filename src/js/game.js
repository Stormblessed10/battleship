import '../scss/index.scss';
import { Gameboard } from "./gameboard.js";
import { Player } from "./players.js";

class Game {
    players = [];
    
    // creates player class by clicking on button
    createPlayer(player) {
        return new Promise(resolve => {
            const helper = (e) => {
                e.preventDefault();
                if (!e.target.classList.contains('select')) return;

                // push player to players array;
                this.players.push(new Player(e.target.textContent, new Gameboard(player)));
                
                this._changeText('Second player type:')
                document.querySelector('.container').removeEventListener('click', helper);
                resolve();
            }

            document.querySelector('.container').addEventListener('click', helper);
        });
    }

    _changeText(text) {
        document.querySelector('.text').textContent = text;
    }

    _winCondition(player1, player2) {
        const countForWin = 5;
        if (player1.countOfSank === countForWin && player2.countOfSank === countForWin) {
            this._changeText('it\'s a draw')
            return true;
        }
        if (player1.countOfSank === countForWin) {
            this._changeText('Player 1 won')
            return true;
        }
        if (player2.countOfSank === countForWin) {
            this._changeText('Player 2 won')
            return true;
        }
        return false;
    }

    _removeBtns() {
        return new Promise(resolve => {
            document.querySelector('.btns').remove();
            resolve();
        });
    }

    // Checks which type of player you select
    selectSetup(player) {
        if (player.name === 'AI') return player.board.setupBoardAi();
        return player.board.setupBoard();
    }

    selectAttack(player, enemyBoard) {
        if (player.name === 'AI') return player.aiAttack(enemyBoard);
        return player.humanAttack(enemyBoard);
    }

    toggleSound() {
        const sound = document.querySelector('audio');
        document.querySelector('.mute').addEventListener('click', (e) => {

            // Play
            if (sound.duration > 0 && !sound.paused) {
                document.querySelector('audio').pause();

                // SVG play icon
                e.target.innerHTML = `
                <svg enable-background="new 0 0 50 50" height="50px" id="Layer_1" version="1.1" viewBox="0 0 50 50" width="50px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><line fill="none" stroke="#000000" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" x1="32" x2="42" y1="20" y2="30"/><line fill="none" stroke="#000000" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" x1="42" x2="32" y1="20" y2="30"/><rect fill="none" height="50" width="50"/><rect fill="none" height="50" width="50"/><path d="M10,33H3  c-1.103,0-2-0.898-2-2V19c0-1.102,0.897-2,2-2h7" fill="none" stroke="#000000" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2.08"/><path d="M9.604,32.43  C9.256,32.129,9,31.391,9,30.754V19.247c0-0.637,0.256-1.388,0.604-1.689L22.274,4.926C23.905,3.27,26,3.898,26,6.327v36.988  c0,2.614-1.896,3.604-3.785,1.686L9.604,32.43z" fill="none" stroke="#000000" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.9797"/></svg>
                `;

                // Pause
            } else {
                document.querySelector('audio').play();

                // SVG mute icon
                e.target.innerHTML = `
                <svg enable-background="new 0 0 50 50" height="50px" id="Layer_1" version="1.1" viewBox="0 0 50 50" width="50px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect fill="none" height="50" width="50"/><path d="M10,33H3  c-1.103,0-2-0.898-2-2V19c0-1.102,0.897-2,2-2h7" fill="none" stroke="#000000" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2.08"/><path d="M9.604,32.43  C9.256,32.129,9,31.391,9,30.754V19.247c0-0.637,0.256-1.388,0.604-1.689L22.274,4.926C23.905,3.27,26,3.898,26,6.327v36.988  c0,2.614-1.896,3.604-3.785,1.686L9.604,32.43z" fill="none" stroke="#000000" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.9797"/><path d="  M30.688,19.417C33.167,20.064,35,22.32,35,25s-1.833,4.936-4.312,5.584" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/><path d="  M34.92,13.142C39.136,15.417,42,19.873,42,25c0,5.111-2.85,9.557-7.045,11.835" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/></svg>
                `;
            }
        });
    }

    async initAttack(player1, player2) {
        if (this._winCondition(player1, player2)) return;
        await this.selectAttack(player1, player2.board);
        await this.selectAttack(player2, player1.board);
        this.initAttack(player1, player2);
    }

    async initSetup() {
        await this.selectSetup(this.players[0]);
        await this.selectSetup(this.players[1]);
        document.querySelector('.player-2').classList.add('hover');
    }

    async initGame() {
        await this.createPlayer('player-1');
        await this.createPlayer('player-2');
        await this._removeBtns();
        await this.initSetup();
        this.initAttack(this.players[0], this.players[1]);
    }
}

const game = new Game;
game.toggleSound();
game.initGame();
