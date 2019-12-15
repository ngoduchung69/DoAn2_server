const { Users, Presences } = require("./models");
const XLSX = require("xlsx");
const excelToJson = require("convert-excel-to-json");
var json2xls = require("json2xls");
const fs = require('fs');
const { connect } = require("mqtt");
const { MQTTPubSub } = require('graphql-mqtt-subscriptions');
const client = connect('mqtt://tailor.cloudmqtt.com', {
	reconnectPeriod: 1000,
	username: "zuqtckzj",
	password: "KvEwQIQrMSLp",
	port: "16132"
});

const pubsub = new MQTTPubSub({
	client
});

const POST_ADDED = 'demo';

const resolvers = { 
  Subscription: {
    postAdded: {
      resolve:(payload) => {
        return payload
      },
      subscribe:() => pubsub.asyncIterator([POST_ADDED])
    }
  },
  Query: {
    users: async () => await Users.find(),
    students: async () => await Users.find({ role: false }),
    user: async (_, mssv) => await Users.findOne(mssv),
    checkInTimes: async (_, _id) => await Presences.find({ userId: _id }),
    posts(root, args, context) {
      return postController.posts();
    },
  },
  Mutation: {
    addPost(root, args, context) {
      // pubsub.publish(POST_ADDED, { postAdded: args });
      pubsub.publish(POST_ADDED,  args.message );
      // return postController.addPost(args);
      return true;
    },
    addUser: async (parent, args) => {
      try {
        let response = await Users.create(args);
        return response;
      } catch (error) {
        return error.message;
      }
    },
    updateUser: async (parent, args) =>
      await Users.findByIdAndUpdate(args._id, {
        name: args.name,
        mssv: args.mssv,
        role: args.role,
        age: args.age,
        tel: args.tel
      }),
    deleteUser: async (parent, args) => await Users.deleteOne(args),
    addCheckInTime: async (parent, args) => {
      return await Presences.create(args);
    },
    convertToExel: () => {
      Users.find({}).then(a => {
        var data = a.map(p => p.toJSON());
        console.log(data);
        var xls = json2xls(data);
        fs.writeFileSync("src/data.xlsx", xls, "binary");
      });
      return Users.find({ role: false });
    },
    uploadFile: async (parent, { file }) => {
      const { createReadStream, filename, mimetype, encoding } = await file;
      // const stream = createReadStream();
      // var stringFile = XLSX.stream.to_json(stream, {raw:true});
      // console.log(stream);

      // var workbook = XLSX.readFile(file);
      // var first_sheet_name = workbook.SheetNames[0];
      // var address_of_cell = "A1";
      // /* Get worksheet */
      // var worksheet = workbook.Sheets[first_sheet_name];
      // var stringFile = XLSX.utils.sheet_to_json(worksheet);
      // console.log(stringFile);

      // var workbook = XLSX.readFile('Book1.xlsx');
      // var first_sheet_name = workbook.SheetNames[0];
      // var worksheet = workbook.Sheets[first_sheet_name];
      // var stream = XLSX.stream.to_json(worksheet, {raw:true});
      //   console.log(stream);
      

      return { filename, mimetype, encoding };
    }
  }
};

module.exports = { resolvers };
