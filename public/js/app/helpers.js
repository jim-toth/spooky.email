// Helper function to determine if an event was within bounds of an image
function withinBounds(eventX, eventY, imageX, imageY, imageWidth, imageHeight) {
	return eventX >= imageX
		&& eventX <= (imageX + imageWidth)
		&& eventY >= imageY
		&& eventY <= (imageY + imageHeight);
};

// Helper function to determine if the spooky asset is set to a specific alignment for x or y positions
// "center" = center alignment
// "right" = right alignment
// "bottom" = bottom alignment
// Returns (calculated, if necessary) coordinate
function resolvePosition(pos, canvasDimension, dimension) {
	var _pos;

	if (pos === "center") {
		if (dimension) {
			_pos = (canvasDimension / 2) - (dimension / 2);
		} else {
			_pos = canvasDimension / 2;
		}
	} else if (pos === "right" || pos === "bottom") {
		_pos = canvasDimension - dimension;
	} else {
		_pos = pos;
	}

	return _pos;
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
		
		// Notify console
		console.log('Copied text to clipboard!');
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
	var spookyString = spookyLine+'~~~(.  .)~~~\n'+
		spookyLine+'\\__      __/\n';
	var i;
	for (i = 0; i < spookyWord.length; i += 1) {
		if (i % 2 === 0) {
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