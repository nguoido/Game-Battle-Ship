var Player = require('./player.js');
var Settings = require('./settings.js');
var GameStatus = require('./gameStatus.js');


 // BattleshipGame constructor
 // id, idPlayer1 Socket ID of player 1, idPlayer2 Socket ID of player 2
function BattleshipGame(id, idPlayer1, idPlayer2) {
	this.id = id;
	//  x = Math.floor(Math.random() * 2); => { x | 0 <= x <= 1; x is Integer }
	// x = 0
	this.currentPlayer = Math.floor(Math.random() * 2);
	this.winningPlayer = null;
	this.gameStatus = GameStatus.inProgress;

	this.players = [new Player(idPlayer1), new Player(idPlayer2)];
	this.check_shoot=0;
}

// Get socket ID of player
// @param {type} player
// @returns {undefined}
 
BattleshipGame.prototype.getPlayerId = function (player) {
	return this.players[player].id;
};

// Get socket ID of winning player
// @returns {BattleshipGame.prototype@arr;players@pro;id}

BattleshipGame.prototype.getWinnerId = function () {
	if (this.winningPlayer === null) {
		return null;
	}
	return this.players[this.winningPlayer].id;
};


// Get socket ID of losing player
// @returns {BattleshipGame.prototype@arr;players@pro;id}
BattleshipGame.prototype.getLoserId = function () {
	if (this.winningPlayer === null) {
		return null;
	}
	var loser = this.winningPlayer === 0 ? 1 : 0;
	return this.players[loser].id;
};

// Switch turns
// Doi luot ban

BattleshipGame.prototype.switchPlayer = function () {
	this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;
};

// Abort game
// @param {Number} player Player who made the request
BattleshipGame.prototype.abortGame = function (player) {
	// give win to opponent
	this.gameStatus = GameStatus.gameOver;
	this.winningPlayer = player === 0 ? 1 : 0;
}


// Fire shot for current player
// Ban cho nguoi hien tai
// @param {Object} position with x and y
// @returns {boolean} True if shot was valid
//kiem tra bắn trúng hay không
BattleshipGame.prototype.shoot = function (position) {
	var opponent = this.currentPlayer === 0 ? 1 : 0,
	// vi tri ban
	gridIndex = position.y * Settings.gridCols + position.x;
	

//chua ban thi = 0
	if (this.players[opponent].shots[gridIndex] === 0 && this.gameStatus === GameStatus.inProgress) {
		// Square has not been shot at yet.
		// nhay vo la if 1 do ban
		if (!this.players[opponent].shoot(gridIndex)) {

			this.check_shoot=1;//shoot missed
			// chuyen luot
			// Miss
			this.switchPlayer();
		}
		else
		{
			this.check_shoot=2;//shoot successed
			this.players[this.currentPlayer].score++;
		}

		// Check if game over
		if (this.players[opponent].getShipsLeft() <= 0) {
			this.gameStatus = GameStatus.gameOver;
			this.winningPlayer = opponent === 0 ? 1 : 0;
		}

		return true;
	}

	return false;
};

BattleshipGame.prototype.get_score = function () {
var opponent = this.currentPlayer === 0 ? 1 : 0;
	return {
		score_you: this.players[this.currentPlayer].score,
		score_opponent: this.players[opponent].score
	};
	
};




// Get game state update (for one grid).
// @param {Number} player Player who is getting this update
// @param {Number} gridOwner Player whose grid state to update
// @returns {BattleshipGame.prototype.getGameState.battleshipGameAnonym$0}

BattleshipGame.prototype.getGameState = function (player, gridOwner) {
	
	return {
		turn: this.currentPlayer === player, // is it this player's turn?
		gridIndex: player === gridOwner ? 0 : 1, // which client grid to update (0 = own, 1 = opponent)
		grid: this.getGrid(gridOwner, player !== gridOwner) // hide unsunk ships if this is not own grid

	};
};

//Get grid with ships for a player.
//@param {type} player Which player's grid to get
//@param {type} hideShips Hide unsunk ships
//@returns {BattleshipGame.prototype.getGridState.battleshipGameAnonym$0}
BattleshipGame.prototype.getGrid = function (player, hideShips) {
	return {
		shots: this.players[player].shots,
		ships: hideShips ? this.players[player].getSunkShips() : this.players[player].ships
	};
};

module.exports = BattleshipGame;
