window.fakeStorage = {
	_data: {},

	setItem: function (id, val) {
		return this._data[id] = String(val);
	},

	getItem: function (id) {
		return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
	},

	removeItem: function (id) {
		return delete this._data[id];
	},

	clear: function () {
		return this._data = {};
	}
};

function LocalStorageManager() {
	this.bestScoreKey     = "bestScore";
	this.gameStateKey     = "gameState";
	this.fDir1Key		  = "fDir1";
	this.fDir2Key		  = "fDir2";

	var supported = this.localStorageSupported();
	this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function () {
	var testKey = "test";
	var storage = window.localStorage;

	try {
		storage.setItem(testKey, "1");
		storage.removeItem(testKey);
		return true;
	} catch (error) {
		return false;
	}
};

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function () {
	return this.storage.getItem(this.bestScoreKey) || 0;
};

LocalStorageManager.prototype.setBestScore = function (score) {
	this.storage.setItem(this.bestScoreKey, score);
};

LocalStorageManager.prototype.setDirections = function (fDir1, fDir2) {
	this.storage.setItem(this.fDir1Key, fDir1);
	this.storage.setItem(this.fDir2Key, fDir2);
}

LocalStorageManager.prototype.getDirections = function() {
	var fDir1 = this.storage.getItem(this.fDir1Key) || 0;
	var fDir2 = this.storage.getItem(this.fDir2Key) || 3;
	if (typeof fDir1 == "string"){
		fDir1 = parseInt(fDir1);
	}
	if (typeof fDir2 == "string"){
		fDir2 = parseInt(fDir2);
	}
	return { fDir1: fDir1, fDir2: fDir2 };
}

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function () {
	var stateJSON = this.storage.getItem(this.gameStateKey);
	return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
	this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
};

LocalStorageManager.prototype.clearGameState = function () {
	this.storage.removeItem(this.gameStateKey);
};
