function HTMLActuator() {
	var self = this;
	this.tileContainer    = document.querySelector(".tile-container");
	this.scoreContainer   = document.querySelector(".score-container");
	this.bestContainer    = document.querySelector(".best-container");
	this.messageContainer = document.querySelector(".game-message");
	this.warningContainer = document.querySelector(".game-container");
	this.psSettingsButton = document.querySelector(".pssettings-button");

	this.howToExplanation = document.querySelector(".game-explanation");
	this.psExplanation	  = document.querySelector(".playstyle-explanation");

	this.psSettingsButton.onclick = function() { self.onPSSettingsClick(); };

	this.score = 0;
	this.gameManager 	  = undefined;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
	var self = this;
	if (this.gameManager.inOptions){
		this.renderPSSettings();
	}
	else{
		window.requestAnimationFrame(function () {
			self.clearContainer(self.tileContainer);

			grid.cells.forEach(function (column) {
				column.forEach(function (cell) {
					if (cell) {
						self.addTile(cell);
					}
				});
			});

			self.updateScore(metadata.score);
			self.updateBestScore(metadata.bestScore);

			if (metadata.terminated) {
				if (metadata.over) {
					self.message(false); // You lose
				} else if (metadata.won) {
					self.message(true); // You win!
				}
			}

			self.noAnimations = false;
		});
	}
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
	this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};

HTMLActuator.prototype.addTile = function (tile) {
	var self = this;

	var wrapper   = document.createElement("div");
	var inner     = document.createElement("div");
	var position  = tile.previousPosition || { x: tile.x, y: tile.y };
	var positionClass = this.positionClass(position);

	// We can't use classlist because it somehow glitches when replacing classes
	var classes = ["tile", "tile-" + tile.value, positionClass];

	if (tile.value > 2048) classes.push("tile-super");

	this.applyClasses(wrapper, classes);

	inner.classList.add("tile-inner");
	inner.textContent = tile.value;
	if (!this.noAnimations){
		if (tile.previousPosition) {
			// Make sure that the tile gets rendered in the previous position first
			window.requestAnimationFrame(function () {
				classes[2] = self.positionClass({ x: tile.x, y: tile.y });
				self.applyClasses(wrapper, classes); // Update the position
			});
		} else if (tile.mergedFrom) {
			classes.push("tile-merged");
			this.applyClasses(wrapper, classes);

			// Render the tiles that merged
			tile.mergedFrom.forEach(function (merged) {
				self.addTile(merged);
			});
		} else {
			classes.push("tile-new");
			this.applyClasses(wrapper, classes);
		}
	}
	else{
		classes.push("tile-new");
		this.applyClasses(wrapper, classes);
	}

	// Add the inner part of the tile to the wrapper
	wrapper.appendChild(inner);

	// Put the tile on the board
	this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
	element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
	return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
	position = this.normalizePosition(position);
	return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
	this.clearContainer(this.scoreContainer);

	var difference = score - this.score;
	this.score = score;

	this.scoreContainer.textContent = this.score;

	if (difference > 0) {
		var addition = document.createElement("div");
		addition.classList.add("score-addition");
		addition.textContent = "+" + difference;

		this.scoreContainer.appendChild(addition);
	}
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
	this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
	var type    = won ? "game-won" : "game-over";
	var message = won ? "You win!" : "Game over!";

	this.messageContainer.classList.add(type);
	this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
	// IE only takes one value to remove at a time.
	this.messageContainer.classList.remove("game-won");
	this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.setWarning = function(active) {
	if(active){
		this.warningContainer.classList.add("warning")
	}
	else{
		this.warningContainer.classList.remove("warning")
	}
};

HTMLActuator.prototype.onPSSettingsClick = function(){

	if (!this.gameManager.inOptions){
		this.setWarning(false);
		this.gameManager.prepareTiles();
		this.gameManager.inOptions = true;
		this.setPSStatus();
		this.bouncePSSettings = true;
		this.renderPSSettings();
		this.howToExplanation.classList.add("hidden");
		this.psExplanation.classList.remove("hidden");
	}
	else if (!this.warningContainer.classList.contains("warning")){
		this.gameManager.inOptions = false;
		this.noAnimations = true;
		this.gameManager.actuate();
		this.howToExplanation.classList.remove("hidden");
		this.psExplanation.classList.add("hidden");
	}
};

HTMLActuator.prototype.setPSStatus = function() {
	var positions = this.gameManager.getPositions();

	var l = positions[1].l;
	var c = positions[1].c;
	if (c == 0){
		this.selLine = 3;
	}
	else if (c == 3){
		this.selLine = 1;
	}
	else if (l == 0){
		this.selLine = 0;
	}
	else if (l == 3){
		this.selLine = 2;
	}
	var l = positions[0].l;
	var c = positions[0].c;
	if (l == 0){
		if (c == 0){
			this.selCorner = 0;
		}
		else{
			this.selCorner = 1;
		}
	}
	else{
		if (c == 0){
			this.selCorner = 3;
		}
		else{
			this.selCorner = 2;
		}
	}
};

HTMLActuator.prototype.renderPSSettings = function(){
	var self = this;
	window.requestAnimationFrame(function() {
		self.clearContainer(self.tileContainer);
		var size = self.gameManager.grid.size;
		for (var x = 0; x < size; x++){
			for (var y = 0; y < size; y++){
				self.addPSSelectTile(x, y);
			}
		}
		self.bouncePSSettings = false;
	});
};

HTMLActuator.prototype.addPSSelectTile = function (x, y) {
	var self = this;
	var wrapper   = document.createElement("div");
	var inner     = document.createElement("div");
	var position  = { x: x, y: y };
	var positionClass = this.positionClass(position);

	// We can't use classlist because it somehow glitches when replacing classes
	var classes = ["tile", "tile-" + this.getTileType(x, y), positionClass];

	this.applyClasses(wrapper, classes);

	inner.classList.add("tile-inner");
	if (this.isSelected(x, y)){
		wrapper.classList.add("tile-selected");
	}
	if (this.bouncePSSettings){
		wrapper.classList.add("tile-new");
	}

	// Add the inner part of the tile to the wrapper
	wrapper.appendChild(inner);

	inner.onclick = function() {
		self.psSelect(y, x);
	};

	// Put the tile on the board
	this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.getTileType = function(x, y) {
	if (x == 0 || y == 0 || x == 3 || y == 3){
		if (x == 1 || x == 2 || y == 1 || y == 2){
			return "line";
		}
		return "corner";
	}
	return "center";
};

HTMLActuator.prototype.isSelected = function(x, y){
	var positions = this.gameManager.getPositions();
	for (var i = 0; i < positions.length - 1; i++){
		if (x == positions[i].c && y == positions[i].l){
			return true;
		}
	}
	return false;
};

//somewhat dirty function
HTMLActuator.prototype.psSelect = function(l, c){
	var type = this.getTileType(c, l);
	if (type == "center"){
		return;
	}
	if (type == "line"){
		if (c == 0){
			this.selLine = 3;
		}
		else if (c == 3){
			this.selLine = 1;
		}
		else if (l == 0){
			this.selLine = 0;
		}
		else if (l == 3){
			this.selLine = 2;
		}
	}
	if (type == "corner"){
		if (l == 0){
			if (c == 0){
				this.selCorner = 0;
			}
			else{
				this.selCorner = 1;
			}
		}
		else{
			if (c == 0){
				this.selCorner = 3;
			}
			else{
				this.selCorner = 2;
			}
		}
	}
	this.interpretSelection();
	this.renderPSSettings();
};

HTMLActuator.prototype.interpretSelection = function(){
	var fDir1 = (this.selLine + 2) % 4;
	var fDir2;
	if (this.selCorner - this.selLine != 0 && this.selCorner - this.selLine != 1 &&
		this.selCorner - this.selLine != -3){
		//warning
		this.setWarning(true);
		return;
	}
	else{
		this.setWarning(false);
	}
	if (this.selCorner == this.selLine){
		fDir2 = (this.selCorner + 1) % 4;
	}
	else{
		fDir2 = (this.selCorner + 2) % 4;
	}
	this.gameManager.fDir1 = fDir1;
	this.gameManager.fDir2 = fDir2;
	this.gameManager.saveDirections();
};