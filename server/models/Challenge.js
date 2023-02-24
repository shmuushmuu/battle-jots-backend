const { Schema, model } = require('mongoose');

const challengeSchema = new Schema(
    {
        challengerId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        inviteeId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        status: {
            type: Number,
            default: 0,
            required: true
        },
        challengerWord:{
            type: String,
            required: true
        },
        inviteeWord:{
            type: String
        },
        challengerGuesses: [{
            type: String
        }],
        inviteeGuesses: [{
            type: String
        }]
    }
)

const Challenge = model('challenge', challengeSchema);

module.exports = Challenge;