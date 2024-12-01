import { User, Game, Score } from '../models/games.js';

// Save a score
export const saveScore = async (req, res) => {
    try {
        const { userid, gameid, score } = req.body;
        if (!userid || !gameid || score === undefined) {
            return res.status(400).json({ message: 'User ID, Game ID, and Score are required' });
        }
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const game = await Game.findById(gameid);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        const newScore = new Score({ userid: user._id, gameid: game._id, score });
        const savedScore = await newScore.save();
        res.status(201).json(savedScore);
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
