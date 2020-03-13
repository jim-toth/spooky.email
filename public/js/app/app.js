$(document).ready(function () {
	"use strict";

	// Create a spookyEngine, passing in selector for target canvas
	// Rain enabled at start
	var spooky = new SpookyEngine("canvas#spooky_canvas", { rain: true });

	// Add keybind for F key to toggle flashlight
	spooky.addKeybind({
		name: "toggle-flashlight-keybind",
		keycode: 70, // F key
		keydown: function () {
			spooky.toggleFlashlight();
		}
	});

	// Add keybind for D key to toggle debug mode
	spooky.addKeybind({
		name: "toggle-debug-keybind",
		keycode: 68, // D key
		keydown: function () {
			spooky.toggleDebug();
		}
	});

	// Add email text
	var emailText = "jim@spooky.email";
	spooky.addText({
		text: emailText,
		name: "email-text",
		x: "center",
		y: "center",
		fillStyle: "grey",
		font: "72px Verdana",
		textAlign: "center",
		height: 72,
		clickable: true,
		click: function () {
			// Copy email address to clipboard
			spooky.copyToClipboard(emailText);
		},
		hover: {
			fillStyle: "white"
		}
	});

	// Add lights toggle
	spooky.addText({
		text: "LIGHTS",
		name: "lights-text",
		x: 0,
		y: 32,
		clickable: true,
		click: function () {
			// Toggle lights (turns off alpha mask)
			spooky.toggleLights();
		},
		hover: {
			fillStyle: "red"
		}
	});

	// Add flashlight toggle
	spooky.addText({
		text: "FLASHLIGHT",
		name: "flashlight-text",
		x: 0,
		y: 64,
		clickable: true,
		click: function () {
			// Toggle flashlight around cursor
			spooky.toggleFlashlight();
		},
		hover: {
			fillStyle: "red"
		}
	});

	// Add rain toggle
	spooky.addText({
		text: "RAIN",
		name: "rain-text",
		x: 0,
		y: 96,
		clickable: true,
		click: function () {
			// Toggle rain effect
			spooky.toggleRain();
		},
		hover: {
			fillStyle: "red"
		}
	});

	// Add Github logo
	spooky.addImage({
		name: "github-logo",
		x: "center",
		y: "bottom",
		y_offset: -25,
		width: 120,
		height: 120,
		src: "public/media/GitHub-Mark-120px-plus.png",
		clickable: true,
		click: function () {
			// Open link to github.com/jim-toth in a new tab
			window.open("https://github.com/jim-toth", '_blank');
		}
	});

	// Add Twitter logo
	spooky.addImage({
		name: "twitter-logo",
		x: "right",
		y: "bottom",
		width: 120,
		height: 120,
		src: "public/media/TwitterLogo_white.png",
		clickable: true,
		click: function () {
			// Open link to twitter.com/letifarz in a new tab
			window.open("https://twitter.com/letifarz", '_blank');
		}
	});

	// Call the engine start method!
	spooky.haunt();
});
