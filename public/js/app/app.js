$(document).ready(function () {
	var emailText = "jim@spooky.email";

	// Create a SpookyEngine, passing in selector for target canvas
	var spooky = SpookyEngine("canvas#spooky_canvas");

	// Add email text
	spooky.addText(
		emailText,
		"center",
		"center",
		{
			clickable: true,
			fillStyle: "grey",
			font: "72px Verdana",
			textAlign: "center",
			height: 72,
			clickEvent: function () {
				// Copy text to clipboard
				CopyEmailToClipboard(emailText);
			}
		}
	);

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