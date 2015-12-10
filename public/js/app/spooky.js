var SpookyEngine = function (canvas_id) {
	// Constants
	var MAX_RAINDROPS = 100;
	var DEFAULT_VELOCITY = 20;
	var RAINDROP_WIDTH = 1;
	var RAINDROP_HEIGHT = 1;
	var RAIN_FILL_STYLE = 'aqua';
	var FLASHLIGHT_RADIUS_1 = 150;
	var FLASHLIGHT_RADIUS_2 = 175;
	var FLASHLIGHT_KEY = 70; // f
	var DEBUG_KEY = 68; // d
	var RAINDROP_SPACING = 5;
	var LOGO_SIZE = 120;
	var DEFAULT_CANVAS_CURSOR = 'default';

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

	// Initialize mouse cursor update function
	$(canvas_id).mousemove(function (ev) {
		// Track cursor position
		cursor_pos.x = ev.pageX;
		cursor_pos.y = ev.pageY;

		// Reset cursor to default
		$(jqCanvas).css('cursor', DEFAULT_CANVAS_CURSOR);

		// Loop through texts to see if we need to update cursor
		for (var i=0; i < texts.length; i++) {
			// If the text has a cursor
			if(texts[i].options.cursorImg || texts[i].options.clickable) {
				// Check if the cursor is within a text's bounds
				if(withinBounds(
					ev.clientX,
					ev.clientY,
					resolvePosition(texts[i].x, jqCanvas.width)-(canvasContext.measureText(texts[i].text).width/2),
					resolvePosition(texts[i].y, jqCanvas.height)-(texts[i].options.height/2),
					canvasContext.measureText(texts[i].text).width,
					texts[i].options.height)) {
					// Text is being hovered over, update cursor
					if(texts[i].options.cursorImg) {
						$(jqCanvas).css(
							'cursor',
							'url('+texts[i].options.cursorImg+'), auto');
					} else if (texts[i].options.clickable) {
						$(jqCanvas).css('cursor', 'pointer');
					}
				}
			}
		}

		// Loop through images to see if we need to update cursor
		for (var i=0; i < images.length; i++) {
			// If the image has a cursor
			if(images[i].cursorImg || images[i].clickable) {
				// Check if the cursor is within an image's bounds
				if (withinBounds(ev.clientX,
						ev.clientY,
						images[i].x,
						images[i].y,
						images[i].img.width,
						images[i].img.height)) {
					// Image is being hovered over, update cursor
					if(images[i].cursorImg) {
						$(jqCanvas).css(
							'cursor',
							'url('+images[i].cursorImg+'), auto');
					} else if(images[i].clickable) {
						$(jqCanvas).css('cursor', 'pointer');
					}
					
				}
			}
		}
	});

	// Catch key presses
	$('body').keydown(function (ev) {
		ev.preventDefault();

		switch(ev.which) {
			case FLASHLIGHT_KEY:
				flashlight_on = !flashlight_on;
				break;
			case DEBUG_KEY:
				//debug_mode_on = !debug_mode_on;
				break;
		}
	});

	// Catch canvas clicks
	jqCanvas.addEventListener('click', function (ev) {
		ev.preventDefault();

		// Check all texts
		for (var i=0; i < texts.length; i++) {
			// If the text is clickable and has a clickEvent defined
			if (texts[i].options
				&& texts[i].options.clickable
				&& texts[i].options.clickEvent) {
				// Check if the click was with a text's bounds
				if(withinBounds(
					ev.clientX,
					ev.clientY,
					resolvePosition(texts[i].x, jqCanvas.width)-(canvasContext.measureText(texts[i].text).width/2),
					resolvePosition(texts[i].y, jqCanvas.height)-(texts[i].options.height/2),
					canvasContext.measureText(texts[i].text).width,
					texts[i].options.height)) {
					// Text clicked, trigger text click event
					texts[i].options.clickEvent();
				}
			}
		}

		// Check all images
		for (var i=0; i < images.length; i++) {
			// If the image is clickable, has a clickEvent defined, and ready
			if (images[i].clickable
				&& images[i].clickEvent
				&& images[i].img.complete) {
				// Check if the click was within an image's bounds
				if(withinBounds(
					ev.clientX,
					ev.clientY,
					images[i].x,
					images[i].y,
					images[i].img.width,
					images[i].img.height)) {
					// Image clicked, trigger image click event
					images[i].clickEvent();
				}
			}
		}
	});

	// Generate raindrops
	for (var i=0; i < jqCanvas.width/RAINDROP_SPACING; i++) {
		rain.push(raindrop(i*10, 0, DEFAULT_VELOCITY + generateVelocityMod()));
	}

	return {
		// Kicks off the SpookyEngine
		haunt: function () {
			this.draw();
		},

		// Add text
		addText: function (text, x, y, options) {
			// Make sure options is defined and has defaults in place
			if (typeof options == "undefined") {
				options = {
					clickable: false
				};
			}

			// Create a new spooky text object
			var oSpookyText = {
				text: text,
				x: x,
				y: y,
				options: options
			};

			// Add to texts collection
			texts.push(oSpookyText);
		},

		// Add an image
		addImage: function (name, src, clickable, link, cursorImg) {
			// Create a new spooky image object
			var oSpookyImage = {
				name: name,
				src: src,
				img: new Image(),
				x: -1,
				y: -1,
				clickable: clickable,
				clickEvent: function () {
					window.open(link, '_blank');
				},
				cursorImg: cursorImg
			};

			// Set img.src, begins loading the image
			oSpookyImage.img.src = src;

			// Add to images collection
			images.push(oSpookyImage);
		},

		// Draw function
		draw: function draw() {
			// Set up draw function to loop
			// TODO: fix w. "this" ?
			requestAnimationFrame(draw);

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
			for (var i=0; i < texts.length; i++) {
				// Handle custom options for drawing text
				if(texts[i].options) {
					// fillStyle
					if(texts[i].options.fillStyle) {
						canvasContext.fillStyle = texts[i].options.fillStyle;
					}

					// font
					if(texts[i].options.font) {
						canvasContext.font = texts[i].options.font;
					}

					// textAlign
					if(texts[i].options.textAlign) {
						canvasContext.textAlign = texts[i].options.textAlign;
					}
				}

				// Draw text to canvas
				canvasContext.fillText(
					texts[i].text,
					resolvePosition(texts[i].x, jqCanvas.width),
					resolvePosition(texts[i].y, jqCanvas.height)
				);
			}

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
					canvasContext.drawImage(
						images[i].img,
						images[i].x,
						images[i].y,
						LOGO_SIZE,
						LOGO_SIZE
					);
				}
			}

			// Draw Raindrops
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
		}
	}
}