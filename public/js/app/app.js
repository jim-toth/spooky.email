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
			// Copy text to clipboard
			CopyEmailToClipboard(emailText);
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
			// Toggle lights
			spooky.toggleLights();
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
			window.open("https://twitter.com/letifarz", '_blank');
		}
	});

	// Let the games begin!
	spooky.haunt();
});

//spookyConsoleArt();