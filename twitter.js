var twitterSetup = function(deviceClient) 
{
	// Self Referentiation
	var self = this;
	
	// Dependencies
	var Twitter = require('twitter');
	
	// Variables for Limiting the Quantity of Twitter Based Information Responses
	var timesGetTwitterCalled = 0;
	self.twitterIntervalID = 0;
	
	var twitterClient = new Twitter({
        consumer_key: 'uyGpIwSq2QmEjok8qsvAtwCW0',
        consumer_secret: 'P1Jona5WwUE54WF8LjQHE8ZJa2zK7wKmLGTj8WPZyGHqeMhxHl',
        access_token_key: '132337921-mWzwmPzlpWS9m5B7pw7T3VIWIgkPQQYUVkuGJqTG',
        access_token_secret: 'waoDLEZrg14hV2dox0FwTUs4Qv5C3ReajWOtVnlLVigUM'
    });
	
	self.getTwitter = function(request, response) 
	{
		// Stop Repetition after N iterations
		/*if (timesGetTwitterCalled > 1)
		{ 
			clearInterval(self.twitterIntervalID);
		}*/
		/*else 
		{*/
			var locationString = "";
			locationString += response.long1 + "," + response.lat2 + "," + response.long2 + "," + response.lat1;
			
			// NOTE: tweets are in a stream format
			var stream = twitterClient.stream("statuses/filter", { locations: locationString });
			stream.on('data', function(event) {
				console.log(event && event.text);
				deviceClient.publish("status", "json", '{"d": {"text": ' + event.text + '}}');
			});
			
			stream.on('error', function(error) {
				console.log("Error: " + error);
			});
		//}
		//++timesGetTwitterCalled;
	}
}

module.exports = twitterSetup;