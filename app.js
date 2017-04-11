/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
/*var express = require('express');
var request = require('request');
var Twitter = require('twitter');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

var parser = require('json-parser');

var Client = require("ibmiotf");
var config = {
    "org": "t82anh",
	"id": "MyGeoTweets",
	"domain": "internetofthings.ibmcloud.com",
	"type": "GeoTweets",
	"auth-method": "token",
	"auth-token": "F0uO@W!BGM8vHbo0RL"
};
var deviceClient = new Client.IotfDevice(config);
deviceClient.connect();

var twitterClient = new Twitter({
        consumer_key: 'uyGpIwSq2QmEjok8qsvAtwCW0',
        consumer_secret: 'P1Jona5WwUE54WF8LjQHE8ZJa2zK7wKmLGTj8WPZyGHqeMhxHl',
        access_token_key: '132337921-mWzwmPzlpWS9m5B7pw7T3VIWIgkPQQYUVkuGJqTG',
        access_token_secret: 'waoDLEZrg14hV2dox0FwTUs4Qv5C3ReajWOtVnlLVigUM'
    });

// create a new express server
var app = express();

var timesGetWeatherAndTweetsCalled = 0;
var weatherIntervalID;

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// When the device connects
deviceClient.on("connect", function() {
	console.log("Device connected!");
});

// When the device receives an error
deviceClient.on("error", function(err) {
	console.log("Error! - " + err);
});

app.get('/process_get', function(req, res)
{
	timesGetWeatherAndTweetsCalled = 0;
	// Prepare output in JSON format
	response = {
		lat1: req.query.latitude1,
		long1: req.query.longitude1,
		lat2: req.query.latitude2,
		long2: req.query.longitude2
	};
	var locationString = "";
	locationString += response.lat1 + "," + response.long1 + "," + response.lat2 + "," + response.long2;
	
	intervalID = setInterval(function() {
		getWeatherAndTweets(locationString);
	}, 10000);

	// res.setHeader("Content-Type", "text/html");
	// res.end("<form action='https://jpeterkdemoapp.mybluemix.net/process_get' method='GET'>" + 
 //      		"Latitude: <input type='text' name='latitude' /><br />" + 
 //      		"Longitude: <input type='text' name='longitude' /><br />" +
 //      		"<input type='submit' text='submit' />" +
 //    		"</form>" +
 //    		"<p id='blankSpace'>" + JSON.stringify(body.forecasts) + "</p>");
});

function getWeatherAndTweets(locationString)
{
	if (timesGetWeatherAndTweetsCalled >= 5)
	{
		clearInterval(intervalID);
		deviceClient.disconnect();
	}
	else
	{
		var callURL = "https://3024c902-44c2-4a90-a124-2fcf95f7a555:6QF9VUcNWw@twcservice.mybluemix.net/api/weather/v1/geocode/" + response.lat1 + "/" + response.long1 + "/forecast/hourly/48hour.json?units=m&language=en-US";
		request.get(callURL, {
			json: true
		},
		function (error, response, body) {
			console.log("forecast: " + body.forecasts);
			deviceClient.publish("status", "json", JSON.stringify(body.forecasts));
		});
		var stream = twitterClient.stream("statuses/filter", { locations: locationString });
		stream.on("data", function(event) {
			console.log(event && event.text);
			deviceClient.publish("status", "json", '{"d": {"text": ' + event.text + '}}');
		});
	}
	timesGetWeatherAndTweetsCalled++;
}

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});*/

// App Dependencies
var Client = require("ibmiotf");
var express = require('express');
var request = require('request');
var cfenv = require('cfenv');

// IOT Device Configuration and Connection
var config = {
    "org": process.env.IOT_ORG,
	"id": process.env.IOT_ID,
	"domain": process.env.IOT_DOMAIN,
	"type": process.env.IOT_TYPE,
	"auth-method": process.env.IOT_AUTHMETHOD,
	"auth-token": process.env.IOT_AUTHTOKEN
};
/*"org": "t82anh",
	"id": "MyGeoTweets",
	"domain": "internetofthings.ibmcloud.com",
	"type": "GeoTweets",
	"auth-method": "token",
	"auth-token": "F0uO@W!BGM8vHbo0RL"*/
var deviceClient = new Client.IotfDevice(config);
deviceClient.connect();


// When the device connects
deviceClient.on("connect", function() {
	console.log("Device connected!");
});

// When the device receives an error
deviceClient.on("error", function(err) {
	console.log("Error! - " + err);
});

// Weather Dependencies and Instance
var weatherVar = require('./weather.js');
var weatherVarInstance = new weatherVar(deviceClient);

var twitterVar = require('./twitter.js');
var twitterVarInstance = new twitterVar(deviceClient);

var trafficVar = require('./traffic.js');
var trafficVarInstance = new trafficVar(deviceClient);

// Create a new express server
var app = express();

// Serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// Get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

app.get('/process_get', function(req, res)
{
	// Prepare output in JSON format
	response = {
		lat1: req.query.latitude1,
		long1: req.query.longitude1,
		lat2: req.query.latitude2,
		long2: req.query.longitude2
	};

	// Perform Twitter Functionality every N milliseconds
	twitterVarInstance.twitterIntervalID = setInterval(function() {
		twitterVarInstance.getTwitter(request, response);
	}, 10000);
	
	//Perform Weather Functionality every N milliseconds
	weatherVarInstance.weatherIntervalID = setInterval(function() {
		weatherVarInstance.getWeather(request, response);
	}, 10000);

	// Perform Traffic Functionality every N milliseconds
	trafficVarInstance.trafficIntervalID = setInterval(function() {
		trafficVarInstance.getTraffic(request, response);
	}, 10000);
});


// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
