const PORT = 1235;
const MULTICAST_ADDR = "232.1.1.1";

const fs = require('fs')
const path = require('path')
const dgram = require("dgram");
const process = require("process");
var express = require("express");
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
var cors = require('cors');
app.use(cors());

app.get('/tweets', function(req, res) {
	var tweet_array = [];

	const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

	socket.bind(PORT);

	socket.on("listening", function() {
    		socket.addMembership(MULTICAST_ADDR);
    	const address = socket.address();
    	console.log(
        	`UDP socket listening on ${address.address}:${address.port} pid: ${
            	process.pid
        	}`
    	);
	});

	socket.on("message", function(message, rinfo) {
		//Replace invalid json from atlas with corrected escaped quotes
        var messageFormatted = message.toString().replace(/\[[^\]]*\]/g, function(match) {
            return match.replace(/([^\\])"/g, "$1\\\"");
        });
		console.info(`Tweet from: ${rinfo.address}:${rinfo.port} - ${messageFormatted}`);
		let tweet = JSON.parse(messageFormatted);
		tweet["IP"] = rinfo.address;
		tweet["port"] = rinfo.port;
		tweet_array.push(tweet);
	});

	//Wait 40 seconds to load tweets
	const tweetFetchTime = 40000;
	setTimeout(function() {
		res.json(tweet_array);
	}, tweetFetchTime);
});

const port = 3000;

app.listen(port, () => {
	console.log(`NodeJS Express app is listening on port ${port}`);
});

var dirname = 'apps/'

app.get('/getApps', function(req, res) {
	if (!fs.existsSync(dirname)){
		fs.mkdirSync(dirname);
	}

	var data = {};
	fs.readdir(dirname, function(err, filenames) {
		if (err) {
		  console.log(err);
		  return;
		}
		filenames.forEach(function(filename) {
		  fs.readFile(dirname + filename, 'utf-8', function(err, content) {
			if (err) {
			  console.log(err);
			  return;
			}
			else {
				console.log("Found file " + filename);
				data[filename] = content;
			}
		  });
		});
	});

	//0.5 seconds
	const fileFetchTime = 500;
	setTimeout(function() {
		console.log(data);
		res.json(data);
	}, fileFetchTime);
});

app.post('/saveApp', function(req, res) {

	response = {
		filename : req.body.filename,
		data : req.body.content,
		encoding: req.body.contentType
	};

	fs.writeFile(dirname + response.filename, response.data, [response.encoding], function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("File saved successfully!");
	})
	
	//this line is optional and will print the response on the command prompt
	//It's useful so that we know what infomration is being transferred 
	//using the server
	console.log(response);
	
	//convert the response in JSON format
	res.end(JSON.stringify(response));
});

app.post('/deleteApp', function(req, res) {

	response = {
		filename : req.body.filename,
	};

	fs.unlink(dirname + response.filename, function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("File deleted successfully!");
	})
	
	//this line is optional and will print the response on the command prompt
	//It's useful so that we know what infomration is being transferred 
	//using the server
	console.log(response);
	
	//convert the response in JSON format
	res.end(JSON.stringify(response));
});

app.post('/changeDirectory', function(req, res) {
	response = {
		directory : req.body.directoryText
	};

	dirname = response.directory;
	
	//this line is optional and will print the response on the command prompt
	//It's useful so that we know what infomration is being transferred 
	//using the server
	console.log(response);
	
	//convert the response in JSON format
	res.end(JSON.stringify(response));
});

app.post('/callServices', function(req, res) {
	response = {
		thing_id : req.body.thing_id,
		space_id : req.body.space_id,
		service_name : req.body.service_name,
		service_input : req.body.service_input
	};
	
	//Example of using a variable received from the request
	console.log("Here is the thing id: " + response.thing_id);
	
	//run callService.js code here using any service info that was given

	res.end(JSON.stringify(response));
});