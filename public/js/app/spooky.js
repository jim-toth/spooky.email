var SpookyEngine = function (canvas_id, spookyOptions) {
	// Constants
	var VELOCITY_MOD_MAX = 10;
	var VELOCITY_MOD_MIN = -10;
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
	var DEFAULT_TEXT_HEIGHT = 32;
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
				this.toggleFlashlight();
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
					(texts[i].x === "center") ? resolvePosition(texts[i].x, jqCanvas.width)-(texts[i].width/2) : resolvePosition(texts[i].x, jqCanvas.width),
					resolvePosition(texts[i].y, jqCanvas.height)-texts[i].height,
					texts[i].width,
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
			if (texts[i].clickable && texts[i].clickEvent) {
				// Check if the click was with a text's bounds
				if (withinBounds(
					ev.clientX,
					ev.clientY,
					resolvePosition(texts[i].x, jqCanvas.width),
					resolvePosition(texts[i].y, jqCanvas.height)-texts[i].height,
					texts[i].width,
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

	// Generates a random velocity modifier for raindrops
	this._generateVelocityMod = function () {
		return Math.floor(Math.random() * (VELOCITY_MOD_MAX-VELOCITY_MOD_MIN+1))
			+ VELOCITY_MOD_MIN;
	};

	// Generate raindrops
	this._generateRaindrops = function () {
		// Generate raindrops
		for (var i=0; i < jqCanvas.width/RAINDROP_SPACING; i += 1) {
			rain.push({
				x: i*10,
				y: 0,
				velocity: DEFAULT_VELOCITY + this._generateVelocityMod()
			});
		}
	};

	// Toggle rain effect on or off, default on
	this.rain = spookyOptions.rain;
	this.toggleRain = function () {
		this.rain = !this.rain;
	};

	// Toggle lights on or off
	this.lights = spookyOptions.lights;
	this.toggleLights = function () {
		this.lights = !this.lights;
	};

	// Toggle flashlight on or off
	// default to true (on) unless specifically set to false (off)
	this.flashlight = (spookyOptions.flashlight === false) ? false : true;
	this.toggleFlashlight = function () {
		this.flashlight = !this.flashlight;
	};

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
			height: options.height || DEFAULT_TEXT_HEIGHT,
			
			// Canvas painting options
			fillStyle: options.fillStyle || DEFAULT_FILL_STYLE,
			font: options.font || DEFAULT_FONT,
			textAlign: options.textAlign || DEFAULT_TEXT_ALIGN,

			// Click event options
			clickable: options.clickable || false,
			clickEvent: options.clickEvent || function () {},

			// Cursor hover options
			cursorImg: options.cursorImg
		};

		// Measure text based on the font size, update .width
		canvasContext.font = oSpookyText.font;
		oSpookyText.width = canvasContext.measureText(oSpookyText.text).width;

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
	this.draw = function () {
		// Set up draw function to loop
		requestAnimationFrame(this.draw.bind(this));

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
			for (var i=0; i < rain.length; i += 1) {
				// Draw drop
				canvasContext.fillStyle = RAIN_FILL_STYLE;
				canvasContext.fillRect(
					rain[i].x,
					rain[i].y,
					RAINDROP_WIDTH,
					RAINDROP_HEIGHT);

				// Animate
				if (rain[i].y + rain[i].velocity <= jqCanvas.height) {
					rain[i].y = rain[i].y + rain[i].velocity;
				} else {
					// When raindrop reaches bottom of screen,
					// reset position to top
					rain[i].y = 0;

					// Set a new random velocity
					rain[i].velocity = DEFAULT_VELOCITY +
						this._generateVelocityMod();
				}
			}
		}

		// Spooky opacity filter!
		if (!this.lights) {
			// clear mask context
			maskContext.clearRect(0,0,maskCanvas.width, maskCanvas.height);

			// fill with opacity settings
			maskContext.fillStyle = 'rgba(0,0,0,0.85)';
			maskContext.fillRect(0,0,maskCanvas.width, maskCanvas.height);

			// flashlight
			if (this.flashlight) {
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
		}

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
}
