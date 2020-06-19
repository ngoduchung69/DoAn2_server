const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Subscription {
    postAdded: String
  }

  type Accel {
    x: String
    y: String
    z: String
  }

  type Color {
    red: String
    green: String
    Blue: String
  }

  input AccelInput {
    x: String
    y: String
    z: String
  }

  input ColorInput {
    red: String
    green: String
    Blue: String
  }

  type LightOn {
    _id: ID!
    micro: String
    accel: Accel
    type: Int
    color: Color
    time: String
  }

  type OpenFridge {
    _id: ID!
    micro: String
    accel: Accel
    magne: String
    type: Int
    color: String
    time: String
  }

  type Query {
    lightOnQuery: [LightOn]
  }

  type Mutation {
    addLightOn(
      micro: String
      accel: AccelInput
      type: Int
      color: ColorInput
    ): LightOn
    addOpenFridge(
      micro: String
      accel: AccelInput
      magne: String
      type: Int
      color: String
    ): OpenFridge
    convertToExel: [LightOn]
    addPost(message: Int!): Boolean
  }
`;

module.exports = { typeDefs };
