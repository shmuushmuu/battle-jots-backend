const { Schema, model } = require('mongoose');

const gameSchema = new Schema ({
    word: {
        type: String,
        required: true
    },
    guess1: {
        type: String,
    },
    guess2: {
        type: String,
    },
    guess3: {
        type: String,
    },
    guess4: {
        type: String,
    },
    guess5: {
        type: String,
    },
    guess6: {
        type: String,
    },
});

const Game = model('game', gameSchema);


model.exports = Game;