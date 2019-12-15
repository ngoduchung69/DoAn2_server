const mongoose = require("mongoose");
const { Schema } = mongoose;

const usersSchema = new Schema({
  name: String,
  mssv: Number,
  role: Boolean,
  age: Number,
  tel: Number,
  fingerPrint: String,
  appearance:Number
});

const Users = mongoose.model("users", usersSchema);

const presenceSchema = new Schema({
  userId: String,
  checkInTime: String
});

const Presences = mongoose.model("presences", presenceSchema);

module.exports = { Users, Presences };
