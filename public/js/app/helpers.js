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

// Copies text to clipboard
function CopyToClipboard(text) {
	Copied = text.createTextRange();
	Copied.execCommand("Copy");
}