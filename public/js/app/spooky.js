$(document).ready(function () {
	// Grab Audio Context
	var audioContext;
	if (typeof AudioContext !== 'undefined') {
		audioContext = new AudioContext();
	} else if (typeof webkitAudioContext !== 'undefined') {
		audioContext = new webkitAudioContext();
	} else {
		throw new Error(
			'AudioContext not supported by this browser because it\'s too old.  Is it a ghost?'
		);
	}

	// Grab canvas and canvas context
	var canvas = $('canvas#spooky_canvas')[0];
	var canvasContext = canvas.getContext('2d');

	// Set canvas height and width to fit page
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Image assets
	var images = [];

	// Create collection for rain to hold our raindrops
	var rain = [];

	// Constants
	var MAX_RAINDROPS = 100;
	var DEFAULT_VELOCITY = 20;
	var RAINDROP_WIDTH = 1;
	var RAINDROP_HEIGHT = 1;
	var VELOCITY_MOD_MIN = -10;
	var VELOCITY_MOD_MAX = 10;
	var RAIN_FILL_STYLE = 'aqua';
	var FLASHLIGHT_RADIUS_1 = 150;
	var FLASHLIGHT_RADIUS_2 = 175;
	var FLASHLIGHT_KEY = '70'; // f
	var RAINDROP_SPACING = 5;

	// toggle variable for flashlight on/off
	var flashlight_on = true;

	// Helper canvas for opacity mask
	var maskCanvas = document.createElement('canvas');
	maskCanvas.width = canvas.width;
	maskCanvas.height = canvas.height;
	var maskContext = maskCanvas.getContext('2d');
	
	// Track cursor position
	var cursor_pos = { x: -1000, y: -1000 };

	// Creates a raindrop object
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

	// Generates a new spooky image object
	function spookyImage(name, src, clickable, clickEvent) {
		var oSpooky = {
			name: name,
			src: src,
			img: new Image(),
			x: -1,
			y: -1,
			clickable: clickable,
			clickEvent: clickEvent
		};

		oSpooky.img.src = src;

		return oSpooky;
	};

	// Draw function
	function draw() {
		// Set up draw function to loop
		requestAnimationFrame(draw);

		// Reset
		canvasContext.globalCompositeOperation = 'source-over';
		canvasContext.clearRect(0, 0, canvas.width, canvas.height);

		// Fill canvas background
		canvasContext.fillStyle = 'black';
		canvasContext.fillRect(0, 0, canvas.width, canvas.height);

		// Center text
		canvasContext.fillStyle = 'grey';
		canvasContext.font = '72px Verdana';
		canvasContext.textAlign = 'center';
		canvasContext.fillText('jim@spooky.email', canvas.width/2, canvas.height/2);

		// Draw images
		for (var i=0; i < images.length; i++) {
			if (images[i].img.complete) {
				// update image positions
				if (images[i].x == -1 || images[i].y == -1) {
					if (images[i].name == 'github-logo') {
						images[i].x = (canvas.width/2)-(images[i].img.width/2);
						images[i].y = canvas.height-(images[i].img.height)-25;
					}
				}

				// draw image
				canvasContext.drawImage(images[i].img, images[i].x, images[i].y);
			}
		}
		

		// Raindrops
		$.each(rain, function (idx, drop) {
			// Draw drop
			canvasContext.fillStyle = RAIN_FILL_STYLE;
			canvasContext.fillRect(drop.x, drop.y, RAINDROP_WIDTH, RAINDROP_HEIGHT);

			// Animate
			if (drop.y + drop.velocity <= canvas.height) {
				drop.y = drop.y + drop.velocity;
			} else {
				// When raindrop reaches bottom of screen, reset position to top
				drop.y = 0;

				// Set a new random velocity
				drop.velocity = DEFAULT_VELOCITY + generateVelocityMod();
			}
		});

		// Spooky opacity filter!
		maskContext.clearRect(0,0,maskCanvas.width, maskCanvas.height);
		maskContext.fillStyle = 'rgba(0,0,0,0.85)';
		maskContext.fillRect(0,0,maskCanvas.width, maskCanvas.height);

		// flashlight
		if (flashlight_on) {
			//maskContext.translate(cursor_pos.x, cursor_pos.y);
			var grd = maskContext.createRadialGradient(cursor_pos.x, cursor_pos.y, FLASHLIGHT_RADIUS_1, cursor_pos.x, cursor_pos.y, FLASHLIGHT_RADIUS_2);
			grd.addColorStop(0, 'white');
			grd.addColorStop(1, 'rgba(255,255,255,0.1)');
			maskContext.fillStyle = grd;
			maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

		}

		canvasContext.globalCompositeOperation = 'multiply';
		canvasContext.drawImage(maskCanvas, 0, 0);
		canvasContext.globalCompositeOperation = 'source-on';
	};

	// Track image assets
	images.push(spookyImage('github-logo', 'media/GitHub-Mark-120px-plus.png', true, function () {
		// Open github page
		window.open('https://github.com/jim-toth', '_blank');
	}));

	// Generate raindrops
	for (var i=0; i < canvas.width/RAINDROP_SPACING; i++) {
		rain.push(raindrop(i*10, 0, DEFAULT_VELOCITY + generateVelocityMod()));
	}
	
	// Initialize mouse cursor update function
	$('canvas#spooky_canvas').mousemove(function (ev) {
		cursor_pos.x = ev.pageX;
		cursor_pos.y = ev.pageY;
	});

	// Catch key presses
	$('body').keydown(function (ev) {
		if (ev.which == FLASHLIGHT_KEY) {
			ev.preventDefault();

			flashlight_on = !flashlight_on;
		}
	});

	// Catch canvas clicks
	canvas.addEventListener('click', function (ev) {
		ev.preventDefault();

		for (var i=0; i < images.length; i++) {
			// If the image is clickable and loaded...
			if (images[i].clickable && images[i].img.complete) {
				// Check if the click was on within an image's bounds
				if (ev.clientX >= images[i].x && ev.clientX <= (images[i].x+images[i].img.width) &&
					ev.clientY >= images[i].y && ev.clientY <= (images[i].y+images[i].img.height)) {
					// Image clicked, trigger image click event
					images[i].clickEvent();
				}
			}
		}
	});

	// Kick it off
	draw();
});

// Spooky console art
var spookyWord = 'SPOOOOOOOOOKY';
var spookyLine = '.\t\t\t';
var spookyString = spookyLine + '~~~(.  .)~~~\n'
					+ spookyLine + 	'\\__      __/\n';
for (var i=0; i < spookyWord.length; i++) {
	if(i % 2 == 0) {
		spookyString += spookyLine + '   )  ' + spookyWord.substr(i,1) + '  )\n';
	} else {
		spookyString += spookyLine + '  (   ' + spookyWord.substr(i,1) + ' (\n';
	}
}
spookyString += spookyLine + 	'   \\    /\n'
				+ spookyLine + 	'    \\  /\n'
				+ spookyLine + 	'     \\/';
console.log(spookyString);