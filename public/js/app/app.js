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
	spooky.addImage(
		"github-logo",
		"media/GitHub-Mark-120px-plus.png",
		true,
		"https://github.com/jim-toth"
	);

	// Add Twitter logo
	spooky.addImage(
		"twitter-logo",
		"media/TwitterLogo_white.png",
		true,
		"https://twitter.com/letifarz"
	);

	// Let the games begin!
	spooky.haunt();
});

//spookyConsoleArt();