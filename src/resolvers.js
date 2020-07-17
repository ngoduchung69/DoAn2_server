const { LightOn, OpenFridge, Events } = require("./models");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
var json2xls = require("json2xls");
const fs = require("fs");
const { MQTTPubSub } = require("graphql-mqtt-subscriptions");
const moment = require("moment");
const mqtt = require("mqtt");
const { connect } = require("mqtt");
const graphql = require("graphql");
const {
	GraphQLInt,
} = graphql;
// var client = mqtt.connect("mqtt://192.168.43.176", { clientId: "hung1" });
var client = connect('mqtt://soldier.cloudmqtt.com', {
	reconnectPeriod: 1000,
	username: "adessils",
	password: "7CSAYPN6-BsG",
	port: "16094"
});


const WMatrix = [
	[-2.24674618, 1.67895369, 0.204699156, - 0.00202542987],
	[1.02753480, - 0.836029306, - 0.152656678, 0.0465834942],
	[-0.197698043, 0.393695312, - 0.0697487474, 1.13419552],
	[-9.04955801, 0.141255710, 0.0870340337, 0.705843029],
	[0.0140734629, - 0.985995727, 0.352892646, 0.0795391233],
	[0.0198432514, - 0.452782946, 0.340988369, - 0.0435996941],
	[-1.19158235, - 0.110107837, 0.538356320, - 0.0366742895]
]
const multiply = (a, b) => {
	var aNumRows = a.length, aNumCols = a[0].length,
		bNumRows = b.length, bNumCols = b[0].length,
		m = new Array(aNumRows);  // initialize array of rows
	for (var r = 0; r < aNumRows; ++r) {
		m[r] = new Array(bNumCols); // initialize the current row
		for (var c = 0; c < bNumCols; ++c) {
			m[r][c] = 0;             // initialize the current cell
			for (var i = 0; i < aNumCols; ++i) {
				m[r][c] += a[r][i] * b[i][c];
			}
		}
	}
	return m;
}

const featureData = (a) => {
	let result = []
	a[0][0] = (Math.abs(a[0][0] - 520) / 520) * 10
	a[0][1] = (Math.abs(a[0][1] - 343) / 343) * 5
	a[0][2] = (Math.abs(a[0][2] - 430) / 430) * 5
	a[0][3] = (Math.abs(a[0][3] - 380) / 380) * 5
	a[0][4] = (Math.abs(a[0][4] - 940) / 940) * 20
	a[0][5] = (Math.abs(a[0][5] - 339) / 339) * 20
	a[0][6] = (Math.abs(a[0][6] - 1048) / 1048) * 20
	return a
}

const type0 = [[522, 344, 379, 430, 900, 332, 1021]]
const type1 = [[491, 339, 376, 426, 958, 344, 1046]]
const type2 = [[537, 338, 375, 425, 813, 345, 894]]
const type3 = [[539, 74, 107, 122, 972, 332, 1021]]

const data = featureData(type0)
const m = multiply(data, WMatrix)
console.log(m)

let createLightOn = async (data) => {
	try {
		var d = new Date();
		var n = d.toISOString();
		let response = await LightOn.create({ ...data, time: n });
		console.log(response);
		return response;
	} catch (error) {
		return error.message;
	}
};

const pubsub = new MQTTPubSub({
	client,
});

var topic_s = "demo";
client.subscribe(topic_s, { qos: 1 });
client.on("message", function (topic, message, packet) {
	console.log("" + message);
	let contentString = "" + message;
	let contentJson = contentString.replace(/'/g, '"');
	let contentObject = JSON.parse(contentJson);
	contentObject.type = 2;
	let arrData = [contentObject.micro, contentObject.color.red, contentObject.color.blue, contentObject.color.green, contentObject.accel.x, contentObject.accel.y, contentObject.accel.z]
	const result = multiply(arrData, WMatrix)
	console.log(result)
	if (contentObject.micro != 0) {
		createLightOn({ ...contentObject });
	}
	// console.log({ ...contentObject });
	// console.log(contentString)
	// pubsub.publish(POST_ADDED, contentString);
});

// const POST_ADDED = "event";
const POST_ADDED = "events";



const resolvers = {
	Subscription: {
		events: {
			type: GraphQLInt,
			resolve: (payload) => {
				console.log(payload)
				return payload;
			},
			subscribe: () => pubsub.asyncIterator("events"),
		},
	},
	Query: {
		lightOnQuery: async () => await LightOn.find(),
	},
	Mutation: {
		addLightOn: async (parent, args) => {
			try {
				var d = new Date();
				var n = d.toISOString();
				let response = await LightOn.create({ ...args, time: n });
				return response;
			} catch (error) {
				return error.message;
			}
		},
		addOpenFridge: async (parent, args) => {
			try {
				let response = await OpenFridge.create(args);
				return response;
			} catch (error) {
				return error.message;
			}
		},
		deleteALl: async () => {
			await LightOn.deleteMany({});
			return true;
		},
		addPost(root, args, context) {
			// pubsub.publish(POST_ADDED, { postAdded: args });
			console.log(args.message);
			pubsub.publish(POST_ADDED, args.message);
			// return postController.addPost(args);
			return true;
		},
		convertToExel: (parent, args) => {
			let timeNow = moment().format("YYYY-MM-DD");
			LightOn.find({}).then((a) => {
				var data_v = a.map((p) => p.toJSON());
				var data = [];
				for (var x of data_v) {
					delete x.__v;
					data.push(x);
				}
				var fileData = [];
				var fileLabel = [];
				var q = 0;
				for (var x of data) {
					q++;
					fileData.push({
						micro: x.micro,
						red: x.color.red,
						blue: x.color.blue,
						green: x.color.green,
						x: x.accel.x,
						y: x.accel.y,
						z: x.accel.z,
					});
					fileLabel.push({
						type: x.type,
					});
				}
				var xls = json2xls(fileData);
				var xlsLabel = json2xls(fileLabel);
				fs.writeFileSync(`src/data.${timeNow}.xlsx`, xls, "binary");
				fs.writeFileSync(`src/label.${timeNow}.xlsx`, xlsLabel, "binary");
			});
			return LightOn.find({});
		},
	},
};

module.exports = { resolvers };
