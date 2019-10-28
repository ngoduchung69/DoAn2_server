const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID!
    name: String
    mssv: Int
    role: Boolean
    age: Int
    tel: Int
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
  }

  type Mutation {
    addUser(
      name: String!
      mssv: Int!
      role: Boolean!
      age: Int!
      tel: Int!
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
  }
`;

module.exports = { typeDefs };
