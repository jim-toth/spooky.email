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

// Generates a new spooky image object, factory method
function spookyImage(name, src, clickable, clickEvent, cursorImg) {
	var oSpooky = {
		name: name,
		src: src,
		img: new Image(),
		x: -1,
		y: -1,
		clickable: clickable,
		clickEvent: clickEvent,
		cursorImg: cursorImg
	};

	oSpooky.img.src = src;

	return oSpooky;
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

// Copies text to clipboard
function CopyEmailToClipboard() {
	var emailLink = document.querySelector('.offscreen-text');
	var range = document.createRange();
	range.selectNode(emailLink);
	window.getSelection().addRange(range);
	try {
		var success = document.execCommand('copy');
	} catch (err) {
		console.log(err);
	}
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