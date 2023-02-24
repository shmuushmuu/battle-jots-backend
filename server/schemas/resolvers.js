const { AuthenticationError } = require('apollo-server-express');
const { User, Challenge, Game, Request } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    searchUsers: async (_parent, args) => {
      const search = args.term;
      const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
      const searchRgx = rgx(search);
      return User.find({
        $or: [
          {
            email: {
              $regex: searchRgx,
              $options: 'i',
            },
          },
          {
            username: {
              $regex: searchRgx,
              $options: 'i',
            }
          },
        ]
      });
    },
    users: async () => {
      return await User.find({})
        .populate('friends')
        .populate('challenges');
    },
    user: async (_, args) => {
      return await User.findOne({ _id: args.id });
    },
    me: async (_, args, context) => {
      if (context.user) {
        const user = await User.findOne({ _id: context.user._id })
          .populate({
            path: 'friendRequests',
            model: 'request',
            populate: {
              path: 'requestor',
              model: 'user',
              select: 'username'
            }
          })
          .populate({
            path: 'friendRequests',
            model: 'request',
            populate: {
              path: 'recipient',
              model: 'user',
              select: 'username'
            }
          })
          .populate('friends','username')
          .populate('challenges')
          .populate({
            path: 'challenges',
            model: 'challenge',
            populate: {
              path: 'inviteeId',
              model: 'user',
              select: 'username'
            }
          })
          .populate({
            path: 'challenges',
            model: 'challenge',
            populate: {
              path: 'challengerId',
              model: 'user',
              select: 'username'
            }
          })
          console.log(user.friendRequests);
          return user;
      }
      if (!context) {
        throw new AuthenticationError('You need to be logged in!');
      }
    },
  },

  Mutation: {
    addUser: async (_, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    login: async (_, { email, username, password }) => {
      const user = await User.findOne(email ? { email } : { username });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },

    createFriendRequest: async (_, { recipient }, context) => {
      const request = await Request.create(
        {
          requestor: context.user._id,
          recipient,
        }
      );
      await User.findOneAndUpdate(
        { _id: recipient },
        { $addToSet: { friendRequests: request._id } }
      );
      await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { friendRequests: request._id } }
      );
      return 'Friend Request Sent';
    },

    acceptFriendRequest: async (_, { _id }) => {
      const request = await Request.findOneAndUpdate(
        { _id },
        { $set: { status: 1 } }
      );
      await User.findOneAndUpdate(
        { _id: request.recipient },
        {
          $addToSet: { friends: request.requestor },
          $pull: { friendRequests: request._id }
        }
      );
      await User.findOneAndUpdate(
        { _id: request.requestor },
        {
          $addToSet: { friends: request.recipient },
          $pull: { friendRequests: request._id }
        }
      )
      return 'Friend Added';
    },

    ignoreFriendRequest: async (_, { _id }) => {
      const request = await Request.findOneAndUpdate(
        { _id },
        { $set: { status: 2 } }
      );
      await User.findOneAndUpdate(
        { _id: request.recipient },
        { $pull: { friendRequests: request._id } }
      );
      await User.findOneAndUpdate(
        { _id: request.requestor },
        { $pull: { friendRequests: request._id } }
      )
      return 'Request Removed';

    },

    createChallenge: async (_, { inviteeId, challengerWord }, context) => {
      const challenge = await Challenge.create(
        {
          challengerId: context.user._id,
          inviteeId,
          challengerWord
        }
      );
      await User.findOneAndUpdate(
        { _id: context.user._id },
        {
          $addToSet:
            { challenges: challenge._id }
        }
      );
      await User.findOneAndUpdate(
        { _id: inviteeId },
        {
          $addToSet:
            { challenges: challenge._id }
        }
      )
      return 'Challenge Created';
    },

    acceptChallenge: async (_, { _id, inviteeWord }) => {
      await Challenge.findOneAndUpdate(
        { _id },
        {
          $set: { status: 1, inviteeWord }
        },
      )
      return 'Starting Game...';
    },

    ignoreChallenge: async (_, { _id }) => {
      const challenge = await Challenge.findOneAndUpdate(
        { _id },
        { $set: { status: 2 } }
      );
      await User.findOneAndUpdate(
        { _id: challenge.challengerId },
        { $pull: { challenges: _id } }
      );
      await User.findOneAndUpdate(
        { _id: challenge.inviteeId },
        { $pull: { challenges: _id } }
      )
      return 'Challenge Ignored';
    },

    archiveChallenge: async (_, { _id, challengerId, inviteeId }) => {
      await Challenge.findOneAndUpdate(
        { _id },
        { $set: { status: 3 } }
      );
    }
  }
};

module.exports = resolvers;
