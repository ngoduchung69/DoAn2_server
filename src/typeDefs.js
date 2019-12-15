const { gql } = require("apollo-server-express");

const typeDefs = gql`

type Subscription {
  postAdded: String
}

  type User {
    _id: ID!
    name: String
    mssv: Int
    role: Boolean
    age: Int
    tel: Int
    fingerPrint:String
    appearance:Int
  }

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type CheckIn {
    userId: String
    checkInTime: String
  }

  type Query {
    users: [User]
    students: [User]
    user(mssv: Int!): User
    checkInTimes(_id: ID!): [CheckIn]
    posts: [Post]
  }

  type Post {
    author: String
    comment: String
  }

  type Mutation {
    addUser(
      name: String!
      mssv: Int!
      role: Boolean!
      age: Int!
      tel: Int!
      fingerPrint:String
      appearance:Int
    ): User
    updateUser(
      name: String!
      mssv: Int!
      role: Boolean!
      _id: ID!
      age: Int!
      tel: Int!
    ): User
    deleteUser(_id: ID!): User
    addCheckInTime(userId: ID!, checkInTime: String!): CheckIn
    uploadFile(file: Upload!): File!
    convertToExel: [User]
    addPost(message:String!): Boolean
  }
`;

module.exports = { typeDefs };