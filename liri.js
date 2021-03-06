/*
*	Load Required Node Modules
*/

var Twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");
var fs = require("fs");

/*
*	Load the user Twitter keys
*/

var keys = require("./keys.js");
var keyConfig = new Twitter({
	consumer_key: 'myTwitterKeys.consumer_key',
  consumer_secret: 'myTwitterKeys.consumer_secret',
  access_token_key: 'myTwitterKeys.access_token_key',
  access_token_secret: 'myTwitterKeys.access_token_secret',
});

keys.twitterKeys;

// Read in the command line arguments
var cmdArgs = process.argv;

// The LIRI command will always be the second command line argument
var liriCommand = cmdArgs[2];

// The parameter to the LIRI command may contain spaces
var liriArg = "";
for (var i = 3; i < cmdArgs.length; i++) {
	liriArg += cmdArgs[i] + " ";
}

// retrieveTweets will retrieve my last 5 tweets and display them together with the date
function retrieveTweets() {
	// Append the command to the log file
	fs.appendFile("./log.txt", "User Command: node liri.js my-tweets\n\n", (err) => {
		if (err) throw err;
	});

	// Initialize the Twitter client
	var client = new Twitter(myTwitterKeys);

	// Set the "screen_name" to my Twitter handle
	var params = {screen_name: "TestAcc68330698", count: 5};

	// Retrieve the last 5 tweets
	client.get("statuses/user_timeline", params, function(error, tweets, response) {
		if (error) {
			var errorStr = "ERROR: Retrieving user tweets -- " + error;

			// Append the error string to the log file
			fs.appendFile("./log.txt", errorStr, (err) => {
				if (err) throw err;
				console.log(errorStr);
			});
			return;
		} else {
			// Prettify user tweets
			var outputStr = "------------------------\n" +
							"User Tweets:\n" +
							"------------------------\n\n";

			for (var i = 0; i < tweets.length; i++) {
				outputStr += "Created on: " + tweets[i].created_at + "\n" +
							 "Tweet content: " + tweets[i].text + "\n" +
							 "------------------------\n";
			}

			// Append the output to the log file
			fs.appendFile("./log.txt", "LIRI Response:\n\n" + outputStr + "\n", (err) => {
				if (err) throw err;
				console.log(outputStr);
			});
		}
	});
}

// spotifySong will retrieve information on a song from Spotify
function spotifySong(song) {
	// Append the command to the log file
	fs.appendFile("./log.txt", "User Command: node liri.js spotify-this-song " + song + "\n\n", (err) => {
		if (err) throw err;
	});

	// If no song is provided, LIRI defaults to "Blackhole Sun" by Soundgarden
	var search;
	if (song === "") {
		search = "Blackhole Sun";
	} else {
		search = song;
	}

	spotify.search({ type: "track", query: search}, function(error, data) {
	    if (error) {
			var errorStr1 = "ERROR: Retrieving Spotify track -- " + error;

			// Append the error string to the log file
			fs.appendFile("./log.txt", errorStr1, (err) => {
				if (err) throw err;
				console.log(errorStr1);
			});
			return;
	    } else {
			var songInfo = data.tracks.items[0];
			if (!songInfo) {
				var errorStr2 = "ERROR: No song info retrieved, please check the spelling of the song name!";

				// Append the error string to the log file
				fs.appendFile("./log.txt", errorStr2, (err) => {
					if (err) throw err;
					console.log(errorStr2);
				});
				return;
			} else {
				// Pretty print the song information
				var outputStr = "------------------------\n" +
								"Song Information:\n" +
								"------------------------\n\n" +
								"Artist: " + songInfo.artists[0].name + "\n" +
								"Song Name: " + songInfo.name + "\n"+
								"Album: " + songInfo.album.name + "\n" +
								"Preview Here: " + songInfo.preview_url + "\n";

				// Append the output to the log file
				fs.appendFile("./log.txt", "LIRI Response:\n\n" + outputStr + "\n", (err) => {
					if (err) throw err;
					console.log(outputStr);
				});
			}
	    }
	});
}

// retrieveOMDBInfo will retrieve information on a movie from the OMDB database
function retrieveOBDBInfo(movie) {
	// Append the command to the log file
	fs.appendFile("./log.txt", "User Command: node liri.js movie-this " + movie + "\n\n", (err) => {
		if (err) throw err;
	});

	// If no movie is provided, LIRI defaults to "The Fifth Element"
	var search;
	if (movie === "") {
		search = "The Fifth Element";
	} else {
		search = movie;
	}

	// Replace spaces with "+" for the query string
	search = search.split(" ").join("+");

	// Construct the query string
	var queryStr = "http://www.omdbapi.com/?t=" + search + "&plot=full&tomatoes=true&apikey=trilogy";

	// Send the request to OMDB
	request(queryStr, function (error, response, body) {
		if ( error || (response.statusCode !== 200) ) {
			var errorStr1 = "ERROR: Retrieving OMDB entry -- " + error;

			// Append the error string to the log file
			fs.appendFile("./log.txt", errorStr1, (err) => {
				if (err) throw err;
				console.log(errorStr1);
			});
			return;
		} else {
			var data = JSON.parse(body);
			if (!data.Title && !data.Released && !data.imdbRating) {
				var errorStr2 = "ERROR: No movie info retrieved, please check the spelling of the movie name!";

				// Append the error string to the log file
				fs.appendFile("./log.txt", errorStr2, (err) => {
					if (err) throw err;
					console.log(errorStr2);
				});
				return;
			} else {
		    	// Pretty print the movie information
		    	var outputStr = "------------------------\n" +
								"Movie Information:\n" +
								"------------------------\n\n" +
								"Movie Title: " + data.Title + "\n" +
								"Year Released: " + data.Released + "\n" +
								"IMBD Rating: " + data.imdbRating + "\n" +
								"Country Produced: " + data.Country + "\n" +
								"Language: " + data.Language + "\n" +
								"Plot: " + data.Plot + "\n" +
								"Actors: " + data.Actors + "\n" +
								"Rotten Tomatoes Rating: " + data.tomatoRating + "\n" +
								"Rotten Tomatoes URL: " + data.tomatoURL + "\n";

				// Append the output to the log file
				fs.appendFile("./log.txt", "LIRI Response:\n\n" + outputStr + "\n", (err) => {
					if (err) throw err;
					console.log(outputStr);
				});
			}
		}
	});
}

// doItBitch will read in a file to determine the desired command and then execute
function doItBitch() {
	// Append the command to the log file
	fs.appendFile("./log.txt", "User Command: node liri.js do-what-it-says\n\n", (err) => {
		if (err) throw err;
	});

	// Read in the file containing the command
	fs.readFile("./random.txt", "utf8", function (error, data) {
		if (error) {
			console.log("ERROR: Reading random.txt -- " + error);
			return;
		} else {
			// Split out the command name and the parameter name
			var cmdString = data.split(",");
			var command = cmdString[0].trim();
			var param = cmdString[1].trim();

			switch(command) {
				case "my-tweets":
					retrieveTweets();
					break;

				case "spotify-this-song":
					if(params){  //if a song is put in 4th paramater go to function
    			spotifySong(param);
					} else {  //if blank call it blink 182"s "whats my age again"
					spotifySong("What\"s my age again");
					}
					break;

				case "movie-this":
					retrieveOBDBInfo(param);
					break;
			}
		}
	});
}

// Determine which LIRI command is being requested by the user
if (liriCommand === "my-tweets") {
	retrieveTweets();

} else if (liriCommand === `spotify-this-song`) {
	spotifySong(liriArg);

} else if (liriCommand === `movie-this`) {
	retrieveOBDBInfo(liriArg);

} else if (liriCommand ===  `do-what-it-says`) {
	doItBitch();

} else {
	// Append the command to the log file
	fs.appendFile("./log.txt", "User Command: " + cmdArgs + "\n\n", (err) => {
		if (err) throw err;

		// If the user types in a command that LIRI does not recognize, output the Usage menu
		// which lists the available commands.
		outputStr = "Usage:\n" +
				   "    node liri.js my-tweets\n" +
				   "    node liri.js spotify-this-song "<song_name>"\n" +
				   "    node liri.js movie-this "<movie_name>"\n" +
				   "    node liri.js do-what-it-says\n";

		// Append the output to the log file
		fs.appendFile("./log.txt", "LIRI Response:\n\n" + outputStr + "\n", (err) => {
			if (err) throw err;
			console.log(outputStr);
		});
	});
}
