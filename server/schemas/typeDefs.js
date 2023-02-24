const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    password: String 
    createdAt: String   
    friends: [User]
    friendRequests: [Request]
    challenges: [Challenge]
    
  }

  type Challenge {
    _id: ID
    challengerId: User
    inviteeId: User
    status: Int
    challengerWord: String
    inviteeWord: String
    challengerGuesses: [String]
    inviteeGuesses: [String]
  }

  type Request {
    _id: ID
    requestor: User
    recipient: User
    status: Int
  }

  type Game {
    _id: ID
    word: String
    guess1: String
    guess2: String
    guess3: String
    guess4: String
    guess5: String
    guess6: String
  }

  type Auth {
    token: ID
    user: User
  }

  type Query {
    users: [User]!
    user(id: ID!): User
    searchUsers(term: String!): [User]!
    me: User
  }

  type Mutation {
    addUser(
      email:String!, 
      username:String!, 
      password:String!
    ): Auth

    login(
      email:String!, 
      password:String!
    ): Auth

    createFriendRequest(
      recipient: ID!
      ): String
    
    acceptFriendRequest(
      _id:ID!
    ): String

    ignoreFriendRequest(
      _id:ID!
    ): String
    
    createChallenge(
      inviteeId:ID!, 
      challengerWord: String!
    ): String 

    acceptChallenge(
      _id: ID!,      
      inviteeWord: String!
    ): String
     
    ignoreChallenge(
      _id: ID!
    ): String

    archiveChallenge(
    _id: ID!
    ): String
  }
`;

module.exports = typeDefs;
