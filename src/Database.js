var fs = require('fs');

function Database(name) {
	this.name = name;
	try {
		this.db = JSON.parse(fs.readFileSync(name));
	}
	catch {
		this.db = {};
		this.db.playlists = {};
		this.db.songs = {};
		this._save();
	}
}

function SongEntry(name, duration, plays) {
	this.name = name;
	this.duration = duration;
	this.plays = plays;
}

function PlaylistEntry(name, plays) {
	this.name = name;
	this.plays = plays;
}

Database.prototype.incrementSong = function(url, name, duration) {
	if (this.db.songs[url]) {
		this.db.songs[url].plays++;
	}
	else {
		this.db.songs[url] = new SongEntry(name, duration, 1);
	}
	this._save();
}

Database.prototype.incrementPlaylist = function(url, name) {
	if (this.db.playlists[url]) {
		this.db.playlists[url].plays++;
	}
	else {
		this.db.playlists[url] = new PlaylistEntry(name, 1);
	}
	this._save();
}

Database.prototype.getSong = function(url) {
	return this.db.songs[url];
}

function compareSongsDesc(a, b) {
	if (a.plays > b.plays) return -1;
	if (a.plays < b.plays) return 1;
	return 0;
}

// Get top X songs
// Defaults: Get top ten from entire server
Database.prototype.getTopXSongs = function(x) {
	if (!x) x = 10;
	let tmpdb = Object.values(this.db.songs).sort(compareSongsDesc);
	return tmpdb.slice(0, x);
}

// Same as getTopXSongs
Database.prototype.getTopXPlaylists = function(x) {
	if (!x) x = 10;
	let tmpdb = Object.values(this.db.playlists).sort(compareSongsDesc);
	return tmpdb.slice(0, x);
}

Database.prototype._save = function() {
	fs.writeFileSync(this.name, JSON.stringify(this.db));
}

module.exports = Database;
