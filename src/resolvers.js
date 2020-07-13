const { LightOn, OpenFridge, User } = require("./models");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
var json2xls = require("json2xls");
const fs = require("fs");
const { MQTTPubSub } = require("graphql-mqtt-subscriptions");
const moment = require("moment");
const mqtt = require("mqtt");
const { connect } = require("mqtt");
// var client = mqtt.connect("mqtt://192.168.43.176", { clientId: "hung1" });
const client = connect("mqtt://soldier.cloudmqtt.com", {
  reconnectPeriod: 1000,
  username: "xbgtybxd",
  password: "JZIb_B9EyDts",
  port: "11282",
});

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

// var topic_s = "event";
var topic_s = "test";
client.subscribe(topic_s, { qos: 1 });
client.on("message", function (topic, message, packet) {
  console.log("" + message);
  // let contentString = "" + message;
  // let contentJson = contentString.replace(/'/g, '"');
  // let contentObject = JSON.parse(contentJson);
  // if (contentObject.micro != 0) {
  // createLightOn({ ...contentObject });
  // }
  // console.log({ ...contentObject });
  // console.log(contentString)
  // pubsub.publish(POST_ADDED, contentString);
});

// const POST_ADDED = "event";
const POST_ADDED = "test";

const resolvers = {
  Subscription: {
    postAdded: {
      resolve: (payload) => {
        // return payload;
        return payload;
      },
      subscribe: () => pubsub.asyncIterator([POST_ADDED]),
    },
  },
  Query: {
    lightOnQuery: async () => await LightOn.find(),
    findUser:async (_,fingerId) => await User.findOne(fingerId),
    getAllUsers: async () => await User.find()
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
    addUser: async (parent, args) => {
      try {
        let response = await User.create(args);
        return response;
      } catch (error) {
        return error.message;
      }
    },
    addPost(root, args, context) {
      // pubsub.publish(POST_ADDED, { postAdded: args });
      console.log(args.message);
      pubsub.publish("test1", args.message);
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
            stt: q,
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
