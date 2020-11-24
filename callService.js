var net = require('net');

let clients_pool = {};

const createClient = (ip_addr, message, relationship_type = null, secondIp_addr = null, secondService = null) =>
{
	var client = null;
	if(clients_pool[ip_addr]) {
		client = clients_pool[ip_addr];
		clients_pool[ip_addr] = client;
	}
	else {
		 client =  new net.Socket();
		 client.connect(6668, ip_addr, function () {
			console.log('Connected');
			}
		);
	}
	client.write(message);
	

	client.on('data', function (data) {
		var buffer = Buffer.alloc(2048);
		console.log(buffer.toString('utf8', 0, data));
		var json = JSON.parse(data)
		let result = json['Service Result'];
		if(relationship_type != null) {
			switch (relationship_type) {
				case "control":
					if(result)
						createClient(secondIp_addr, makeMessage(secondService["Thing ID"], secondService["Space ID"], secondService["Name"], result));
					break
				case "drive":
					createClient(secondIp_addr, makeMessage(secondService["Thing ID"], secondService["Space ID"], secondService["Name"], result));
					break
				case "support":
					if(result)
						createClient(secondIp_addr, makeMessage(secondService["Thing ID"], secondService["Space ID"], secondService["Name"], result));
					break
				case "extend":
					createClient(secondIp_addr, makeMessage(secondService["Thing ID"], secondService["Space ID"], secondService["Name"], ""));
					break
				case "contest":
					createClient(secondIp_addr, makeMessage(secondService["Thing ID"], secondService["Space ID"], secondService["Name"], ""));
					break
				case "interfere":
					if(message["Space ID"] != secondService["Space ID"])
						createClient(secondIp_addr, makeMessage(secondService["Thing ID"], secondService["Space ID"], secondService["Name"], ""));
					break
				default:
					console.error("invalid relationship type");
			}

		}
		//client.destroy(); // kill client after server's response
	});

	client.on('close', function () {
		console.log('Connection closed');
	});

	client.on('error', function (err) {
		console.error('Connection error: ' + err);
		console.error(new Error().stack);
	});
};
function makeMessage(thing_id, space_id, service_name, service_input) {
	return "{ \"Tweet Type\" : \"Service call\", \"Thing ID\" : \"" + thing_id + "\", \"Space ID\" :\"" + space_id +"\", \"Service Name\" :\""+ service_name + "\", \"Service Inputs\" :\"(" + service_input + ")\" }";
}
function testRequestService() {
	var message = "{ \"Tweet Type\" : \"Service call\", \"Thing ID\" : \"raspberry_pi_ar4757\", \"Space ID\" : \"MySmartSpace_ar4757\", \"Service Name\" : \"Digital_Sound\", \"Service Inputs\" : \"()\" }";
	client.write(message);
}

function handleRelationship(param) {
	if(param.type != "servicesRelationship") {
		console.log("not relationship type");
		return false;
	}
	let relationship_type = param.relationship["Type"];
	const message = makeMessage(param.first_service.content["Thing ID"], param.first_service.content["Space ID"], param.first_service.content["Name"], "");
	createClient(param.first_service.content["IP"], message, relationship_type, param.second_service.content["IP"], param.second_service.content);
	return true;
}

function handleService(param) {
	if(param["Tweet Type"] != "Service") {
		console.log("not service type");
		return false;
	}
	const message = makeMessage(param["Thing ID"], param["Space ID"], param["Name"], "");
	createClient(param["IP"], message);
	return true;
}
const runApp = (app)=> {
	app.forEach(param => {
		if(!handleRelationship(param))
			if(!handleService(param)) 
				console.error("undefined tweet");
	});
};

exports.runApp = runApp;
