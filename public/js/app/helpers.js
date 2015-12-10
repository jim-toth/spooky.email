var VELOCITY_MOD_MAX = 10;
var VELOCITY_MOD_MIN = -10;

// Creates a raindrop object, factory function
function raindrop(startX, startY, velocity) {
	return {
		velocity: velocity,
		x: startX,
		y: startY
	};
};

// Generates a random velocity modifier for raindrops
function generateVelocityMod() {
	return Math.floor(Math.random() * (VELOCITY_MOD_MAX - VELOCITY_MOD_MIN + 1)) + VELOCITY_MOD_MIN;
};

// Helper function to determine if an event was within bounds of an image
function withinBounds(eventX, eventY, imageX, imageY, imageWidth, imageHeight) {
	return eventX >= imageX
		&& eventX <= (imageX + imageWidth)
		&& eventY >= imageY
		&& eventY <= (imageY + imageHeight);
};

// Helper function to determine if the spooky asset is set to a specific alignment for x or y positions
// Returns (calculated, if necessary) coordinate
function resolvePosition(pos, canvasDimension) {
	return pos === "center" ? canvasDimension/2 : pos;
};

// Copies text to clipboard
// NB: Text can only be copied from the DOM
function CopyEmailToClipboard(text) {
	// create new text node with desired text
	var textNode = document.createTextNode(text);

	// create new element to contain text node
	var textElement = document.createElement('div');

	// add offscreen-text class to new element
	textElement.className = 'offscreen-text';

	// append text node to text element
	textElement.appendChild(textNode);

	// append text element to document.body
	document.body.appendChild(textElement);

	// create range and select text element
	var range = document.createRange();
	
	// re-select element from the document
	var docElement = document.querySelector('.offscreen-text');

	// use range to select text element from document
	range.selectNode(docElement);
	
	// select range
	window.getSelection().addRange(range);
	try {
		var success = document.execCommand('copy');
	} catch (err) {
		console.log(err);
	}

	// remove offscreen text holder from document
	$(textElement).remove();
};

// Spooky console art
function spookyConsoleArt() {
	var spookyWord = 'SPOOOOOOOOOKY';
	var spookyLine = '.\t\t\t';
	var spookyString = spookyLine + '~~~(.  .)~~~\n'
						+ spookyLine + 	'\\__      __/\n';
	for (var i=0; i < spookyWord.length; i++) {
		if(i % 2 == 0) {
			spookyString += spookyLine+'   )  '+spookyWord.substr(i,1)+'  )\n';
		} else {
			spookyString += spookyLine+'  (   '+spookyWord.substr(i,1)+' (\n';
		}
	}
	spookyString += spookyLine + 	'   \\    /\n'
					+ spookyLine + 	'    \\  /\n'
					+ spookyLine + 	'     \\/';
	console.log(spookyString);
};