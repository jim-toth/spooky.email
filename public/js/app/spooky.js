var SpookyEngine = function (canvas_id, spookyOptions) {
	// Constants
	var MAX_RAINDROPS = 100;
	var DEFAULT_VELOCITY = 20;
	var RAINDROP_WIDTH = 1;
	var RAINDROP_HEIGHT = 1;
	var RAIN_FILL_STYLE = 'aqua';
	var FLASHLIGHT_RADIUS_1 = 150;
	var FLASHLIGHT_RADIUS_2 = 175;
	var FLASHLIGHT_KEY = 70; // f key
	var DEBUG_KEY = 68; // d key
	var RAINDROP_SPACING = 5;
	var LOGO_SIZE = 120;
	var DEFAULT_CANVAS_CURSOR = 'default';
	var DEFAULT_FONT = '32px Verdana';
	var DEFAULT_FILL_STYLE = 'white';
	var DEFAULT_TEXT_ALIGN = 'start';

	// The ID for the canvas DOM element
	var canvas_id = canvas_id;

	// Text assets
	var texts = [];

	// Image assets
	var images = [];

	// Create collection for rain to hold our raindrops
	var rain = [];

	// toggle variable for flashlight on/off
	var flashlight_on = true;

	// toggle variable for debug mode on/off
	var debug_mode_on = false;

	// Track cursor position
	var cursor_pos = { x: -1000, y: -1000 };

	// track center text width/height for calculations
	var email_text_width = 0;
	var email_text_height = 72;

	// Grab Audio Context
	var audioContext;
	if (typeof AudioContext !== 'undefined') {
		audioContext = new AudioContext();
	} else if (typeof webkitAudioContext !== 'undefined') {
		audioContext = new webkitAudioContext();
	} else {
		throw new Error(
			'AudioContext not supported by this browser because it\'s too old.'  
			+'  Is it a ghost?'
		);
	}

	// Grab canvas and canvas context
	var jqCanvas = $(canvas_id)[0];
	var canvasContext = jqCanvas.getContext('2d');

	// Set canvas height and width to fit page
	jqCanvas.width = window.innerWidth;
	jqCanvas.height = window.innerHeight;

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

	// Catch key presses
	$('body').keydown(function (ev) {
		ev.preventDefault();

		switch (ev.which) {
			case FLASHLIGHT_KEY:
				flashlight_on = !flashlight_on;
				break;
			case DEBUG_KEY:
				//debug_mode_on = !debug_mode_on;
				break;
		}
	});

	// Initialize mouse cursor update function
	$(canvas_id).mousemove(function (ev) {
		// Track cursor position
		cursor_pos.x = ev.pageX;
		cursor_pos.y = ev.pageY;

		// Reset cursor to default
		$(jqCanvas).css('cursor', DEFAULT_CANVAS_CURSOR);

		// Loop through texts to see if we need to update cursor
		for (var i=0; i < texts.length; i += 1) {
			// If the text has a cursor
			if (texts[i].cursorImg || texts[i].clickable) {
				// Check if the cursor is within a text's bounds
				if (withinBounds(
					ev.clientX,
					ev.clientY,
					resolvePosition(texts[i].x, jqCanvas.width)-(canvasContext.measureText(texts[i].text).width/2),
					resolvePosition(texts[i].y, jqCanvas.height)-(texts[i].height/2),
					canvasContext.measureText(texts[i].text).width,
					texts[i].height)) {
					// Text is being hovered over, update cursor
					if (texts[i].cursorImg) {
						$(jqCanvas).css(
							'cursor',
							'url('+texts[i].cursorImg+'), auto');
					} else if (texts[i].clickable) {
						$(jqCanvas).css('cursor', 'pointer');
					}
				}
			}
		}

		// Loop through images to see if we need to update cursor
		for (var i=0; i < images.length; i += 1) {
			// If the image has a cursor
			if (images[i].cursorImg || images[i].clickable) {
				// Check if the cursor is within an image's bounds
				if (withinBounds(ev.clientX,
						ev.clientY,
						resolvePosition(images[i].x, jqCanvas.width, images[i].width),
						resolvePosition(images[i].y, jqCanvas.height, images[i].height),
						images[i].width,
						images[i].height)) {
					// Image is being hovered over, update cursor
					if (images[i].cursorImg) {
						$(jqCanvas).css(
							'cursor',
							'url('+images[i].cursorImg+'), auto');
					} else if (images[i].clickable) {
						$(jqCanvas).css('cursor', 'pointer');
					}
					
				}
			}
		}
	});

	// Catch canvas clicks
	jqCanvas.addEventListener('click', function (ev) {
		ev.preventDefault();

		// Check all texts
		for (var i=0; i < texts.length; i += 1) {
			// If the text is clickable and has a clickEvent defined
			if (texts[i] && texts[i].clickable && texts[i].clickEvent) {
				// Check if the click was with a text's bounds
				if (withinBounds(
					ev.clientX,
					ev.clientY,
					resolvePosition(texts[i].x, jqCanvas.width)-(canvasContext.measureText(texts[i].text).width/2),
					resolvePosition(texts[i].y, jqCanvas.height)-(texts[i].height/2),
					canvasContext.measureText(texts[i].text).width,
					texts[i].height)) {
					// Text clicked, trigger text click event
					texts[i].clickEvent();
				}
			}
		}

		// Check all images
		for (var i=0; i < images.length; i += 1) {
			// If the image is clickable, has a clickEvent defined, and ready
			if (images[i].clickable
				&& images[i].clickEvent
				&& images[i].img.complete) {
				// Check if the click was within an image's bounds
				if (withinBounds(
					ev.clientX,
					ev.clientY,
					resolvePosition(images[i].x, jqCanvas.width, images[i].width),
					resolvePosition(images[i].y, jqCanvas.height, images[i].height),
					images[i].width,
					images[i].height)) {
					// Image clicked, trigger image click event
					images[i].clickEvent();
				}
			}
		}
	});

	// Toggle rain effect on or off, default on
	this.rain = spookyOptions.rain;

	// Generate raindrops
	this._generateRaindrops = function () {
		// Generate raindrops
		for (var i=0; i < jqCanvas.width/RAINDROP_SPACING; i += 1) {
			rain.push(raindrop(i*10, 0, DEFAULT_VELOCITY + generateVelocityMod()));
		}
	},

	// Kicks off the SpookyEngine
	this.haunt = function () {
		// generate rain
		if (this.rain) {
			this._generateRaindrops();
		}

		// kick off draw method
		this.draw();
	},

	// Add text
	this.addText = function (options) {
		// Create a new spooky text object
		var oSpookyText = {
			// Main options
			text: options.text || '',
			name: options.name,
			x: options.x || 0,
			y: options.y || 0,
			x_offset: options.x_offset || 0,
			y_offset: options.y_offset || 0,
			width: options.width || 0,
			height: options.height || 0,
			
			// Canvas painting options
			fillStyle: options.fillStyle || DEFAULT_FILL_STYLE,
			font: options.font || DEFAULT_FONT,
			textAlign: options.textAlign,

			// Click event options
			clickable: options.clickable || false,
			clickEvent: options.clickEvent || function () {},

			// Cursor hover options
			cursorImg: options.cursorImg
		};

		// Add to texts collection
		texts.push(oSpookyText);
	};

	// Add an image
	this.addImage = function (options) {
		// Create a new spooky image object
		var oSpookyImage = {
			// Main options
			name: options.name,
			src: options.src,
			img: new Image(),
			x: options.x || 0,
			y: options.y || 0,
			x_offset: options.x_offset || 0,
			y_offset: options.y_offset || 0,
			width: options.width || 0,
			height: options.height || 0,

			// Click event options
			clickable: options.clickable || false,
			clickEvent: options.clickEvent || function () {},

			// Cursor hover options
			cursorImg: options.cursorImg
		};

		// Set img.src, begins loading the image
		if (oSpookyImage.src) {
			oSpookyImage.img.src = oSpookyImage.src;
		}
		

		// Add to images collection
		images.push(oSpookyImage);
	};

	// Draw function
	this.draw = function draw() {
		// Set up draw function to loop
		// TODO: fix w. "this" ?
		requestAnimationFrame(draw.bind(this));

		// Update canvas dimensions to handle window resize
		jqCanvas.width = window.innerWidth;
		jqCanvas.height = window.innerHeight;

		// Reset
		canvasContext.globalCompositeOperation = 'source-over';
		canvasContext.clearRect(0, 0, jqCanvas.width, jqCanvas.height);

		// Fill canvas background
		canvasContext.fillStyle = 'black';
		canvasContext.fillRect(0, 0, jqCanvas.width, jqCanvas.height);

		// Draw texts
		for (var i=0; i < texts.length; i += 1) {
			// Handle custom options for drawing text
			if (texts[i]) {
				// fillStyle
				if (texts[i].fillStyle) {
					canvasContext.fillStyle = texts[i].fillStyle;
				}

				// font
				if (texts[i].font) {
					canvasContext.font = texts[i].font;
				}

				// textAlign
				if (texts[i].textAlign) {
					canvasContext.textAlign = texts[i].textAlign;
				}
			}

			// Draw text to canvas
			canvasContext.fillText(
				texts[i].text,
				resolvePosition(texts[i].x, jqCanvas.width)+texts[i].x_offset,
				resolvePosition(texts[i].y, jqCanvas.height)+texts[i].y_offset
			);
		}

		// Draw images
		for (var i=0; i < images.length; i += 1) {
			// If the image is loaded
			if (images[i].img.complete) {
				// Draw image
				canvasContext.drawImage(
					images[i].img,
					resolvePosition(images[i].x, jqCanvas.width, images[i].width)+images[i].x_offset,
					resolvePosition(images[i].y, jqCanvas.height, images[i].height)+images[i].y_offset,
					images[i].width,
					images[i].height
				);
			}
		}

		// Draw Raindrops
		if (this.rain) {
			$.each(rain, function (idx, drop) {
				// Draw drop
				canvasContext.fillStyle = RAIN_FILL_STYLE;
				canvasContext.fillRect(
					drop.x,
					drop.y,
					RAINDROP_WIDTH,
					RAINDROP_HEIGHT);

				// Animate
				if (drop.y + drop.velocity <= jqCanvas.height) {
					drop.y = drop.y + drop.velocity;
				} else {
					// When raindrop reaches bottom of screen,
					// reset position to top
					drop.y = 0;

					// Set a new random velocity
					drop.velocity = DEFAULT_VELOCITY + generateVelocityMod();
				}
			});
		}

		// Spooky opacity filter!
		// clear mask context
		maskContext.clearRect(0,0,maskCanvas.width, maskCanvas.height);

		// fill with opacity settings
		maskContext.fillStyle = 'rgba(0,0,0,0.85)';
		maskContext.fillRect(0,0,maskCanvas.width, maskCanvas.height);

		// flashlight
		if (flashlight_on) {
			//maskContext.translate(cursor_pos.x, cursor_pos.y);
			var grd = maskContext.createRadialGradient(
				cursor_pos.x,
				cursor_pos.y,
				FLASHLIGHT_RADIUS_1,
				cursor_pos.x,
				cursor_pos.y,
				FLASHLIGHT_RADIUS_2);
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
}