const { Users, Presences } = require("./models");

const resolvers = {
  Query: {
    users: async () => await Users.find(),
    students: async () => await Users.find({ role: false }),
    user: async (_, mssv) => await Users.findOne(mssv),
    checkInTimes: async (_, _id) => await Presences.find({ userId: _id })
  },
  Mutation: {
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
    }
  }
};

module.exports = { resolvers };
