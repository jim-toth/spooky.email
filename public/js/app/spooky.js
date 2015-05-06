$(document).ready(function () {
	// Grab Audio Context
	var audioContext;
	if (typeof AudioContext !== 'undefined') {
		audioContext = new AudioContext();
	} else if (typeof webkitAudioContext !== 'undefined') {
		audioContext = new webkitAudioContext();
	} else {
		throw new Error('AudioContext not supported.');
	}

	// Grab canvas and canvas context
	var canvas = $('canvas#spooky_canvas')[0];
	var canvasContext = canvas.getContext('2d');

	// Set canvas height and width to fit page
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Create collection for rain to hold our raindrops
	var rain = [];

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

	function generateVelocityMod() {
		return Math.floor(Math.random() * (VELOCITY_MOD_MAX - VELOCITY_MOD_MIN + 1)) + VELOCITY_MOD_MIN;
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
		canvasContext.fillStyle = 'red';
		canvasContext.font = '72px Verdana';
		canvasContext.textAlign = 'center';
		canvasContext.fillText('jim@spooky.email', canvas.width/2, canvas.height/2);

		// Raindrops
		$.each(rain, function (idx, drop) {
			// Draw drop
			canvasContext.fillStyle = RAIN_FILL_STYLE;
			canvasContext.fillRect(drop.x, drop.y, RAINDROP_WIDTH, RAINDROP_HEIGHT);

			// Animate
			if(drop.y + drop.velocity <= canvas.height) {
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
		maskContext.fillStyle = 'rgba(0,0,0,0.75)';
		maskContext.fillRect(0,0,maskCanvas.width, maskCanvas.height);

		// flashlight
		if(flashlight_on) {
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

	// Generate raindrops
	for(var i=0; i < canvas.width/RAINDROP_SPACING; i++) {
		rain.push(raindrop(i*10, 0, DEFAULT_VELOCITY + generateVelocityMod()));
	}
	
	// Initialize mouse cursor update function
	$('canvas#spooky_canvas').mousemove(function (ev) {
		cursor_pos.x = ev.pageX;
		cursor_pos.y = ev.pageY;
	});

	$('body').keydown(function (ev) {
		if(event.which == FLASHLIGHT_KEY) {
			event.preventDefault();

			flashlight_on = !flashlight_on;
		}
	});

	// Kick it off
	draw();
});