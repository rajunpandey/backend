
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
});



const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});




const scoreSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',  
        required: true
    },
    gameid: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'Game',  
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    recordedAt: {
        type: Date,
        default: Date.now
    }
});



const User = mongoose.model('User', userSchema);
const Game = mongoose.model('Game', gameSchema);
const Score = mongoose.model('Score', scoreSchema);

export { User, Game, Score };
