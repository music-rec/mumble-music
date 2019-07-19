var mumble = require("mumble"),
	fs = require("fs");

var ytdl = require("./src/ytdl.js"),
	SongQueue = require("./src/SongQueue.js");

var config = JSON.parse(fs.readFileSync("config.json")); 

var playing = false;
var queue = new SongQueue(config);
var channel = undefined;


function onMessage(msg, user, connection) {
	console.log(user.name + ": " + msg);
	if (msg.startsWith("!play ")) {
		let arg = msg.substring(6);
		if (arg == "" || !arg.match(".*href=\"*\".*")) return; // check for a link
		let url = arg.substring(arg.indexOf("href=\"") + 6, arg.indexOf("\"", arg.indexOf("href=\"") + 6));
		console.log("Trying to play " + url + " from " + user.name);

		queue.addSong(url).then((song) => {
			channel.sendMessage("Added \"" + song.name + "\" to queue.");
			console.log(queue.getQueue());
			queue.start(connection);
		}).catch((e) => {
			console.log(e);
			channel.sendMessage("Error adding " + url + ": " + e);
		});
	}
	if (msg == "!skip") {
		queue.skip();
	}
	if (msg == "!queue") {
		channel.sendMessage("Now playing: " + queue.nowPlaying.name + "<br>" +
				"Current queue: <br>" + queue.getQueue().replace(/\n/g, "<br>"));
	}
	if (msg == "!debug") {
		console.log(queue);
	}
	if (msg == "!help") {
		channel.sendMessage("Command list: <br>" +
				"<ul>" +
				"<li><span style='font-family: monospace'>!play [url]</span>: Adds the URL to the queue.</li>" +
				"<li><span style='font-family: monospace'>!skip</span>: Skips the current song.</li>" +
				"<li><span style='font-family: monospace'>!queue</span>: Displays a list of all the songs in the queue.</li>" +
				"<li><span style='font-family: monospace'>!help</span>: Displays this message.</li>" +
				"</ul>");
	}
}

mumble.connect(config.server, null, (e, connection) => {
	if (e) throw e;
	connection.authenticate(config.name, config.password);
	connection.on("initialized", () => {
		// Set bitrate only if specified
		if (config.bitrate) connection.connection.setBitrate(config.bitrate);
		channel = connection.channelByName(config.channel);
		if (!channel) channel = connection.rootChannel();
		// Automatically move back
		connection.on("user-move", (user) => {
			if (user.name == config.name) channel.join();
		})
		channel.join();
	})
	connection.on("message", (msg, user) => onMessage(msg, user, connection));
});
