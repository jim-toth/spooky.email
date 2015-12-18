$(document).ready(function () {
	// Create a spookyEngine, passing in selector for target canvas
	// Turn on rain
	var spooky = new SpookyEngine("canvas#spooky_canvas", { rain: true });

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
		clickEvent: function () {
			// Copy email address to clipboard
			spooky.copyToClipboard(emailText);
		}
	});

	// Add lights toggle
	spooky.addText({
		text: "LIGHTS",
		name: "lights-text",
		x: 0,
		y: 32,
		clickable: true,
		clickEvent: function () {
			// Toggle lights (turns off alpha mask)
			spooky.toggleLights();
		}
	});

	// Add flashlight toggle
	spooky.addText({
		text: "FLASHLIGHT",
		name: "flashlight-text",
		x: 0,
		y: 64,
		clickable: true,
		clickEvent: function () {
			// Toggle flashlight around cursor
			spooky.toggleFlashlight();
		}
	});

	// Add rain toggle
	spooky.addText({
		text: "RAIN",
		name: "rain-text",
		x: 0,
		y: 96,
		clickable: true,
		clickEvent: function () {
			// Toggle rain effect
			spooky.toggleRain();
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
		src: "media/GitHub-Mark-120px-plus.png",
		clickable: true,
		clickEvent: function () {
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
		src: "media/TwitterLogo_white.png",
		clickable: true,
		clickEvent: function () {
			// Open link to twitter.com/letifarz in a new tab
			window.open("https://twitter.com/letifarz", '_blank');
		}
	});

	// Let the games begin!
	spooky.haunt();
});
