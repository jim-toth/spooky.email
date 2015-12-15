$(document).ready(function () {
	// Create a spookyEngine, passing in selector for target canvas
	var spooky = spookyEngine("canvas#spooky_canvas");

	// Add email text
	var emailText = "jim@spooky.email";
	spooky.addText({
		text: emailText,
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