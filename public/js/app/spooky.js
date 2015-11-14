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
	var jqCanvas = $('canvas#spooky_canvas')[0];
	var canvasContext = jqCanvas.getContext('2d');

	// Set canvas height and width to fit page
	jqCanvas.width = window.innerWidth;
	jqCanvas.height = window.innerHeight;

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
	var FLASHLIGHT_KEY = 70; // f
	var DEBUG_KEY = 68; // d
	var RAINDROP_SPACING = 5;
	var LOGO_SIZE = 120;
	var DEFAULT_CANVAS_CURSOR = 'none';

	// toggle variable for flashlight on/off
	var flashlight_on = true;

	// toggle variable for debug mode on/off
	var debug_mode_on = false;

	// Canvas for opacity mask
	var maskCanvas = document.createElement('canvas');
	maskCanvas.width = jqCanvas.width;
	maskCanvas.height = jqCanvas.height;
	var maskContext = maskCanvas.getContext('2d');

	// Canvas for debug
	var debugCanvas = document.createElement('canvas');
	debugCanvas.width = jqCanvas.width;
	debugCanvas.height = jqCanvas.height;
	var debugContext = debugCanvas.getContext('2d');
	
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

	// Draw function
	function draw() {
		// Set up draw function to loop
		requestAnimationFrame(draw);

		// Reset
		canvasContext.globalCompositeOperation = 'source-over';
		canvasContext.clearRect(0, 0, jqCanvas.width, jqCanvas.height);

		// Fill canvas background
		canvasContext.fillStyle = 'black';
		canvasContext.fillRect(0, 0, jqCanvas.width, jqCanvas.height);

		// Center text
		canvasContext.fillStyle = 'grey';
		canvasContext.font = '72px Verdana';
		canvasContext.textAlign = 'center';
		canvasContext.fillText('jim@spooky.email', jqCanvas.width/2, jqCanvas.height/2);

		// Draw images
		for (var i=0; i < images.length; i++) {
			// If the image is loaded
			if (images[i].img.complete) {
				// Update image positions
				if (images[i].x == -1 || images[i].y == -1) {
					switch (images[i].name) {
						// Github logo center bottom
						case 'github-logo':
							images[i].x = (jqCanvas.width/2)-(LOGO_SIZE/2);
							images[i].y = jqCanvas.height - LOGO_SIZE - 25;
							break;
						// Twitter logo bottom right
						case 'twitter-logo':
							images[i].x = jqCanvas.width - LOGO_SIZE;
							images[i].y = jqCanvas.height - LOGO_SIZE;
							break;
						default:
							break;
					}
				}

				// Draw image
				canvasContext.drawImage(images[i].img, images[i].x, images[i].y, LOGO_SIZE, LOGO_SIZE);
			}
		}

		// Draw Raindrops
		$.each(rain, function (idx, drop) {
			// Draw drop
			canvasContext.fillStyle = RAIN_FILL_STYLE;
			canvasContext.fillRect(drop.x, drop.y, RAINDROP_WIDTH, RAINDROP_HEIGHT);

			// Animate
			if (drop.y + drop.velocity <= jqCanvas.height) {
				drop.y = drop.y + drop.velocity;
			} else {
				// When raindrop reaches bottom of screen, reset position to top
				drop.y = 0;

				// Set a new random velocity
				drop.velocity = DEFAULT_VELOCITY + generateVelocityMod();
			}
		});

		// Spooky opacity filter!
		// clear mask context
		maskContext.clearRect(0,0,maskCanvas.width, maskCanvas.height);

		// fill with opacity settings
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

		// Draw mask canvas to main canvas
		// NB: multiply mode to create the opaque filter effect
		canvasContext.globalCompositeOperation = 'multiply';
		canvasContext.drawImage(maskCanvas, 0, 0);
		canvasContext.globalCompositeOperation = 'source-over';

		// debug mode
		if (debug_mode_on) {
			// clear debug context
			debugContext.clearRect(0,0,debugCanvas.width, debugCanvas.height);

			// debug mode logo
			debugContext.fillStyle = 'red';
			debugContext.font = '32px Verdana';
			debugContext.textAlign = 'center';
			debugContext.fillText('DEBUG', jqCanvas.width/2, 72);

			// Draw debug canvas to main canvas
			canvasContext.drawImage(debugCanvas, 0, 0);
		}
	};


	// Initialize mouse cursor update function
	$('canvas#spooky_canvas').mousemove(function (ev) {
		cursor_pos.x = ev.pageX;
		cursor_pos.y = ev.pageY;
	});

	// Catch key presses
	$('body').keydown(function (ev) {
		ev.preventDefault();

		switch(ev.which) {
			case FLASHLIGHT_KEY:
				flashlight_on = !flashlight_on;
				break;
			case DEBUG_KEY:
				debug_mode_on = !debug_mode_on;
				break;
		}
	});

	// Catch canvas clicks
	jqCanvas.addEventListener('click', function (ev) {
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

	// Catch canvas mousemove
	jqCanvas.addEventListener('mousemove', function (ev) {
		ev.preventDefault();

		// Reset cursor to default
		$(jqCanvas).css('cursor', DEFAULT_CANVAS_CURSOR);

		// Loop through images to see if we need to update cursor
		for (var i=0; i < images.length; i++) {
			// If the image has a cursor
			if(images[i].cursorImg) {

				// Check if the cursor is within an image's bounds
				if (ev.clientX >= images[i].x && ev.clientX <= (images[i].x+images[i].img.width) &&
					ev.clientY >= images[i].y && ev.clientY <= (images[i].y+images[i].img.height)) {
					
					// Image hover over, update cursor
					$(jqCanvas).css('cursor', 'url('+images[i].cursorImg+'), auto');
				}
			}
		}
	});


	// Track image assets, make them clickable
	// Github logo
	images.push(spookyImage('github-logo', 'media/GitHub-Mark-120px-plus.png', true, function () {
		// Open github
		window.open('https://github.com/jim-toth', '_blank');
	}, 'media/debug_cursor.png'));
	// Twitter logo
	images.push(spookyImage('twitter-logo', 'media/TwitterLogo_white.png', true, function () {
		// Open twitter
		window.open('https://twitter.com/letifarz', '_blank');
	}, 'media/debug_cursor.png'));

	// Generate raindrops
	for (var i=0; i < jqCanvas.width/RAINDROP_SPACING; i++) {
		rain.push(raindrop(i*10, 0, DEFAULT_VELOCITY + generateVelocityMod()));
	}

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