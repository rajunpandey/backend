import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, 
    },
});

// Game Schema
const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

// Score Schema
const scoreSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    gameid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Models
export const User = mongoose.model('User', userSchema);
export const Game = mongoose.model('Game', gameSchema);
export const Score = mongoose.model('Score', scoreSchema);
